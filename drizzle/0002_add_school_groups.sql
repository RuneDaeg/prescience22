CREATE TABLE `school_groups` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`admin_token_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `diagnostic_classes` ADD `school_code` text REFERENCES school_groups(code) ON DELETE set null;
--> statement-breakpoint
ALTER TABLE `diagnostic_classes` ADD `academic_year` integer;
--> statement-breakpoint
ALTER TABLE `diagnostic_classes` ADD `grade` integer;
--> statement-breakpoint
ALTER TABLE `diagnostic_classes` ADD `class_number` integer;
--> statement-breakpoint
CREATE INDEX `idx_diagnostic_classes_school_cohort` ON `diagnostic_classes` (`school_code`,`academic_year`,`grade`,`class_number`);
