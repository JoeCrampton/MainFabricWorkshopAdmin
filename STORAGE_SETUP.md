# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage buckets for the workshop admin panel.

## Overview

The application now uses Supabase Storage for image uploads instead of manual URL entry. Three storage buckets are required:

1. `workshop-images` - For workshop cover images
2. `workshop-resources` - For resource images and thumbnails
3. `workshop-updates` - For update images

## Setup Instructions

### 1. Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar

### 2. Create Storage Buckets

Create three public buckets with the following configurations:

#### Bucket 1: workshop-images

```
Name: workshop-images
Public: Yes (Enable public access)
File size limit: 5MB
Allowed MIME types: image/*
```

#### Bucket 2: workshop-resources

```
Name: workshop-resources
Public: Yes (Enable public access)
File size limit: 5MB
Allowed MIME types: image/*
```

#### Bucket 3: workshop-updates

```
Name: workshop-updates
Public: Yes (Enable public access)
File size limit: 5MB
Allowed MIME types: image/*
```

### 3. Set Bucket Policies

For each bucket, you need to set up RLS (Row Level Security) policies to allow authenticated users to upload and manage images.

#### Navigate to Policies

1. Click on the bucket name
2. Go to **Policies** tab
3. Click **New Policy**

#### Policy 1: Allow authenticated uploads

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'workshop-images');
```

**Repeat for other buckets:**
- Replace `'workshop-images'` with `'workshop-resources'`
- Replace `'workshop-images'` with `'workshop-updates'`

#### Policy 2: Allow public read access

```sql
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'workshop-images');
```

**Repeat for other buckets.**

#### Policy 3: Allow authenticated users to delete their uploads

```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'workshop-images');
```

**Repeat for other buckets.**

### 4. Verify Setup

To verify the setup is working:

1. Start your development server: `npm run dev`
2. Navigate to a workshop form
3. Try uploading an image
4. You should see:
   - File upload button
   - Upload progress indicator
   - Image preview after successful upload
   - Remove button to delete the image

## Image Upload Features

### User Experience

- **File picker** with drag-and-drop support
- **Image preview** after upload
- **Remove button** to clear uploaded images
- **Fallback URL input** for direct URL entry (when no image uploaded)
- **Upload progress** indicator
- **Error handling** with user-friendly messages

### Technical Details

- Maximum file size: 5MB (configurable)
- Accepted formats: JPG, PNG, GIF, WebP
- Auto-generated unique filenames to prevent conflicts
- Files stored in appropriate buckets based on context
- Public URLs generated automatically

### Component Usage

The `ImageUpload` component is used in three forms:

1. **WorkshopForm** - Workshop cover images
   ```tsx
   <ImageUpload
     value={imageUrl}
     onChange={setImageUrl}
     label="Workshop Image (optional)"
     bucket="workshop-images"
   />
   ```

2. **ResourceForm** - Resource images and thumbnails
   ```tsx
   <ImageUpload
     value={url}
     onChange={setUrl}
     label="Resource Image"
     bucket="workshop-resources"
   />
   ```

3. **UpdateForm** - Update images
   ```tsx
   <ImageUpload
     value={imageUrl}
     onChange={setImageUrl}
     label="Update Image (optional)"
     bucket="workshop-updates"
   />
   ```

## Troubleshooting

### Error: "Failed to upload image"

**Possible causes:**
1. Storage buckets not created
2. RLS policies not configured
3. Bucket names don't match (case-sensitive)
4. User not authenticated

**Solution:**
- Verify all three buckets exist
- Check policy configuration
- Ensure user is logged in
- Check browser console for detailed error messages

### Error: "Bucket not found"

**Cause:** The bucket name in the code doesn't match the actual bucket name in Supabase.

**Solution:**
- Verify bucket names in Supabase dashboard
- Check bucket names in code match exactly (case-sensitive)

### Images upload but don't display

**Cause:** Buckets are not set to public.

**Solution:**
- Go to Storage > Bucket Settings
- Enable "Public bucket" option
- Verify public read policy exists

### File size errors

**Cause:** File exceeds 5MB limit.

**Solution:**
- Compress images before upload
- Adjust `maxSizeMB` prop in ImageUpload component if needed

## Optional Enhancements

### 1. Add file compression

Install sharp or browser-image-compression:
```bash
npm install browser-image-compression
```

### 2. Add image cropping

Install react-image-crop:
```bash
npm install react-image-crop
```

### 3. Support more file types

Modify the `accept` prop:
```tsx
<ImageUpload
  accept="image/*,application/pdf"
  ...
/>
```

### 4. Increase file size limit

Modify the `maxSizeMB` prop:
```tsx
<ImageUpload
  maxSizeMB={10}
  ...
/>
```

## Environment Variables

No additional environment variables are needed. The component uses the existing Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Security Considerations

- Images are uploaded using the anon key (client-side)
- RLS policies protect against unauthorized access
- File size limits prevent abuse
- File type validation prevents malicious uploads
- Public buckets only allow read access to everyone
- Only authenticated users can upload/delete

## Migration from URL Input

The old URL input fields have been replaced with the ImageUpload component, but:

- Existing URLs in the database continue to work
- Users can still manually enter URLs using the fallback input
- No database migration needed
- Fully backward compatible
