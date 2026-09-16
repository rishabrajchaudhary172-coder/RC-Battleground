-- Migration: Add eSewa Transaction Fields and update gateway constraints

ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS transaction_uuid VARCHAR(120);
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS ref_id VARCHAR(120);
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS raw_response JSONB DEFAULT '{}'::jsonb;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Update gateway constraint to restrict gateway to esewa
ALTER TABLE payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_gateway_check;
ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_gateway_check CHECK (gateway IN ('esewa'));

-- Add transaction_uuid to orders table if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_uuid VARCHAR(120);
