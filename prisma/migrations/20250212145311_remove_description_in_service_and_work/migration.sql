/*
  Warnings:

  - You are about to drop the column `description` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Work` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "Work" DROP COLUMN "description";
