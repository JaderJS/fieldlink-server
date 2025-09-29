-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "flag" TEXT NOT NULL DEFAULT 'Desconhecido';

-- AlterTable
CREATE SEQUENCE period_order_seq;
ALTER TABLE "Period" ALTER COLUMN "order" SET DEFAULT nextval('period_order_seq');
ALTER SEQUENCE period_order_seq OWNED BY "Period"."order";

-- AlterTable
ALTER TABLE "Work" ADD COLUMN     "flag" TEXT NOT NULL DEFAULT 'Desconhecido';

-- CreateTable
CREATE TABLE "OrderDate" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "finish" TIMESTAMP(3) NOT NULL,
    "hours" INTEGER NOT NULL,

    CONSTRAINT "OrderDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkDate" (
    "id" SERIAL NOT NULL,
    "workId" INTEGER NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "finish" TIMESTAMP(3) NOT NULL,
    "hours" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderDate_orderId_key" ON "OrderDate"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkDate_workId_key" ON "WorkDate"("workId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_updatedByCuid_fkey" FOREIGN KEY ("updatedByCuid") REFERENCES "User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDate" ADD CONSTRAINT "OrderDate_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkDate" ADD CONSTRAINT "WorkDate_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
