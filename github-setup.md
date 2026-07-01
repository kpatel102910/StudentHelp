# GitHub Setup Guide

## 🚀 Step 1: Install Git

### Option A: Install via Git for Windows
1. Download from: https://git-scm.com/download/win
2. Run the installer with default settings
3. Restart your terminal/command prompt

### Option B: Install via GitHub Desktop (Easier)
1. Download from: https://desktop.github.com/
2. Install GitHub Desktop
3. It includes Git automatically

## 🎯 Step 2: Create GitHub Repository

1. Go to https://github.com
2. Click "+" → "New repository"
3. Repository name: `student-academic-help` (or your preferred name)
4. Description: "Student Academic Help website with database"
5. Make it **Public** or **Private** (your choice)
6. **Don't** initialize with README (we'll push existing code)
7. Click "Create repository"

## 📋 Step 3: Connect Local Project to GitHub

After installing Git, open your terminal/command prompt in the project folder:

```bash
cd c:/Users/kpate/CascadeProjects/windsurf-project
```

Then run these commands:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Student Academic Help website"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/student-academic-help.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔑 Step 4: Authenticate with GitHub

When you push, GitHub will ask you to authenticate:

### Option A: Personal Access Token (Recommended)
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` permissions
3. Use token as password when prompted

### Option B: GitHub CLI
```bash
gh auth login
```

## ✅ Alternative: Manual Upload

If Git installation is difficult, you can:

1. **Create GitHub repository** (empty)
2. **Upload files manually:**
   - Click "uploading an existing file"
   - Drag and drop all your project files
   - Commit changes directly in GitHub

## 📁 Files to Include

Your project includes:
- HTML files (index.html, videos.html, etc.)
- CSS file (styles.css)
- JavaScript files (script.js, supabase-db.js, etc.)
- Database setup files (supabase-setup.md)
- Configuration files (.gitignore, package.json)

## 🎯 After Setup

Once on GitHub, you can:
- Share your project with others
- Collaborate with team members
- Deploy to GitHub Pages for free hosting
- Track changes and history

## 🚀 GitHub Pages Deployment (Optional)

After pushing to GitHub:
1. Go to repository Settings → Pages
2. Select "main" branch as source
3. Your site will be live at: `https://YOUR_USERNAME.github.io/student-academic-help/`
