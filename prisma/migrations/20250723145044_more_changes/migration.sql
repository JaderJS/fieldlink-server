-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "cartId" INTEGER;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;
