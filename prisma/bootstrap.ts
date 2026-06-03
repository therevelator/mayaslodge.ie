// First-run bootstrap for production. Runs on deploy but does nothing once the
// database already has an admin user — so it never overwrites your changes and
// never re-adds data. Creates: admin user, amenities, settings, and the 6
// starter rooms (which you then edit). It does NOT create any bookings or open
// any availability (rooms stay closed until you open dates).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AMENITY_CATALOG } from "../lib/constants";
import { ROOMS, SETTINGS_DEFAULTS } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  const adminCount = await prisma.adminUser.count();
  if (adminCount > 0) {
    console.log("Bootstrap: database already set up — skipping.");
    return;
  }

  console.log("Bootstrap: fresh database, setting up…");

  // Admin user (credentials from environment).
  const email = process.env.ADMIN_EMAIL ?? "maya@mayaslodge.ie";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({
    data: { email, passwordHash, name: process.env.ADMIN_NAME ?? "Maya" },
  });
  console.log(`  • admin user created (${email})`);

  // Amenities.
  for (let i = 0; i < AMENITY_CATALOG.length; i++) {
    const a = AMENITY_CATALOG[i];
    await prisma.amenity.upsert({
      where: { key: a.key },
      update: {},
      create: { ...a, sortOrder: i },
    });
  }
  const amenities = await prisma.amenity.findMany();
  const amenityIdByKey = (key: string) => {
    const found = amenities.find((a) => a.key === key);
    return found ? { id: found.id } : null;
  };
  console.log(`  • ${amenities.length} amenities`);

  // Settings.
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...SETTINGS_DEFAULTS },
  });
  console.log("  • settings");

  // Rooms (with beds, amenities and placeholder images).
  for (let i = 0; i < ROOMS.length; i++) {
    const r = ROOMS[i];
    await prisma.room.create({
      data: {
        slug: r.slug,
        name: r.name,
        roomType: r.roomType,
        shortDesc: r.shortDesc,
        description: r.description,
        maxGuests: r.maxGuests,
        bedConfig: r.bedConfig,
        sizeSqm: r.sizeSqm,
        basePrice: r.basePrice,
        sortOrder: i,
        published: true,
        amenities: {
          connect: r.amenityKeys.map(amenityIdByKey).filter((x): x is { id: string } => x !== null),
        },
        beds: {
          create: r.beds.map((b, idx) => ({ type: b.type, quantity: b.quantity, sortOrder: idx })),
        },
        images: {
          create: [
            { url: `/rooms/${r.img}.svg`, alt: `${r.name} — main photo`, sortOrder: 0 },
            { url: `/rooms/${r.img}-2.svg`, alt: `${r.name} — second photo`, sortOrder: 1 },
          ],
        },
      },
    });
  }
  console.log(`  • ${ROOMS.length} starter rooms`);
  console.log("Bootstrap: done.");
}

main()
  .catch((e) => {
    console.error("Bootstrap failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
