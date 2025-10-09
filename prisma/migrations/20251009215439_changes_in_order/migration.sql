/*
  Warnings:

  - Made the column `orderStatusId` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_orderStatusId_fkey";

-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "orderStatusId" SET NOT NULL,
ALTER COLUMN "orderStatusId" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_orderStatusId_fkey" FOREIGN KEY ("orderStatusId") REFERENCES "public"."order_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
