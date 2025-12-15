/*
  Warnings:

  - You are about to drop the column `pillCount` on the `medicinerecord` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `medicinerecord` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `disease` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Medicine_name_userId_key` ON `medicine`;

-- AlterTable
ALTER TABLE `medicine` ADD COLUMN `strength` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `medicinerecord` DROP COLUMN `pillCount`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `ocrConfidence` DOUBLE NULL,
    ADD COLUMN `strength` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `notification` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `birthDate`,
    DROP COLUMN `disease`,
    DROP COLUMN `firstName`,
    DROP COLUMN `height`,
    DROP COLUMN `lastName`,
    DROP COLUMN `profileImage`,
    DROP COLUMN `weight`;

-- CreateTable
CREATE TABLE `Profile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `fullName` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `weight` DOUBLE NULL,
    `height` DOUBLE NULL,
    `disease` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Profile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
