/*
  Warnings:

  - You are about to drop the column `equipmentId` on the `ChannelSchema` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `ChannelSchema` table. All the data in the column will be lost.
  - Added the required column `order` to the `ChannelAnalogOnChannelSchema` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `ChannelDigitalOnChannelSchema` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChannelSchema" DROP CONSTRAINT "ChannelSchema_equipmentId_fkey";

-- DropIndex
DROP INDEX "ChannelSchema_equipmentId_key";

-- AlterTable
ALTER TABLE "ChannelAnalogOnChannelSchema" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ChannelDigitalOnChannelSchema" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ChannelSchema" DROP COLUMN "equipmentId",
DROP COLUMN "order";

-- CreateTable
CREATE TABLE "_ChannelSchemaToEquipment" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ChannelSchemaToEquipment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChannelSchemaToEquipment_B_index" ON "_ChannelSchemaToEquipment"("B");

-- AddForeignKey
ALTER TABLE "_ChannelSchemaToEquipment" ADD CONSTRAINT "_ChannelSchemaToEquipment_A_fkey" FOREIGN KEY ("A") REFERENCES "ChannelSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelSchemaToEquipment" ADD CONSTRAINT "_ChannelSchemaToEquipment_B_fkey" FOREIGN KEY ("B") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
