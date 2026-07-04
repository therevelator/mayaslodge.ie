// Shared constants and small value helpers. No DB / server imports here so this
// file is safe to use from client components too.

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "DECLINED",
  "CANCELLED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_SOURCES = [
  "WEBSITE", // guest request from this site
  "MANUAL", // owner-entered reservation (e.g. phone/email)
  "BLOCK", // owner blocking dates (maintenance, personal use)
  "BOOKING_COM", // reserved for future Booking.com iCal sync
] as const;
export type BookingSource = (typeof BOOKING_SOURCES)[number];

// Statuses that occupy a room (i.e. make dates unavailable).
export const BLOCKING_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED"];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
};

export const SOURCE_LABELS: Record<BookingSource, string> = {
  WEBSITE: "Website",
  MANUAL: "Manual",
  BLOCK: "Blocked",
  BOOKING_COM: "Booking.com",
};

export const BED_TYPES = [
  "Single",
  "Twin",
  "Double",
  "Queen",
  "King",
  "Sofa bed",
  "Bunk bed",
  "Cot / Travel cot",
] as const;

export const ROOM_TYPES = [
  "Single",
  "Double",
  "Twin",
  "Double/Twin",
  "Family",
  "Triple",
  "Suite",
] as const;

// Master list of amenities used to seed the DB and render the admin picker.
export const AMENITY_CATALOG: {
  key: string;
  label: string;
  icon: string;
  category: string;
}[] = [
  { key: "private_bathroom", label: "Private bathroom (ensuite)", icon: "bath", category: "Bathroom" },
  { key: "shared_bathroom", label: "Shared bathroom", icon: "bath", category: "Bathroom" },
  { key: "shower", label: "Walk-in shower", icon: "shower", category: "Bathroom" },
  { key: "bathtub", label: "Bathtub", icon: "bath", category: "Bathroom" },
  { key: "toiletries", label: "Free toiletries", icon: "soap", category: "Bathroom" },
  { key: "hairdryer", label: "Hairdryer", icon: "wind", category: "Bathroom" },
  { key: "wifi", label: "Free Wi-Fi", icon: "wifi", category: "Comfort" },
  { key: "tv", label: "Flat-screen TV", icon: "tv", category: "Comfort" },
  { key: "heating", label: "Central heating", icon: "flame", category: "Comfort" },
  { key: "desk", label: "Work desk", icon: "desk", category: "Comfort" },
  { key: "wardrobe", label: "Wardrobe", icon: "wardrobe", category: "Comfort" },
  { key: "blackout", label: "Blackout curtains", icon: "moon", category: "Comfort" },
  { key: "tea_coffee", label: "Tea & coffee facilities", icon: "coffee", category: "Kitchen" },
  { key: "kettle", label: "Electric kettle", icon: "kettle", category: "Kitchen" },
  { key: "minifridge", label: "Mini fridge", icon: "fridge", category: "Kitchen" },
  { key: "garden_view", label: "Garden view", icon: "leaf", category: "View" },
  { key: "sea_view", label: "Sea view", icon: "wave", category: "View" },
  { key: "mountain_view", label: "Mountain view", icon: "mountain", category: "View" },
  { key: "parking", label: "Free parking", icon: "parking", category: "Practical" },
  { key: "non_smoking", label: "Non-smoking", icon: "nosmoke", category: "Practical" },
  { key: "family_friendly", label: "Family friendly", icon: "family", category: "Practical" },
  { key: "pet_friendly", label: "Pet friendly", icon: "paw", category: "Practical" },
  { key: "accessible", label: "Step-free access", icon: "accessible", category: "Practical" },
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  GBP: "£",
  USD: "$",
};
