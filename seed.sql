
INSERT INTO departments (name) VALUES
('Sales'),
('Legal'),
('Financial'),
('Engineering');

INSERT INTO roles (title, salary, department_id) VALUES
('Sales Manager', 100000.00, 1),
('Sales Rep', 70000.00, 1),
('Lawyer', 150000.00, 2),
('Legal Team Lead', 150000.00, 2),
('Senior Accountant', 80000.00, 3),
('Senior Developer', 90000.00, 4),
('Software Engineer', 90000.00, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
('Billy', 'Andrews', 1, NULL),
('Melinda', 'Meyer', 2, 1),
('Perry','Webb', 3, NULL),
('Ryan', 'McDaniel', 4, 3),
('Henrietta', 'Bennett', 5, NULL),
('Willis', 'Francis', 6, NULL),
('Betsy', 'Perez', 7, 6);