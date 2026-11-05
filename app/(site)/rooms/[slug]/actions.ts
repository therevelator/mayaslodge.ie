"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { notifyNewBooking } from "@/lib/notify";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRoomAvailable, isRangeOpen } from "@/lib/availability";
import { dateFromISO, nightsBetween, todayUTC } from "@/lib/dates";
import { captureRequestMeta } from "@/lib/request-meta";
import { stayTotal, hasUnpricedNight } from "@/lib/pricing";
import { MAX_NIGHTS } from "@/lib/constants";
import { sanitizePhone, isAcceptablePhone, isValidEmail } from "@/lib/contact-validation";

// All guest fields are required.
const schema = z.object({
  roomId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a check-in date"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a check-out date"),
  guestName: z.string().trim().min(2, "Please tell us your name"),
  guestEmail: z
    .string()
    .trim()
    .email("Enter a valid email")
    .refine(isValidEmail, "Enter a valid email"),
  guestPhone: z
    .string()
    .transform(sanitizePhone)
    .refine(isAcceptablePhone, "Enter a valid phone number (digits and + only)"),
  guests: z.coerce.number().int().min(1).max(20),
  message: z.string().trim().min(1, "Please add a short message").max(2000),
});

export type BookingFormState = {
  ok: boolean;
  error?: string;
};

export async function requestBooking(
  _prev: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const data = parsed.data;

  const room = await prisma.room.findUnique({ where: { id: data.roomId } });
  if (!room || !room.published) {
    return { ok: false, error: "This room is no longer available." };
  }

  const checkIn = dateFromISO(data.checkIn);
  const checkOut = dateFromISO(data.checkOut);
  const nights = nightsBetween(checkIn, checkOut);

  if (nights < 1) {
    return { ok: false, error: "Check-out must be after check-in." };
  }
  if (nights > MAX_NIGHTS) {
    return {
      ok: false,
      error: `Online requests are limited to ${MAX_NIGHTS} nights. For longer stays, please get in touch.`,
    };
  }
  if (checkIn < todayUTC()) {
    return { ok: false, error: "Check-in cannot be in the past." };
  }
  if (data.guests > room.maxGuests) {
    return {
      ok: false,
      error: `This room sleeps up to ${room.maxGuests} guests.`,
    };
  }

  // Re-check on the server — never trust the client calendar.
  // 1) The whole range must be inside the room's open dates.
  const totalPrice = await stayTotal(room, checkIn, checkOut);
  if (await hasUnpricedNight(room, checkIn, checkOut)) {
    return { ok: false, error: "Some of these nights aren't available to book online yet." };
  }

  const open = await isRangeOpen(room.id, checkIn, checkOut);
  if (!open) {
    return {
      ok: false,
      error: "Those dates aren't open for booking. Please pick available dates.",
    };
  }
  // 2) And free of any other reservation.
  const available = await isRoomAvailable(room.id, checkIn, checkOut);
  if (!available) {
    return {
      ok: false,
      error: "Sorry, those dates have just been taken. Please pick another range.",
    };
  }

  // Capture technical metadata (server-side, no browser prompt).
  const meta = await captureRequestMeta();

  const booking = await prisma.booking.create({
    data: {
      roomId: room.id,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      checkIn,
      checkOut,
      guests: data.guests,
      message: data.message,
      nights,
      totalPrice,
      status: "PENDING",
      source: "WEBSITE",
      ...meta,
    },
  });

  // Email the owner once the guest already has their confirmation page.
  after(() =>
    notifyNewBooking({
      id: booking.id,
      roomName: room.name,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      message: booking.message,
    })
  );

  redirect(`/booking/success?ref=${booking.id.slice(-6).toUpperCase()}`);
}
