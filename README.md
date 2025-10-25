# Main Fabric Workshop Admin Panel

A web-based admin panel for managing workshops and resources for the Main Fabric Workshop mobile app.

## Features

- **Workshop Management**: Create, edit, and view workshops
- **Markdown Support**: Full markdown editing with live preview for descriptions
- **Resource Management**: Add videos, images, instructions, and PDFs to workshops
- **User-Friendly Interface**: Clean, intuitive UI built with Tailwind CSS
- **Real-time Sync**: All changes sync directly to Supabase

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Access to the Supabase project

### Installation

1. Navigate to the admin panel directory:
   ```bash
   cd workshop-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment variables are already configured in `.env.local`

### Running the Admin Panel

Start the development server:
```bash
npm run dev
```

The admin panel will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Managing Workshops

1. **View Workshops**: Navigate to the home page to see all workshops
2. **Create Workshop**: Click "Add workshop" button
   - Enter title, difficulty level, duration
   - Add description with markdown formatting (bold, italic, lists, code, etc.)
   - Optionally add an image URL
   - Use the preview toggle to see how it will look
3. **Edit Workshop**: Click "Edit" on any workshop in the list
4. **Manage Resources**: Click "Resources" to add/edit workshop resources

### Managing Resources

1. Navigate to a workshop's resources page
2. Click "Add Resource" to create a new resource
3. Fill in the form:
   - **Title**: Name of the resource
   - **Type**: Video, Image, Instruction, or PDF
   - **Display Order**: Number to control ordering (lower numbers appear first)
   - **URLs**: Add resource URL, video URL (for videos), thumbnail URL
   - **Description**: Markdown-formatted description
4. Resources appear in the mobile app based on display order

### Markdown Formatting Guide

You can use standard markdown in descriptions:

- **Bold**: `**bold text**`
- **Italic**: `*italic text*`
- **Headings**: `# H1`, `## H2`, `### H3`
- **Lists**: Use `-` or `*` for bullets, `1.` for numbered
- **Links**: `[link text](url)`
- **Code**: `\`inline code\`` or `\`\`\`code blocks\`\`\``
- **Quotes**: `> quote text`

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Markdown Editor**: SimpleMDE
- **Language**: TypeScript

## Database Schema

### workshops table
- `id`: UUID (primary key)
- `title`: Text
- `description`: Text (markdown)
- `image_url`: Text (nullable)
- `difficulty`: Enum ('Beginner', 'Intermediate', 'Advanced')
- `duration`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### workshop_resources table
- `id`: UUID (primary key)
- `workshop_id`: UUID (foreign key to workshops)
- `title`: Text
- `type`: Enum ('video', 'image', 'instruction', 'pdf')
- `url`: Text (nullable)
- `video_url`: Text (nullable)
- `description`: Text (nullable, markdown)
- `thumbnail_url`: Text (nullable)
- `display_order`: Integer
- `created_at`: Timestamp

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

The admin panel will automatically deploy on every push to main.

## Support

For issues or questions, please contact the development team.
