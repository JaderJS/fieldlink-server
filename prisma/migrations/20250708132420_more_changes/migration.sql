/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `CategoryOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CategoryOrder_name_key" ON "CategoryOrder"("name");
