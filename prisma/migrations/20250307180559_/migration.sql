-- CreateTable
CREATE TABLE `TakenMedicine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `medicineId` INTEGER NOT NULL,
    `notificationId` INTEGER NOT NULL,
    `takenAt` DATETIME(3) NOT NULL,
    `note` VARCHAR(191) NULL,

    UNIQUE INDEX `TakenMedicine_notificationId_key`(`notificationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TakenMedicine` ADD CONSTRAINT `TakenMedicine_notificationId_fkey` FOREIGN KEY (`notificationId`) REFERENCES `Notification`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
