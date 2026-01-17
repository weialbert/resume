import { z } from 'zod';

// Bullet validation schema
const BulletSchema = z.object({
  id: z.string(),
  text: z.string(),
  importance: z.number().int().min(1).max(5),
  tags: z.array(z.string()).optional(),
});

export type Bullet = z.infer<typeof BulletSchema>;

// Experience validation schema
const ExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  location: z.string(),
  start: z.number(),
  end: z.union([z.number(), z.literal('present')]),
  tags: z.array(z.string()).optional(),
  bullets: z.array(BulletSchema),
  'tech-used': z.string().optional(),
});

export type Experience = z.infer<typeof ExperienceSchema>;

// Education validation schema
const DegreeSchema = z.object({
  degree: z.string(),
  start: z.number(),
  end: z.number(),
  gpa: z.string().optional(),
  details: z.array(z.string()).optional(),
});

const EducationSchema = z.object({
  institution: z.string(),
  location: z.string(),
  degrees: z.array(DegreeSchema),
  awards: z.array(z.string()).optional(),
});

export type Education = z.infer<typeof EducationSchema>;

// Project validation schema
const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  dates: z.object({
    start: z.number(),
    end: z.number(),
  }),
  'tech-used': z.string(),
  url: z.string(),
  bullets: z.array(
    z.object({
      text: z.string(),
    })
  ),
});

export type Project = z.infer<typeof ProjectSchema>;

// Publication validation schema
const PublicationSchema = z.object({
  id: z.string(),
  title: z.string(),
  journal: z.string(),
  year: z.number(),
  authors: z.array(z.string()),
});

export type Publication = z.infer<typeof PublicationSchema>;

// Leadership validation schema
const LeadershipSchema = z.object({
  id: z.string(),
  title: z.string(),
  dates: z.string(),
  bullets: z.array(z.string()),
});

export type Leadership = z.infer<typeof LeadershipSchema>;

// Skill validation schema
const SkillSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

export type Skill = z.infer<typeof SkillSchema>;

// Personal info validation schema
const PersonalInfoSchema = z.object({
  name: z.string(),
  location: z.string(),
  email: z.string(),
  phone: z.string(),
  linkedin: z.string(),
  github: z.string(),
  portfolio: z.string(),
});

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

// Profile validation schema
const ProfileSchema = z.object({
  min_importance: z.number().int().min(1).max(5),
  max_bullets_per_experience: z.number().int().positive(),
  include_tags: z.array(z.string()).nullable().optional(),
  exclude_tags: z.array(z.string()).nullable().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// Config validation schema
const ConfigSchema = z.object({
  max_bullet_length: z.number().int().positive(),
});

export type Config = z.infer<typeof ConfigSchema>;

// Full Resume validation schema
export const ResumeSchema = z.object({
  personal: PersonalInfoSchema,
  education: z.array(EducationSchema),
  experiences: z.array(ExperienceSchema),
  projects: z.array(ProjectSchema).optional(),
  publications: z.array(PublicationSchema).optional(),
  leadership: z.array(LeadershipSchema).optional(),
  skills: z.array(SkillSchema),
  profiles: z.record(z.string(), ProfileSchema),
  config: ConfigSchema,
});

export type Resume = z.infer<typeof ResumeSchema>;

// Validation error class
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate resume data against schema
 * Throws ValidationError if validation fails
 */
export function validateResume(data: unknown): Resume {
  const result = ResumeSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new ValidationError(`Resume validation failed: ${errors}`);
  }

  // Additional custom validations
  const resume = result.data;

  // Check for duplicate experience IDs
  const expIds = resume.experiences.map(e => e.id);
  const dupExpIds = expIds.filter((id, index) => expIds.indexOf(id) !== index);
  if (dupExpIds.length > 0) {
    throw new ValidationError(`Duplicate experience id(s): ${[...new Set(dupExpIds)].join(', ')}`);
  }

  // Check for duplicate bullet IDs globally
  const allBulletIds = resume.experiences.flatMap(e => e.bullets.map(b => b.id));
  const dupBulletIds = allBulletIds.filter((id, index) => allBulletIds.indexOf(id) !== index);
  if (dupBulletIds.length > 0) {
    throw new ValidationError(`Duplicate bullet id(s): ${[...new Set(dupBulletIds)].join(', ')}`);
  }

  // Check bullet length constraints
  const maxLen = resume.config.max_bullet_length;
  for (const exp of resume.experiences) {
    for (const bullet of exp.bullets) {
      if (bullet.text.length > maxLen) {
        throw new ValidationError(
          `Bullet '${bullet.id}' exceeds max length (${bullet.text.length} > ${maxLen})`
        );
      }
    }
  }

  return resume;
}

/**
 * Get list of available profile names
 */
export function getProfileNames(resume: Resume): string[] {
  return Object.keys(resume.profiles);
}
