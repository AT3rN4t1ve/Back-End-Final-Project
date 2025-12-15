/*
  Warnings:

  - You are about to drop the column `frequency` on the `medicinerecord` table. All the data in the column will be lost.
  - You are about to drop the column `strength` on the `medicinerecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `medicinerecord` DROP COLUMN `frequency`,
    DROP COLUMN `strength`;
