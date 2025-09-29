-- AddForeignKey
ALTER TABLE "public"."Equipment" ADD CONSTRAINT "Equipment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
