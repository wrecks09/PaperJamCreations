# Paper Jam Creations - Deployment Guide

## Quick Start (Supabase + Vercel)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to you)
3. Wait for the database to be ready (~2 minutes)
4. Go to **Settings > API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 2. Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` and run it
3. This creates `materials` and `projects` tables with RLS policies for shared access

### 3. Configure Auth
1. In Supabase dashboard, go to **Authentication > Settings**
2. Under **Site URL**, add your Vercel URL (e.g., `https://your-app.vercel.app`)
3. Add `http://localhost:5173` for local development
4. Enable **Email** provider (default)
5. Optional: Disable "Enable email confirmations" for easier testing

### 4. Deploy to Vercel
1. Push this repo to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add Environment Variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
4. Deploy!

### 5. Create User Accounts
1. Visit your deployed URL
2. Click "Don't have an account? Sign up"
3. Create accounts for both users
4. Both users will share the same inventory and projects data

---

## Local Development

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL (from Settings > API) | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key (from Settings > API) | Yes |

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│   Supabase      │
│   (Vercel)      │     │   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘
        │                       │
        │                       ├── Auth (Email/Password)
        │                       ├── Database (Materials, Projects)
        │                       ├── Realtime (Live sync)
        │                       └── Row Level Security
        ▼
┌─────────────────┐
│   Browser       │
│   (User)        │
└─────────────────┘
```

---

## Free Tier Limits (Supabase)

| Resource | Limit |
|----------|-------|
| Database size | 500 MB |
| File storage | 50 MB |
| Monthly active users | 50,000 |
| Realtime connections | 200 |
| Edge functions | 500K invocations/mo |

More than enough for 2 users!

---

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists with correct values
- Restart dev server after changing `.env`
- In Vercel, check Environment Variables are set correctly

### "Failed to fetch materials/projects"
- Check Supabase project is active (not paused)
- Verify RLS policies allow authenticated access
- Check browser console for detailed errors

### Auth not working
- Verify Site URL in Supabase Auth settings matches your domain
- Check redirect URLs include your Vercel domain
- Clear browser cookies/storage and try again

### Realtime not syncing
- Ensure Realtime is enabled for tables in Supabase (Database > Replication)
- Check browser console for WebSocket connection errors

---

## Customization

### Change to Private Data (Per User)
To make data private per user instead of shared:
1. Add `user_id UUID REFERENCES auth.users(id)` to both tables
2. Update RLS policies to filter by `auth.uid()`
3. Modify insert operations to include `user_id: (await supabase.auth.getUser()).data.user.id`

### Add Social Login (Google, GitHub, etc.)
1. Enable providers in Supabase Auth > Settings
2. Add OAuth credentials from provider consoles
3. Update Login page to show social buttons

---

## Support

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Issues: Create a GitHub issue in this repo