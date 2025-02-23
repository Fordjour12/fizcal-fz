DROP INDEX `Users_username_unique`;--> statement-breakpoint
ALTER TABLE `Users` ADD `email` text NOT NULL;--> statement-breakpoint
ALTER TABLE `Users` ADD `password` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `Users_email_unique` ON `Users` (`email`);--> statement-breakpoint
ALTER TABLE `Users` DROP COLUMN `username`;