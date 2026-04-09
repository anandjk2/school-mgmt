-- Track when a student is removed from a class (soft disenroll)
ALTER TABLE student_classes ADD COLUMN disenrolled_on TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_sc_active ON student_classes(student_id, class_id, disenrolled_on);
