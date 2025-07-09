/*
  Warnings:

  - You are about to drop the `Cart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Work` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ArchivesToWork` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CartToOtherValues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrderToOtherValues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OtherValuesToWork` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_assignedCuid_fkey";

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_cartId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Work" DROP CONSTRAINT "Work_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Work" DROP CONSTRAINT "Work_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "_ArchivesToWork" DROP CONSTRAINT "_ArchivesToWork_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArchivesToWork" DROP CONSTRAINT "_ArchivesToWork_B_fkey";

-- DropForeignKey
ALTER TABLE "_CartToOtherValues" DROP CONSTRAINT "_CartToOtherValues_A_fkey";

-- DropForeignKey
ALTER TABLE "_CartToOtherValues" DROP CONSTRAINT "_CartToOtherValues_B_fkey";

-- DropForeignKey
ALTER TABLE "_OrderToOtherValues" DROP CONSTRAINT "_OrderToOtherValues_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrderToOtherValues" DROP CONSTRAINT "_OrderToOtherValues_B_fkey";

-- DropForeignKey
ALTER TABLE "_OtherValuesToWork" DROP CONSTRAINT "_OtherValuesToWork_A_fkey";

-- DropForeignKey
ALTER TABLE "_OtherValuesToWork" DROP CONSTRAINT "_OtherValuesToWork_B_fkey";

-- DropTable
DROP TABLE "Cart";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "Service";

-- DropTable
DROP TABLE "Work";

-- DropTable
DROP TABLE "_ArchivesToWork";

-- DropTable
DROP TABLE "_CartToOtherValues";

-- DropTable
DROP TABLE "_OrderToOtherValues";

-- DropTable
DROP TABLE "_OtherValuesToWork";
