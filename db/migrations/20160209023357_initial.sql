
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied

SET TIMEZONE TO 'UTC';

CREATE EXTENSION "uuid-ossp";

CREATE TABLE auth_user (
    id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V1(),
    email TEXT NOT NULL,
    username VARCHAR(20) NOT NULL,
    password_hash TEXT NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    created_time TIMESTAMPTZ NOT NULL,
    UNIQUE(email),
    UNIQUE(username)
);

CREATE TABLE auth_token (
    id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V4(),
    user_id UUID NOT NULL,
    created_time TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
);

CREATE TABLE model (
    id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V1(),
    user_id UUID NOT NULL,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'public',
    readme TEXT NOT NULL,
    created_time TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_user(id),
    UNIQUE(user_id, slug)
);

CREATE TABLE file (
    id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V1(),
    user_id UUID NOT NULL,
    model_id UUID NOT NULL,
    filename TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    kind TEXT NOT NULL,
    client_name TEXT NOT NULL,
    created_time TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
);

CREATE INDEX file_model_id_status_idx ON file (model_id, status);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back

DROP INDEX file_model_id_status_idx;
DROP TABLE file;
DROP TABLE model;
DROP TABLE auth_token;
DROP TABLE auth_user;
DROP EXTENSION "uuid-ossp";