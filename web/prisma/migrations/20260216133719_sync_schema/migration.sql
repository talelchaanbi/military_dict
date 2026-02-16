/*
  Warnings:

  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentAsset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentVariant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `DocumentAsset` DROP FOREIGN KEY `DocumentAsset_assetId_fkey`;

-- DropForeignKey
ALTER TABLE `DocumentAsset` DROP FOREIGN KEY `DocumentAsset_documentId_fkey`;

-- DropForeignKey
ALTER TABLE `DocumentVariant` DROP FOREIGN KEY `DocumentVariant_documentId_fkey`;

-- AlterTable
ALTER TABLE `Term` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `Asset`;

-- DropTable
DROP TABLE `DocumentAsset`;

-- DropTable
DROP TABLE `DocumentVariant`;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'editor', 'reader') NOT NULL DEFAULT 'reader',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AbbreviationProposal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `termId` INTEGER NOT NULL,
    `proposedAbbreviation` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `createdById` INTEGER NOT NULL,
    `reviewedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AbbreviationProposal_termId_idx`(`termId`),
    INDEX `AbbreviationProposal_status_idx`(`status`),
    INDEX `AbbreviationProposal_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AbbreviationProposal` ADD CONSTRAINT `AbbreviationProposal_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `Term`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbbreviationProposal` ADD CONSTRAINT `AbbreviationProposal_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbbreviationProposal` ADD CONSTRAINT `AbbreviationProposal_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
