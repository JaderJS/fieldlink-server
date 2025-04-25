-- DropForeignKey
ALTER TABLE "StationAnalog" DROP CONSTRAINT "StationAnalog_stationId_fkey";

-- DropForeignKey
ALTER TABLE "StationDigital" DROP CONSTRAINT "StationDigital_stationId_fkey";

-- AddForeignKey
ALTER TABLE "StationDigital" ADD CONSTRAINT "StationDigital_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationAnalog" ADD CONSTRAINT "StationAnalog_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;
