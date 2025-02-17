/*
  Warnings:

  - Added the required column `title` to the `Transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileUrl` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "billed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fromAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hasNfe" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileUrl" TEXT NOT NULL;
