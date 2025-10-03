-- Demo users for testing role-based access control
-- Run this in your MySQL database

INSERT INTO users (id, full_name, email, password, phone, address, role, enabled) VALUES 
(1, 'Admin User', 'admin@autofuel.com', 'admin123', '0770000001', 'Admin Office, Colombo', 'ADMIN', true),
(2, 'Staff User', 'staff@autofuel.com', 'staff123', '0770000002', 'Staff Office, Colombo', 'STAFF', true),
(3, 'John Doe', 'customer@autofuel.com', 'customer123', '0771234567', '123 Main St, Colombo', 'CUSTOMER', true)
ON DUPLICATE KEY UPDATE 
full_name = VALUES(full_name),
email = VALUES(email),
password = VALUES(password),
phone = VALUES(phone),
address = VALUES(address),
role = VALUES(role),
enabled = VALUES(enabled);

-- Add some demo vehicles for the customer
INSERT INTO vehicles (id, customer_id, plate_number, make, model, year_of_manufacture, fuel_type) VALUES 
(1, 3, 'ABC-1234', 'Toyota', 'Corolla', 2020, 'PETROL'),
(2, 3, 'XYZ-5678', 'Honda', 'Civic', 2019, 'PETROL')
ON DUPLICATE KEY UPDATE 
customer_id = VALUES(customer_id),
plate_number = VALUES(plate_number),
make = VALUES(make),
model = VALUES(model),
year_of_manufacture = VALUES(year_of_manufacture),
fuel_type = VALUES(fuel_type);

-- Add some demo service types
INSERT INTO service_types (id, code, name, label, description, base_price, price) VALUES 
(1, 'OIL_CHANGE', 'Oil Change', 'Standard Oil Change', 'Regular engine oil change service', 25.00, 30.00),
(2, 'TIRE_ROTATION', 'Tire Rotation', 'Tire Rotation Service', 'Rotate tires for even wear', 15.00, 20.00),
(3, 'BRAKE_CHECK', 'Brake Check', 'Brake System Check', 'Complete brake system inspection', 35.00, 40.00)
ON DUPLICATE KEY UPDATE 
code = VALUES(code),
name = VALUES(name),
label = VALUES(label),
description = VALUES(description),
base_price = VALUES(base_price),
price = VALUES(price);

-- Add some demo locations
INSERT INTO locations (id, name, address, phone, email) VALUES 
(1, 'Main Station', '123 Fuel Street, Colombo', '011-2345678', 'main@autofuel.com'),
(2, 'Branch Station', '456 Service Road, Kandy', '081-2345678', 'branch@autofuel.com')
ON DUPLICATE KEY UPDATE 
name = VALUES(name),
address = VALUES(address),
phone = VALUES(phone),
email = VALUES(email);
