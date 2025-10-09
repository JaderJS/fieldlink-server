/*
  Warnings:

  - You are about to drop the column `status` on the `order_status` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."order_status" DROP COLUMN "status",
ADD COLUMN     "flag" "public"."OrderStatusFlag" NOT NULL DEFAULT 'NOTHING';
