/**
 * Background Carousel
 * Changes the background image every 10 seconds
 */

class BackgroundCarousel {
  constructor(imageDirectory = 'images', interval = 10000) {
    this.imageDirectory = imageDirectory;
    this.interval = interval;
    this.currentIndex = 0;
    this.images = [];
    this.isRunning = false;
  }

  /**
   * Load images from the specified directory
   * Expects image files to be named: carousel-1.jpg, carousel-2.jpg, etc.
   */
  async loadImages() {
    try {
      // Try to fetch the manifest of images
      const response = await fetch(`${this.imageDirectory}/manifest.json`);
      if (response.ok) {
        const data = await response.json();
        this.images = data.images.map(img => `${this.imageDirectory}/${img}`);
      }
    } catch (error) {
      // Fallback: try common image names
      const commonImages = [];
      for (let i = 1; i <= 5; i++) {
        const extensions = ['jpg', 'jpeg', 'png', 'webp'];
        for (const ext of extensions) {
          commonImages.push(`${this.imageDirectory}/carousel-${i}.${ext}`);
        }
      }
      
      // Check which images exist
      for (const img of commonImages) {
        try {
          const response = await fetch(img, { method: 'HEAD' });
          if (response.ok) {
            // Remove duplicates
            if (!this.images.includes(img)) {
              this.images.push(img);
            }
          }
        } catch {
          // Image doesn't exist, skip
        }
      }
    }

    // If no images found, use default gradient
    if (this.images.length === 0) {
      console.warn('No carousel images found. Using default gradient.');
      return false;
    }

    return true;
  }

  /**
   * Set the background image with slide animation
   */
  setBackground(imagePath) {
    const escapedPath = imagePath.replace(/'/g, "\\'");
    // Set the next image
    document.body.style.setProperty('--carousel-next', `url('${escapedPath}')`);
    
    // Trigger slide animation
    document.body.classList.add('carousel-slide');
    
    // After animation, update main background and reset
    setTimeout(() => {
      document.body.style.setProperty('--carousel-bg', `url('${escapedPath}')`);
      document.body.classList.remove('carousel-slide');
    }, 800);
  }

  /**
   * Cycle to the next image
   */
  nextImage() {
    if (this.images.length === 0) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.setBackground(this.images[this.currentIndex]);
  }

  /**
   * Start the carousel
   */
  start() {
    if (this.isRunning) return;
    
    if (this.images.length > 0) {
      this.isRunning = true;
      document.body.classList.add('carousel-ready');
      
      // Set initial image
      this.setBackground(this.images[0]);
      
      // Cycle every interval
      setInterval(() => this.nextImage(), this.interval);
      
      console.log(`Carousel started with ${this.images.length} images (${this.interval / 1000}s interval)`);
    }
  }

  /**
   * Stop the carousel
   */
  stop() {
    this.isRunning = false;
    document.body.classList.remove('carousel-ready');
  }
}

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const carousel = new BackgroundCarousel('images', 10000); // 10 seconds
  const imagesLoaded = await carousel.loadImages();
  
  if (imagesLoaded) {
    carousel.start();
  }
});
