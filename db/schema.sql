-- Carpark slot schema for Neon (PostgreSQL)

CREATE TABLE IF NOT EXISTS slots (
  id         SERIAL PRIMARY KEY,
  zone       TEXT NOT NULL DEFAULT '',          -- group / area the slot belongs to
  slot_code  TEXT NOT NULL,                      -- e.g. "NE 3", "OW 12"
  name       TEXT NOT NULL DEFAULT '',           -- person / owner of the slot
  plate      TEXT NOT NULL DEFAULT '',           -- license plate, e.g. "กย 6486 ชุมพร"
  room       TEXT NOT NULL DEFAULT '',           -- room number, e.g. "604"
  status     TEXT NOT NULL DEFAULT 'Vacant'      -- 'Vacant' or 'Occupied'
             CHECK (status IN ('Vacant', 'Occupied')),
  note       TEXT NOT NULL DEFAULT '',           -- free text (license plate, remarks)
  sort_order INTEGER NOT NULL DEFAULT 0,         -- display order
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS slots_zone_idx ON slots (zone);

-- keep updated_at fresh on every UPDATE
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS slots_set_updated_at ON slots;
CREATE TRIGGER slots_set_updated_at
  BEFORE UPDATE ON slots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
