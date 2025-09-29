/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Transactions" DROP CONSTRAINT "Transactions_orderId_fkey";

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "transactionId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_transactionId_key" ON "public"."Order"("transactionId");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."Transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
