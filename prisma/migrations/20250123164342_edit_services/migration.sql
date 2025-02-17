/*
  Warnings:

  - You are about to drop the column `tagId` on the `Product` table. All the data in the column will be lost.
  - Added the required column `CategoryId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "tagId",
ADD COLUMN     "CategoryId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Services" ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'unknown';
