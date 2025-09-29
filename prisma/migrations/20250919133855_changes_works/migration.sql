/*
  Warnings:

  - You are about to drop the column `content` on the `Work` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Work" DROP COLUMN "content",
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Novo trabalho';
