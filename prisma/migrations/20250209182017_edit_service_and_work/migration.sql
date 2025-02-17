/*
  Warnings:

  - Made the column `content` on table `Work` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Work" ALTER COLUMN "content" SET NOT NULL;
