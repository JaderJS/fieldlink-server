/*
  Warnings:

  - You are about to drop the `ProductsOnWorks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductsOnWorks" DROP CONSTRAINT "ProductsOnWorks_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductsOnWorks" DROP CONSTRAINT "ProductsOnWorks_workId_fkey";

-- AlterTable
ALTER TABLE "Work" ADD COLUMN     "orderId" INTEGER;

-- DropTable
DROP TABLE "ProductsOnWorks";

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
