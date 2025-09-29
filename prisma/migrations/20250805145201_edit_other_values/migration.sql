/*
  Warnings:

  - You are about to drop the `_OrderToOtherValues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OtherValuesToWork` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_OrderToOtherValues" DROP CONSTRAINT "_OrderToOtherValues_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrderToOtherValues" DROP CONSTRAINT "_OrderToOtherValues_B_fkey";

-- DropForeignKey
ALTER TABLE "_OtherValuesToWork" DROP CONSTRAINT "_OtherValuesToWork_A_fkey";

-- DropForeignKey
ALTER TABLE "_OtherValuesToWork" DROP CONSTRAINT "_OtherValuesToWork_B_fkey";

-- DropTable
DROP TABLE "_OrderToOtherValues";

-- DropTable
DROP TABLE "_OtherValuesToWork";
