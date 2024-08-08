/*
  Warnings:

  - You are about to drop the column `street_name` on the `user` table. All the data in the column will be lost.
  - Added the required column `street` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "street_name",
ADD COLUMN     "street" TEXT NOT NULL;
