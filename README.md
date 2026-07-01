# Student Academic Help Website

A modern, responsive dark-themed academic help website built with HTML, CSS, and JavaScript.

## How to View the Website

### Option 1: Direct File Access (Recommended for quick viewing)
1. Open any of the HTML files directly in your browser:
   - `index.html` - Home page
   - `videos.html` - Videos page
   - `request-help.html` - Request Help page
   - `about.html` - About page
   - `contact.html` - Contact page

Simply double-click any HTML file or right-click and "Open with" your preferred browser.

### Option 2: Local Web Server (Recommended for full functionality)
If you want to run a local web server for the best experience:

#### Using Python (if installed):
```bash
cd c:/Users/kpate/CascadeProjects/windsurf-project
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

#### Using Node.js (if installed):
```bash
cd c:/Users/kpate/CascadeProjects/windsurf-project
npx http-server -p 8000
```
Then visit `http://localhost:8000` in your browser.

#### Using VS Code Live Server:
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"

## Features

✅ **Complete Website Structure**
- 5 fully functional pages (Home, Videos, Request Help, About, Contact)
- Responsive navigation with mobile hamburger menu
- Dark/light theme toggle with smooth transitions

✅ **Modern Design**
- Dark-first theme with optional light mode
- Smooth animations and micro-interactions
- Frosted glass navigation header
- Consistent spacing and rounded corners

✅ **Interactive Elements**
- Working theme toggle (saves preference)
- Video filtering by subject
- FAQ accordion
- Form submissions with success messages
- Hover effects on all interactive elements

✅ **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface

## File Structure

```
windsurf-project/
├── index.html          # Home page
├── videos.html         # Videos page with filtering
├── request-help.html   # Request help form
├── about.html          # About page with FAQ
├── contact.html        # Contact page
├── styles.css          # Complete styling with theme system
├── script.js           # All JavaScript functionality
└── README.md           # This file
```

## Browser Compatibility

The website works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## Troubleshooting

If you see "This page isn't working" error:
1. Try opening the files directly (Option 1 above)
2. Make sure all files are in the same folder
3. Check that your browser allows local file access
4. Try a different browser if issues persist

The website is designed to work even without a web server, though some features work best with one.
