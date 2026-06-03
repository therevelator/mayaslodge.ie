// Shared starter data for the 6 rooms, used by both the full dev seed
// (prisma/seed.ts) and the production first-run bootstrap (prisma/bootstrap.ts).
// Prices are in euro-cents. Images reference the generated placeholders in
// public/rooms — the owner replaces them with real photos in the admin.

export type RoomSeed = {
  slug: string;
  name: string;
  roomType: string;
  shortDesc: string;
  description: string;
  maxGuests: number;
  bedConfig: string;
  sizeSqm: number;
  basePrice: number;
  amenityKeys: string[];
  img: string;
  beds: { type: string; quantity: number }[];
};

export const ROOMS: RoomSeed[] = [
  {
    slug: "shamrock-room",
    name: "The Shamrock Room",
    roomType: "Double",
    shortDesc: "A bright double with ensuite and city access.",
    description:
      "Our signature double room, full of light and warmth. A comfortable king-size bed, soft Irish wool throws and a spotless private bathroom make this a guest favourite.",
    maxGuests: 2,
    bedConfig: "1 King bed",
    sizeSqm: 18,
    basePrice: 9500,
    amenityKeys: ["private_bathroom", "shower", "wifi", "tv", "heating", "tea_coffee", "hairdryer", "breakfast", "non_smoking", "parking"],
    img: "shamrock",
    beds: [{ type: "King", quantity: 1 }],
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
    beds: [{ type: "Double", quantity: 1 }],
  },
  {
    slug: "connemara-room",
    name: "The Connemara Room",
    roomType: "Family",
    shortDesc: "Spacious family room sleeping up to four.",
    description:
      "Our largest room, ideal for families. A double bed and two singles and an ensuite with a walk-in shower. Children are very welcome — travel cot available on request.",
    maxGuests: 4,
    bedConfig: "1 Double + 2 Single beds",
    sizeSqm: 28,
    basePrice: 13000,
    amenityKeys: ["private_bathroom", "shower", "wifi", "tv", "heating", "tea_coffee", "minifridge", "breakfast", "family_friendly", "non_smoking", "parking"],
    img: "connemara",
    beds: [{ type: "Double", quantity: 1 }, { type: "Single", quantity: 2 }],
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
    beds: [{ type: "Single", quantity: 2 }],
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
    beds: [{ type: "Double", quantity: 1 }],
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
    amenityKeys: ["private_bathroom", "bathtub", "shower", "wifi", "tv", "heating", "tea_coffee", "minifridge", "hairdryer", "blackout", "breakfast", "non_smoking", "parking"],
    img: "burren",
    beds: [{ type: "King", quantity: 1 }],
  },
];

export const SETTINGS_DEFAULTS = {
  propertyName: "Maya's Lodge",
  tagline: "A warm Irish welcome",
  heroHeadline: "Your home away from home in Dublin",
  heroSubline:
    "A family-run bed & breakfast in Santry, just minutes from Dublin Airport and the city — six cosy rooms, hearty breakfasts and a proper Irish welcome.",
  aboutTitle: "Welcome to Maya's Lodge",
  aboutBody:
    "Tucked away in Santry on Dublin's northside, Maya's Lodge is a small family-run bed & breakfast where every guest is treated like one of our own. We're ideally placed — only minutes from Dublin Airport, a short hop to the city centre, and close to the coast at Clontarf and Howth. Our six individually styled rooms blend traditional Irish charm with the comforts you need for a restful stay.",
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
  mapEmbedUrl:
    "https://www.google.com/maps?q=37+Shanrath+Road,+Santry,+Dublin,+D09+NY56&output=embed",
  currency: "EUR",
};
