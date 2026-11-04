"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  getSession,
  verifyPassword,
} from "@/lib/auth";
import { parsePriceToCents } from "@/lib/format";
import { addDays, dateFromISO, nightsBetween } from "@/lib/dates";
import { isRoomAvailable } from "@/lib/availability";
import { stayTotal } from "@/lib/pricing";
import {
  BLOCKING_STATUSES,
  BOOKING_STATUSES,
  BED_TYPES,
  type BookingStatus,
} from "@/lib/constants";

/** Parse the beds JSON sent by the room form into validated rows. */
function parseBeds(raw: string): { type: string; quantity: number; sortOrder: number }[] {
  let arr: unknown;
  try {
    arr = JSON.parse(raw || "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  const allowed = new Set<string>(BED_TYPES);
  return arr
    .map((b, i) => {
      const type = String((b as { type?: unknown })?.type ?? "");
      const quantity = Math.max(1, Math.min(20, Number((b as { quantity?: unknown })?.quantity) || 1));
      return { type, quantity, sortOrder: i };
    })
    .filter((b) => allowed.has(b.type));
}

// --------------------------------------------------------------------------
// Auth helpers
// --------------------------------------------------------------------------

/** Ensure a mutation is only run by a signed-in admin. */
async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

  await createSession({ sub: user.id, email: user.email, name: user.name ?? undefined });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

// --------------------------------------------------------------------------
// Bookings
// --------------------------------------------------------------------------

export async function setBookingStatus(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as BookingStatus;
  if (!id || !BOOKING_STATUSES.includes(status)) return;

  // When confirming, guard against a clash with another active booking.
  if (status === "CONFIRMED") {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (booking) {
      const free = await isRoomAvailable(
        booking.roomId,
        booking.checkIn,
        booking.checkOut,
        booking.id
      );
      if (!free) {
        // Leave as-is; the UI surfaces clashes separately.
        return;
      }
    }
  }

  await prisma.booking.update({ where: { id }, data: { status } });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
}

export async function deleteBooking(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.booking.delete({ where: { id } });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
}

const manualBookingSchema = z.object({
  roomId: z.string().min(1),
  source: z.enum(["MANUAL", "BLOCK", "BOOKING_COM"]),
  guestName: z.string().trim().min(1),
  guestEmail: z.string().trim().email().optional().or(z.literal("")),
  guestPhone: z.string().trim().optional().or(z.literal("")),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().int().min(0).max(20),
  message: z.string().trim().optional().or(z.literal("")),
});

export type ManualBookingState = { error?: string; ok?: boolean };

export async function createManualBooking(
  _prev: ManualBookingState,
  formData: FormData
): Promise<ManualBookingState> {
  await requireSession();
  const parsed = manualBookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;
  const checkIn = dateFromISO(d.checkIn);
  const checkOut = dateFromISO(d.checkOut);
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) return { error: "Check-out must be after check-in." };

  const free = await isRoomAvailable(d.roomId, checkIn, checkOut);
  if (!free) return { error: "Those dates clash with an existing reservation." };

  const room = await prisma.room.findUnique({ where: { id: d.roomId } });

  await prisma.booking.create({
    data: {
      roomId: d.roomId,
      guestName: d.guestName,
      guestEmail: d.guestEmail || null,
      guestPhone: d.guestPhone || null,
      checkIn,
      checkOut,
      guests: d.guests,
      message: d.message || null,
      nights,
      totalPrice: room ? await stayTotal(room, checkIn, checkOut) : null,
      status: "CONFIRMED",
      source: d.source,
    },
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
  return { ok: true };
}

const updateBookingSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  source: z.enum(["WEBSITE", "MANUAL", "BLOCK", "BOOKING_COM"]),
  status: z.enum(["PENDING", "CONFIRMED", "DECLINED", "CANCELLED"]),
  guestName: z.string().trim().min(1, "Add a name or label"),
  guestEmail: z.string().trim().email().optional().or(z.literal("")),
  guestPhone: z.string().trim().optional().or(z.literal("")),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().int().min(0).max(20),
  message: z.string().trim().optional().or(z.literal("")),
});

export async function updateBooking(
  _prev: ManualBookingState,
  formData: FormData
): Promise<ManualBookingState> {
  await requireSession();
  const parsed = updateBookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;
  const checkIn = dateFromISO(d.checkIn);
  const checkOut = dateFromISO(d.checkOut);
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) return { error: "Check-out must be after check-in." };

  // Only active (room-occupying) statuses need a clash check; ignore self.
  const occupies = d.status === "PENDING" || d.status === "CONFIRMED";
  if (occupies) {
    const free = await isRoomAvailable(d.roomId, checkIn, checkOut, d.id);
    if (!free) return { error: "Those dates clash with another reservation." };
  }

  const room = await prisma.room.findUnique({ where: { id: d.roomId } });

  await prisma.booking.update({
    where: { id: d.id },
    data: {
      roomId: d.roomId,
      guestName: d.guestName,
      guestEmail: d.guestEmail || null,
      guestPhone: d.guestPhone || null,
      checkIn,
      checkOut,
      guests: d.guests,
      message: d.message || null,
      nights,
      totalPrice: d.source === "BLOCK" || !room ? null : await stayTotal(room, checkIn, checkOut),
      status: d.status,
      source: d.source,
    },
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
  return { ok: true };
}

// --------------------------------------------------------------------------
// Availability (rooms are closed by default; the owner opens date ranges)
// --------------------------------------------------------------------------

const openDatesSchema = z.object({
  roomId: z.string().min(1),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type OpenDatesState = { error?: string; ok?: boolean };

export async function openDates(
  _prev: OpenDatesState,
  formData: FormData
): Promise<OpenDatesState> {
  await requireSession();
  const parsed = openDatesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Please choose a start and end date." };
  }
  const { roomId, start, end } = parsed.data;
  const startD = dateFromISO(start);
  const endD = dateFromISO(end);
  if (nightsBetween(startD, endD) < 1) {
    return { error: "The end date must be after the start date." };
  }
  await prisma.availabilityWindow.create({
    data: { roomId, start: startD, end: endD },
  });
  revalidatePath("/admin/calendar");
  revalidatePath("/rooms");
  return { ok: true };
}

// --------------------------------------------------------------------------
// Custom nightly prices (override the room's standard price on chosen nights)
// --------------------------------------------------------------------------

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PRICE_DAYS = 400;

export type DayPriceState = { error?: string; ok?: boolean };

function cleanDates(dates: unknown): string[] | null {
  if (!Array.isArray(dates) || dates.length === 0 || dates.length > MAX_PRICE_DAYS) return null;
  const list = Array.from(new Set(dates.map(String)));
  return list.every((d) => ISO_DAY.test(d)) ? list : null;
}

/** Of the given days, which ones are taken by a guest booking (pending or confirmed)? Blocks don't count. */
async function bookedDays(roomId: string, days: string[]): Promise<string[]> {
  if (days.length === 0) return [];
  const sortedDays = [...days].sort();
  const from = dateFromISO(sortedDays[0]);
  const to = addDays(dateFromISO(sortedDays[sortedDays.length - 1]), 1);
  const stays = await prisma.booking.findMany({
    where: {
      roomId,
      status: { in: BLOCKING_STATUSES },
      source: { not: "BLOCK" },
      checkIn: { lt: to },
      checkOut: { gt: from },
    },
    select: { checkIn: true, checkOut: true },
  });
  return sortedDays.filter((iso) => {
    const d = dateFromISO(iso);
    return stays.some((s) => d >= s.checkIn && d < s.checkOut);
  });
}

/** Every day from `first` to `last` (both included), as YYYY-MM-DD. */
function dayList(first: string, last: string): string[] {
  const out: string[] = [];
  for (let d = dateFromISO(first); d <= dateFromISO(last); d = addDays(d, 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/** Group sorted days into contiguous runs [start, end) of UTC-midnight dates. */
function toRuns(days: string[]): { start: Date; end: Date }[] {
  const runs: { start: Date; end: Date }[] = [];
  for (const iso of [...days].sort()) {
    const d = dateFromISO(iso);
    const lastRun = runs[runs.length - 1];
    if (lastRun && lastRun.end.getTime() === d.getTime()) lastRun.end = addDays(d, 1);
    else runs.push({ start: d, end: addDays(d, 1) });
  }
  return runs;
}

function validRange(roomId: string, first: string, last: string): boolean {
  return Boolean(roomId) && ISO_DAY.test(first) && ISO_DAY.test(last) && first <= last &&
    nightsBetween(dateFromISO(first), dateFromISO(last)) < MAX_PRICE_DAYS;
}

function revalidateCalendar() {
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  revalidatePath("/rooms", "layout");
}

/** Set a custom price (e.g. "120" or "120.50" euros) on the given nights. */
export async function setDayPrices(
  roomId: string,
  dates: string[],
  price: string
): Promise<DayPriceState> {
  await requireSession();
  const days = cleanDates(dates);
  if (!roomId || !days) return { error: "Select one or more days first." };
  const cents = parsePriceToCents(price);
  if (cents <= 0) return { error: "Enter a price per night." };
  if (cents > 10_000_00) return { error: "That price looks too high." };

  const room = await prisma.room.findUnique({ where: { id: roomId }, select: { id: true } });
  if (!room) return { error: "Room not found." };
  if ((await bookedDays(roomId, days)).length > 0) {
    return { error: "Some of these days are already booked, so their price can't be changed." };
  }

  await prisma.$transaction(
    days.map((iso) => {
      const date = dateFromISO(iso);
      return prisma.roomPrice.upsert({
        where: { roomId_date: { roomId, date } },
        update: { price: cents },
        create: { roomId, date, price: cents },
      });
    })
  );
  revalidatePath("/admin/calendar");
  revalidatePath("/rooms", "layout");
  return { ok: true };
}

/** Remove custom prices so the nights go back to the room's standard price. */
export async function clearDayPrices(roomId: string, dates: string[]): Promise<DayPriceState> {
  await requireSession();
  const days = cleanDates(dates);
  if (!roomId || !days) return { error: "Select one or more days first." };
  if ((await bookedDays(roomId, days)).length > 0) {
    return { error: "Some of these days are already booked, so their price can't be changed." };
  }
  await prisma.roomPrice.deleteMany({
    where: { roomId, date: { in: days.map(dateFromISO) } },
  });
  revalidatePath("/admin/calendar");
  revalidatePath("/rooms", "layout");
  return { ok: true };
}

/**
 * Block the room for the selected nights (from `first` to `last`, both
 * included). Nights that are already blocked are skipped; guest bookings in
 * the range stop the whole action.
 */
export async function blockDates(roomId: string, first: string, last: string): Promise<DayPriceState> {
  await requireSession();
  if (!validRange(roomId, first, last)) return { error: "Select a day or a range of days first." };
  const days = dayList(first, last);
  if ((await bookedDays(roomId, days)).length > 0) {
    return { error: "Some of these days have a guest booking, so they can't be blocked." };
  }
  const from = dateFromISO(first);
  const to = addDays(dateFromISO(last), 1);
  const blocks = await prisma.booking.findMany({
    where: { roomId, source: "BLOCK", status: { in: BLOCKING_STATUSES }, checkIn: { lt: to }, checkOut: { gt: from } },
    select: { checkIn: true, checkOut: true },
  });
  const free = days.filter((iso) => {
    const d = dateFromISO(iso);
    return !blocks.some((b) => d >= b.checkIn && d < b.checkOut);
  });
  if (free.length === 0) return { error: "These days are already blocked." };

  await prisma.$transaction(
    toRuns(free).map((r) =>
      prisma.booking.create({
        data: {
          roomId,
          guestName: "Blocked",
          checkIn: r.start,
          checkOut: r.end,
          guests: 0,
          nights: nightsBetween(r.start, r.end),
          totalPrice: null,
          status: "CONFIRMED",
          source: "BLOCK",
        },
      })
    )
  );
  revalidateCalendar();
  return { ok: true };
}

/** Remove blocks from the selected nights (blocks partly outside are trimmed or split). */
export async function unblockDates(roomId: string, first: string, last: string): Promise<DayPriceState> {
  await requireSession();
  if (!validRange(roomId, first, last)) return { error: "Select a day or a range of days first." };
  const from = dateFromISO(first);
  const to = addDays(dateFromISO(last), 1);
  const blocks = await prisma.booking.findMany({
    where: { roomId, source: "BLOCK", status: { in: BLOCKING_STATUSES }, checkIn: { lt: to }, checkOut: { gt: from } },
  });
  if (blocks.length === 0) return { error: "None of these days are blocked." };

  await prisma.$transaction(
    blocks.flatMap((b) => {
      const keep: { start: Date; end: Date }[] = [];
      if (b.checkIn < from) keep.push({ start: b.checkIn, end: from });
      if (b.checkOut > to) keep.push({ start: to, end: b.checkOut });
      return [
        prisma.booking.delete({ where: { id: b.id } }),
        ...keep.map((k) =>
          prisma.booking.create({
            data: {
              roomId,
              guestName: b.guestName,
              message: b.message,
              checkIn: k.start,
              checkOut: k.end,
              guests: 0,
              nights: nightsBetween(k.start, k.end),
              totalPrice: null,
              status: b.status,
              source: "BLOCK",
            },
          })
        ),
      ];
    })
  );
  revalidateCalendar();
  return { ok: true };
}

/**
 * Open (guests can request) or close the selected nights. Open periods are
 * stored as windows; we rebuild the windows around the selection so they stay
 * merged and tidy.
 */
export async function setDatesOpen(
  roomId: string,
  first: string,
  last: string,
  open: boolean
): Promise<DayPriceState> {
  await requireSession();
  if (!validRange(roomId, first, last)) return { error: "Select a day or a range of days first." };
  const from = dateFromISO(first);
  const to = addDays(dateFromISO(last), 1);

  // Windows touching the selection (including ones that just meet it).
  const windows = await prisma.availabilityWindow.findMany({
    where: { roomId, start: { lte: to }, end: { gte: from } },
  });
  const openDays = new Set<string>();
  for (const w of windows) {
    for (let d = new Date(w.start); d < w.end; d = addDays(d, 1)) openDays.add(d.toISOString().slice(0, 10));
  }
  for (const iso of dayList(first, last)) {
    if (open) openDays.add(iso);
    else openDays.delete(iso);
  }

  await prisma.$transaction([
    prisma.availabilityWindow.deleteMany({ where: { id: { in: windows.map((w) => w.id) } } }),
    ...toRuns(Array.from(openDays)).map((r) =>
      prisma.availabilityWindow.create({ data: { roomId, start: r.start, end: r.end } })
    ),
  ]);
  revalidateCalendar();
  return { ok: true };
}

export async function deleteAvailabilityWindow(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.availabilityWindow.delete({ where: { id } });
  revalidatePath("/admin/calendar");
  revalidatePath("/rooms");
}

// --------------------------------------------------------------------------
// Rooms
// --------------------------------------------------------------------------

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = base || "room";
  let slug = root;
  let n = 1;
  // Loop until we find a free slug.
  while (true) {
    const existing = await prisma.room.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

const roomSchema = z.object({
  name: z.string().trim().min(2, "Room name is required"),
  roomType: z.string().trim().min(1, "Choose a room type"),
  shortDesc: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().min(1, "Add a description"),
  maxGuests: z.coerce.number().int().min(1).max(20),
  bedConfig: z.string().trim().optional().or(z.literal("")),
  sizeSqm: z.coerce.number().int().min(0).max(1000).optional(),
  published: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export type RoomFormState = { error?: string };

export async function saveRoom(
  _prev: RoomFormState,
  formData: FormData
): Promise<RoomFormState> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const parsed = roomSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;
  const basePrice = parsePriceToCents(String(formData.get("basePrice") ?? "0"));
  if (basePrice <= 0) return { error: "Enter a nightly price." };

  const amenityKeys = formData.getAll("amenityKeys").map(String);
  const amenities = await prisma.amenity.findMany({
    where: { key: { in: amenityKeys } },
    select: { id: true },
  });

  const beds = parseBeds(String(formData.get("beds") ?? "[]"));

  const customSlug = String(formData.get("slug") ?? "").trim();
  const slugBase = customSlug ? slugify(customSlug) : slugify(d.name);

  const data = {
    name: d.name,
    roomType: d.roomType,
    shortDesc: d.shortDesc || null,
    description: d.description,
    maxGuests: d.maxGuests,
    bedConfig: d.bedConfig || null,
    sizeSqm: d.sizeSqm || null,
    basePrice,
    published: Boolean(formData.get("published")),
    sortOrder: d.sortOrder ?? 0,
  };

  if (id) {
    const slug = await uniqueSlug(slugBase, id);
    await prisma.room.update({
      where: { id },
      data: {
        ...data,
        slug,
        amenities: { set: amenities.map((a) => ({ id: a.id })) },
        beds: { deleteMany: {}, create: beds },
      },
    });
  } else {
    const slug = await uniqueSlug(slugBase);
    await prisma.room.create({
      data: {
        ...data,
        slug,
        amenities: { connect: amenities.map((a) => ({ id: a.id })) },
        beds: { create: beds },
      },
    });
  }

  revalidatePath("/admin/rooms");
  revalidatePath("/rooms");
  redirect("/admin/rooms");
}

export async function deleteRoom(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.room.delete({ where: { id } });
  revalidatePath("/admin/rooms");
  revalidatePath("/rooms");
}

/** Flip a room between shown (live) and hidden on the public site. */
export async function toggleRoomPublished(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const room = await prisma.room.findUnique({ where: { id }, select: { published: true } });
  if (!room) return;
  await prisma.room.update({ where: { id }, data: { published: !room.published } });
  revalidatePath("/admin/visibility");
  revalidatePath("/admin/rooms");
  revalidatePath("/rooms");
  revalidatePath("/");
}

export async function addRoomImage(formData: FormData) {
  await requireSession();
  const roomId = String(formData.get("roomId") ?? "");
  const url = String(formData.get("url") ?? "");
  const alt = String(formData.get("alt") ?? "");
  if (!roomId || !url) return;
  const count = await prisma.roomImage.count({ where: { roomId } });
  await prisma.roomImage.create({
    data: { roomId, url, alt: alt || null, sortOrder: count },
  });
  revalidatePath(`/admin/rooms/${roomId}`);
}

export async function deleteRoomImage(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const roomId = String(formData.get("roomId") ?? "");
  if (!id) return;
  await prisma.roomImage.delete({ where: { id } });
  revalidatePath(`/admin/rooms/${roomId}`);
}

// --------------------------------------------------------------------------
// Settings
// --------------------------------------------------------------------------

export async function saveSettings(formData: FormData) {
  await requireSession();
  const str = (k: string) => String(formData.get(k) ?? "");
  await prisma.setting.update({
    where: { id: 1 },
    data: {
      propertyName: str("propertyName"),
      tagline: str("tagline"),
      heroHeadline: str("heroHeadline"),
      heroSubline: str("heroSubline"),
      aboutTitle: str("aboutTitle"),
      aboutBody: str("aboutBody"),
      breakfastInfo: str("breakfastInfo"),
      houseRules: str("houseRules"),
      addressLine: str("addressLine"),
      town: str("town"),
      county: str("county"),
      eircode: str("eircode"),
      country: str("country"),
      phone: str("phone"),
      email: str("email"),
      checkInTime: str("checkInTime"),
      checkOutTime: str("checkOutTime"),
      facebookUrl: str("facebookUrl"),
      instagramUrl: str("instagramUrl"),
      mapEmbedUrl: str("mapEmbedUrl"),
      currency: str("currency") || "EUR",
      metaRetentionDays: Math.max(0, Math.min(3650, parseInt(str("metaRetentionDays"), 10) || 0)),
      comingSoon: Boolean(formData.get("comingSoon")),
    },
  });
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}
