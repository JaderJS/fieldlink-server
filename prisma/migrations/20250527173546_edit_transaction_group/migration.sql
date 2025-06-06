-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "base";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "finance";

-- CreateEnum
CREATE TYPE "base"."Role" AS ENUM ('USER', 'ADMIN', 'ROOT');

-- CreateEnum
CREATE TYPE "base"."TypeTransaction" AS ENUM ('INPUT', 'OUTPUT');

-- CreateEnum
CREATE TYPE "base"."ServiceType" AS ENUM ('STARTED', 'PENDING', 'FINISHED', 'DROPPED');

-- CreateEnum
CREATE TYPE "base"."ProductDiscountType" AS ENUM ('NONE', 'PERCENT', 'AMOUNT');

-- CreateEnum
CREATE TYPE "base"."TypeProduct" AS ENUM ('UND', 'm', 'L', 'g');

-- CreateEnum
CREATE TYPE "base"."OrderStatusType" AS ENUM ('PROCESS', 'INIT', 'FINISHED');

-- CreateEnum
CREATE TYPE "base"."TypeAnalogSilent" AS ENUM ('CSQ', 'TPL', 'DPL_N', 'DPL_I');

-- CreateTable
CREATE TABLE "base"."User" (
    "cuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "role" "base"."Role" NOT NULL,
    "password" TEXT NOT NULL,
    "isEnable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("cuid")
);

-- CreateTable
CREATE TABLE "base"."GoogleTokens" (
    "id" SERIAL NOT NULL,
    "tokens" JSONB NOT NULL,

    CONSTRAINT "GoogleTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Archives" (
    "cuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "pathUrl" TEXT NOT NULL,
    "createdCuid" TEXT NOT NULL,
    "updatedCuid" TEXT NOT NULL,
    "ownerCuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Archives_pkey" PRIMARY KEY ("cuid")
);

-- CreateTable
CREATE TABLE "base"."Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "base"."ServiceType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clientId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Work" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "orderId" INTEGER,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."OtherValues" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OtherValues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Period" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."parentTransaction" (
    "id" SERIAL NOT NULL,
    "n" INTEGER NOT NULL,
    "firstTransactionId" INTEGER NOT NULL,

    CONSTRAINT "parentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."TransactionGroup" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,

    CONSTRAINT "TransactionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Transactions" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" "base"."TypeTransaction" NOT NULL,
    "description" TEXT,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "hasNfe" BOOLEAN NOT NULL DEFAULT false,
    "value" DOUBLE PRECISION NOT NULL,
    "billed" BOOLEAN NOT NULL DEFAULT false,
    "createCuid" TEXT NOT NULL,
    "updatedCuid" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "bankId" INTEGER NOT NULL,
    "periodId" INTEGER NOT NULL,
    "hasNotify" BOOLEAN NOT NULL DEFAULT false,
    "serviceId" INTEGER,
    "cartId" INTEGER,
    "orderId" INTEGER,
    "eventId" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "fromAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentTransactionId" INTEGER,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."CategoryTransaction" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Supplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "property" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Cart" (
    "id" SERIAL NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" "base"."OrderStatusType" NOT NULL,
    "assignedCuid" TEXT NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."ProductsOnCart" (
    "cartId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductsOnCart_pkey" PRIMARY KEY ("cartId","productId")
);

-- CreateTable
CREATE TABLE "base"."Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pictureUrl" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "discountType" "base"."ProductDiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL,
    "CategoryId" INTEGER NOT NULL,
    "unity" "base"."TypeProduct" NOT NULL,
    "priceFn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createCuid" TEXT NOT NULL,
    "updatedCuid" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."ProductPriceHistory" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "costValue" DOUBLE PRECISION NOT NULL,
    "saleValue" DOUBLE PRECISION NOT NULL,
    "createdCuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Order" (
    "id" SERIAL NOT NULL,
    "status" "base"."OrderStatusType" NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "assignedCuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."ProductsOnOrder" (
    "productId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductsOnOrder_pkey" PRIMARY KEY ("productId","orderId")
);

-- CreateTable
CREATE TABLE "base"."ProductCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT[],
    "parentCategoryId" INTEGER,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Bank" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pix" TEXT NOT NULL,
    "limitBankingMovements" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "limitBankingMovementsMonth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ownerCuid" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "ownerCuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Daily" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ownerCuid" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Property" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Station" (
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
CREATE TABLE "base"."StationDigital" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "colorCode" INTEGER NOT NULL,

    CONSTRAINT "StationDigital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."StationAnalog" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "silent" "base"."TypeAnalogSilent" NOT NULL,
    "encoder" DOUBLE PRECISION NOT NULL,
    "decoder" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StationAnalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Equipment" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "sn" TEXT NOT NULL,
    "identifier" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."ChannelSchema" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "ChannelSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."ChannelDigitalOnChannelSchema" (
    "channelSchemaId" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ChannelDigitalOnChannelSchema_pkey" PRIMARY KEY ("channelSchemaId","stationId","groupId")
);

-- CreateTable
CREATE TABLE "base"."ChannelAnalogOnChannelSchema" (
    "channelSchemaId" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ChannelAnalogOnChannelSchema_pkey" PRIMARY KEY ("channelSchemaId","stationId")
);

-- CreateTable
CREATE TABLE "base"."Group" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "identifier" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."_ArchivesToWork" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ArchivesToWork_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "base"."_ArchivesToTransactions" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ArchivesToTransactions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "base"."_ArchivesToEquipment" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ArchivesToEquipment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "base"."_OtherValuesToWork" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OtherValuesToWork_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "base"."_CategoryTransactionToTransactions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryTransactionToTransactions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "base"."_CartToOtherValues" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CartToOtherValues_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "base"."_OrderToOtherValues" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OrderToOtherValues_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "base"."_EquipmentToStation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EquipmentToStation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "base"."_ChannelSchemaToEquipment" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ChannelSchemaToEquipment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "base"."_GroupToStation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GroupToStation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "base"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "base"."User"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "Period_name_key" ON "base"."Period"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_name_key" ON "base"."Supplier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_parentCategoryId_key" ON "base"."ProductCategory"("parentCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "StationDigital_stationId_key" ON "base"."StationDigital"("stationId");

-- CreateIndex
CREATE UNIQUE INDEX "StationAnalog_stationId_key" ON "base"."StationAnalog"("stationId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_sn_key" ON "base"."Equipment"("sn");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_identifier_key" ON "base"."Equipment"("identifier");

-- CreateIndex
CREATE INDEX "_ArchivesToWork_B_index" ON "base"."_ArchivesToWork"("B");

-- CreateIndex
CREATE INDEX "_ArchivesToTransactions_B_index" ON "base"."_ArchivesToTransactions"("B");

-- CreateIndex
CREATE INDEX "_ArchivesToEquipment_B_index" ON "base"."_ArchivesToEquipment"("B");

-- CreateIndex
CREATE INDEX "_OtherValuesToWork_B_index" ON "base"."_OtherValuesToWork"("B");

-- CreateIndex
CREATE INDEX "_CategoryTransactionToTransactions_B_index" ON "base"."_CategoryTransactionToTransactions"("B");

-- CreateIndex
CREATE INDEX "_CartToOtherValues_B_index" ON "base"."_CartToOtherValues"("B");

-- CreateIndex
CREATE INDEX "_OrderToOtherValues_B_index" ON "base"."_OrderToOtherValues"("B");

-- CreateIndex
CREATE INDEX "_EquipmentToStation_B_index" ON "base"."_EquipmentToStation"("B");

-- CreateIndex
CREATE INDEX "_ChannelSchemaToEquipment_B_index" ON "base"."_ChannelSchemaToEquipment"("B");

-- CreateIndex
CREATE INDEX "_GroupToStation_B_index" ON "base"."_GroupToStation"("B");

-- AddForeignKey
ALTER TABLE "base"."Archives" ADD CONSTRAINT "Archives_ownerCuid_fkey" FOREIGN KEY ("ownerCuid") REFERENCES "base"."User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Archives" ADD CONSTRAINT "Archives_createdCuid_fkey" FOREIGN KEY ("createdCuid") REFERENCES "base"."User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Archives" ADD CONSTRAINT "Archives_updatedCuid_fkey" FOREIGN KEY ("updatedCuid") REFERENCES "base"."User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Service" ADD CONSTRAINT "Service_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "base"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Work" ADD CONSTRAINT "Work_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "base"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Work" ADD CONSTRAINT "Work_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "base"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."TransactionGroup" ADD CONSTRAINT "TransactionGroup_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "base"."Transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Transactions" ADD CONSTRAINT "Transactions_parentTransactionId_fkey" FOREIGN KEY ("parentTransactionId") REFERENCES "base"."Transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Transactions" ADD CONSTRAINT "Transactions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "base"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Transactions" ADD CONSTRAINT "Transactions_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "base"."Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Transactions" ADD CONSTRAINT "Transactions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "base"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Transactions" ADD CONSTRAINT "Transactions_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "base"."Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Transactions" ADD CONSTRAINT "Transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "base"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Transactions" ADD CONSTRAINT "Transactions_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "base"."Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Transactions" ADD CONSTRAINT "Transactions_createCuid_fkey" FOREIGN KEY ("createCuid") REFERENCES "base"."User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Transactions" ADD CONSTRAINT "Transactions_updatedCuid_fkey" FOREIGN KEY ("updatedCuid") REFERENCES "base"."User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Cart" ADD CONSTRAINT "Cart_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "base"."Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Cart" ADD CONSTRAINT "Cart_assignedCuid_fkey" FOREIGN KEY ("assignedCuid") REFERENCES "base"."User"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."ProductsOnCart" ADD CONSTRAINT "ProductsOnCart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "base"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."ProductsOnCart" ADD CONSTRAINT "ProductsOnCart_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "base"."Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Product" ADD CONSTRAINT "Product_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "base"."ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Product" ADD CONSTRAINT "Product_createCuid_fkey" FOREIGN KEY ("createCuid") REFERENCES "base"."User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Product" ADD CONSTRAINT "Product_updatedCuid_fkey" FOREIGN KEY ("updatedCuid") REFERENCES "base"."User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."ProductPriceHistory" ADD CONSTRAINT "ProductPriceHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "base"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."ProductPriceHistory" ADD CONSTRAINT "ProductPriceHistory_createdCuid_fkey" FOREIGN KEY ("createdCuid") REFERENCES "base"."User"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "base"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."ProductsOnOrder" ADD CONSTRAINT "ProductsOnOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "base"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."ProductsOnOrder" ADD CONSTRAINT "ProductsOnOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "base"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."ProductCategory" ADD CONSTRAINT "ProductCategory_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "base"."ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Bank" ADD CONSTRAINT "Bank_ownerCuid_fkey" FOREIGN KEY ("ownerCuid") REFERENCES "base"."User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Company" ADD CONSTRAINT "Company_ownerCuid_fkey" FOREIGN KEY ("ownerCuid") REFERENCES "base"."User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Daily" ADD CONSTRAINT "Daily_ownerCuid_fkey" FOREIGN KEY ("ownerCuid") REFERENCES "base"."User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Property" ADD CONSTRAINT "Property_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "base"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Station" ADD CONSTRAINT "Station_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "base"."Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."StationDigital" ADD CONSTRAINT "StationDigital_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "base"."Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."StationAnalog" ADD CONSTRAINT "StationAnalog_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "base"."Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Equipment" ADD CONSTRAINT "Equipment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "base"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."ChannelDigitalOnChannelSchema" ADD CONSTRAINT "ChannelDigitalOnChannelSchema_channelSchemaId_fkey" FOREIGN KEY ("channelSchemaId") REFERENCES "base"."ChannelSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."ChannelDigitalOnChannelSchema" ADD CONSTRAINT "ChannelDigitalOnChannelSchema_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "base"."Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."ChannelDigitalOnChannelSchema" ADD CONSTRAINT "ChannelDigitalOnChannelSchema_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "base"."Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."ChannelAnalogOnChannelSchema" ADD CONSTRAINT "ChannelAnalogOnChannelSchema_channelSchemaId_fkey" FOREIGN KEY ("channelSchemaId") REFERENCES "base"."ChannelSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."ChannelAnalogOnChannelSchema" ADD CONSTRAINT "ChannelAnalogOnChannelSchema_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "base"."Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_ArchivesToWork" ADD CONSTRAINT "_ArchivesToWork_A_fkey" FOREIGN KEY ("A") REFERENCES "base"."Archives"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_ArchivesToWork" ADD CONSTRAINT "_ArchivesToWork_B_fkey" FOREIGN KEY ("B") REFERENCES "base"."Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_ArchivesToTransactions" ADD CONSTRAINT "_ArchivesToTransactions_A_fkey" FOREIGN KEY ("A") REFERENCES "base"."Archives"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_ArchivesToTransactions" ADD CONSTRAINT "_ArchivesToTransactions_B_fkey" FOREIGN KEY ("B") REFERENCES "base"."Transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_ArchivesToEquipment" ADD CONSTRAINT "_ArchivesToEquipment_A_fkey" FOREIGN KEY ("A") REFERENCES "base"."Archives"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_ArchivesToEquipment" ADD CONSTRAINT "_ArchivesToEquipment_B_fkey" FOREIGN KEY ("B") REFERENCES "base"."Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_OtherValuesToWork" ADD CONSTRAINT "_OtherValuesToWork_A_fkey" FOREIGN KEY ("A") REFERENCES "base"."OtherValues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_OtherValuesToWork" ADD CONSTRAINT "_OtherValuesToWork_B_fkey" FOREIGN KEY ("B") REFERENCES "base"."Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_CategoryTransactionToTransactions" ADD CONSTRAINT "_CategoryTransactionToTransactions_A_fkey" FOREIGN KEY ("A") REFERENCES "base"."CategoryTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_CategoryTransactionToTransactions" ADD CONSTRAINT "_CategoryTransactionToTransactions_B_fkey" FOREIGN KEY ("B") REFERENCES "base"."Transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_CartToOtherValues" ADD CONSTRAINT "_CartToOtherValues_A_fkey" FOREIGN KEY ("A") REFERENCES "base"."Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_CartToOtherValues" ADD CONSTRAINT "_CartToOtherValues_B_fkey" FOREIGN KEY ("B") REFERENCES "base"."OtherValues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_OrderToOtherValues" ADD CONSTRAINT "_OrderToOtherValues_A_fkey" FOREIGN KEY ("A") REFERENCES "base"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_OrderToOtherValues" ADD CONSTRAINT "_OrderToOtherValues_B_fkey" FOREIGN KEY ("B") REFERENCES "base"."OtherValues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_EquipmentToStation" ADD CONSTRAINT "_EquipmentToStation_A_fkey" FOREIGN KEY ("A") REFERENCES "base"."Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_EquipmentToStation" ADD CONSTRAINT "_EquipmentToStation_B_fkey" FOREIGN KEY ("B") REFERENCES "base"."Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_ChannelSchemaToEquipment" ADD CONSTRAINT "_ChannelSchemaToEquipment_A_fkey" FOREIGN KEY ("A") REFERENCES "base"."ChannelSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_ChannelSchemaToEquipment" ADD CONSTRAINT "_ChannelSchemaToEquipment_B_fkey" FOREIGN KEY ("B") REFERENCES "base"."Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_GroupToStation" ADD CONSTRAINT "_GroupToStation_A_fkey" FOREIGN KEY ("A") REFERENCES "base"."Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."_GroupToStation" ADD CONSTRAINT "_GroupToStation_B_fkey" FOREIGN KEY ("B") REFERENCES "base"."Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;
