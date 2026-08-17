CREATE TABLE `tributes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`message` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_tributes_created_at` ON `tributes` (`created_at`);
