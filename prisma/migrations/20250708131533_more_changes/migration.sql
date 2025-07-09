/*
  Warnings:

  - Added the required column `pictureUrl` to the `Product_` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UnityProduct" AS ENUM ('und', 'm', 'l', 'g');

-- AlterTable
ALTER TABLE "Product_" ADD COLUMN     "pictureUrl" TEXT NOT NULL,
ADD COLUMN     "unity" "UnityProduct" NOT NULL DEFAULT 'und';

-- CreateTable
CREATE TABLE "CategoryProduct" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryProduct" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoryProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryProductToProduct_" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryProductToProduct__AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OtherValueToWork_" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OtherValueToWork__AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OtherValueToSale" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OtherValueToSale_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryProductToProduct__B_index" ON "_CategoryProductToProduct_"("B");

-- CreateIndex
CREATE INDEX "_OtherValueToWork__B_index" ON "_OtherValueToWork_"("B");

-- CreateIndex
CREATE INDEX "_OtherValueToSale_B_index" ON "_OtherValueToSale"("B");

-- AddForeignKey
ALTER TABLE "HistoryProduct" ADD CONSTRAINT "HistoryProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product_"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryProductToProduct_" ADD CONSTRAINT "_CategoryProductToProduct__A_fkey" FOREIGN KEY ("A") REFERENCES "CategoryProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryProductToProduct_" ADD CONSTRAINT "_CategoryProductToProduct__B_fkey" FOREIGN KEY ("B") REFERENCES "Product_"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OtherValueToWork_" ADD CONSTRAINT "_OtherValueToWork__A_fkey" FOREIGN KEY ("A") REFERENCES "OtherValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OtherValueToWork_" ADD CONSTRAINT "_OtherValueToWork__B_fkey" FOREIGN KEY ("B") REFERENCES "Work_"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OtherValueToSale" ADD CONSTRAINT "_OtherValueToSale_A_fkey" FOREIGN KEY ("A") REFERENCES "OtherValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OtherValueToSale" ADD CONSTRAINT "_OtherValueToSale_B_fkey" FOREIGN KEY ("B") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
