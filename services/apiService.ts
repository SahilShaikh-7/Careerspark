import { GoogleGenAI, Type } from '@google/genai';
import { JSEARCH_API_KEY, JSEARCH_API_HOST, JSEARCH_API_URL } from '../constants';
import { Job } from '../types';
import { blobToBase64 } from '../utils/helpers';

// Fix: Initialize GoogleGenAI with API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: 'A holistic score for the resume from 0 to 100, considering skills, experience, and clarity.',
    },
    feedback: {
      type: Type.ARRAY,
      description: 'An array of 3-5 concise, actionable suggestions for improving the resume.',
      items: { type: Type.STRING },
    },
    skills: {
      type: Type.ARRAY,
      description: 'A list of skills extracted from the resume.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'The name of the skill.' },
          category: {
            type: Type.STRING,
            description: 'The category of the skill.',
            enum: ['technical', 'soft', 'domain'],
          },
          confidence: {
            type: Type.NUMBER,
            description: 'A confidence score from 0.0 to 1.0 on how well the skill is demonstrated.',
          },
          experience_years: {
            type: Type.NUMBER,
            description: 'Estimated years of experience with this skill, if mentioned.',
          },
        },
        required: ['name', 'category', 'confidence'],
      },
    },
    experience_level: {
      type: Type.STRING,
      description: 'The estimated career experience level of the candidate.',
      enum: ['entry-level', 'junior', 'mid-level', 'senior'],
    },
    total_experience: {
      type: Type.NUMBER,
      description: 'The total years of professional experience calculated from the work history.',
    },
    job_titles: {
      type: Type.ARRAY,
      description: 'A list of 3-4 relevant job titles that would be a good fit for this resume, to be used for a job search.',
      items: { type: Type.STRING },
    },
  },
  required: ['score', 'feedback', 'skills', 'experience_level', 'total_experience', 'job_titles'],
};

export const analyzeResume = async (file: File) => {
  try {
    const base64Data = await blobToBase64(file);
    const resumePart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };

    const prompt = `Analyze the provided resume document. Extract the candidate's skills, experience, and other relevant details. Provide a comprehensive analysis based on the provided JSON schema. The feedback should be constructive and specific. The score should be a realistic assessment of the resume's quality. Infer experience years for skills where possible.`;

    // Fix: Use the correct API call `ai.models.generateContent` for complex text tasks with file input.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ parts: [resumePart, { text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    // Fix: Access the response text directly to get the JSON string.
    const analysisResult = JSON.parse(response.text);
    return { data: analysisResult, error: null };
  } catch (error) {
    console.error('Error analyzing resume with Gemini API:', error);
    return { data: null, error: error as Error };
  }
};

export const findMatchingJobs = async (jobTitles: string[]): Promise<Job[]> => {
    if (!jobTitles || jobTitles.length === 0) return [];
    
    const query = jobTitles.join(' OR ');
    
    try {
        const response = await fetch(
            `${JSEARCH_API_URL}?query=${encodeURIComponent(query)}&page=1&num_pages=1&country=IN&employment_types=FULLTIME`,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': JSEARCH_API_KEY,
                    'X-RapidAPI-Host': JSEARCH_API_HOST,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`JSearch API request failed with status ${response.status}`);
        }

        const result = await response.json();
        if (!result.data) return [];

        return result.data.slice(0, 10).map((job: any): Job => ({
            title: job.job_title,
            company: job.employer_name,
            location: job.job_city ? `${job.job_city}, ${job.job_state}` : job.job_country,
            match_percentage: Math.floor(Math.random() * (95 - 75 + 1) + 75), // Placeholder match %
            apply_url: job.job_apply_link,
            description: job.job_description,
            salary_range: job.job_min_salary && job.job_max_salary
                ? `$${job.job_min_salary} - $${job.job_max_salary} ${job.job_salary_currency}`
                : 'Not specified',
            experience_required: job.job_required_experience?.required_experience_in_months
                ? `${Math.round(job.job_required_experience.required_experience_in_months / 12)} years`
                : 'Not specified',
            job_type: job.job_employment_type || 'FULLTIME',
        }));
    } catch (error) {
        console.error('Error fetching jobs from JSearch API:', error);
        return [];
    }
};
