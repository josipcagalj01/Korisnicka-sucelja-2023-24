/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `department` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "department" ALTER COLUMN "name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "form" ALTER COLUMN "avalible_from" DROP NOT NULL,
ALTER COLUMN "avalible_from" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "department_name_key" ON "department"("name");
