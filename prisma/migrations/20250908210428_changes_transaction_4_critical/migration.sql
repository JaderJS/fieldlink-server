/*
  Warnings:

  - You are about to alter the column `total` on the `Cart` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `total` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - A unique constraint covering the columns `[transactionId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Transactions" DROP CONSTRAINT "Transactions_cartId_fkey";

-- AlterTable
ALTER TABLE "public"."Cart" ADD COLUMN     "transactionId" INTEGER NOT NULL,
ALTER COLUMN "total" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "total" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Cart_transactionId_key" ON "public"."Cart"("transactionId");

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."Transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
