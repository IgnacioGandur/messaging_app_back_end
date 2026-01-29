/*
  Warnings:

  - You are about to drop the column `lastMessage` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "lastMessage",
ADD COLUMN     "lastMessageAt" TIMESTAMP(3);
