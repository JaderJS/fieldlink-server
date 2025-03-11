/*
  Warnings:

  - Added the required column `productId` to the `Equipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "productId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
