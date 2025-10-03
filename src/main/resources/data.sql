-- Demo data for AutoFuel Lanka System
-- This file will be automatically executed by Spring Boot

-- Insert demo users
INSERT IGNORE INTO users (id, full_name, email, password, phone, address, role, enabled) VALUES 
(1, 'Admin User', 'admin@autofuel.com', 'admin123', '0770000001', 'Admin Office, Colombo', 'ADMIN', true),
(2, 'Staff User', 'staff@autofuel.com', 'staff123', '0770000002', 'Staff Office, Colombo', 'STAFF', true),
(3, 'John Doe', 'customer@autofuel.com', 'customer123', '0771234567', '123 Main St, Colombo', 'CUSTOMER', true),
(4, 'Jane Smith', 'jane@example.com', 'password123', '0771234568', '456 Oak Ave, Kandy', 'CUSTOMER', true);

-- Insert demo locations
INSERT IGNORE INTO locations (id, name, address, type) VALUES 
(1, 'Main Service Center', '123 Fuel Street, Colombo', 'SERVICE_CENTER'),
(2, 'Branch Station', '456 Service Road, Kandy', 'FUEL_STATION'),
(3, 'Express Service', '789 Highway Road, Galle', 'SERVICE_CENTER'),
(4, 'City Fuel Station', '321 Downtown Ave, Negombo', 'FUEL_STATION');

-- Insert demo vehicles
INSERT IGNORE INTO vehicles (id, customer_id, plate_number, make, model, year_of_manufacture, fuel_type) VALUES 
(1, 3, 'ABC-1234', 'Toyota', 'Corolla', 2020, 'PETROL'),
(2, 3, 'XYZ-5678', 'Honda', 'Civic', 2019, 'PETROL'),
(3, 4, 'DEF-9012', 'Nissan', 'Sunny', 2021, 'PETROL'),
(4, 4, 'GHI-3456', 'Mitsubishi', 'Lancer', 2018, 'DIESEL');

-- Insert demo service types
INSERT IGNORE INTO service_types (id, code, name, label, description, base_price, price) VALUES 
(1, 'OIL_CHANGE', 'Oil Change', 'Standard Oil Change', 'Regular engine oil change service', 25.00, 30.00),
(2, 'TIRE_ROTATION', 'Tire Rotation', 'Tire Rotation Service', 'Rotate tires for even wear', 15.00, 20.00),
(3, 'BRAKE_CHECK', 'Brake Check', 'Brake System Check', 'Complete brake system inspection', 35.00, 40.00),
(4, 'WASH_EXT', 'Car Wash', 'Exterior Wash', 'Quick exterior clean', 12.00, 15.00),
(5, 'BATTERY_CHECK', 'Battery Check', 'Battery Inspection', 'Battery health and charging system check', 20.00, 25.00);

-- Insert demo bookings
INSERT IGNORE INTO bookings (id, customer_id, location_id, vehicle_id, type, start_time, end_time, status, service_type_id, fuel_type, liters_requested) VALUES 
(1, 3, 1, 1, 'SERVICE', '2024-01-15 09:00:00', '2024-01-15 11:00:00', 'COMPLETED', 1, NULL, NULL),
(2, 3, 2, 2, 'FUEL', '2024-01-16 14:30:00', '2024-01-16 15:00:00', 'CONFIRMED', NULL, 'PETROL', 25.5),
(3, 4, 3, 3, 'SERVICE', '2024-01-17 10:00:00', '2024-01-17 12:00:00', 'PENDING', 2, NULL, NULL),
(4, 4, 4, 4, 'FUEL', '2024-01-18 16:00:00', '2024-01-18 16:30:00', 'IN_PROGRESS', NULL, 'DIESEL', 30.0);
