CREATE TABLE IF NOT EXISTS students (
  id            SERIAL PRIMARY KEY,
  first_name    TEXT        NOT NULL,
  last_name     TEXT        NOT NULL,
  date_of_birth DATE,
  gender        TEXT        CHECK(gender IN ('male','female','other')),
  email         TEXT        UNIQUE,
  phone         TEXT,
  address       TEXT,
  enrolled_on   DATE        NOT NULL DEFAULT CURRENT_DATE,
  status        TEXT        NOT NULL DEFAULT 'active'
                            CHECK(status IN ('active','inactive','graduated')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  id                SERIAL PRIMARY KEY,
  name              TEXT        NOT NULL,
  grade_level       TEXT,
  section           TEXT,
  subject           TEXT,
  teacher_name      TEXT,
  room_number       TEXT,
  academic_year     TEXT        NOT NULL,
  capacity          INTEGER     DEFAULT 40,
  fee_amount        NUMERIC     DEFAULT NULL,
  billing_frequency TEXT        DEFAULT NULL
                    CHECK(billing_frequency IN ('per_session','per_week','per_month')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_classes (
  id             SERIAL PRIMARY KEY,
  student_id     INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id       INTEGER NOT NULL REFERENCES classes(id)  ON DELETE CASCADE,
  enrolled_on    DATE    NOT NULL DEFAULT CURRENT_DATE,
  disenrolled_on DATE    DEFAULT NULL,
  UNIQUE(student_id, class_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id          SERIAL PRIMARY KEY,
  student_id  INTEGER     NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id    INTEGER     NOT NULL REFERENCES classes(id)  ON DELETE CASCADE,
  date        DATE        NOT NULL,
  status      TEXT        NOT NULL CHECK(status IN ('present','absent','late','excused')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, class_id, date)
);

CREATE TABLE IF NOT EXISTS fees (
  id                SERIAL PRIMARY KEY,
  student_id        INTEGER     NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id          INTEGER     REFERENCES classes(id) ON DELETE SET NULL,
  fee_type          TEXT        NOT NULL,
  description       TEXT,
  amount_due        NUMERIC     NOT NULL DEFAULT 0,
  amount_paid       NUMERIC     NOT NULL DEFAULT 0,
  billing_frequency TEXT        DEFAULT NULL
                    CHECK(billing_frequency IN ('per_session','per_week','per_month')),
  due_date          DATE,
  paid_on           DATE,
  status            TEXT        NOT NULL DEFAULT 'pending'
                    CHECK(status IN ('pending','partial','paid','waived')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_sc_student    ON student_classes(student_id);
CREATE INDEX IF NOT EXISTS idx_sc_class      ON student_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_sc_active     ON student_classes(student_id, class_id, disenrolled_on);
CREATE INDEX IF NOT EXISTS idx_att_date      ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_att_student   ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_att_cls_date  ON attendance(class_id, date);
CREATE INDEX IF NOT EXISTS idx_fees_student  ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status   ON fees(status);
CREATE INDEX IF NOT EXISTS idx_fees_class    ON fees(class_id);
