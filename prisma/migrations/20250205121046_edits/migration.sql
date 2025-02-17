-- CreateTable
CREATE TABLE "OtherValues" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OtherValues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OtherValuesToWork" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OtherValuesToWork_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OtherValuesToWork_B_index" ON "_OtherValuesToWork"("B");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_assignedCuid_fkey" FOREIGN KEY ("assignedCuid") REFERENCES "User"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OtherValuesToWork" ADD CONSTRAINT "_OtherValuesToWork_A_fkey" FOREIGN KEY ("A") REFERENCES "OtherValues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OtherValuesToWork" ADD CONSTRAINT "_OtherValuesToWork_B_fkey" FOREIGN KEY ("B") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
