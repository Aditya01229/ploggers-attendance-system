/*
  Warnings:

  - Added the required column `expiryDate` to the `Drive` table without a default value. This is not possible if the table is not empty.
  - Added the required column `temporaryToken` to the `Drive` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Drive" ADD COLUMN     "expiryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "temporaryToken" TEXT NOT NULL;
