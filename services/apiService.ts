import { GoogleGenAI, Type } from '@google/genai';
import { blobToBase64 } from '../utils/helpers';
import { Job } from '../types';

// FIX: Initialize the GoogleGenAI client according to the coding guidelines.
// The API key must be provided via the `process.env.API_KEY` environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: 'Overall score for the resume out of 100.' },
    experience_level: { type: Type.STRING, description: "Candidate's experience level (e.g., 'Entry-Level', 'Mid-Level', 'Senior')." },
    total_experience: { type: Type.NUMBER, description: 'Total years of professional experience as a number.' },
    feedback: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'An array of 3-5 concise, actionable suggestions to improve the resume.'
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING, enum: ['technical', 'soft', 'domain'] },
          confidence: { type: Type.NUMBER, description: 'A number between 0 and 1 representing confidence.' }
        },
        required: ['name', 'category', 'confidence']
      }
    },
    job_titles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'An array of 3-5 suitable job titles based on the resume content.'
    }
  },
  required: ['score', 'experience_level', 'total_experience', 'feedback', 'skills', 'job_titles']
};

/**
 * Analyzes a resume file using the Gemini API.
 * @param file The resume file (PDF or DOCX).
 * @returns An object containing the analysis data or an error.
 */
export const analyzeResume = async (file: File) => {
  try {
    const base64Data = await blobToBase64(file);
    const filePart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };

    const textPart = {
      text: `Analyze the attached resume. Extract the following information in JSON format:
1. score: An overall score for the resume out of 100, based on clarity, skills, and experience.
2. experience_level: The candidate's experience level (e.g., 'Entry-Level', 'Mid-Level', 'Senior').
3. total_experience: The total years of professional experience as a number.
4. feedback: An array of 3-5 concise, actionable suggestions to improve the resume.
5. skills: An array of objects, each representing a skill. Each skill object should have 'name' (string), 'category' ('technical', 'soft', or 'domain'), and 'confidence' (a number between 0 and 1 representing your confidence in this skill being present and relevant).
6. job_titles: An array of 3-5 suitable job titles based on the resume content.`
    };
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Use a powerful model for complex analysis
      contents: { parts: [filePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    const jsonString = response.text.trim();
    const data = JSON.parse(jsonString);

    return { data, error: null };
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    return { data: null, error: error.message || 'An unknown error occurred during resume analysis.' };
  }
};

/**
 * Finds matching job listings using Google Search grounding.
 * @param jobTitles An array of job titles to search for.
 * @returns A promise that resolves to an array of Job objects.
 */
export const findMatchingJobs = async (jobTitles: string[]): Promise<Job[]> => {
    if (!jobTitles || jobTitles.length === 0) {
        return [];
    }
    try {
        const prompt = `Based on the following job titles: [${jobTitles.join(', ')}], find 5 recent, relevant job openings in India from top job portals. For each job, provide the information in a JSON array format. Each object in the array should have the following keys: "title", "company", "location", "match_percentage" (an estimated match percentage between 70-100 based on the titles), "apply_url", "description" (a brief 1-2 sentence summary), "salary_range" (e.g., "₹10-15 LPA" or "Competitive"), "experience_required" (e.g., "2-4 years"), and "job_type" (e.g., "Full-time", "Contract"). Ensure the response is only the valid JSON array and nothing else. Do not wrap it in markdown backticks.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        let jsonString = response.text.trim();
        // The model might still wrap the JSON in markdown, so we strip it.
        if (jsonString.startsWith('```json')) {
            jsonString = jsonString.substring(7, jsonString.length - 3).trim();
        } else if (jsonString.startsWith('```')) {
            jsonString = jsonString.substring(3, jsonString.length - 3).trim();
        }
        
        const matchedJobs: Job[] = JSON.parse(jsonString);
        return matchedJobs;

    } catch (error) {
        console.error("Error finding matching jobs:", error);
        return []; // Return an empty array on error to prevent breaking the UI
    }
};
