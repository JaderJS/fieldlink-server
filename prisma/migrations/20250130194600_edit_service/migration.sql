/*
  Warnings:

  - You are about to drop the column `status` on the `Work` table. All the data in the column will be lost.
  - Added the required column `status` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('STARTED', 'PENDING', 'FINISHED', 'DROPPED');

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "status" "ServiceType" NOT NULL;

-- AlterTable
ALTER TABLE "Work" DROP COLUMN "status";
