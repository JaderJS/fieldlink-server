-- CreateTable
CREATE TABLE "_CartToOtherValues" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CartToOtherValues_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CartToOtherValues_B_index" ON "_CartToOtherValues"("B");

-- AddForeignKey
ALTER TABLE "_CartToOtherValues" ADD CONSTRAINT "_CartToOtherValues_A_fkey" FOREIGN KEY ("A") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartToOtherValues" ADD CONSTRAINT "_CartToOtherValues_B_fkey" FOREIGN KEY ("B") REFERENCES "OtherValues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
