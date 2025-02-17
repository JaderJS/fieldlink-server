-- CreateTable
CREATE TABLE "_OrderToOtherValues" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OrderToOtherValues_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OrderToOtherValues_B_index" ON "_OrderToOtherValues"("B");

-- AddForeignKey
ALTER TABLE "_OrderToOtherValues" ADD CONSTRAINT "_OrderToOtherValues_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToOtherValues" ADD CONSTRAINT "_OrderToOtherValues_B_fkey" FOREIGN KEY ("B") REFERENCES "OtherValues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
