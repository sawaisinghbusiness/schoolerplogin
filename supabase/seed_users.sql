-- ==============================================================================
-- Seed login users with bcrypt password hashes.
-- The hashes below correspond to the demo passwords; regenerate for production
-- with:  node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD',10))"
--
-- Demo credentials:
--   9414012345   (admin)
--   9829055443   (teacher)
--   9460199887   (accountant)
--   ADM-9102     (parent)
-- Set real passwords from Settings > Users & roles after seeding.
-- ==============================================================================
INSERT INTO users (phone_number, admission_no, employee_code, full_name, role, password_hash)
VALUES
    ('9414012345', NULL, 'EMP-ADMIN-01', 'Mahendra Parihar (Director/Admin)', 'admin',
     '$2b$10$1M7Rj8ungRXjIruTt4xIIu1cpn9oIJMuDpr3hIuTT1zu3tbKmGejS'),
    ('9829055443', NULL, 'EMP-PGT-14', 'Sunita Sharma (Senior PGT)', 'teacher',
     '$2b$10$zetTYgHr0gEgOE639.TqJ.YcJyLNb9jfADj7kCG.ZqAxMRnyQnKrO'),
    ('9460199887', NULL, 'EMP-ACC-03', 'Ramesh Bhati (Accounts)', 'accountant',
     '$2b$10$vTleD4P5HwlZmuMYOnEnOeJ4h6kYW2iLJcW1Rs0bQJmkFdNA6.Hmy')
ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO users (phone_number, admission_no, employee_code, full_name, role, password_hash)
VALUES
    (NULL, 'ADM-9102', NULL, 'Rajesh Sharma (Parent - Aarav)', 'parent',
     '$2b$10$yPb1WnyARzpBUtyw8PeXxOuI73AuUQ9RgJ8SBJQbUFxJJWuA/l9BG')
ON CONFLICT (admission_no) DO NOTHING;
