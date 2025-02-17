/*
  Warnings:

  - A unique constraint covering the columns `[serviceId]` on the table `Transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Transactions_serviceId_key" ON "Transactions"("serviceId");
