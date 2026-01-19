// src/lib/resume/build.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');

interface BuildOptions {
  profile: string;
  outputDir?: string;
}

/**
 * Build resume for a specific profile using Typst CLI
 */
async function buildResume(options: BuildOptions): Promise<void> {
  const { profile, outputDir = join(projectRoot, 'public/resume') } = options;
  
  console.log(`📄 Building resume with profile: ${profile}`);
  
  // Create output directory
  const profileDir = join(outputDir, profile);
  await fs.mkdir(profileDir, { recursive: true });
  
  const templatePath = 'src/lib/resume/resume.typ'; // Relative to project root
  const pdfPath = join(profileDir, 'resume.pdf');
  const typPath = join(profileDir, 'resume.typ');
  
  try {
    // Compile Typst to PDF with profile input
    // Use --root to allow accessing files in src/data/
    await execAsync(
      `typst compile --root . "${templatePath}" "${pdfPath}" --input profile=${profile}`,
      { cwd: projectRoot }
    );
    console.log(`✓ Compiled ${pdfPath}`);
    
    // Copy the source .typ file for download
    await fs.copyFile(join(projectRoot, templatePath), typPath);
    console.log(`✓ Copied ${typPath}`);
    
  } catch (error) {
    console.error(`❌ Failed to build ${profile}:`, error);
    throw error;
  }
}

/**
 * Build all profiles
 */
async function buildAllProfiles(): Promise<void> {
  const profiles = ['default', 'onepage'];
  
  console.log(`\n🔨 Building ${profiles.length} resume profiles...\n`);
  
  for (const profile of profiles) {
    await buildResume({ profile });
  }
  
  console.log('\n✅ All resumes built successfully!\n');
}

// CLI entry point
const args = process.argv.slice(2);
const profileArg = args.find(arg => arg.startsWith('--profile='));
const buildAll = args.includes('--all');

(async () => {
  try {
    if (buildAll || !profileArg) {
      await buildAllProfiles();
    } else {
      const profile = profileArg.split('=')[1];
      await buildResume({ profile });
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
})();