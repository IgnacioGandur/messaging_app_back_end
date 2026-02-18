-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "lastDeletedAt" TIMESTAMP(3),
ADD COLUMN     "listVisible" BOOLEAN NOT NULL DEFAULT true;
