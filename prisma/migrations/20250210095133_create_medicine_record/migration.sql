-- CreateTable
CREATE TABLE `MedicineRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `dosage` VARCHAR(191) NULL,
    `timing` VARCHAR(191) NULL,
    `frequency` VARCHAR(191) NULL,
    `purpose` VARCHAR(191) NULL,
    `strength` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
