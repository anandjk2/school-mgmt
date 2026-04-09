PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS students (
  id            INTEGER PRIMARY KEY,
  first_name    TEXT    NOT NULL,
  last_name     TEXT    NOT NULL,
  date_of_birth TEXT,
  gender        TEXT    CHECK(gender IN ('male','female','other')),
  email         TEXT    UNIQUE,
  phone         TEXT,
  address       TEXT,
  enrolled_on   TEXT    NOT NULL DEFAULT (date('now')),
  status        TEXT    NOT NULL DEFAULT 'active'
                        CHECK(status IN ('active','inactive','graduated')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS classes (
  id            INTEGER PRIMARY KEY,
  name          TEXT    NOT NULL,
  grade_level   TEXT,
  section       TEXT,
  subject       TEXT,
  teacher_name  TEXT,
  room_number   TEXT,
  academic_year TEXT    NOT NULL,
  capacity      INTEGER DEFAULT 40,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS student_classes (
  id          INTEGER PRIMARY KEY,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id    INTEGER NOT NULL REFERENCES classes(id)  ON DELETE CASCADE,
  enrolled_on TEXT    NOT NULL DEFAULT (date('now')),
  UNIQUE(student_id, class_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id          INTEGER PRIMARY KEY,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id    INTEGER NOT NULL REFERENCES classes(id)  ON DELETE CASCADE,
  date        TEXT    NOT NULL,
  status      TEXT    NOT NULL CHECK(status IN ('present','absent','late','excused')),
  notes       TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(student_id, class_id, date)
);

CREATE TABLE IF NOT EXISTS fees (
  id          INTEGER PRIMARY KEY,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_type    TEXT    NOT NULL,
  description TEXT,
  amount_due  REAL    NOT NULL DEFAULT 0,
  amount_paid REAL    NOT NULL DEFAULT 0,
  due_date    TEXT,
  paid_on     TEXT,
  status      TEXT    NOT NULL DEFAULT 'pending'
                      CHECK(status IN ('pending','partial','paid','waived')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sc_student   ON student_classes(student_id);
CREATE INDEX IF NOT EXISTS idx_sc_class     ON student_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_att_date     ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_att_student  ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_att_cls_date ON attendance(class_id, date);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status  ON fees(status);
