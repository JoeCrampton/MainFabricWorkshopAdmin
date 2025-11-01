-- Add shopify_product_id column to workshops table
ALTER TABLE workshops
ADD COLUMN IF NOT EXISTS shopify_product_id BIGINT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workshops_shopify_product_id
ON workshops(shopify_product_id);

-- Add unique constraint
ALTER TABLE workshops
ADD CONSTRAINT workshops_shopify_product_id_unique
UNIQUE (shopify_product_id);

-- Add comment
COMMENT ON COLUMN workshops.shopify_product_id
IS 'The Shopify product ID that this workshop corresponds to';
