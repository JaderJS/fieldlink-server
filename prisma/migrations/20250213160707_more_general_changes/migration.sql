/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Transactions` table. All the data in the column will be lost.
  - Added the required column `createdCuid` to the `Archives` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerCuid` to the `Archives` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Archives` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Archives` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Archives` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedCuid` to the `Archives` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Archives" ADD COLUMN     "createdCuid" TEXT NOT NULL,
ADD COLUMN     "ownerCuid" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "size" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedCuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "property" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "fileUrl",
ADD COLUMN     "parentTransactionId" INTEGER;

-- CreateTable
CREATE TABLE "ProductPriceHistory" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "costValue" DOUBLE PRECISION NOT NULL,
    "saleValue" DOUBLE PRECISION NOT NULL,
    "updatedCuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArchivesToTransactions" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ArchivesToTransactions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ArchivesToTransactions_B_index" ON "_ArchivesToTransactions"("B");

-- AddForeignKey
ALTER TABLE "Archives" ADD CONSTRAINT "Archives_ownerCuid_fkey" FOREIGN KEY ("ownerCuid") REFERENCES "User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archives" ADD CONSTRAINT "Archives_createdCuid_fkey" FOREIGN KEY ("createdCuid") REFERENCES "User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archives" ADD CONSTRAINT "Archives_updatedCuid_fkey" FOREIGN KEY ("updatedCuid") REFERENCES "User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_parentTransactionId_fkey" FOREIGN KEY ("parentTransactionId") REFERENCES "Transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPriceHistory" ADD CONSTRAINT "ProductPriceHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPriceHistory" ADD CONSTRAINT "ProductPriceHistory_updatedCuid_fkey" FOREIGN KEY ("updatedCuid") REFERENCES "User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArchivesToTransactions" ADD CONSTRAINT "_ArchivesToTransactions_A_fkey" FOREIGN KEY ("A") REFERENCES "Archives"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArchivesToTransactions" ADD CONSTRAINT "_ArchivesToTransactions_B_fkey" FOREIGN KEY ("B") REFERENCES "Transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
