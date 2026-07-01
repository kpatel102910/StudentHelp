# Supabase Setup Instructions

## 🚀 Quick Setup Guide

### 1. Get Your Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing one
3. Go to Project Settings → API
4. Copy your **Project URL** and **anon public key**

### 2. Create the Database Table
In your Supabase project, run this enhanced SQL in the SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type text NOT NULL,   -- (renamed from `type`)
  name text NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- constrain status values (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'submissions_status_check'
  ) THEN
    ALTER TABLE submissions
    ADD CONSTRAINT submissions_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- auto-update updated_at on every row update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS submissions_set_updated_at ON submissions;

CREATE TRIGGER submissions_set_updated_at
BEFORE UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- indexes (tune based on your real queries)
CREATE INDEX IF NOT EXISTS submissions_status_idx
ON submissions(status);

CREATE INDEX IF NOT EXISTS submissions_created_at_idx
ON submissions(created_at DESC);
```

### 3. Update Your Code
Edit `supabase-db.js` and replace:
- `YOUR_SUPABASE_URL` with your actual Supabase URL
- `YOUR_SUPABASE_ANON_KEY` with your actual anon key

### 4. Test the Integration
1. Open any HTML file in browser
2. Submit a test request
3. Check browser console for success messages
4. Open admin dashboard to see the submission

## 🔧 Features Enabled

✅ **Real Cloud Database** - Data persists across all devices
✅ **Automatic Sync** - No manual file updates needed
✅ **Cross-Browser** - Works on any browser/device
✅ **Real-time Updates** - Admin dashboard refreshes automatically
✅ **Fallback System** - LocalStorage backup if Supabase fails

## 📊 Benefits Over Previous Systems

**vs LocalStorage Only:**
- ✅ Cross-device access
- ✅ True persistence
- ✅ No data loss on browser clear

**vs File Downloads:**
- ✅ No manual file replacement
- ✅ Automatic cloud sync
- ✅ Multiple users can access same data

**vs Self-Hosted Server:**
- ✅ No server maintenance
- ✅ Free hosting
- ✅ Professional database backend
- ✅ Built-in security and backups

## 🎯 Next Steps

1. Complete Supabase setup
2. Update credentials in `supabase-db.js`
3. Test with a sample submission
4. Deploy to production

Your database will work seamlessly across all devices and browsers!
