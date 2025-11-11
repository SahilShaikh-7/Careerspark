import { User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser;

export interface Profile {
  id: string;
  full_name: string;
  updated_at?: string;
}

export interface Skill {
  id?: string;
  name: string;
  category: 'technical' | 'soft' | 'domain';
  confidence: number;
}

export interface Feedback {
  id?: string;
  suggestion: string;
}

export interface Job {
  id?: string;
  title: string;
  company: string;
  location: string;
  match_percentage: number;
  apply_url: string;
  description: string;
  salary_range: string;
  experience_required: string;
  job_type: string;
}

export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  file_url: string;
  created_at: string;
  score: number;
  experience_level: string;
  total_experience: number;
  feedback: { suggestion: string }[];
  skills: Skill[];
  matched_jobs: Job[];
}