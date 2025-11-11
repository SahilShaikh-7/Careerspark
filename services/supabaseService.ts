
import { supabase } from '../lib/supabase';
import { Profile, Resume } from '../types';

/**
 * Fetches the public profile for a given user.
 * @param userId The ID of the user.
 * @returns The user's profile or null if not found or on error.
 */
export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, updated_at')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

/**
 * Updates a user's profile.
 * @param userId The ID of the user whose profile to update.
 * @param updates The profile fields to update.
 */
export const updateProfile = async (userId: string, updates: { full_name: string }): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Uploads a resume file to Supabase Storage.
 * @param file The resume file to upload.
 * @param userId The ID of the user uploading the file.
 * @returns The public URL of the uploaded file or null on error.
 */
export const uploadResumeFile = async (file: File, userId:string): Promise<string | null> => {
    const filePath = `${userId}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    try {
        const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading resume file:', error);
        return null;
    }
};

/**
 * Saves the analyzed resume data and its relations to the database.
 * @param payload The complete data payload for the resume.
 * @returns An object with the saved resume data or an error.
 */
export const saveResumeData = async (payload: Omit<Resume, 'id' | 'created_at'>): Promise<{ data: Resume | null, error: any }> => {
    const { skills, feedback, matched_jobs, ...resumeInfo } = payload;

    try {
        const { data: newResume, error: resumeError } = await supabase
            .from('resumes')
            .insert([resumeInfo])
            .select()
            .single();

        if (resumeError) throw resumeError;

        const resumeId = newResume.id;

        if (skills && skills.length > 0) {
            const skillsToInsert = skills.map(skill => ({ ...skill, resume_id: resumeId }));
            const { error: skillsError } = await supabase.from('skills').insert(skillsToInsert);
            if (skillsError) console.error('Error saving skills:', skillsError);
        }

        if (feedback && feedback.length > 0) {
            const feedbackToInsert = feedback.map(fb => ({ ...fb, resume_id: resumeId }));
            const { error: feedbackError } = await supabase.from('feedback').insert(feedbackToInsert);
            if (feedbackError) console.error('Error saving feedback:', feedbackError);
        }

        if (matched_jobs && matched_jobs.length > 0) {
            const jobsToInsert = matched_jobs.map(job => ({ ...job, resume_id: resumeId }));
            const { error: jobsError } = await supabase.from('matched_jobs').insert(jobsToInsert);
            if (jobsError) console.error('Error saving matched jobs:', jobsError);
        }
        
        const finalResume = await getResumeData(resumeId);
        return { data: finalResume, error: null };

    } catch (error) {
        console.error('Error saving complete resume data:', error);
        return { data: null, error };
    }
};


/**
 * Fetches all resume analyses for a specific user.
 * @param userId The ID of the user.
 * @returns An array of resumes.
 */
export const getResumesForUser = async (userId: string): Promise<Resume[]> => {
    try {
        // This query is optimized for the dashboard list view.
        const { data, error } = await supabase
            .from('resumes')
            .select('id, filename, score, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        // The type assertion is safe here as we are only using a subset of Resume fields.
        return (data || []) as Resume[];
    } catch(error) {
        console.error('Error fetching resumes for user:', error);
        return [];
    }
};

/**
 * Fetches a single resume analysis and all its related data by ID.
 * @param resumeId The ID of the resume.
 * @returns The complete resume data or null if not found or on error.
 */
export const getResumeData = async (resumeId: string): Promise<Resume | null> => {
    try {
        const { data, error } = await supabase
            .from('resumes')
            .select(`
                *,
                skills(*),
                feedback(*),
                matched_jobs(*)
            `)
            .eq('id', resumeId)
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error fetching resume data with relations:', error);
        return null;
    }
};
