import { validateResume, type Resume, type Experience, type Bullet, ValidationError } from './schema';

// Import YAML parser
import YAML from 'yaml';

/**
 * Load and validate resume data from YAML
 */
export async function loadResumeData(): Promise<Resume> {
  try {
    // Dynamic imports for Node.js modules (build-time only)
    // @ts-ignore - node modules not available in browser context
    const { readFileSync } = await import('fs');
    // @ts-ignore - node modules not available in browser context
    const { join } = await import('path');
    // @ts-ignore - node modules not available in browser context
    const { cwd } = await import('process');

    // Use project root (cwd during build)
    const projectRoot = cwd();
    const yamlPath = join(projectRoot, 'src', 'data', 'resume.yaml');
    
    const yamlContent = readFileSync(yamlPath, 'utf-8');
    const resumeData = YAML.parse(yamlContent);
    return validateResume(resumeData);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(`Failed to load resume data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Filter a bullet based on profile rules
 */
function tagPass(bullet: Bullet, includeTag: string[] | null | undefined, excludeTags: string[] | null | undefined): boolean {
  const bulletTags = new Set(bullet.tags || []);

  // If include_tags is specified, bullet must have at least one of them
  if (includeTag && includeTag.length > 0) {
    const includeSet = new Set(includeTag);
    if (![...bulletTags].some(tag => includeSet.has(tag))) {
      return false;
    }
  }

  // If exclude_tags is specified, bullet must not have any of them
  if (excludeTags && excludeTags.length > 0) {
    const excludeSet = new Set(excludeTags);
    if ([...bulletTags].some(tag => excludeSet.has(tag))) {
      return false;
    }
  }

  return true;
}

/**
 * Apply a profile to filter and transform resume data
 * Filters experiences and bullets based on profile configuration
 */
export function applyProfile(resume: Resume, profileName: string): Resume {
  const profiles = resume.profiles;

  if (!profiles || !(profileName in profiles)) {
    throw new ValidationError(`Missing profile: ${profileName}`);
  }

  const profile = profiles[profileName];
  const minImportance = profile.min_importance || 1;
  const maxBullets = profile.max_bullets_per_experience || 5;
  const includeTags = profile.include_tags;
  const excludeTags = profile.exclude_tags;

  // Filter and sort bullets within each experience
  const filteredExperiences = resume.experiences.map((exp): Experience => {
    // Filter bullets by importance and tags
    let filtered = exp.bullets.filter(
      bullet =>
        (bullet.importance || 1) >= minImportance &&
        tagPass(bullet, includeTags, excludeTags)
    );

    // Sort by importance descending, stable sort (preserve order for same importance)
    filtered = filtered.sort((a, b) => {
      const impA = a.importance || 1;
      const impB = b.importance || 1;
      return impB - impA;
    });

    // Truncate to max bullets
    filtered = filtered.slice(0, maxBullets);

    return {
      ...exp,
      bullets: filtered,
    };
  });

  return {
    ...resume,
    experiences: filteredExperiences,
  };
}

/**
 * Get available profile names from resume data
 */
export async function getAvailableProfiles(): Promise<string[]> {
  const resume = await loadResumeData();
  return Object.keys(resume.profiles || {});
}
