-- Seed data exported from SQLite on 2026-04-11
-- Rows inserted with explicit IDs; sequences reset at end

-- students: 8 rows
INSERT INTO students (id, first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status, created_at, updated_at) VALUES (1, 'Alice', 'Johnson', '2010-03-15', 'female', 'alice.johnson@school.edu', '555-0101', NULL, '2024-01-10', 'active', '2026-03-25 21:37:09', '2026-03-25 21:37:09');
INSERT INTO students (id, first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status, created_at, updated_at) VALUES (2, 'Bob', 'Smith', '2010-07-22', 'male', 'bob.smith@school.edu', '555-0102', NULL, '2024-01-10', 'active', '2026-03-25 21:37:09', '2026-03-25 21:37:09');
INSERT INTO students (id, first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status, created_at, updated_at) VALUES (3, 'Carol', 'Williams', '2011-01-05', 'female', 'carol.williams@school.edu', '555-0103', NULL, '2024-01-10', 'active', '2026-03-25 21:37:09', '2026-03-25 21:37:09');
INSERT INTO students (id, first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status, created_at, updated_at) VALUES (4, 'David', 'Brown', '2010-11-30', 'male', 'david.brown@school.edu', '555-0104', NULL, '2024-01-10', 'active', '2026-03-25 21:37:09', '2026-03-25 21:37:09');
INSERT INTO students (id, first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status, created_at, updated_at) VALUES (5, 'Eve', 'Davis', '2011-04-18', 'female', 'eve.davis@school.edu', '555-0105', NULL, '2024-01-10', 'active', '2026-03-25 21:37:09', '2026-03-25 21:37:09');
INSERT INTO students (id, first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status, created_at, updated_at) VALUES (6, 'Frank', 'Miller', '2009-08-09', 'male', 'frank.miller@school.edu', '555-0106', NULL, '2024-01-10', 'active', '2026-03-25 21:37:09', '2026-03-25 21:37:09');
INSERT INTO students (id, first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status, created_at, updated_at) VALUES (7, 'Grace', 'Wilson', '2010-12-25', 'female', 'grace.wilson@school.edu', '555-0107', NULL, '2024-01-10', 'active', '2026-03-25 21:37:09', '2026-03-25 21:37:09');
INSERT INTO students (id, first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status, created_at, updated_at) VALUES (8, 'Henry', 'Moore', '2011-02-14', 'male', 'henry.moore@school.edu', '555-0108', NULL, '2024-01-10', 'active', '2026-03-25 21:37:09', '2026-03-25 21:37:09');

-- classes: 5 rows
INSERT INTO classes (id, name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity, created_at, updated_at, fee_amount, billing_frequency) VALUES (1, 'Grade 5A', '5', 'A', NULL, 'Mrs. Thompson', '101', '2024-2025', 30, '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);
INSERT INTO classes (id, name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity, created_at, updated_at, fee_amount, billing_frequency) VALUES (2, 'Grade 5B', '5', 'B', NULL, 'Mr. Garcia', '102', '2024-2025', 30, '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);
INSERT INTO classes (id, name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity, created_at, updated_at, fee_amount, billing_frequency) VALUES (3, 'Math 5', '5', 'A', 'Mathematics', 'Mr. Patel', '201', '2024-2025', 35, '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);
INSERT INTO classes (id, name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity, created_at, updated_at, fee_amount, billing_frequency) VALUES (4, 'Science 5', '5', 'A', 'Science', 'Ms. Lee', '202', '2024-2025', 35, '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);
INSERT INTO classes (id, name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity, created_at, updated_at, fee_amount, billing_frequency) VALUES (5, 'English 5', '5', 'A', 'English', 'Mrs. Chen', '203', '2024-2025', 35, '2026-03-25 21:37:09', '2026-03-25 22:09:19', 100, 'per_session');

-- student_classes: 22 rows
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (1, 1, 1, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (2, 1, 3, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (3, 1, 4, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (4, 2, 1, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (5, 2, 3, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (6, 2, 5, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (7, 3, 1, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (8, 3, 4, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (9, 3, 5, '2026-03-25', '2026-03-26');
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (10, 4, 2, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (11, 4, 3, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (12, 5, 2, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (13, 5, 4, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (14, 6, 2, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (15, 6, 5, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (16, 7, 1, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (17, 7, 3, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (18, 7, 4, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (19, 8, 2, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (20, 8, 5, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (21, 4, 5, '2026-03-25', NULL);
INSERT INTO student_classes (id, student_id, class_id, enrolled_on, disenrolled_on) VALUES (22, 5, 5, '2026-03-27', NULL);

-- attendance: 20 rows
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (1, 1, 1, '2025-03-20', 'present', NULL, '2026-03-25 21:37:09');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (2, 2, 1, '2025-03-20', 'present', NULL, '2026-03-25 21:37:09');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (3, 3, 1, '2025-03-20', 'absent', NULL, '2026-03-25 21:37:09');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (4, 1, 1, '2025-03-21', 'present', NULL, '2026-03-25 21:37:09');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (5, 2, 1, '2025-03-21', 'late', NULL, '2026-03-25 21:37:09');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (6, 3, 1, '2025-03-21', 'present', NULL, '2026-03-25 21:37:09');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (7, 1, 3, '2025-03-20', 'present', NULL, '2026-03-25 21:37:09');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (8, 2, 3, '2025-03-20', 'present', NULL, '2026-03-25 21:37:09');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (9, 4, 3, '2025-03-20', 'present', NULL, '2026-03-25 21:37:09');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (10, 7, 1, '2025-03-20', 'present', NULL, '2026-03-25 21:37:09');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (11, 7, 1, '2025-03-21', 'excused', NULL, '2026-03-25 21:37:09');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (12, 4, 5, '2026-03-26', 'present', NULL, '2026-03-26 00:57:29');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (13, 6, 5, '2026-03-26', 'absent', NULL, '2026-03-26 00:57:29');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (14, 8, 5, '2026-03-26', 'late', NULL, '2026-03-26 00:57:29');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (15, 2, 5, '2026-03-26', 'excused', NULL, '2026-03-26 00:57:29');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (16, 3, 5, '2026-03-26', 'present', NULL, '2026-03-26 00:57:29');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (17, 4, 3, '2026-03-26', 'present', NULL, '2026-03-26 00:58:42');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (18, 1, 3, '2026-03-26', 'present', NULL, '2026-03-26 00:58:42');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (19, 2, 3, '2026-03-26', 'present', NULL, '2026-03-26 00:58:42');
INSERT INTO attendance (id, student_id, class_id, date, status, notes, created_at) VALUES (20, 7, 3, '2026-03-26', 'present', NULL, '2026-03-26 00:58:42');

-- fees: 10 rows
INSERT INTO fees (id, student_id, fee_type, description, amount_due, amount_paid, due_date, paid_on, status, created_at, updated_at, class_id, billing_frequency) VALUES (1, 1, 'tuition', 'Term 1 Tuition', 5000, 5000, '2025-01-31', '2025-01-20', 'paid', '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);
INSERT INTO fees (id, student_id, fee_type, description, amount_due, amount_paid, due_date, paid_on, status, created_at, updated_at, class_id, billing_frequency) VALUES (2, 1, 'tuition', 'Term 2 Tuition', 5000, 2500, '2025-04-30', NULL, 'partial', '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);
INSERT INTO fees (id, student_id, fee_type, description, amount_due, amount_paid, due_date, paid_on, status, created_at, updated_at, class_id, billing_frequency) VALUES (3, 2, 'tuition', 'Term 1 Tuition', 5000, 5000, '2025-01-31', '2025-01-25', 'paid', '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);
INSERT INTO fees (id, student_id, fee_type, description, amount_due, amount_paid, due_date, paid_on, status, created_at, updated_at, class_id, billing_frequency) VALUES (4, 2, 'tuition', 'Term 2 Tuition', 5000, 0, '2025-04-30', NULL, 'pending', '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);
INSERT INTO fees (id, student_id, fee_type, description, amount_due, amount_paid, due_date, paid_on, status, created_at, updated_at, class_id, billing_frequency) VALUES (5, 3, 'tuition', 'Term 2 Tuition', 5000, 0, '2025-04-30', NULL, 'pending', '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);
INSERT INTO fees (id, student_id, fee_type, description, amount_due, amount_paid, due_date, paid_on, status, created_at, updated_at, class_id, billing_frequency) VALUES (6, 3, 'library', 'Library Fee', 500, 500, '2025-02-28', '2025-02-10', 'paid', '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);
INSERT INTO fees (id, student_id, fee_type, description, amount_due, amount_paid, due_date, paid_on, status, created_at, updated_at, class_id, billing_frequency) VALUES (7, 4, 'exam', 'Exam Fee', 800, 0, '2025-03-31', NULL, 'pending', '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);
INSERT INTO fees (id, student_id, fee_type, description, amount_due, amount_paid, due_date, paid_on, status, created_at, updated_at, class_id, billing_frequency) VALUES (8, 5, 'tuition', 'Term 2 Tuition', 5000, 5000, '2025-04-30', '2025-03-01', 'paid', '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);
INSERT INTO fees (id, student_id, fee_type, description, amount_due, amount_paid, due_date, paid_on, status, created_at, updated_at, class_id, billing_frequency) VALUES (9, 6, 'tuition', 'Term 2 Tuition', 5000, 0, '2025-04-30', NULL, 'pending', '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);
INSERT INTO fees (id, student_id, fee_type, description, amount_due, amount_paid, due_date, paid_on, status, created_at, updated_at, class_id, billing_frequency) VALUES (10, 7, 'activity', 'Sports Fee', 300, 300, '2025-02-28', '2025-02-15', 'paid', '2026-03-25 21:37:09', '2026-03-25 21:37:09', NULL, NULL);

-- settings: 8 rows
INSERT INTO settings (key, value) VALUES ('school_name', 'Captivate Dance Academy');
INSERT INTO settings (key, value) VALUES ('tagline', '');
INSERT INTO settings (key, value) VALUES ('address', '510 E 6th St
Corona CA 92879');
INSERT INTO settings (key, value) VALUES ('phone', '');
INSERT INTO settings (key, value) VALUES ('email', '');
INSERT INTO settings (key, value) VALUES ('website', '');
INSERT INTO settings (key, value) VALUES ('academic_year', '');
INSERT INTO settings (key, value) VALUES ('principal_name', 'Natalie');

-- Reset sequences after explicit-ID inserts
SELECT setval(pg_get_serial_sequence('students',        'id'), COALESCE((SELECT MAX(id) FROM students), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('classes',         'id'), COALESCE((SELECT MAX(id) FROM classes), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('student_classes', 'id'), COALESCE((SELECT MAX(id) FROM student_classes), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('attendance',      'id'), COALESCE((SELECT MAX(id) FROM attendance), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('fees',            'id'), COALESCE((SELECT MAX(id) FROM fees), 0) + 1, false);
