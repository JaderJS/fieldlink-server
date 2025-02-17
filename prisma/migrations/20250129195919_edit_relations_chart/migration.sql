/*
  Warnings:

  - The primary key for the `ProductsOnCart` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `orderId` on the `ProductsOnCart` table. All the data in the column will be lost.
  - Added the required column `productId` to the `ProductsOnCart` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductsOnCart" DROP CONSTRAINT "ProductsOnCart_cartId_fkey";

-- DropForeignKey
ALTER TABLE "ProductsOnCart" DROP CONSTRAINT "ProductsOnCart_orderId_fkey";

-- AlterTable
ALTER TABLE "ProductsOnCart" DROP CONSTRAINT "ProductsOnCart_pkey",
DROP COLUMN "orderId",
ADD COLUMN     "productId" INTEGER NOT NULL,
ADD CONSTRAINT "ProductsOnCart_pkey" PRIMARY KEY ("cartId", "productId");

-- AddForeignKey
ALTER TABLE "ProductsOnCart" ADD CONSTRAINT "ProductsOnCart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsOnCart" ADD CONSTRAINT "ProductsOnCart_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
