/*
  Warnings:

  - You are about to drop the `Cart_` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order_` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Work_` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OtherValuesToWork_` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SaleToWork_` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cart_" DROP CONSTRAINT "Cart__supplierId_fkey";

-- DropForeignKey
ALTER TABLE "Order_" DROP CONSTRAINT "Order__categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Order_" DROP CONSTRAINT "Order__clientId_fkey";

-- DropForeignKey
ALTER TABLE "Order_" DROP CONSTRAINT "Order__docCuid_fkey";

-- DropForeignKey
ALTER TABLE "ProductsOnCarts" DROP CONSTRAINT "ProductsOnCarts_cartId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Work_" DROP CONSTRAINT "Work__docCuid_fkey";

-- DropForeignKey
ALTER TABLE "Work_" DROP CONSTRAINT "Work__orderId_fkey";

-- DropForeignKey
ALTER TABLE "_OtherValuesToWork_" DROP CONSTRAINT "_OtherValuesToWork__A_fkey";

-- DropForeignKey
ALTER TABLE "_OtherValuesToWork_" DROP CONSTRAINT "_OtherValuesToWork__B_fkey";

-- DropForeignKey
ALTER TABLE "_SaleToWork_" DROP CONSTRAINT "_SaleToWork__A_fkey";

-- DropForeignKey
ALTER TABLE "_SaleToWork_" DROP CONSTRAINT "_SaleToWork__B_fkey";

-- DropTable
DROP TABLE "Cart_";

-- DropTable
DROP TABLE "Order_";

-- DropTable
DROP TABLE "Work_";

-- DropTable
DROP TABLE "_OtherValuesToWork_";

-- DropTable
DROP TABLE "_SaleToWork_";

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "docCuid" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" SERIAL NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "orderId" INTEGER NOT NULL,
    "docCuid" TEXT,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SaleToWork" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SaleToWork_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OtherValuesToWork" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OtherValuesToWork_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SaleToWork_B_index" ON "_SaleToWork"("B");

-- CreateIndex
CREATE INDEX "_OtherValuesToWork_B_index" ON "_OtherValuesToWork"("B");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_docCuid_fkey" FOREIGN KEY ("docCuid") REFERENCES "Doc"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsOnCarts" ADD CONSTRAINT "ProductsOnCarts_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_docCuid_fkey" FOREIGN KEY ("docCuid") REFERENCES "Doc"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SaleToWork" ADD CONSTRAINT "_SaleToWork_A_fkey" FOREIGN KEY ("A") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SaleToWork" ADD CONSTRAINT "_SaleToWork_B_fkey" FOREIGN KEY ("B") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OtherValuesToWork" ADD CONSTRAINT "_OtherValuesToWork_A_fkey" FOREIGN KEY ("A") REFERENCES "OtherValues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OtherValuesToWork" ADD CONSTRAINT "_OtherValuesToWork_B_fkey" FOREIGN KEY ("B") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
