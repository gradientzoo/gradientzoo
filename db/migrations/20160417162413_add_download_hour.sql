-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
CREATE TABLE download_hour (
    file_id UUID NOT NULL,
    hour TIMESTAMPTZ NOT NULL,
    ip VARCHAR(45),
    user_id UUID,
    downloads INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (file_id) REFERENCES file(id),
    FOREIGN KEY (user_id) REFERENCES auth_user(id),
    UNIQUE(file_id, hour, ip)
);
CREATE INDEX download_hour_file_id_idx ON download_hour (file_id);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP INDEX download_hour_file_id_idx;
DROP TABLE download_hour;