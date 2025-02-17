/*
  Warnings:

  - You are about to drop the column `status` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the `_ArchivesToService` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ServicesOnMaterials" DROP CONSTRAINT "ServicesOnMaterials_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "_ArchivesToService" DROP CONSTRAINT "_ArchivesToService_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArchivesToService" DROP CONSTRAINT "_ArchivesToService_B_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "status",
DROP COLUMN "title",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "_ArchivesToService";

-- CreateTable
CREATE TABLE "Work" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'unknown',
    "description" TEXT,
    "status" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArchivesToWork" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ArchivesToWork_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ArchivesToWork_B_index" ON "_ArchivesToWork"("B");

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicesOnMaterials" ADD CONSTRAINT "ServicesOnMaterials_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Work"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Work"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArchivesToWork" ADD CONSTRAINT "_ArchivesToWork_A_fkey" FOREIGN KEY ("A") REFERENCES "Archives"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArchivesToWork" ADD CONSTRAINT "_ArchivesToWork_B_fkey" FOREIGN KEY ("B") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
