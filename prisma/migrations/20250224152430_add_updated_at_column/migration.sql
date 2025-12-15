/*
  Warnings:

  - You are about to drop the column `timing` on the `medicinerecord` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `MedicineRecord` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `medicinerecord` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `medicine` ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `medicinerecord` DROP COLUMN `timing`,
    ADD COLUMN `intakeTime` VARCHAR(191) NULL,
    ADD COLUMN `pillCount` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `birthDate` DATETIME(3) NULL,
    ADD COLUMN `disease` VARCHAR(191) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `height` DOUBLE NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `profileImage` VARCHAR(191) NULL,
    ADD COLUMN `weight` DOUBLE NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `medicineId` INTEGER NULL,
    `notificationTime` DATETIME(3) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_medicineId_fkey` FOREIGN KEY (`medicineId`) REFERENCES `Medicine`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
