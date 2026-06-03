import "server-only";
import { prisma } from "./prisma";
import { BLOCKING_STATUSES } from "./constants";
import { dayInStay, intervalsOverlap } from "./dates";

export type Stay = { checkIn: Date; checkOut: Date };

/**
 * Fetch the date ranges that block a room (pending + confirmed bookings, manual
 * reservations and owner blocks). Declined/cancelled bookings do not block.
 */
export async function getBlockingStays(
  roomId: string,
  from?: Date,
  to?: Date
): Promise<Stay[]> {
  const rows = await prisma.booking.findMany({
    where: {
      roomId,
      status: { in: BLOCKING_STATUSES },
      ...(from && to
        ? { checkIn: { lt: to }, checkOut: { gt: from } }
        : {}),
    },
    select: { checkIn: true, checkOut: true },
  });
  return rows;
}

/** Is a room free for the whole interval [checkIn, checkOut)? */
export async function isRoomAvailable(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  ignoreBookingId?: string
): Promise<boolean> {
  const clash = await prisma.booking.findFirst({
    where: {
      roomId,
      status: { in: BLOCKING_STATUSES },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
      ...(ignoreBookingId ? { id: { not: ignoreBookingId } } : {}),
    },
    select: { id: true },
  });
  return clash === null;
}

/** Return the set of occupied YYYY-MM-DD day-strings for a room from given stays. */
export function occupiedDaySet(stays: Stay[]): Set<string> {
  const set = new Set<string>();
  for (const stay of stays) {
    const cursor = new Date(stay.checkIn);
    while (cursor < stay.checkOut) {
      set.add(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  return set;
}

// --- Availability windows (rooms are closed by default) -------------------

export type Window = { start: Date; end: Date };

/** Open windows for a room that overlap [from, to). */
export async function getOpenWindows(
  roomId: string,
  from?: Date,
  to?: Date
): Promise<Window[]> {
  return prisma.availabilityWindow.findMany({
    where: {
      roomId,
      ...(from && to ? { start: { lt: to }, end: { gt: from } } : {}),
    },
    select: { start: true, end: true },
    orderBy: { start: "asc" },
  });
}

/** Set of YYYY-MM-DD day-strings that are open, from given windows. */
export function openDaySet(windows: Window[]): Set<string> {
  const set = new Set<string>();
  for (const w of windows) {
    const cursor = new Date(w.start);
    while (cursor < w.end) {
      set.add(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  return set;
}

/** Is every night in [checkIn, checkOut) inside an open window? */
export async function isRangeOpen(
  roomId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> {
  const windows = await getOpenWindows(roomId, checkIn, checkOut);
  const open = openDaySet(windows);
  const cursor = new Date(checkIn);
  while (cursor < checkOut) {
    if (!open.has(cursor.toISOString().slice(0, 10))) return false;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return true;
}

export { dayInStay, intervalsOverlap };
