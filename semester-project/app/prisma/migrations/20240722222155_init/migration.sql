-- AlterTable
ALTER TABLE "form" ALTER COLUMN "avalible_from" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "avalible_from" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "avalible_until" SET DATA TYPE TIMESTAMPTZ;
