/*
  Warnings:

  - You are about to drop the `OrderDate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkDate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderDate" DROP CONSTRAINT "OrderDate_orderId_fkey";

-- DropForeignKey
ALTER TABLE "WorkDate" DROP CONSTRAINT "WorkDate_workId_fkey";

-- DropTable
DROP TABLE "OrderDate";

-- DropTable
DROP TABLE "WorkDate";
