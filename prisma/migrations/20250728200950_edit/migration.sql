/*
  Warnings:

  - You are about to drop the column `parentTransactionId` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the `TransactionGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TransactionGroup" DROP CONSTRAINT "TransactionGroup_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_parentTransactionId_fkey";

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "parentTransactionId",
ADD COLUMN     "groupCuid" TEXT,
ADD COLUMN     "transactionGroupId" INTEGER;

-- DropTable
DROP TABLE "TransactionGroup";
