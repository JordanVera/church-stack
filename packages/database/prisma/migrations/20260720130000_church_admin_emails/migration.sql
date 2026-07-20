-- CreateTable
CREATE TABLE `ChurchAdminEmail` (
    `id` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `locationId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ChurchAdminEmail_churchId_idx`(`churchId`),
    INDEX `ChurchAdminEmail_locationId_idx`(`locationId`),
    INDEX `ChurchAdminEmail_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChurchAdminEmail` ADD CONSTRAINT `ChurchAdminEmail_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChurchAdminEmail` ADD CONSTRAINT `ChurchAdminEmail_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
