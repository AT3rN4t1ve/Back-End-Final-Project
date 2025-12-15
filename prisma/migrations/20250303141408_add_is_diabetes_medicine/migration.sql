/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `medicine` table. All the data in the column will be lost.
  - You are about to drop the column `strength` on the `medicine` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `medicine` DROP COLUMN `imageUrl`,
    DROP COLUMN `strength`,
    ADD COLUMN `isDiabetesMedicine` BOOLEAN NOT NULL DEFAULT false;
