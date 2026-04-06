CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE reservations (
  id          SERIAL PRIMARY KEY,
  room_id     VARCHAR(20) NOT NULL,
  organizer   VARCHAR(100) NOT NULL,
  subject     VARCHAR(100) NOT NULL,
  reason      TEXT,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),

  CHECK (ends_at > starts_at),

  CONSTRAINT no_double_booking
    EXCLUDE USING GIST (
      room_id WITH =,
      tstzrange(starts_at, ends_at, '[)') WITH &&
    )
);