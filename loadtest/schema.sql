-- Tables used by the app (taken from the local test database).
CREATE TABLE IF NOT EXISTS creations (
    id serial PRIMARY KEY,
    user_id text NOT NULL,
    prompt text NOT NULL,
    content text NOT NULL,
    type text NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_usage (
    user_id text PRIMARY KEY,
    free_usage integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_creations_user_created ON creations (user_id, created_at DESC);
