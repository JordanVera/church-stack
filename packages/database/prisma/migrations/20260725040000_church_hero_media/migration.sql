-- AlterTable
ALTER TABLE `Church` ADD COLUMN `heroMediaUrl` VARCHAR(191) NULL,
    ADD COLUMN `heroMediaType` ENUM('IMAGE', 'VIDEO') NULL;
