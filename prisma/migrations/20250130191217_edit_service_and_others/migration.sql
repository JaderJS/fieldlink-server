-- CreateTable
CREATE TABLE "Archives" (
    "cuid" TEXT NOT NULL,
    "pathUrl" TEXT NOT NULL,

    CONSTRAINT "Archives_pkey" PRIMARY KEY ("cuid")
);

-- CreateTable
CREATE TABLE "_ArchivesToService" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ArchivesToService_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ArchivesToService_B_index" ON "_ArchivesToService"("B");

-- AddForeignKey
ALTER TABLE "_ArchivesToService" ADD CONSTRAINT "_ArchivesToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Archives"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArchivesToService" ADD CONSTRAINT "_ArchivesToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
