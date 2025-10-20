-- Update foreign key constraints to allow NULL values
-- This script fixes the foreign key constraint errors when deleting bookings

-- 1. Update feedback table to allow NULL booking_id
ALTER TABLE feedback MODIFY COLUMN booking_id BIGINT NULL;

-- 2. Update jobs table to allow NULL booking reference
-- The jobs table uses @OneToOne, so the column is likely named 'booking_id'
ALTER TABLE jobs MODIFY COLUMN booking_id BIGINT NULL;

-- 3. Update invoices table to allow NULL booking_id
ALTER TABLE invoices MODIFY COLUMN booking_id BIGINT NULL;

-- 4. Update payments table to allow NULL invoice_id
ALTER TABLE payments MODIFY COLUMN invoice_id BIGINT NULL;

-- Optional: Add indexes for better performance with NULL values
CREATE INDEX IF NOT EXISTS idx_feedback_booking_id ON feedback(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
