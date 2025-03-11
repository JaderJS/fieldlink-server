/*
  Warnings:

  - The primary key for the `ChannelAnalogOnChannelSchema` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `channelAnalogId` on the `ChannelAnalogOnChannelSchema` table. All the data in the column will be lost.
  - The primary key for the `ChannelDigitalOnChannelSchema` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `channelDigitalId` on the `ChannelDigitalOnChannelSchema` table. All the data in the column will be lost.
  - You are about to drop the `ChannelAnalog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChannelDigital` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `slot` to the `ChannelDigitalOnChannelSchema` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChannelAnalogOnChannelSchema" DROP CONSTRAINT "ChannelAnalogOnChannelSchema_channelAnalogId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelDigitalOnChannelSchema" DROP CONSTRAINT "ChannelDigitalOnChannelSchema_channelDigitalId_fkey";

-- AlterTable
ALTER TABLE "ChannelAnalogOnChannelSchema" DROP CONSTRAINT "ChannelAnalogOnChannelSchema_pkey",
DROP COLUMN "channelAnalogId",
ADD CONSTRAINT "ChannelAnalogOnChannelSchema_pkey" PRIMARY KEY ("channelSchemaId", "stationId");

-- AlterTable
ALTER TABLE "ChannelDigitalOnChannelSchema" DROP CONSTRAINT "ChannelDigitalOnChannelSchema_pkey",
DROP COLUMN "channelDigitalId",
ADD COLUMN     "slot" INTEGER NOT NULL,
ADD CONSTRAINT "ChannelDigitalOnChannelSchema_pkey" PRIMARY KEY ("channelSchemaId", "stationId", "groupId");

-- DropTable
DROP TABLE "ChannelAnalog";

-- DropTable
DROP TABLE "ChannelDigital";
