
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
ALTER TABLE file RENAME kind TO framework;

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
ALTER TABLE file RENAME framework TO kind;
