/*
  Warnings:

  - You are about to drop the column `equipmentId` on the `ChannelSchema` table. All the data in the column will be lost.
  - You are about to drop the column `stationId` on the `Equipment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChannelSchema" DROP CONSTRAINT "ChannelSchema_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_stationId_fkey";

-- DropIndex
DROP INDEX "ChannelSchema_equipmentId_key";

-- AlterTable
ALTER TABLE "ChannelSchema" DROP COLUMN "equipmentId";

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "stationId";

-- CreateTable
CREATE TABLE "_EquipmentToStation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EquipmentToStation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ChannelSchemaToEquipment" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ChannelSchemaToEquipment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EquipmentToStation_B_index" ON "_EquipmentToStation"("B");

-- CreateIndex
CREATE INDEX "_ChannelSchemaToEquipment_B_index" ON "_ChannelSchemaToEquipment"("B");

-- AddForeignKey
ALTER TABLE "_EquipmentToStation" ADD CONSTRAINT "_EquipmentToStation_A_fkey" FOREIGN KEY ("A") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToStation" ADD CONSTRAINT "_EquipmentToStation_B_fkey" FOREIGN KEY ("B") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelSchemaToEquipment" ADD CONSTRAINT "_ChannelSchemaToEquipment_A_fkey" FOREIGN KEY ("A") REFERENCES "ChannelSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelSchemaToEquipment" ADD CONSTRAINT "_ChannelSchemaToEquipment_B_fkey" FOREIGN KEY ("B") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
