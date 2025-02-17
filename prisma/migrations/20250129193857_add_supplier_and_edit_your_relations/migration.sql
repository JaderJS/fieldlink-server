/*
  Warnings:

  - You are about to drop the `_CartToSupplier` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `supplierId` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CartToSupplier" DROP CONSTRAINT "_CartToSupplier_A_fkey";

-- DropForeignKey
ALTER TABLE "_CartToSupplier" DROP CONSTRAINT "_CartToSupplier_B_fkey";

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "supplierId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "cartId" INTEGER;

-- DropTable
DROP TABLE "_CartToSupplier";

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
