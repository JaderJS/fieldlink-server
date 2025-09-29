/*
  Warnings:

  - You are about to drop the `Daily` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Daily" DROP CONSTRAINT "Daily_ownerCuid_fkey";

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "property" DROP DEFAULT;

-- DropTable
DROP TABLE "Daily";

-- DropEnum
DROP TYPE "OrderStatusType";

-- DropEnum
DROP TYPE "ServiceType";

-- DropEnum
DROP TYPE "TypeProduct";
