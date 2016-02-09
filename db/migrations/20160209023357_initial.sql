
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied

SET TIMEZONE TO 'UTC';

CREATE EXTENSION "uuid-ossp";

CREATE TABLE auth_user (
    id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V1(),
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    created_time TIMESTAMPTZ NOT NULL,
    UNIQUE(email)
);

CREATE TABLE auth_token (
    id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V4(),
    user_id UUID NOT NULL,
    created_time TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back

DROP TABLE auth_token;
DROP TABLE auth_user;
DROP EXTENSION "uuid-ossp";