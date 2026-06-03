-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "propertyName" TEXT NOT NULL DEFAULT 'Maya''s Lodge',
    "tagline" TEXT NOT NULL DEFAULT 'A warm Irish welcome',
    "heroHeadline" TEXT NOT NULL DEFAULT 'Your home away from home in Ireland',
    "heroSubline" TEXT NOT NULL DEFAULT 'A family-run bed & breakfast with six cosy rooms, hearty breakfasts and a proper Irish welcome.',
    "aboutTitle" TEXT NOT NULL DEFAULT 'Welcome to Maya''s Lodge',
    "aboutBody" TEXT NOT NULL DEFAULT '',
    "addressLine" TEXT NOT NULL DEFAULT '',
    "town" TEXT NOT NULL DEFAULT '',
    "county" TEXT NOT NULL DEFAULT '',
    "eircode" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT 'Ireland',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT 'hello@mayaslodge.ie',
    "checkInTime" TEXT NOT NULL DEFAULT '15:00',
    "checkOutTime" TEXT NOT NULL DEFAULT '11:00',
    "houseRules" TEXT NOT NULL DEFAULT '',
    "breakfastInfo" TEXT NOT NULL DEFAULT 'A full Irish breakfast is served every morning, included with every room.',
    "facebookUrl" TEXT NOT NULL DEFAULT '',
    "instagramUrl" TEXT NOT NULL DEFAULT '',
    "bookingComUrl" TEXT NOT NULL DEFAULT '',
    "mapEmbedUrl" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "metaRetentionDays" INTEGER NOT NULL DEFAULT 90,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Setting" ("aboutBody", "aboutTitle", "addressLine", "bookingComUrl", "breakfastInfo", "checkInTime", "checkOutTime", "country", "county", "currency", "eircode", "email", "facebookUrl", "heroHeadline", "heroSubline", "houseRules", "id", "instagramUrl", "mapEmbedUrl", "phone", "propertyName", "tagline", "town", "updatedAt") SELECT "aboutBody", "aboutTitle", "addressLine", "bookingComUrl", "breakfastInfo", "checkInTime", "checkOutTime", "country", "county", "currency", "eircode", "email", "facebookUrl", "heroHeadline", "heroSubline", "houseRules", "id", "instagramUrl", "mapEmbedUrl", "phone", "propertyName", "tagline", "town", "updatedAt" FROM "Setting";
DROP TABLE "Setting";
ALTER TABLE "new_Setting" RENAME TO "Setting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
