-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "shortDesc" TEXT,
    "description" TEXT NOT NULL,
    "maxGuests" INTEGER NOT NULL DEFAULT 2,
    "bedConfig" TEXT,
    "sizeSqm" INTEGER,
    "basePrice" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Room" ("basePrice", "bedConfig", "createdAt", "description", "id", "maxGuests", "name", "published", "roomType", "shortDesc", "sizeSqm", "slug", "sortOrder", "updatedAt") SELECT "basePrice", "bedConfig", "createdAt", "description", "id", "maxGuests", "name", "published", "roomType", "shortDesc", "sizeSqm", "slug", "sortOrder", "updatedAt" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE UNIQUE INDEX "Room_slug_key" ON "Room"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Start with every existing room hidden; the owner shows them from admin.
UPDATE "Room" SET "published" = 0;
