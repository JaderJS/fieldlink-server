-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_serviceId_fkey";

-- AlterTable
ALTER TABLE "Transactions" ALTER COLUMN "serviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
