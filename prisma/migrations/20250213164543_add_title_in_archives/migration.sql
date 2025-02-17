/*
  Warnings:

  - Added the required column `title` to the `Archives` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Archives" ADD COLUMN     "title" TEXT NOT NULL;
