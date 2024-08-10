/*
  Warnings:

  - Added the required column `volunteerCount` to the `Drive` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Drive" ADD COLUMN     "volunteerCount" INTEGER NOT NULL;
