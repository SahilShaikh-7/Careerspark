export interface Skill {
  id?: string;
  resume_id?: string;
  name: string;
  category: 'technical' | 'soft' | 'domain';
  confidence: number;
  experience_years?: number;
}

export interface Job {
  id?: string;
  resume_id?: string;
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

export interface Feedback {
    id?: string;
    resume_id?: string;
    suggestion: string;
}

export type AnalysisStatus = 'processing' | 'completed' | 'failed';

export interface Resume {
  id: string;
  user_id: string; // Made required again
  filename: string;
  file_url: string;
  extracted_text: string | null;
  skills: Skill[];
  score: number;
  feedback: Feedback[];
  matched_jobs: Job[];
  experience_level: 'entry-level' | 'junior' | 'mid-level' | 'senior';
  total_experience: number;
  status: AnalysisStatus;
  created_at: string;
}

export interface Profile {
  id?: string;
  full_name: string;
  email: string;
}