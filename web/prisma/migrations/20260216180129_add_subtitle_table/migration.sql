-- AlterTable
ALTER TABLE `Term` ADD COLUMN `subtitleId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Subtitle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `parentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Subtitle_sectionId_idx`(`sectionId`),
    INDEX `Subtitle_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Term_subtitleId_idx` ON `Term`(`subtitleId`);

-- AddForeignKey
ALTER TABLE `Subtitle` ADD CONSTRAINT `Subtitle_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Subtitle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subtitle` ADD CONSTRAINT `Subtitle_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Term` ADD CONSTRAINT `Term_subtitleId_fkey` FOREIGN KEY (`subtitleId`) REFERENCES `Subtitle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
