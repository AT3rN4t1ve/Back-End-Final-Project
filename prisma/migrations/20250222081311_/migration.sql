/*
  Warnings:

  - You are about to drop the column `purpose` on the `medicinerecord` table. All the data in the column will be lost.
  - You are about to drop the column `timing` on the `medicinerecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `medicinerecord` DROP COLUMN `purpose`,
    DROP COLUMN `timing`,
    ADD COLUMN `drugUses` VARCHAR(191) NULL,
    ADD COLUMN `intakeTime` VARCHAR(191) NULL;
