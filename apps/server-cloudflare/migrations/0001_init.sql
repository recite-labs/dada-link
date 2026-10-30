-- Generated from packages/db/migrations/20261030222515_init/migration.sql by scripts/sync-migrations.ts. Do not edit.
CREATE TABLE `agencies` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`name_normalized` text NOT NULL,
	`licence_number` text,
	`licence_normalized` text,
	`status` text NOT NULL,
	`region` text,
	`phone` text,
	`address` text,
	`source_url` text NOT NULL,
	`verified_at` text
);
--> statement-breakpoint
CREATE TABLE `assistant_feedback` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`day` text NOT NULL,
	`helpful` integer NOT NULL,
	`locale` text NOT NULL,
	`content_ids` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_preferences` (
	`chat_hash` text PRIMARY KEY,
	`locale` text NOT NULL,
	`country` text,
	`updated_at_ms` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_items` (
	`id` text PRIMARY KEY,
	`kind` text NOT NULL,
	`phase` text,
	`countries` text NOT NULL,
	`topics` text NOT NULL,
	`sources` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_translations` (
	`content_id` text NOT NULL,
	`locale` text NOT NULL,
	`status` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`body` text NOT NULL,
	CONSTRAINT `content_translations_pk` PRIMARY KEY(`content_id`, `locale`),
	CONSTRAINT `fk_content_translations_content_id_content_items_id_fk` FOREIGN KEY (`content_id`) REFERENCES `content_items`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `directory_entries` (
	`id` text PRIMARY KEY,
	`country` text NOT NULL,
	`position` integer NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`names` text NOT NULL,
	`phone` text,
	`whatsapp` text,
	`email` text,
	`url` text,
	`address` text,
	`hours` text,
	`notes` text,
	`emergency` integer NOT NULL,
	`source_url` text NOT NULL,
	`verified` integer NOT NULL,
	`last_verified` text
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY,
	`window_start_ms` integer NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agencies_licence_idx` ON `agencies` (`licence_normalized`);--> statement-breakpoint
CREATE INDEX `agencies_name_idx` ON `agencies` (`name_normalized`);--> statement-breakpoint
CREATE INDEX `content_items_phase_idx` ON `content_items` (`phase`);--> statement-breakpoint
CREATE INDEX `content_items_kind_idx` ON `content_items` (`kind`);--> statement-breakpoint
CREATE INDEX `directory_entries_country_idx` ON `directory_entries` (`country`,`position`);