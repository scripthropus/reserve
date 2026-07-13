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

INSERT INTO reservations (room_id, organizer, subject, reason, starts_at, ends_at) VALUES
  ('学科会議室', 'system', 'placeholder', '', '2000-01-01 00:00:00+00', '2000-01-01 00:05:00+00'),
  ('会議室1', 'system', 'placeholder', '', '2000-01-01 00:00:00+00', '2000-01-01 00:05:00+00'),
  ('会議室2', 'system', 'placeholder', '', '2000-01-01 00:00:00+00', '2000-01-01 00:05:00+00'),
  ('会議室3', 'system', 'placeholder', '', '2000-01-01 00:00:00+00', '2000-01-01 00:05:00+00'),
  ('会議室4', 'system', 'placeholder', '', '2000-01-01 00:00:00+00', '2000-01-01 00:05:00+00'),
  ('会議室5', 'system', 'placeholder', '', '2000-01-01 00:00:00+00', '2000-01-01 00:05:00+00');

GRANT ALL ON ALL TABLES IN SCHEMA public TO masaki;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO masaki;