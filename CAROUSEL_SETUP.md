# Background Carousel Setup

This document explains how to set up and use the background carousel for your website.

## What's New

- **Carousel Background**: The entire webpage background now cycles through images every 10 seconds
- **Git LFS Folder**: `static/images/` is configured for Git LFS to efficiently store large image files

## Adding Carousel Images

1. Place your background images in the `static/images/` folder
2. Name them sequentially: `carousel-1.jpg`, `carousel-2.jpg`, `carousel-3.jpg`, etc.
3. Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.mp4`, `.webm`

### Image Recommendations

- **Dimensions**: 1920x1080 or higher for best quality
- **File Format**: Use `.webp` for smaller file sizes, or `.jpg` for compatibility
- **Size**: Keep images under 5MB each to minimize page load time

## How It Works

1. **HTML**: `templates/index.html.j2` includes `js/carousel.js`
2. **JavaScript**: `static/js/carousel.js` automatically:
   - Searches for images in `static/images/`
   - Cycles through them every 10 seconds
   - Applies a smooth fade transition
3. **CSS**: `static/css/style.css` updated to use the carousel background

## Setting Up Git LFS

If you haven't already set up Git LFS:

```bash
# Install git-lfs (if not already installed)
brew install git-lfs

# Initialize git-lfs in your repository
git lfs install

# The .gitattributes file is already configured for image files
```

Then add your images normally:

```bash
cd static/images
# Add your image files here
git add carousel-*.jpg
git commit -m "Add carousel background images"
git push
```

## Customizing the Interval

To change the carousel interval from 10 seconds, edit `static/js/carousel.js`:

```javascript
const carousel = new BackgroundCarousel('images', 10000); // Change 10000 to milliseconds
```

For example:
- `5000` = 5 seconds
- `15000` = 15 seconds
- `30000` = 30 seconds

## Manifest File (Optional)

For better control, you can create a `static/images/manifest.json` file:

```json
{
  "images": [
    "carousel-1.jpg",
    "carousel-2.jpg",
    "carousel-3.jpg"
  ]
}
```

This lets you:
- Control the order of images
- Include non-sequential filenames
- Exclude certain images

## Fallback Behavior

If no images are found in `static/images/`, the website will use the default purple gradient background.

## Troubleshooting

- **Images not showing**: Check browser console for errors (F12 → Console tab)
- **Images too large**: The script automatically handles large files, but Git LFS helps reduce repo size
- **Transition too fast/slow**: Adjust the interval in `carousel.js`
