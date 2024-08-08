/*
  Warnings:

  - You are about to drop the column `address` on the `user` table. All the data in the column will be lost.
  - Added the required column `house_number` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street_name` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `town` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "address",
ADD COLUMN     "house_number" TEXT NOT NULL,
ADD COLUMN     "place" TEXT NOT NULL,
ADD COLUMN     "street_name" TEXT NOT NULL,
ADD COLUMN     "town" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "submission" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "form_id" INTEGER NOT NULL,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
