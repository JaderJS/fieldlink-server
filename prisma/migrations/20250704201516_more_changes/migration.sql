/*
  Warnings:

  - The primary key for the `Order_` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Order_` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Product_` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Product_` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ProductsOnSales` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Sale` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Sale` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Work_` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Work_` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `_SaleToWork_` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `saleId` on the `ProductsOnSales` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `productId` on the `ProductsOnSales` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `Sale` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `Work_` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_SaleToWork_` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_SaleToWork_` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ProductsOnSales" DROP CONSTRAINT "ProductsOnSales_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductsOnSales" DROP CONSTRAINT "ProductsOnSales_saleId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Work_" DROP CONSTRAINT "Work__orderId_fkey";

-- DropForeignKey
ALTER TABLE "_SaleToWork_" DROP CONSTRAINT "_SaleToWork__A_fkey";

-- DropForeignKey
ALTER TABLE "_SaleToWork_" DROP CONSTRAINT "_SaleToWork__B_fkey";

-- AlterTable
ALTER TABLE "Order_" DROP CONSTRAINT "Order__pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Order__pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Product_" DROP CONSTRAINT "Product__pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Product__pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProductsOnSales" DROP CONSTRAINT "ProductsOnSales_pkey",
DROP COLUMN "saleId",
ADD COLUMN     "saleId" INTEGER NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER NOT NULL,
ADD CONSTRAINT "ProductsOnSales_pkey" PRIMARY KEY ("saleId", "productId");

-- AlterTable
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD CONSTRAINT "Sale_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Work_" DROP CONSTRAINT "Work__pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD CONSTRAINT "Work__pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_SaleToWork_" DROP CONSTRAINT "_SaleToWork__AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL,
ADD CONSTRAINT "_SaleToWork__AB_pkey" PRIMARY KEY ("A", "B");

-- CreateIndex
CREATE INDEX "_SaleToWork__B_index" ON "_SaleToWork_"("B");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order_"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsOnSales" ADD CONSTRAINT "ProductsOnSales_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsOnSales" ADD CONSTRAINT "ProductsOnSales_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product_"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_" ADD CONSTRAINT "Work__orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order_"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SaleToWork_" ADD CONSTRAINT "_SaleToWork__A_fkey" FOREIGN KEY ("A") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SaleToWork_" ADD CONSTRAINT "_SaleToWork__B_fkey" FOREIGN KEY ("B") REFERENCES "Work_"("id") ON DELETE CASCADE ON UPDATE CASCADE;
