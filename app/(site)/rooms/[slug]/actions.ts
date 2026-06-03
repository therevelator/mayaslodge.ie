"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRoomAvailable, isRangeOpen } from "@/lib/availability";
import { dateFromISO, nightsBetween, todayUTC } from "@/lib/dates";
import { captureRequestMeta } from "@/lib/request-meta";

// All guest fields are required.
const schema = z.object({
  roomId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a check-in date"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a check-out date"),
  guestName: z.string().trim().min(2, "Please tell us your name"),
  guestEmail: z.string().trim().email("Enter a valid email"),
  guestPhone: z.string().trim().min(6, "Please add a phone number").max(40),
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
      totalPrice: room.basePrice * nights,
      status: "PENDING",
      source: "WEBSITE",
      ...meta,
    },
  });

  redirect(`/booking/success?ref=${booking.id.slice(-6).toUpperCase()}`);
}
