-- DropIndex
DROP INDEX "Transactions_serviceId_key";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "clientId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
