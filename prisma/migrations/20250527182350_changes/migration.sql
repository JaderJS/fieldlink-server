-- CreateTable
CREATE TABLE "TransactionGroup" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,

    CONSTRAINT "TransactionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parentTransaction" (
    "id" SERIAL NOT NULL,
    "n" INTEGER NOT NULL,
    "firstTransactionId" INTEGER NOT NULL,

    CONSTRAINT "parentTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionGroup" ADD CONSTRAINT "TransactionGroup_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
