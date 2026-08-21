CREATE TABLE `recovery_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`checksum` varchar(64) NOT NULL,
	`recordCount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recovery_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `recovery_snapshots_created_at_idx` ON `recovery_snapshots` (`createdAt`);