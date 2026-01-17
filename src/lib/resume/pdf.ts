import { chromium, type Browser, type Page } from 'playwright';

export interface PDFGenerationOptions {
  format?: 'Letter' | 'A4';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  scale?: number;
}

const DEFAULT_OPTIONS: PDFGenerationOptions = {
  format: 'Letter',
  margin: {
    top: '0.5in',
    right: '0.5in',
    bottom: '0.5in',
    left: '0.5in',
  },
  printBackground: true,
  scale: 1.0,
};

let browserInstance: Browser | null = null;

/**
 * Get or create a shared Playwright browser instance
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      headless: true,
    });
  }
  return browserInstance;
}

/**
 * Close the shared browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Generate a PDF from HTML content
 */
export async function generatePDF(
  htmlContent: string,
  outputPath: string,
  options: PDFGenerationOptions = DEFAULT_OPTIONS
): Promise<void> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const browser = await getBrowser();

  let page: Page | null = null;
  try {
    // Dynamic imports for Node.js modules (build-time only)
    // @ts-ignore - node modules not available in browser context
    const { mkdir } = await import('fs/promises');
    // @ts-ignore - node modules not available in browser context
    const { dirname } = await import('path');

    page = await browser.newPage({
      viewport: {
        width: 850,
        height: 1100,
      },
    });

    // Set the HTML content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle',
    });

    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    await mkdir(outputDir, { recursive: true });

    // Generate PDF with specified options
    await page.pdf({
      path: outputPath,
      format: mergedOptions.format as 'Letter' | 'A4',
      margin: mergedOptions.margin,
      printBackground: mergedOptions.printBackground,
      scale: mergedOptions.scale,
    });

    console.log(`✓ Generated PDF: ${outputPath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate PDF at ${outputPath}: ${message}`);
  } finally {
    if (page) {
      await page.close();
    }
  }
}

/**
 * Generate multiple PDFs with a single browser instance
 */
export async function generateMultiplePDFs(
  pdfs: Array<{
    htmlContent: string;
    outputPath: string;
    options?: PDFGenerationOptions;
  }>
): Promise<void> {
  try {
    for (const pdf of pdfs) {
      await generatePDF(pdf.htmlContent, pdf.outputPath, pdf.options);
    }
  } finally {
    await closeBrowser();
  }
}
