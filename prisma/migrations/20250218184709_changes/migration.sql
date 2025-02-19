-- DropForeignKey
ALTER TABLE "ProductPriceHistory" DROP CONSTRAINT "ProductPriceHistory_createdCuid_fkey";

-- DropForeignKey
ALTER TABLE "ProductPriceHistory" DROP CONSTRAINT "ProductPriceHistory_productId_fkey";

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "ProductPriceHistory" ADD CONSTRAINT "ProductPriceHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPriceHistory" ADD CONSTRAINT "ProductPriceHistory_createdCuid_fkey" FOREIGN KEY ("createdCuid") REFERENCES "User"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;
