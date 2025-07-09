/*
  Warnings:

  - Added the required column `createdAt` to the `Product_` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product_" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT;
