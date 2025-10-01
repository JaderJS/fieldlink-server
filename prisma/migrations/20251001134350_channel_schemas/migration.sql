/*
  Warnings:

  - A unique constraint covering the columns `[channelSchemaId]` on the table `ChannelAnalogOnChannelSchema` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[channelSchemaId]` on the table `ChannelDigitalOnChannelSchema` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stationId` to the `ChannelSchema` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ChannelAnalogOnChannelSchema" DROP CONSTRAINT "ChannelAnalogOnChannelSchema_stationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChannelDigitalOnChannelSchema" DROP CONSTRAINT "ChannelDigitalOnChannelSchema_stationId_fkey";

-- AlterTable
CREATE SEQUENCE "public".channelanalogonchannelschema_order_seq;
ALTER TABLE "public"."ChannelAnalogOnChannelSchema" ALTER COLUMN "order" SET DEFAULT nextval('"public".channelanalogonchannelschema_order_seq');
ALTER SEQUENCE "public".channelanalogonchannelschema_order_seq OWNED BY "public"."ChannelAnalogOnChannelSchema"."order";

-- AlterTable
CREATE SEQUENCE "public".channeldigitalonchannelschema_order_seq;
ALTER TABLE "public"."ChannelDigitalOnChannelSchema" ALTER COLUMN "order" SET DEFAULT nextval('"public".channeldigitalonchannelschema_order_seq');
ALTER SEQUENCE "public".channeldigitalonchannelschema_order_seq OWNED BY "public"."ChannelDigitalOnChannelSchema"."order";

-- AlterTable
ALTER TABLE "public"."ChannelSchema" ADD COLUMN     "stationId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ChannelAnalogOnChannelSchema_channelSchemaId_key" ON "public"."ChannelAnalogOnChannelSchema"("channelSchemaId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelDigitalOnChannelSchema_channelSchemaId_key" ON "public"."ChannelDigitalOnChannelSchema"("channelSchemaId");

-- AddForeignKey
ALTER TABLE "public"."ChannelSchema" ADD CONSTRAINT "ChannelSchema_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "public"."Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
