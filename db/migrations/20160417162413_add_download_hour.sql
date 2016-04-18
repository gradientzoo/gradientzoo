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

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TABLE download_hour;