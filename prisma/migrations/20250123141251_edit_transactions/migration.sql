/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Transactions` table. All the data in the column will be lost.
  - Added the required column `createCuid` to the `Transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedCuid` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_updatedBy_fkey";

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "createdBy",
DROP COLUMN "updatedBy",
ADD COLUMN     "createCuid" TEXT NOT NULL,
ADD COLUMN     "updatedCuid" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_createCuid_fkey" FOREIGN KEY ("createCuid") REFERENCES "User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_updatedCuid_fkey" FOREIGN KEY ("updatedCuid") REFERENCES "User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;
