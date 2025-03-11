-- CreateTable
CREATE TABLE "googleToken" (
    "id" SERIAL NOT NULL,
    "userCuid" TEXT NOT NULL,
    "tokens" JSONB NOT NULL,

    CONSTRAINT "googleToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "googleToken_userCuid_key" ON "googleToken"("userCuid");

-- AddForeignKey
ALTER TABLE "googleToken" ADD CONSTRAINT "googleToken_userCuid_fkey" FOREIGN KEY ("userCuid") REFERENCES "User"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;
