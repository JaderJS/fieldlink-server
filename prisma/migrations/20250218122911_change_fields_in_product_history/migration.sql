/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `ProductPriceHistory` table. All the data in the column will be lost.
  - You are about to drop the column `updatedCuid` on the `ProductPriceHistory` table. All the data in the column will be lost.
  - Added the required column `createdCuid` to the `ProductPriceHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductPriceHistory" DROP CONSTRAINT "ProductPriceHistory_updatedCuid_fkey";

-- AlterTable
ALTER TABLE "ProductPriceHistory" DROP COLUMN "updatedAt",
DROP COLUMN "updatedCuid",
ADD COLUMN     "createdCuid" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductPriceHistory" ADD CONSTRAINT "ProductPriceHistory_createdCuid_fkey" FOREIGN KEY ("createdCuid") REFERENCES "User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;
