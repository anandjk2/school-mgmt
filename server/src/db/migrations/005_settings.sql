CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Default values
INSERT OR IGNORE INTO settings (key, value) VALUES ('school_name',    'My School');
INSERT OR IGNORE INTO settings (key, value) VALUES ('tagline',        '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('address',        '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('phone',          '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('email',          '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('website',        '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('academic_year',  '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('principal_name', '');
