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
