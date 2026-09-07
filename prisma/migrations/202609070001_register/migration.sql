CREATE SEQUENCE "Project_archiveNumber_seq";
ALTER TABLE "Project" ADD COLUMN "archiveNumber" INTEGER;
WITH numbered AS (
 SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS number FROM "Project"
)
UPDATE "Project" SET "archiveNumber" = numbered.number FROM numbered WHERE "Project"."id" = numbered."id";
SELECT setval('"Project_archiveNumber_seq"', COALESCE((SELECT MAX("archiveNumber") FROM "Project"), 0) + 1, false);
ALTER TABLE "Project" ALTER COLUMN "archiveNumber" SET NOT NULL;
ALTER TABLE "Project" ALTER COLUMN "archiveNumber" SET DEFAULT nextval('"Project_archiveNumber_seq"');
ALTER SEQUENCE "Project_archiveNumber_seq" OWNED BY "Project"."archiveNumber";
CREATE UNIQUE INDEX "Project_archiveNumber_key" ON "Project"("archiveNumber");
ALTER TABLE "Project"
 ADD COLUMN "titleLines" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "brief" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "direction" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "result" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "homeLayout" TEXT NOT NULL DEFAULT 'A',
 ADD COLUMN "artworkAspect" TEXT NOT NULL DEFAULT 'PORTRAIT';
UPDATE "Project" SET "brief" = "projectContext";
WITH layouts AS (SELECT "id", ROW_NUMBER() OVER (ORDER BY "sortOrder", "id") AS n FROM "Project")
UPDATE "Project" SET "homeLayout" = CASE (layouts.n - 1) % 4 WHEN 0 THEN 'A' WHEN 1 THEN 'B' WHEN 2 THEN 'C' ELSE 'D' END FROM layouts WHERE "Project"."id" = layouts."id";
ALTER TYPE "MediaLayout" ADD VALUE 'LARGE';
ALTER TYPE "MediaLayout" ADD VALUE 'OFFSET_SMALL';
ALTER TYPE "MediaLayout" ADD VALUE 'FULL_WIDTH';
ALTER TABLE "SiteSettings"
 ADD COLUMN "aboutHeadline" TEXT NOT NULL DEFAULT 'Design is how I organize attention.',
 ADD COLUMN "contactHeadline" TEXT NOT NULL DEFAULT E'Have something\nworth making?',
 ADD COLUMN "statement" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "statementAttribution" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "bookingText" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "openingEdition" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "introDisciplines" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 ADD COLUMN "workflowTools" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 ADD COLUMN "availableFor" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
