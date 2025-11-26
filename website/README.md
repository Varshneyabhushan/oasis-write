# Oasis Write Website

This directory contains the landing page for Oasis Write.

## Features

- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **Auto-Updating**: Fetches latest release info from GitHub API
- **Platform Detection**: Highlights the user's platform automatically
- **Smooth Animations**: Polished interactions and transitions
- **SEO Optimized**: Proper meta tags and semantic HTML

## Setup

### 1. Update Configuration

Edit `script.js` and change the repository:

```javascript
const GITHUB_REPO = 'Varshneyabhushan/oasis-write'; // Change this!
```

### 2. Customize Content

Edit `index.html`:
- Replace all GitHub links with your repository URL
- Update social media links in footer
- Customize features and descriptions as needed
- Add your own branding

### 3. Deploy to GitHub Pages

**Option A: Automatic (Recommended)**
1. Push changes to the `master` branch
2. GitHub Actions will automatically deploy (see `.github/workflows/deploy-website.yml`)
3. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Source: "GitHub Actions"
   - Your site will be at `https://Varshneyabhushan.github.io/oasis-write/`

**Option B: Manual**
1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `master`, Folder: `/website`
4. Save and wait for deployment

### 4. Custom Domain (Optional)

To use a custom domain like `oasis-write.com`:

1. Create a `CNAME` file in this directory:
   ```
   oasis-write.com
   ```
2. Configure DNS with your registrar:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: Varshneyabhushan.github.io
   ```
3. Enable HTTPS in GitHub Pages settings
4. Update links in `index.html`

## Local Development

Simply open `index.html` in a browser, or use a local server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## File Structure

```
website/
├── index.html      # Main HTML structure
├── style.css       # All styling
├── script.js       # Dynamic functionality
└── README.md       # This file
```

## Customization

### Colors

Edit CSS variables in `style.css`:

```css
:root {
    --primary: #3b82f6;        /* Primary brand color */
    --primary-dark: #2563eb;   /* Darker shade */
    --text: #1e293b;           /* Text color */
    --bg: #ffffff;             /* Background */
}
```

### Features

Add/remove feature cards in `index.html`:

```html
<div class="feature-card">
    <div class="feature-icon">🎨</div>
    <h3>Your Feature</h3>
    <p>Description here</p>
</div>
```

### Platform Downloads

The script automatically finds download links based on file patterns:
- macOS: `.dmg` files
- Windows: `.msi` or `.exe` files
- Linux: `.AppImage`, `.deb`, `.rpm` files

These are automatically extracted from your GitHub Releases.

## Analytics (Optional)

To add privacy-respecting analytics:

1. **Plausible** (recommended):
   ```html
   <script defer data-domain="yourdomain.com"
           src="https://plausible.io/js/script.js"></script>
   ```

2. **Google Analytics** (if you must):
   ```html
   <!-- Add GA tag to <head> -->
   ```

Always inform users about analytics in a privacy policy!

## SEO Optimization

The site includes:
- ✅ Semantic HTML
- ✅ Meta descriptions
- ✅ Open Graph tags (add these for social sharing)
- ✅ Mobile-friendly design
- ✅ Fast loading times

To improve further, add Open Graph tags in `<head>`:

```html
<meta property="og:title" content="Oasis Write - Serene Markdown Editor">
<meta property="og:description" content="Lightweight, beautiful markdown editor for macOS, Windows, and Linux">
<meta property="og:image" content="https://yourdomain.com/preview.png">
<meta property="og:url" content="https://yourdomain.com">
<meta name="twitter:card" content="summary_large_image">
```

## Screenshots

For best results, add screenshots:
1. Create a `screenshots/` directory
2. Add high-quality PNG images
3. Insert in HTML:
   ```html
   <img src="screenshots/editor.png" alt="Oasis Write Editor">
   ```

## Performance

Current performance:
- 📦 Small bundle size (~20KB total)
- ⚡ No build step required
- 🚀 Fast First Contentful Paint
- ✅ No external dependencies

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Troubleshooting

**Issue**: Download links show "#"
- **Solution**: Make sure you've created a GitHub Release with proper asset names

**Issue**: Version shows "0.1.0" instead of latest
- **Solution**: Check GITHUB_REPO in `script.js` matches your repository

**Issue**: Website not updating
- **Solution**: Clear browser cache or check GitHub Actions workflow status

## License

Same as the main project (add your license here).
