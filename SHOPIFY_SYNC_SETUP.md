# Shopify Workshop Sync - Setup Guide

This guide will help you set up the Shopify workshop sync feature for the workshop-admin app.

## Overview

The sync feature imports workshop products from your Shopify store (collection ID: 503854825767) into the Supabase workshops table. It uses a Supabase Edge Function to securely handle the Shopify API credentials.

## Prerequisites

- Supabase project set up
- Shopify Admin API access token
- Supabase CLI installed (for deploying Edge Functions)

## Step 1: Run Database Migration

Run the migration to add the `shopify_product_id` column to your workshops table:

### Option A: Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/20250101000000_add_shopify_product_id.sql`
4. Click **Run**

### Option B: Via Supabase CLI

```bash
supabase db push
```

### Migration Contents

The migration adds:
- `shopify_product_id` column (BIGINT, nullable)
- Index on `shopify_product_id` for faster lookups
- Unique constraint to prevent duplicate Shopify products
- Column comment for documentation

## Step 2: Install Supabase CLI

If you haven't already, install the Supabase CLI:

```bash
npm install -g supabase
```

Then initialize your project (if not done):

```bash
cd /path/to/workshop-admin
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

To find your project ref:
1. Go to Supabase Dashboard
2. Settings → General → Reference ID

## Step 3: Set Up Environment Variables

You need to add the Shopify Admin API token as a secret in Supabase Edge Functions.

### Get Your Shopify Admin API Token

1. Go to your Shopify admin: `https://mainfabric.myshopify.com/admin`
2. Navigate to **Settings → Apps and sales channels**
3. Click **Develop apps** (or create a new app)
4. Create a new app or select existing
5. Configure **Admin API scopes**: `read_products`, `read_collections`
6. Install the app and copy the **Admin API access token**

### Add Secret to Supabase

```bash
supabase secrets set SHOPIFY_ADMIN_API_TOKEN=your_token_here
```

Alternatively, in the Supabase Dashboard:
1. Go to **Edge Functions** → **Manage secrets**
2. Add a new secret:
   - Key: `SHOPIFY_ADMIN_API_TOKEN`
   - Value: Your Shopify Admin API token

## Step 4: Deploy the Edge Function

Deploy the sync-shopify-workshops Edge Function to Supabase:

```bash
supabase functions deploy sync-shopify-workshops
```

This will:
- Upload the function code from `supabase/functions/sync-shopify-workshops/`
- Make it available at: `https://YOUR_PROJECT.supabase.co/functions/v1/sync-shopify-workshops`

### Verify Deployment

Check that the function was deployed successfully:

```bash
supabase functions list
```

You should see `sync-shopify-workshops` in the list.

## Step 5: Test the Sync

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/workshops`

3. Click the **"Sync from Shopify"** button

4. On the sync page, click **"Sync Now"**

5. Wait for the sync to complete (should take 5-15 seconds)

6. You should see results showing:
   - Number of workshops created
   - Number of workshops updated
   - Any errors that occurred

7. Go back to the workshops list to see the imported workshops

## Step 6: Verify Results

After syncing, check:

1. **Workshops table in Supabase**:
   - Go to Database → Tables → workshops
   - Verify rows have `shopify_product_id` populated
   - Check that titles, descriptions, and images are correct

2. **Workshop list in admin**:
   - Navigate to `/workshops`
   - Verify all workshops appear
   - Check that images and details look correct

3. **Mobile app** (if deployed):
   - Open the React Native app
   - Verify workshops appear in the list
   - Test subscribing to a workshop

## Troubleshooting

### Error: "SHOPIFY_ADMIN_API_TOKEN not configured"

**Cause**: The Shopify API token wasn't set in Edge Function secrets.

**Solution**:
```bash
supabase secrets set SHOPIFY_ADMIN_API_TOKEN=your_token_here
```

Then redeploy the function:
```bash
supabase functions deploy sync-shopify-workshops
```

### Error: "Shopify API error: 401"

**Cause**: Invalid Shopify API token or insufficient permissions.

**Solution**:
- Verify the token is correct
- Check that the Shopify app has `read_products` and `read_collections` scopes
- Regenerate the token if needed

### Error: "duplicate key value violates unique constraint"

**Cause**: A workshop with that `shopify_product_id` already exists.

**Solution**: This is expected behavior - the sync will update the existing workshop instead of creating a duplicate. If you see this error, it means the update logic isn't working correctly.

### Error: "relation 'workshops' does not exist"

**Cause**: The workshops table hasn't been created.

**Solution**: Run all database migrations first.

### Edge Function not found (404)

**Cause**: The Edge Function wasn't deployed or the URL is wrong.

**Solution**:
```bash
supabase functions deploy sync-shopify-workshops
```

Verify the URL matches your Supabase project:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-shopify-workshops
```

### CORS errors in browser console

**Cause**: CORS headers not configured correctly.

**Solution**: The Edge Function already includes CORS headers. If you still see errors:
1. Check that you're using the correct authorization header
2. Verify you're logged in to the admin app
3. Clear browser cache and try again

## Field Mapping Reference

| Shopify Field    | Supabase Field      | Transformation                                    |
|------------------|---------------------|---------------------------------------------------|
| `id`             | `shopify_product_id`| Store as-is (BigInt)                              |
| `title`          | `title`             | Store as-is                                       |
| `body_html`      | `description`       | Strip HTML tags                                   |
| `images[0].src`  | `image_url`         | Use first image URL                               |
| `tags`           | `difficulty`        | Parse from tags (Advanced/Intermediate/Beginner)  |
| `title/body`     | `duration`          | Parse duration patterns or default to "TBD"       |

## Sync Behavior

- **Creates** new workshops that don't exist (based on `shopify_product_id`)
- **Updates** existing workshops with latest data from Shopify
- **Does NOT delete** workshops that no longer exist in Shopify
- **Preserves** workshop resources and updates (not affected by sync)
- **Preserves** user subscriptions to workshops

## Manual Editing After Sync

After syncing, you can manually edit any workshop fields:
- Go to `/workshops`
- Click on a workshop to edit
- Update difficulty, duration, or any other field
- The next sync will **overwrite** your manual changes with Shopify data

To prevent overwrites, you'd need to modify the Edge Function to skip certain fields.

## Automating the Sync

### Option 1: Shopify Webhooks (Recommended)

Set up a Shopify webhook to trigger the sync when products are updated:

1. In Shopify Admin: Settings → Notifications → Webhooks
2. Create webhook for "Product update" event
3. Point to: `https://YOUR_PROJECT.supabase.co/functions/v1/sync-shopify-workshops`
4. Add your Supabase anon key as a header for authentication

### Option 2: Cron Job

Use Supabase cron jobs (requires Pro plan) or external cron service:

```sql
-- Example: Sync daily at midnight
SELECT cron.schedule(
  'sync-shopify-workshops-daily',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/sync-shopify-workshops',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY')
  );
  $$
);
```

## Production Deployment

When deploying to production (Vercel):

1. **Deploy Edge Function to production Supabase project**:
   ```bash
   supabase link --project-ref PROD_PROJECT_REF
   supabase functions deploy sync-shopify-workshops
   supabase secrets set SHOPIFY_ADMIN_API_TOKEN=your_token
   ```

2. **Deploy Next.js app to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Test the sync** in production to verify everything works

## Support

If you encounter issues:
1. Check the Edge Function logs in Supabase Dashboard (Functions → Logs)
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Check Shopify API status: https://www.shopifystatus.com

## Next Steps

After successful sync:
1. Review imported workshops and edit as needed
2. Add resources to workshops (videos, images, instructions)
3. Test the mobile app to ensure workshops appear correctly
4. Set up automated syncing via webhooks or cron
