DROP TABLE `planned_exercises`;--> statement-breakpoint
DROP TABLE `plans`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text,
	`is_active` integer DEFAULT true NOT NULL,
	`routine_id` text,
	`target_duration` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "date", "start_time", "end_time", "is_active", "routine_id", "target_duration", "created_at", "updated_at") SELECT "id", "date", "start_time", "end_time", "is_active", "routine_id", "target_duration", "created_at", "updated_at" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `exercises` ADD `completed_at` text;