/*
  Warnings:

  - A unique constraint covering the columns `[location]` on the table `DriveLocation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ploggersid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ploggersid` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ploggersid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DriveLocation_location_key" ON "DriveLocation"("location");

-- CreateIndex
CREATE UNIQUE INDEX "User_ploggersid_key" ON "User"("ploggersid");
