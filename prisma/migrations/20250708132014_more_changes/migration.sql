/*
  Warnings:

  - Added the required column `categoryId` to the `Order_` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order_" ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "CategoryOrder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order_" ADD CONSTRAINT "Order__categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
