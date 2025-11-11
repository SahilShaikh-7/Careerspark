import { supabase } from '../lib/supabase';
import { Resume, Job, Skill, Profile } from '../types';

// --- Profile Functions ---
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
    return data;
}

export const updateUserProfile = async (userId: string, profileData: Omit<Profile, 'id' | 'email'>): Promise<Profile | null> => {
    const { data, error } = await supabase.from('profiles').update({ full_name: profileData.full_name }).eq('id', userId).select().single();
     if (error) {
        console.error("Error updating profile:", error);
        return null;
    }
    return data;
}


// --- Resume Functions ---
export const fetchUserResumes = async (userId: string): Promise<Resume[]> => {
    const { data, error } = await supabase
        .from('resumes')
        .select(`*`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user resumes:', error);
        return [];
    }
    return data as Resume[];
};


export const getResumeData = async (id: string): Promise<Resume | null> => {
    // RLS ensures the user can only fetch their own resume.
    const { data, error } = await supabase
        .from('resumes')
        .select(`
            *,
            skills (*),
            feedback (*),
            matched_jobs (*)
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching resume data:', error);
        throw new Error(error.message);
    }
    return data as Resume;
};

export const createResumeRecord = async (
    resume: Partial<Pick<Resume, 'filename' | 'file_url'>>,
    userId: string
): Promise<{ data: Resume | null; error: any }> => {
    const { data, error } = await supabase
        .from('resumes')
        .insert({
            filename: resume.filename,
            file_url: resume.file_url,
            status: 'processing',
            user_id: userId,
        })
        .select()
        .single();

    return { data: data as Resume, error };
};

type AnalysisData = {
    score: number;
    feedback: string[];
    skills: Omit<Skill, 'id' | 'resume_id'>[];
    experience_level: 'entry-level' | 'junior' | 'mid-level' | 'senior';
    total_experience: number;
    matched_jobs: Omit<Job, 'id' | 'resume_id'>[];
    extracted_text: string;
};

export const updateResumeWithAnalysis = async (
    resumeId: string,
    analysis: AnalysisData
): Promise<{ data: Resume | null; error: any }> => {
    try {
        const { score, experience_level, total_experience, extracted_text, skills, feedback, matched_jobs } = analysis;

        // Sanitize and provide defaults
        const sanitizedScore = typeof score === 'number' ? score : 0;
        const sanitizedExpLevel = experience_level || 'entry-level';
        const sanitizedTotalExp = typeof total_experience === 'number' ? total_experience : 0;
        
        const { error: resumeUpdateError } = await supabase
            .from('resumes')
            .update({
                score: sanitizedScore,
                experience_level: sanitizedExpLevel,
                total_experience: sanitizedTotalExp,
                extracted_text,
                status: 'completed',
            })
            .eq('id', resumeId);

        if (resumeUpdateError) throw resumeUpdateError;

        const skillsToInsert = (skills || []).map(s => ({ ...s, resume_id: resumeId, confidence: typeof s.confidence === 'number' ? s.confidence : 0.8 }));
        const feedbackToInsert = (feedback || []).map(f => ({ suggestion: f, resume_id: resumeId }));
        const jobsToInsert = (matched_jobs || []).map(j => ({ ...j, resume_id: resumeId, match_percentage: typeof j.match_percentage === 'number' ? j.match_percentage : 0 }));

        const results = await Promise.all([
            skillsToInsert.length ? supabase.from('skills').insert(skillsToInsert) : Promise.resolve({ error: null }),
            feedbackToInsert.length ? supabase.from('feedback').insert(feedbackToInsert) : Promise.resolve({ error: null }),
            jobsToInsert.length ? supabase.from('matched_jobs').insert(jobsToInsert) : Promise.resolve({ error: null }),
        ]);
        
        for (const result of results) {
            if (result.error) throw result.error;
        }
        
        const finalData = await getResumeData(resumeId);

        return { data: finalData, error: null };

    } catch (error) {
        console.error('Error updating resume with analysis:', error);
        return { data: null, error };
    }
};

export const uploadResumeFile = async (file: File, userId: string): Promise<{ file_url: string | null; error: any }> => {
    const filePath = `${userId}/${crypto.randomUUID()}/${file.name}`;
    
    const { error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

    if (error) {
        console.error("Error uploading file to Supabase storage:", error);
        return { file_url: null, error };
    }

    const { data } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

    return { file_url: data.publicUrl, error: null };
};