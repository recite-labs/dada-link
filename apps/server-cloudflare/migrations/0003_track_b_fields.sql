-- Generated from packages/db/migrations/20261030230332_track_b_fields/migration.sql by scripts/sync-migrations.ts. Do not edit.
ALTER TABLE `content_items` ADD `sensitive` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `content_items` ADD `related` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `content_items` ADD `updated` text;--> statement-breakpoint
ALTER TABLE `directory_entries` ADD `short_code` text;--> statement-breakpoint
ALTER TABLE `directory_entries` ADD `telegram` text;--> statement-breakpoint
ALTER TABLE `directory_entries` ADD `city` text;--> statement-breakpoint
ALTER TABLE `directory_entries` ADD `helps_with` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `directory_entries` ADD `languages` text DEFAULT '[]' NOT NULL;