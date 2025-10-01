/*
  Warnings:

  - The primary key for the `ChannelAnalogOnChannelSchema` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `stationId` on the `ChannelAnalogOnChannelSchema` table. All the data in the column will be lost.
  - The primary key for the `ChannelDigitalOnChannelSchema` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `stationId` on the `ChannelDigitalOnChannelSchema` table. All the data in the column will be lost.
  - Added the required column `decoder` to the `ChannelAnalogOnChannelSchema` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encoder` to the `ChannelAnalogOnChannelSchema` table without a default value. This is not possible if the table is not empty.
  - Added the required column `silent` to the `ChannelAnalogOnChannelSchema` table without a default value. This is not possible if the table is not empty.
  - Added the required column `colorCode` to the `ChannelDigitalOnChannelSchema` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ChannelAnalogOnChannelSchema" DROP CONSTRAINT "ChannelAnalogOnChannelSchema_pkey",
DROP COLUMN "stationId",
ADD COLUMN     "decoder" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "encoder" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "silent" "public"."TypeAnalogSilent" NOT NULL,
ADD CONSTRAINT "ChannelAnalogOnChannelSchema_pkey" PRIMARY KEY ("channelSchemaId");

-- AlterTable
ALTER TABLE "public"."ChannelDigitalOnChannelSchema" DROP CONSTRAINT "ChannelDigitalOnChannelSchema_pkey",
DROP COLUMN "stationId",
ADD COLUMN     "colorCode" INTEGER NOT NULL,
ADD CONSTRAINT "ChannelDigitalOnChannelSchema_pkey" PRIMARY KEY ("channelSchemaId", "groupId");
