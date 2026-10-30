-- Full-text index over content translations (SQLite FTS5; available in node:sqlite and Cloudflare D1).
-- Kept in sync with `content_translations` by triggers so every writer stays consistent.
CREATE VIRTUAL TABLE `content_fts` USING fts5(
	`title`,
	`summary`,
	`body`,
	`content_id` UNINDEXED,
	`locale` UNINDEXED,
	`status` UNINDEXED,
	tokenize = 'unicode61 remove_diacritics 2'
);
--> statement-breakpoint
CREATE TRIGGER `content_translations_fts_insert` AFTER INSERT ON `content_translations` BEGIN
	INSERT INTO `content_fts` (`title`, `summary`, `body`, `content_id`, `locale`, `status`)
	VALUES (new.`title`, new.`summary`, new.`body`, new.`content_id`, new.`locale`, new.`status`);
END;
--> statement-breakpoint
CREATE TRIGGER `content_translations_fts_delete` AFTER DELETE ON `content_translations` BEGIN
	DELETE FROM `content_fts` WHERE `content_id` = old.`content_id` AND `locale` = old.`locale`;
END;
--> statement-breakpoint
CREATE TRIGGER `content_translations_fts_update` AFTER UPDATE ON `content_translations` BEGIN
	DELETE FROM `content_fts` WHERE `content_id` = old.`content_id` AND `locale` = old.`locale`;
	INSERT INTO `content_fts` (`title`, `summary`, `body`, `content_id`, `locale`, `status`)
	VALUES (new.`title`, new.`summary`, new.`body`, new.`content_id`, new.`locale`, new.`status`);
END;
