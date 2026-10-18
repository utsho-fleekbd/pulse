CREATE TABLE `check_results` (
	`id` text PRIMARY KEY,
	`monitor_id` text NOT NULL,
	`status` text NOT NULL,
	`status_code` integer,
	`reason` text,
	`response_time_ms` integer NOT NULL,
	`checked_at` integer NOT NULL,
	CONSTRAINT `fk_check_results_monitor_id_monitors_id_fk` FOREIGN KEY (`monitor_id`) REFERENCES `monitors`(`id`) ON DELETE CASCADE,
	CONSTRAINT "check_results_status_check" CHECK("status" IN ('up', 'down')),
	CONSTRAINT "check_results_reason_check" CHECK("reason" IS NULL OR "reason" IN ('unhealthy_status', 'timeout', 'network_error'))
);
--> statement-breakpoint
CREATE TABLE `monitors` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	CONSTRAINT "monitors_status_check" CHECK("status" IN ('pending', 'up', 'down'))
);
--> statement-breakpoint
CREATE INDEX `check_results_monitor_time_idx` ON `check_results` (`monitor_id`,`checked_at`);