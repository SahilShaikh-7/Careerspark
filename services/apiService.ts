// FIX: Cast import.meta to any to bypass TypeScript errors with vite/client types.
import { GoogleGenAI, Type } from '@google/genai';
import { Job } from '../types';
import { blobToBase64 } from '../utils/helpers';

// Per Vite's security model, client-side env vars MUST be prefixed with VITE_
// and accessed via import.meta.env.
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("Google GenAI API key is missing. Please set the VITE_GEMINI_API_KEY environment variable.");
}
const ai = new GoogleGenAI({ apiKey: apiKey });

const resumeAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
      score: {
        type: Type.NUMBER,
        description: 'An overall score for the resume from 0-100 based on clarity, skills, and experience.',
      },
      feedback: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of 3-5 actionable suggestions to improve the resume.',
      },
      skills: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['technical', 'soft', 'domain'] },
            confidence: { type: Type.NUMBER, description: 'Confidence score from 0.0 to 1.0 on whether the candidate possesses this skill.' },
          },
          required: ['name', 'category', 'confidence'],
        },
        description: 'A list of skills extracted from the resume.',
      },
      experience_level: {
        type: Type.STRING,
        enum: ['entry-level', 'junior', 'mid-level', 'senior'],
        description: 'The estimated experience level of the candidate.',
      },
      total_experience: {
        type: Type.NUMBER,
        description: 'Total years of professional experience.',
      },
      job_titles: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A list of 3-5 suitable job titles for the candidate based on the resume.'
      }
    },
    required: ['score', 'feedback', 'skills', 'experience_level', 'total_experience', 'job_titles'],
};

export const analyzeResume = async (file: File): Promise<{ data: any | null, error: string | null }> => {
    try {
        const base64Data = await blobToBase64(file);
        const filePart = {
            inlineData: {
                data: base64Data,
                mimeType: file.type,
            },
        };

        const textPart = {
            text: `Analyze this resume for a candidate seeking a job in India. Extract key information and provide feedback. Respond in JSON format according to the provided schema.`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [filePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: resumeAnalysisSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const analysisData = JSON.parse(jsonText);

        return { data: analysisData, error: null };

    } catch (error: any) {
        console.error("Error analyzing resume:", error);
        return { data: null, error: error.message || "Failed to analyze resume." };
    }
};

export const findMatchingJobs = async (jobTitles: string[]): Promise<Job[]> => {
    if (!jobTitles || jobTitles.length === 0) return [];
    try {
        const prompt = `Find 5-10 recent job openings in India for the following roles: "${jobTitles.join('", "')}". Use Google Search to find relevant results from job boards like LinkedIn, Naukri, or official company career pages. For each job, provide a detailed entry. The final output should be a plain text response containing a markdown code block with a JSON array of job objects. Each object should include: "title" (string), "company" (string), "location" (string), "match_percentage" (number, your best estimate 0-100), "apply_url" (string, a direct link), "description" (string, 1-2 sentences), "salary_range" (string), "experience_required" (string, e.g., '2+ years'), and "job_type" (string, e.g., 'Full-time'). Do not include any text outside of the JSON markdown block.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        let jsonText = response.text.trim();
        const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonText = jsonMatch[1];
        }

        try {
            const jobs = JSON.parse(jsonText);
            return (jobs || []) as Job[];
        } catch(e) {
            console.error("Failed to parse JSON from model response for jobs", e);
            const fixJsonPrompt = `The following text is supposed to be a JSON array of objects but is invalid. Please fix it and return only the valid JSON array. Do not add any commentary.\n\n${jsonText}`;
            const fixResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fixJsonPrompt,
            });
            let fixedJsonText = fixResponse.text.trim();
            const fixedJsonMatch = fixedJsonText.match(/```json\n([\s\S]*?)\n```/);
            if (fixedJsonMatch && fixedJsonMatch[1]) {
                fixedJsonText = fixedJsonMatch[1];
            }
            return JSON.parse(fixedJsonText);
        }

    } catch (error) {
        console.error("Error finding matching jobs:", error);
        return [];
    }
};