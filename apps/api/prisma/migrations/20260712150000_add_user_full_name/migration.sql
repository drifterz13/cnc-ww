ALTER TABLE "User"
ADD COLUMN "fullName" TEXT NOT NULL DEFAULT '';

UPDATE "User"
SET "fullName" = split_part("email", '@', 1)
WHERE "fullName" = '';

ALTER TABLE "User"
ALTER COLUMN "fullName" DROP DEFAULT;
