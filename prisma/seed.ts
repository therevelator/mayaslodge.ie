import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AMENITY_CATALOG } from "../lib/constants";

const prisma = new PrismaClient();

function utcDay(offsetDays: number): Date {
  const d = new Date();
  const base = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base;
}

async function main() {
  // --- Amenities ---
  for (let i = 0; i < AMENITY_CATALOG.length; i++) {
    const a = AMENITY_CATALOG[i];
    await prisma.amenity.upsert({
      where: { key: a.key },
      update: { label: a.label, icon: a.icon, category: a.category, sortOrder: i },
      create: { ...a, sortOrder: i },
    });
  }
  const amenities = await prisma.amenity.findMany();
  const byKey = (key: string) => {
    const found = amenities.find((a) => a.key === key);
    if (!found) throw new Error(`Amenity ${key} missing`);
    return { id: found.id };
  };

  // --- Admin user ---
  const email = process.env.ADMIN_EMAIL ?? "maya@mayaslodge.ie";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: process.env.ADMIN_NAME ?? "Maya" },
  });

  // --- Settings ---
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      propertyName: "Maya's Lodge",
      tagline: "A warm Irish welcome",
      heroHeadline: "Your home away from home in Dublin",
      heroSubline:
        "A family-run bed & breakfast in Santry, just minutes from Dublin Airport and the city — six cosy rooms, hearty breakfasts and a proper Irish welcome.",
      aboutTitle: "Welcome to Maya's Lodge",
      aboutBody:
        "Tucked away in Santry on Dublin's northside, Maya's Lodge is a small family-run bed & breakfast where every guest is treated like one of our own. We're ideally placed — only minutes from Dublin Airport, a short hop to the city centre, and close to the coast at Clontarf and Howth. Our six individually styled rooms blend traditional Irish charm with the comforts you need for a restful stay. Wake up to a full Irish breakfast, explore the city by day, then return to a warm welcome.",
      breakfastInfo:
        "A full Irish breakfast is served every morning from 8:00 to 9:30, included with every room. Vegetarian, vegan and gluten-free options are always available — just let us know.",
      addressLine: "37 Shanrath Road",
      town: "Santry",
      county: "Co. Dublin",
      eircode: "D09 NY56",
      country: "Ireland",
      phone: "+353 (0) 83 804 6727",
      email: "hello@mayaslodge.ie",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      houseRules:
        "Check-in from 3:00pm · Check-out by 11:00am · No smoking indoors · Quiet hours after 10:00pm · Well-behaved pets welcome by arrangement.",
      facebookUrl: "https://facebook.com/",
      instagramUrl: "https://instagram.com/",
      bookingComUrl: "https://www.booking.com/",
      mapEmbedUrl:
        "https://www.google.com/maps?q=37+Shanrath+Road,+Santry,+Dublin,+D09+NY56&output=embed",
      currency: "EUR",
    },
  });

  // --- Rooms ---
  const rooms = [
    {
      slug: "shamrock-room",
      name: "The Shamrock Room",
      roomType: "Double",
      shortDesc: "A bright double with ensuite and countryside views.",
      description:
        "Our signature double room, full of light and warmth. A comfortable king-size bed, soft Irish wool throws and a spotless private bathroom make this a guest favourite. Large windows look out over rolling green fields.",
      maxGuests: 2,
      bedConfig: "1 King bed",
      sizeSqm: 18,
      basePrice: 9500,
      amenityKeys: ["private_bathroom", "shower", "wifi", "tv", "heating", "tea_coffee", "hairdryer", "breakfast", "garden_view", "non_smoking", "parking"],
      img: "shamrock",
    },
    {
      slug: "claddagh-room",
      name: "The Claddagh Room",
      roomType: "Double/Twin",
      shortDesc: "Flexible double or twin, perfect for friends or couples.",
      description:
        "Versatile and cosy, the Claddagh Room can be made up as a double or as two single beds — just let us know when you book. Ensuite bathroom, plenty of storage and a quiet aspect at the back of the house.",
      maxGuests: 2,
      bedConfig: "1 Double or 2 Single beds",
      sizeSqm: 17,
      basePrice: 9500,
      amenityKeys: ["private_bathroom", "shower", "wifi", "tv", "heating", "tea_coffee", "wardrobe", "breakfast", "non_smoking", "parking"],
      img: "claddagh",
    },
    {
      slug: "connemara-room",
      name: "The Connemara Room",
      roomType: "Family",
      shortDesc: "Spacious family room sleeping up to four, with sea view.",
      description:
        "Our largest room, ideal for families. A double bed and two singles, an ensuite with a walk-in shower, and a window framing the Connemara coastline. Children are very welcome — travel cot available on request.",
      maxGuests: 4,
      bedConfig: "1 Double + 2 Single beds",
      sizeSqm: 28,
      basePrice: 13000,
      amenityKeys: ["private_bathroom", "shower", "wifi", "tv", "heating", "tea_coffee", "minifridge", "breakfast", "sea_view", "family_friendly", "non_smoking", "parking"],
      img: "connemara",
    },
    {
      slug: "liffey-room",
      name: "The Liffey Room",
      roomType: "Twin",
      shortDesc: "Snug twin room with a private shared bathroom.",
      description:
        "A snug, value-friendly twin room with two single beds. The Liffey Room uses a private bathroom just across the hall, kept exclusively for this room. Great for friends travelling together.",
      maxGuests: 2,
      bedConfig: "2 Single beds",
      sizeSqm: 14,
      basePrice: 7500,
      amenityKeys: ["shared_bathroom", "shower", "wifi", "tv", "heating", "tea_coffee", "breakfast", "non_smoking", "parking"],
      img: "liffey",
    },
    {
      slug: "aran-room",
      name: "The Aran Room",
      roomType: "Double",
      shortDesc: "Romantic double overlooking the garden.",
      description:
        "A peaceful double room at the front of the house, overlooking our cottage garden. Beautifully decorated with handmade Aran touches, a comfortable double bed and a modern ensuite with rainfall shower.",
      maxGuests: 2,
      bedConfig: "1 Double bed",
      sizeSqm: 19,
      basePrice: 10500,
      amenityKeys: ["private_bathroom", "shower", "wifi", "tv", "heating", "tea_coffee", "hairdryer", "blackout", "breakfast", "garden_view", "non_smoking", "parking"],
      img: "aran",
    },
    {
      slug: "burren-suite",
      name: "The Burren Suite",
      roomType: "Suite",
      shortDesc: "Our top suite with a freestanding bathtub.",
      description:
        "Indulge in our finest room. The Burren Suite offers a generous king-size bed, a separate seating area and a luxurious ensuite with a freestanding bathtub and walk-in shower. The perfect choice for a special occasion.",
      maxGuests: 2,
      bedConfig: "1 King bed",
      sizeSqm: 32,
      basePrice: 15000,
      amenityKeys: ["private_bathroom", "bathtub", "shower", "wifi", "tv", "heating", "tea_coffee", "minifridge", "hairdryer", "blackout", "breakfast", "mountain_view", "non_smoking", "parking"],
      img: "burren",
    },
  ];

  const bedsBySlug: Record<string, { type: string; quantity: number }[]> = {
    "shamrock-room": [{ type: "King", quantity: 1 }],
    "claddagh-room": [{ type: "Double", quantity: 1 }],
    "connemara-room": [{ type: "Double", quantity: 1 }, { type: "Single", quantity: 2 }],
    "liffey-room": [{ type: "Single", quantity: 2 }],
    "aran-room": [{ type: "Double", quantity: 1 }],
    "burren-suite": [{ type: "King", quantity: 1 }],
  };

  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i];
    await prisma.room.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
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
        amenities: { connect: r.amenityKeys.map(byKey) },
        beds: {
          create: (bedsBySlug[r.slug] ?? []).map((b, idx) => ({
            type: b.type,
            quantity: b.quantity,
            sortOrder: idx,
          })),
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

  // --- Demo bookings ---
  const shamrock = await prisma.room.findUnique({ where: { slug: "shamrock-room" } });
  const connemara = await prisma.room.findUnique({ where: { slug: "connemara-room" } });
  const aran = await prisma.room.findUnique({ where: { slug: "aran-room" } });

  if (shamrock) {
    await prisma.booking.create({
      data: {
        roomId: shamrock.id,
        guestName: "John & Mary Walsh",
        guestEmail: "walsh@example.com",
        guestPhone: "+353 86 111 2222",
        checkIn: utcDay(5),
        checkOut: utcDay(8),
        guests: 2,
        nights: 3,
        totalPrice: 9500 * 3,
        status: "CONFIRMED",
        source: "WEBSITE",
        message: "Celebrating our anniversary.",
      },
    });
  }
  if (connemara) {
    await prisma.booking.create({
      data: {
        roomId: connemara.id,
        guestName: "The O'Brien Family",
        guestEmail: "obrien@example.com",
        checkIn: utcDay(12),
        checkOut: utcDay(15),
        guests: 4,
        nights: 3,
        totalPrice: 13000 * 3,
        status: "PENDING",
        source: "WEBSITE",
        message: "Two adults, two children (6 and 9). Travel cot please.",
      },
    });
  }
  if (aran) {
    await prisma.booking.create({
      data: {
        roomId: aran.id,
        guestName: "Maintenance",
        checkIn: utcDay(20),
        checkOut: utcDay(22),
        guests: 0,
        status: "CONFIRMED",
        source: "BLOCK",
        message: "Repainting.",
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
