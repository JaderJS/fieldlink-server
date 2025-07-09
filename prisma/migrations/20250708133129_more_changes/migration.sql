/*
  Warnings:

  - Added the required column `clientId` to the `Order_` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order_" ADD COLUMN     "clientId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Order_" ADD CONSTRAINT "Order__clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
