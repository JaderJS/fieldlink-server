/*
  Warnings:

  - You are about to drop the `OtherValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product_` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryProductToProduct_` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OtherValueToSale` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OtherValueToWork_` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HistoryProduct" DROP CONSTRAINT "HistoryProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductsOnCarts" DROP CONSTRAINT "ProductsOnCarts_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductsOnSales" DROP CONSTRAINT "ProductsOnSales_productId_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryProductToProduct_" DROP CONSTRAINT "_CategoryProductToProduct__A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryProductToProduct_" DROP CONSTRAINT "_CategoryProductToProduct__B_fkey";

-- DropForeignKey
ALTER TABLE "_OtherValueToSale" DROP CONSTRAINT "_OtherValueToSale_A_fkey";

-- DropForeignKey
ALTER TABLE "_OtherValueToSale" DROP CONSTRAINT "_OtherValueToSale_B_fkey";

-- DropForeignKey
ALTER TABLE "_OtherValueToWork_" DROP CONSTRAINT "_OtherValueToWork__A_fkey";

-- DropForeignKey
ALTER TABLE "_OtherValueToWork_" DROP CONSTRAINT "_OtherValueToWork__B_fkey";

-- DropTable
DROP TABLE "OtherValue";

-- DropTable
DROP TABLE "Product_";

-- DropTable
DROP TABLE "_CategoryProductToProduct_";

-- DropTable
DROP TABLE "_OtherValueToSale";

-- DropTable
DROP TABLE "_OtherValueToWork_";

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "unity" "UnityProduct" NOT NULL DEFAULT 'und',
    "pictureUrl" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryProductToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryProductToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OtherValuesToWork_" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OtherValuesToWork__AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OtherValuesToSale" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OtherValuesToSale_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryProductToProduct_B_index" ON "_CategoryProductToProduct"("B");

-- CreateIndex
CREATE INDEX "_OtherValuesToWork__B_index" ON "_OtherValuesToWork_"("B");

-- CreateIndex
CREATE INDEX "_OtherValuesToSale_B_index" ON "_OtherValuesToSale"("B");

-- AddForeignKey
ALTER TABLE "ProductsOnCarts" ADD CONSTRAINT "ProductsOnCarts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsOnSales" ADD CONSTRAINT "ProductsOnSales_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryProduct" ADD CONSTRAINT "HistoryProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryProductToProduct" ADD CONSTRAINT "_CategoryProductToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "CategoryProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryProductToProduct" ADD CONSTRAINT "_CategoryProductToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OtherValuesToWork_" ADD CONSTRAINT "_OtherValuesToWork__A_fkey" FOREIGN KEY ("A") REFERENCES "OtherValues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OtherValuesToWork_" ADD CONSTRAINT "_OtherValuesToWork__B_fkey" FOREIGN KEY ("B") REFERENCES "Work_"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OtherValuesToSale" ADD CONSTRAINT "_OtherValuesToSale_A_fkey" FOREIGN KEY ("A") REFERENCES "OtherValues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OtherValuesToSale" ADD CONSTRAINT "_OtherValuesToSale_B_fkey" FOREIGN KEY ("B") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
