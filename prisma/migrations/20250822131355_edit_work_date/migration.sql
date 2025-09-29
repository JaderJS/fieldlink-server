/*
  Warnings:

  - Changed the type of `hours` on the `WorkDate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "WorkDate" DROP COLUMN "hours",
ADD COLUMN     "hours" INTEGER NOT NULL;
