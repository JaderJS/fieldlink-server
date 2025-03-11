/*
  Warnings:

  - Added the required column `title` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "title" TEXT NOT NULL;
