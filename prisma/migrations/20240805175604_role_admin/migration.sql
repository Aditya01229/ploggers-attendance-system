/*
  Warnings:

  - Added the required column `role` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SuperAdmin', 'Admin');

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "role" "Role" NOT NULL;
