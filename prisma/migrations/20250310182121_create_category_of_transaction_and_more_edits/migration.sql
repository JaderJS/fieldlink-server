-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "hasNotify" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CategoryTransaction" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryTransactionToTransactions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryTransactionToTransactions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryTransactionToTransactions_B_index" ON "_CategoryTransactionToTransactions"("B");

-- AddForeignKey
ALTER TABLE "_CategoryTransactionToTransactions" ADD CONSTRAINT "_CategoryTransactionToTransactions_A_fkey" FOREIGN KEY ("A") REFERENCES "CategoryTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryTransactionToTransactions" ADD CONSTRAINT "_CategoryTransactionToTransactions_B_fkey" FOREIGN KEY ("B") REFERENCES "Transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
