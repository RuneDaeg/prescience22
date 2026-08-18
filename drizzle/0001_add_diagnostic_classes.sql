CREATE TABLE `diagnostic_classes` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`teacher_token_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_diagnostic_classes_code` ON `diagnostic_classes` (`code`);
--> statement-breakpoint
CREATE TABLE `diagnostic_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`student_name` text NOT NULL,
	`student_number` text NOT NULL,
	`answers_json` text NOT NULL,
	`completed_at` integer NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `diagnostic_classes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_diagnostic_submissions_class_student` ON `diagnostic_submissions` (`class_id`,`student_number`);
--> statement-breakpoint
CREATE INDEX `idx_diagnostic_submissions_class_completed` ON `diagnostic_submissions` (`class_id`,`completed_at`);
