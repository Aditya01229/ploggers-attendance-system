/*
  Warnings:

  - Changed the type of `bloodGroup` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bloodGroup",
ADD COLUMN     "bloodGroup" "BloodGroup" NOT NULL;
