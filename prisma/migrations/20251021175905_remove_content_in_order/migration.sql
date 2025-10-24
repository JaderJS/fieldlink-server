/*
  Warnings:

  - You are about to drop the column `content` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Cart" ADD COLUMN     "content" JSONB;

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "content";
