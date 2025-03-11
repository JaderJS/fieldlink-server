-- CreateEnum
CREATE TYPE "TypeAnalogSilent" AS ENUM ('CSQ', 'TPL', 'DPL_N', 'DPL_I');

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "rx" DOUBLE PRECISION NOT NULL,
    "tx" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationDigital" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "colorCode" INTEGER NOT NULL,

    CONSTRAINT "StationDigital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationAnalog" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "silent" "TypeAnalogSilent" NOT NULL,
    "encoder" DOUBLE PRECISION NOT NULL,
    "decoder" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StationAnalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" SERIAL NOT NULL,
    "sn" TEXT NOT NULL,
    "identifier" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelSchema" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "ChannelSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "channelSchemaId" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "groupId" INTEGER,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "identifier" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupToStation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GroupToStation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "StationDigital_stationId_key" ON "StationDigital"("stationId");

-- CreateIndex
CREATE UNIQUE INDEX "StationAnalog_stationId_key" ON "StationAnalog"("stationId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_sn_key" ON "Equipment"("sn");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_identifier_key" ON "Equipment"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelSchema_equipmentId_key" ON "ChannelSchema"("equipmentId");

-- CreateIndex
CREATE INDEX "_GroupToStation_B_index" ON "_GroupToStation"("B");

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationDigital" ADD CONSTRAINT "StationDigital_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationAnalog" ADD CONSTRAINT "StationAnalog_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelSchema" ADD CONSTRAINT "ChannelSchema_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_channelSchemaId_fkey" FOREIGN KEY ("channelSchemaId") REFERENCES "ChannelSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToStation" ADD CONSTRAINT "_GroupToStation_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToStation" ADD CONSTRAINT "_GroupToStation_B_fkey" FOREIGN KEY ("B") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;
