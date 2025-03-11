-- CreateTable
CREATE TABLE "Daily" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "ownerCuid" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Daily_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Daily" ADD CONSTRAINT "Daily_ownerCuid_fkey" FOREIGN KEY ("ownerCuid") REFERENCES "User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;
