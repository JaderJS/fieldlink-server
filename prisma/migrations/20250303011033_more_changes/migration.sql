/*
  Warnings:

  - You are about to drop the column `channelSchemaId` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `stationId` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the `ChannelSchema` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChannelSchemaToEquipment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_channelSchemaId_fkey";

-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_stationId_fkey";

-- DropForeignKey
ALTER TABLE "_ChannelSchemaToEquipment" DROP CONSTRAINT "_ChannelSchemaToEquipment_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChannelSchemaToEquipment" DROP CONSTRAINT "_ChannelSchemaToEquipment_B_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "channelSchemaId",
DROP COLUMN "description",
DROP COLUMN "groupId",
DROP COLUMN "stationId",
ADD COLUMN     "content" TEXT NOT NULL;

-- DropTable
DROP TABLE "ChannelSchema";

-- DropTable
DROP TABLE "_ChannelSchemaToEquipment";

-- CreateTable
CREATE TABLE "_ArchivesToEquipment" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ArchivesToEquipment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ChannelToEquipment" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ChannelToEquipment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ArchivesToEquipment_B_index" ON "_ArchivesToEquipment"("B");

-- CreateIndex
CREATE INDEX "_ChannelToEquipment_B_index" ON "_ChannelToEquipment"("B");

-- AddForeignKey
ALTER TABLE "_ArchivesToEquipment" ADD CONSTRAINT "_ArchivesToEquipment_A_fkey" FOREIGN KEY ("A") REFERENCES "Archives"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArchivesToEquipment" ADD CONSTRAINT "_ArchivesToEquipment_B_fkey" FOREIGN KEY ("B") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelToEquipment" ADD CONSTRAINT "_ChannelToEquipment_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelToEquipment" ADD CONSTRAINT "_ChannelToEquipment_B_fkey" FOREIGN KEY ("B") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
