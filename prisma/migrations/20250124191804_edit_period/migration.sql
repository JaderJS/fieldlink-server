/*
  Warnings:

  - You are about to drop the column `fromDate` on the `Period` table. All the data in the column will be lost.
  - You are about to drop the column `toDate` on the `Period` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `Period` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Period` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Period" DROP COLUMN "fromDate",
DROP COLUMN "toDate",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;
