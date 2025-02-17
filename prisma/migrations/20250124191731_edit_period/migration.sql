/*
  Warnings:

  - Added the required column `fromDate` to the `Period` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toDate` to the `Period` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Period" ADD COLUMN     "fromDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "toDate" TIMESTAMP(3) NOT NULL;
