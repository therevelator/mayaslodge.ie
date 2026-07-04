-- Breakfast is no longer an "included" amenity (now available on request for a
-- fee), so remove the amenity. Deleting the Amenity row also removes its
-- room links via the implicit many-to-many join table.
DELETE FROM "Amenity" WHERE "key" = 'breakfast';
