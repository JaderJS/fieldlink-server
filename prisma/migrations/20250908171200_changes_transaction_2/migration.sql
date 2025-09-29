/*
  Warnings:

  - You are about to drop the column `description` on the `Transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Transactions" DROP COLUMN "description",
ADD COLUMN     "content" JSONB;
