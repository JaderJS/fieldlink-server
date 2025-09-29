/*
  Warnings:

  - You are about to drop the `_CartToOtherValues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OtherValuesToSale` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `parentTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CartToOtherValues" DROP CONSTRAINT "_CartToOtherValues_A_fkey";

-- DropForeignKey
ALTER TABLE "_CartToOtherValues" DROP CONSTRAINT "_CartToOtherValues_B_fkey";

-- DropForeignKey
ALTER TABLE "_OtherValuesToSale" DROP CONSTRAINT "_OtherValuesToSale_A_fkey";

-- DropForeignKey
ALTER TABLE "_OtherValuesToSale" DROP CONSTRAINT "_OtherValuesToSale_B_fkey";

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "otherValues" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "otherValues" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- DropTable
DROP TABLE "_CartToOtherValues";

-- DropTable
DROP TABLE "_OtherValuesToSale";

-- DropTable
DROP TABLE "parentTransaction";

-- DropEnum
DROP TYPE "ProductDiscountType";
