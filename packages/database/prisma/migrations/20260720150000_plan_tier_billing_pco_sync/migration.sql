-- CreateEnum
ALTER TABLE `Church` MODIFY COLUMN `givingEnabled` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `Church` MODIFY COLUMN `mobilePlan` ENUM('SHARED', 'WHITELABEL') NOT NULL DEFAULT 'WHITELABEL';

-- CreateEnum PlanTier / ContentSource via columns (MySQL enums)
ALTER TABLE `Church` ADD COLUMN `planTier` ENUM('SITE', 'GROWTH', 'CUSTOM') NOT NULL DEFAULT 'SITE';
ALTER TABLE `Church` ADD COLUMN `stripeCustomerId` VARCHAR(191) NULL;
ALTER TABLE `Church` ADD COLUMN `stripeSubscriptionId` VARCHAR(191) NULL;
ALTER TABLE `Church` ADD COLUMN `stripePriceId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Church_stripeCustomerId_key` ON `Church`(`stripeCustomerId`);
CREATE UNIQUE INDEX `Church_stripeSubscriptionId_key` ON `Church`(`stripeSubscriptionId`);
CREATE INDEX `Church_planTier_idx` ON `Church`(`planTier`);

-- Location sync fields
ALTER TABLE `Location` ADD COLUMN `source` ENUM('MANUAL', 'PLANNING_CENTER') NOT NULL DEFAULT 'MANUAL';
ALTER TABLE `Location` ADD COLUMN `externalId` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `Location_churchId_externalId_key` ON `Location`(`churchId`, `externalId`);

-- Service sync fields
ALTER TABLE `Service` ADD COLUMN `source` ENUM('MANUAL', 'PLANNING_CENTER') NOT NULL DEFAULT 'MANUAL';
ALTER TABLE `Service` ADD COLUMN `externalId` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `Service_locationId_externalId_key` ON `Service`(`locationId`, `externalId`);

-- Event sync fields
ALTER TABLE `Event` ADD COLUMN `source` ENUM('MANUAL', 'PLANNING_CENTER') NOT NULL DEFAULT 'MANUAL';
ALTER TABLE `Event` ADD COLUMN `externalId` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `Event_churchId_externalId_key` ON `Event`(`churchId`, `externalId`);

-- LifeGroup
CREATE TABLE `LifeGroup` (
    `id` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `location` VARCHAR(191) NULL,
    `meetingDay` INTEGER NULL,
    `meetingTime` VARCHAR(191) NULL,
    `source` ENUM('MANUAL', 'PLANNING_CENTER') NOT NULL DEFAULT 'MANUAL',
    `externalId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LifeGroup_churchId_externalId_key`(`churchId`, `externalId`),
    INDEX `LifeGroup_churchId_idx`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `LifeGroup` ADD CONSTRAINT `LifeGroup_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
