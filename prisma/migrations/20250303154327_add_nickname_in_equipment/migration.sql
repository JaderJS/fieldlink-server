/*
  Warnings:

  - Added the required column `nickname` to the `Equipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "nickname" TEXT NOT NULL;
