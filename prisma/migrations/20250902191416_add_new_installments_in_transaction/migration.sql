-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'PAID', 'PARTIAL', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'PIX', 'BOLETO', 'TED', 'CASH', 'OTHER', 'NOT_DECLARED');

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "total" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "installments" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "installmentsNumber" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'NOT_DECLARED',
    "billed" BOOLEAN NOT NULL DEFAULT false,
    "periodId" INTEGER NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdCuid" TEXT NOT NULL,
    "updatedCuid" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "installmentsTotal" INTEGER,
    "paymentReference" TEXT,

    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArchivesToInstallment" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ArchivesToInstallment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "installments_transactionId_installmentsNumber_key" ON "installments"("transactionId", "installmentsNumber");

-- CreateIndex
CREATE INDEX "_ArchivesToInstallment_B_index" ON "_ArchivesToInstallment"("B");

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_createdCuid_fkey" FOREIGN KEY ("createdCuid") REFERENCES "User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_updatedCuid_fkey" FOREIGN KEY ("updatedCuid") REFERENCES "User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArchivesToInstallment" ADD CONSTRAINT "_ArchivesToInstallment_A_fkey" FOREIGN KEY ("A") REFERENCES "Archives"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArchivesToInstallment" ADD CONSTRAINT "_ArchivesToInstallment_B_fkey" FOREIGN KEY ("B") REFERENCES "installments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
