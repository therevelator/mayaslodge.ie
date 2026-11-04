import "server-only";
import { prisma } from "./prisma";
import { addDays } from "./dates";

// Nightly pricing. A room has a standard basePrice; the owner can override it
// for specific nights (RoomPrice rows). A stay [checkIn, checkOut) costs the
// sum of each night's price.

/** Custom prices for nights in [from, to), keyed by YYYY-MM-DD. */
export async function getCustomPrices(
  roomId: string,
  from: Date,
  to: Date
): Promise<Record<string, number>> {
  const rows = await prisma.roomPrice.findMany({
    where: { roomId, date: { gte: from, lt: to } },
    select: { date: true, price: true },
  });
  const map: Record<string, number> = {};
  for (const r of rows) map[r.date.toISOString().slice(0, 10)] = r.price;
  return map;
}

/** Total price in euro-cents for the nights of [checkIn, checkOut). */
export async function stayTotal(
  room: { id: string; basePrice: number },
  checkIn: Date,
  checkOut: Date
): Promise<number> {
  const custom = await getCustomPrices(room.id, checkIn, checkOut);
  let total = 0;
  for (let d = new Date(checkIn); d < checkOut; d = addDays(d, 1)) {
    total += custom[d.toISOString().slice(0, 10)] ?? room.basePrice;
  }
  return total;
}

export type DisplayPrice = { price: number; from: boolean };

/**
 * The nightly price to advertise for each published room (room cards): the
 * lowest price among the open nights of the next year, custom prices included.
 * `from` is true when open nights don't all cost the same ("from €70 / night").
 * Rooms with no open nights fall back to their standard price.
 */
export async function getDisplayPrices(
  rooms: { id: string; basePrice: number }[]
): Promise<Record<string, DisplayPrice>> {
  const from = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");
  const to = addDays(from, 365);
  const ids = rooms.map((r) => r.id);
  const [windows, customs] = await Promise.all([
    prisma.availabilityWindow.findMany({
      where: { roomId: { in: ids }, start: { lt: to }, end: { gt: from } },
      select: { roomId: true, start: true, end: true },
    }),
    prisma.roomPrice.findMany({
      where: { roomId: { in: ids }, date: { gte: from, lt: to } },
      select: { roomId: true, date: true, price: true },
    }),
  ]);

  const custom = new Map<string, number>();
  for (const c of customs) custom.set(`${c.roomId}|${c.date.toISOString().slice(0, 10)}`, c.price);

  const out: Record<string, DisplayPrice> = {};
  for (const room of rooms) {
    let min = Infinity;
    let max = -Infinity;
    for (const w of windows) {
      if (w.roomId !== room.id) continue;
      for (let d = w.start < from ? new Date(from) : new Date(w.start); d < w.end && d < to; d = addDays(d, 1)) {
        const p = custom.get(`${room.id}|${d.toISOString().slice(0, 10)}`) ?? room.basePrice;
        if (p < min) min = p;
        if (p > max) max = p;
      }
    }
    out[room.id] = Number.isFinite(min) ? { price: min, from: max > min } : { price: room.basePrice, from: false };
  }
  return out;
}
