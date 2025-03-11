-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
