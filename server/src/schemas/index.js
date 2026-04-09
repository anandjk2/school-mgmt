import { z } from 'zod';

export const studentSchema = z.object({
  first_name:    z.string().min(1),
  last_name:     z.string().min(1),
  date_of_birth: z.string().optional().nullable(),
  gender:        z.enum(['male', 'female', 'other']).optional().nullable(),
  email:         z.string().email().optional().nullable(),
  phone:         z.string().optional().nullable(),
  address:       z.string().optional().nullable(),
  enrolled_on:   z.string().optional(),
  status:        z.enum(['active', 'inactive', 'graduated']).optional(),
});

export const classSchema = z.object({
  name:              z.string().min(1),
  grade_level:       z.string().optional().nullable(),
  section:           z.string().optional().nullable(),
  subject:           z.string().optional().nullable(),
  teacher_name:      z.string().optional().nullable(),
  room_number:       z.string().optional().nullable(),
  academic_year:     z.string().min(1),
  capacity:          z.number().int().positive().optional(),
  fee_amount:        z.number().nonnegative().optional().nullable(),
  billing_frequency: z.enum(['per_session', 'per_week', 'per_month']).optional().nullable(),
});

export const assignmentSchema = z.object({
  student_id: z.number().int().positive(),
  class_id:   z.number().int().positive(),
});

export const bulkAssignmentSchema = z.object({
  assignments: z.array(assignmentSchema).min(1),
});

export const attendanceSchema = z.object({
  student_id: z.number().int().positive(),
  class_id:   z.number().int().positive(),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status:     z.enum(['present', 'absent', 'late', 'excused']),
  notes:      z.string().optional().nullable(),
});

export const bulkAttendanceSchema = z.object({
  class_id: z.number().int().positive(),
  date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  records:  z.array(z.object({
    student_id: z.number().int().positive(),
    status:     z.enum(['present', 'absent', 'late', 'excused']),
    notes:      z.string().optional().nullable(),
  })).min(1),
});

export const feeSchema = z.object({
  student_id:        z.number().int().positive(),
  class_id:          z.number().int().positive().optional().nullable(),
  fee_type:          z.string().min(1),
  description:       z.string().optional().nullable(),
  amount_due:        z.number().nonnegative(),
  amount_paid:       z.number().nonnegative().optional(),
  billing_frequency: z.enum(['per_session', 'per_week', 'per_month']).optional().nullable(),
  due_date:          z.string().optional().nullable(),
  paid_on:           z.string().optional().nullable(),
  status:            z.enum(['pending', 'partial', 'paid', 'waived']).optional(),
});

export const feeUpdateSchema = z.object({
  class_id:          z.number().int().positive().optional().nullable(),
  fee_type:          z.string().min(1).optional(),
  description:       z.string().optional().nullable(),
  amount_due:        z.number().nonnegative().optional(),
  amount_paid:       z.number().nonnegative().optional(),
  billing_frequency: z.enum(['per_session', 'per_week', 'per_month']).optional().nullable(),
  due_date:          z.string().optional().nullable(),
  paid_on:           z.string().optional().nullable(),
  status:            z.enum(['pending', 'partial', 'paid', 'waived']).optional(),
});
