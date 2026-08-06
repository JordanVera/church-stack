-- Pre-onboard Stripe subscription held on User until church registration completes.
ALTER TABLE `User`
  ADD COLUMN `pendingPlanTier` ENUM('SITE', 'GROWTH', 'CUSTOM') NULL,
  ADD COLUMN `pendingStripeCustomerId` VARCHAR(191) NULL,
  ADD COLUMN `pendingStripeSubscriptionId` VARCHAR(191) NULL,
  ADD COLUMN `pendingStripePriceId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `User_pendingStripeSubscriptionId_key` ON `User`(`pendingStripeSubscriptionId`);
