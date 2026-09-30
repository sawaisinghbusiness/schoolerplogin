-- ==============================================================================
-- Migration: Add Schedule Column to Staff Table
-- Institution: Mother Teresa Nobles Academy Sr. Sec. School, Barmer
-- Table: public.staff
-- Description: Stores 8-period timetable allocations (JSONB) for each faculty member
-- ==============================================================================

-- 1. Add schedule column (JSONB format)
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}'::jsonb;

-- 2. Create index on schedule column for JSONB query performance
CREATE INDEX IF NOT EXISTS idx_staff_schedule ON staff USING gin (schedule);

-- 3. Verification query
SELECT employee_code, name, role, department, schedule 
FROM staff 
LIMIT 5;
