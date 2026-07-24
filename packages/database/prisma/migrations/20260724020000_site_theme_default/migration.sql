-- AlterTable
ALTER TABLE `Church` ADD COLUMN `siteThemeDefault` ENUM('LIGHT', 'DARK') NOT NULL DEFAULT 'LIGHT';
