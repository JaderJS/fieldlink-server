/*
  Warnings:

  - You are about to drop the column `billed` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `fromAt` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `groupCuid` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `periodId` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Transactions" DROP CONSTRAINT "Transactions_periodId_fkey";

-- AlterTable
ALTER TABLE "public"."Transactions" DROP COLUMN "billed",
DROP COLUMN "content",
DROP COLUMN "fromAt",
DROP COLUMN "groupCuid",
DROP COLUMN "periodId",
DROP COLUMN "serviceId",
DROP COLUMN "value";
