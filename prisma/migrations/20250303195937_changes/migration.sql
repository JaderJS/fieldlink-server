/*
  Warnings:

  - You are about to drop the `Channel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChannelToEquipment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ChannelToEquipment" DROP CONSTRAINT "_ChannelToEquipment_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChannelToEquipment" DROP CONSTRAINT "_ChannelToEquipment_B_fkey";

-- DropTable
DROP TABLE "Channel";

-- DropTable
DROP TABLE "_ChannelToEquipment";

-- CreateTable
CREATE TABLE "ChannelSchema" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ChannelSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelDigital" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "ChannelDigital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelDigitalOnChannelSchema" (
    "channelDigitalId" INTEGER NOT NULL,
    "channelSchemaId" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "ChannelDigitalOnChannelSchema_pkey" PRIMARY KEY ("channelDigitalId","channelSchemaId","stationId","groupId")
);

-- CreateTable
CREATE TABLE "ChannelAnalog" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "ChannelAnalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelAnalogOnChannelSchema" (
    "channelAnalogId" INTEGER NOT NULL,
    "channelSchemaId" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,

    CONSTRAINT "ChannelAnalogOnChannelSchema_pkey" PRIMARY KEY ("channelAnalogId","channelSchemaId","stationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChannelSchema_equipmentId_key" ON "ChannelSchema"("equipmentId");

-- AddForeignKey
ALTER TABLE "ChannelSchema" ADD CONSTRAINT "ChannelSchema_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelDigitalOnChannelSchema" ADD CONSTRAINT "ChannelDigitalOnChannelSchema_channelDigitalId_fkey" FOREIGN KEY ("channelDigitalId") REFERENCES "ChannelDigital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelDigitalOnChannelSchema" ADD CONSTRAINT "ChannelDigitalOnChannelSchema_channelSchemaId_fkey" FOREIGN KEY ("channelSchemaId") REFERENCES "ChannelSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelDigitalOnChannelSchema" ADD CONSTRAINT "ChannelDigitalOnChannelSchema_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelDigitalOnChannelSchema" ADD CONSTRAINT "ChannelDigitalOnChannelSchema_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelAnalogOnChannelSchema" ADD CONSTRAINT "ChannelAnalogOnChannelSchema_channelAnalogId_fkey" FOREIGN KEY ("channelAnalogId") REFERENCES "ChannelAnalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelAnalogOnChannelSchema" ADD CONSTRAINT "ChannelAnalogOnChannelSchema_channelSchemaId_fkey" FOREIGN KEY ("channelSchemaId") REFERENCES "ChannelSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelAnalogOnChannelSchema" ADD CONSTRAINT "ChannelAnalogOnChannelSchema_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
