/*
  Warnings:

  - You are about to drop the column `lastMessageAt` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "lastMessage" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "lastMessageAt";
