
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
ALTER TABLE file ADD COLUMN framework_version TEXT NOT NULL DEFAULT '';
ALTER TABLE file ADD COLUMN size_bytes INTEGER NOT NULL DEFAULT -1;
ALTER TABLE file ADD COLUMN metadata JSONB NOT NULL DEFAULT '{}'::JSONB;

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
ALTER TABLE file DROP COLUMN framework_version;
ALTER TABLE file DROP COLUMN size_bytes;
ALTER TABLE file DROP COLUMN metadata;