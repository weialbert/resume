export const RESUME_PROFILES = ['default', 'onepage'] as const;
export const RESUME_OUTPUT_DIR = 'public/resumes';
export const RESUME_DATA_FILE = 'src/data/resume.yaml';

export const PDF_FILENAMES: Record<string, string> = {
  default: 'resume-default.pdf',
  onepage: 'resume-onepage.pdf',
} as const;

export const PDF_OPTIONS = {
  format: 'Letter' as const,
  margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
  printBackground: true,
  scale: 1.0,
} as const;
