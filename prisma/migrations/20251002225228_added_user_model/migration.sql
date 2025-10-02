-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(75) NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" VARCHAR(50),
    "lastName" VARCHAR(50)
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
