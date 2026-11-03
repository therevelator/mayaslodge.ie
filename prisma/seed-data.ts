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
    amenityKeys: ["private_bathroom", "shower", "wifi", "tv", "heating", "tea_coffee", "hairdryer", "non_smoking", "parking"],
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
    amenityKeys: ["private_bathroom", "shower", "wifi", "tv", "heating", "tea_coffee", "wardrobe", "non_smoking", "parking"],
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
    amenityKeys: ["private_bathroom", "shower", "wifi", "tv", "heating", "tea_coffee", "minifridge", "family_friendly", "non_smoking", "parking"],
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
    amenityKeys: ["shared_bathroom", "shower", "wifi", "tv", "heating", "tea_coffee", "non_smoking", "parking"],
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
    amenityKeys: ["private_bathroom", "shower", "wifi", "tv", "heating", "tea_coffee", "hairdryer", "blackout", "garden_view", "non_smoking", "parking"],
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
    amenityKeys: ["private_bathroom", "bathtub", "shower", "wifi", "tv", "heating", "tea_coffee", "minifridge", "hairdryer", "blackout", "non_smoking", "parking"],
    img: "burren",
    beds: [{ type: "King", quantity: 1 }],
  },
];

export const SETTINGS_DEFAULTS = {
  propertyName: "Maya's Lodge",
  tagline: "Santry, Dublin — by the airport",
  heroHeadline: "Minutes from Dublin Airport, close to the city centre",
  heroSubline:
    "Maya's Lodge is a bed & breakfast in Santry, Dublin — only minutes from Dublin Airport and a short ride from the city centre. A practical, comfortable base whether you're catching an early flight, stopping over, or exploring Dublin.",
  aboutTitle: "About Maya's Lodge",
  aboutBody:
    "Maya's Lodge is a bed & breakfast in Santry, Dublin, chosen for its location. Dublin Airport is just minutes away — handy for early flights, late arrivals and stopovers — and frequent buses on the Swords Road run straight into the city centre and O'Connell Street. From there, Trinity College, Temple Bar, Dublin Castle, the Guinness Storehouse and Grafton Street are all within easy reach, with Croke Park, the 3Arena and the coast at Clontarf and Howth a short trip away. The M50 motorway is close by, so the rest of Ireland is easy to get to as well.",
  breakfastInfo:
    "A full Irish breakfast is available on request for €10 per person, per day, served fresh each morning. Vegetarian, vegan and gluten-free options are always available — just let us know.",
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
