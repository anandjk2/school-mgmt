-- Seed demo data (only inserts if tables are empty)

INSERT OR IGNORE INTO students (first_name, last_name, date_of_birth, gender, email, phone, enrolled_on, status) VALUES
  ('Alice',   'Johnson',  '2010-03-15', 'female', 'alice.johnson@school.edu',  '555-0101', '2024-01-10', 'active'),
  ('Bob',     'Smith',    '2010-07-22', 'male',   'bob.smith@school.edu',      '555-0102', '2024-01-10', 'active'),
  ('Carol',   'Williams', '2011-01-05', 'female', 'carol.williams@school.edu', '555-0103', '2024-01-10', 'active'),
  ('David',   'Brown',    '2010-11-30', 'male',   'david.brown@school.edu',    '555-0104', '2024-01-10', 'active'),
  ('Eve',     'Davis',    '2011-04-18', 'female', 'eve.davis@school.edu',      '555-0105', '2024-01-10', 'active'),
  ('Frank',   'Miller',   '2009-08-09', 'male',   'frank.miller@school.edu',   '555-0106', '2024-01-10', 'active'),
  ('Grace',   'Wilson',   '2010-12-25', 'female', 'grace.wilson@school.edu',   '555-0107', '2024-01-10', 'active'),
  ('Henry',   'Moore',    '2011-02-14', 'male',   'henry.moore@school.edu',    '555-0108', '2024-01-10', 'active');

INSERT OR IGNORE INTO classes (name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity) VALUES
  ('Grade 5A',    '5', 'A', NULL,          'Mrs. Thompson', '101', '2024-2025', 30),
  ('Grade 5B',    '5', 'B', NULL,          'Mr. Garcia',    '102', '2024-2025', 30),
  ('Math 5',      '5', 'A', 'Mathematics', 'Mr. Patel',     '201', '2024-2025', 35),
  ('Science 5',   '5', 'A', 'Science',     'Ms. Lee',       '202', '2024-2025', 35),
  ('English 5',   '5', 'A', 'English',     'Mrs. Chen',     '203', '2024-2025', 35);

INSERT OR IGNORE INTO student_classes (student_id, class_id) VALUES
  (1, 1), (1, 3), (1, 4),
  (2, 1), (2, 3), (2, 5),
  (3, 1), (3, 4), (3, 5),
  (4, 2), (4, 3),
  (5, 2), (5, 4),
  (6, 2), (6, 5),
  (7, 1), (7, 3), (7, 4),
  (8, 2), (8, 5);

INSERT OR IGNORE INTO attendance (student_id, class_id, date, status) VALUES
  (1, 1, '2025-03-20', 'present'), (2, 1, '2025-03-20', 'present'), (3, 1, '2025-03-20', 'absent'),
  (1, 1, '2025-03-21', 'present'), (2, 1, '2025-03-21', 'late'),    (3, 1, '2025-03-21', 'present'),
  (1, 3, '2025-03-20', 'present'), (2, 3, '2025-03-20', 'present'), (4, 3, '2025-03-20', 'present'),
  (7, 1, '2025-03-20', 'present'), (7, 1, '2025-03-21', 'excused');

INSERT OR IGNORE INTO fees (student_id, fee_type, description, amount_due, amount_paid, due_date, paid_on, status) VALUES
  (1, 'tuition',  'Term 1 Tuition', 5000.00, 5000.00, '2025-01-31', '2025-01-20', 'paid'),
  (1, 'tuition',  'Term 2 Tuition', 5000.00, 2500.00, '2025-04-30', NULL,         'partial'),
  (2, 'tuition',  'Term 1 Tuition', 5000.00, 5000.00, '2025-01-31', '2025-01-25', 'paid'),
  (2, 'tuition',  'Term 2 Tuition', 5000.00, 0,       '2025-04-30', NULL,         'pending'),
  (3, 'tuition',  'Term 2 Tuition', 5000.00, 0,       '2025-04-30', NULL,         'pending'),
  (3, 'library',  'Library Fee',    500.00,  500.00,  '2025-02-28', '2025-02-10', 'paid'),
  (4, 'exam',     'Exam Fee',       800.00,  0,       '2025-03-31', NULL,         'pending'),
  (5, 'tuition',  'Term 2 Tuition', 5000.00, 5000.00, '2025-04-30', '2025-03-01', 'paid'),
  (6, 'tuition',  'Term 2 Tuition', 5000.00, 0,       '2025-04-30', NULL,         'pending'),
  (7, 'activity', 'Sports Fee',     300.00,  300.00,  '2025-02-28', '2025-02-15', 'paid');
