-- DropForeignKey
ALTER TABLE "Work" DROP CONSTRAINT "Work_serviceId_fkey";

-- AlterTable
ALTER TABLE "Period" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
