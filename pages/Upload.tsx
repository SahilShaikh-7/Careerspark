import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, File, X, Loader, ShieldAlert } from 'lucide-react';
import { uploadResumeFile, createResumeRecord, updateResumeWithAnalysis } from '../services/supabaseService';
import { analyzeResume, findMatchingJobs } from '../services/apiService';
import { useAppContext } from '../context/AppContext';

const Upload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Ready to upload...');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAppContext();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size must be less than 5MB.');
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
        multiple: false,
    });

    const handleAnalyze = async () => {
        if (!file || !user) return;

        setIsLoading(true);
        setError(null);

        try {
            setStatus('Uploading your resume...');
            setProgress(10);
            const { file_url, error: uploadError } = await uploadResumeFile(file, user.id);
            if (uploadError || !file_url) throw new Error('Failed to upload file.');
            
            setProgress(25);
            setStatus('Creating analysis record...');
            const { data: newResume, error: createError } = await createResumeRecord({ filename: file.name, file_url }, user.id);
            if (createError || !newResume) throw new Error('Failed to create resume record.');
            
            setProgress(40);
            setStatus('AI is analyzing your resume...');
            const { data: analysisData, error: analysisError } = await analyzeResume(file);
            if (analysisError || !analysisData) throw new Error('AI analysis failed.');
            
            setProgress(70);
            setStatus('Searching for live jobs in India...');
            const matched_jobs = await findMatchingJobs(analysisData.job_titles);
            
            setProgress(90);
            setStatus('Finalizing your report...');
            const finalData = { ...analysisData, matched_jobs, extracted_text: 'Text extraction handled by AI model.' };
            const { data: updatedResume, error: updateError } = await updateResumeWithAnalysis(newResume.id, finalData);
            if (updateError || !updatedResume) throw new Error('Failed to save analysis results.');
            
            setProgress(100);
            setStatus('Analysis complete!');
            navigate(`/results/${updatedResume.id}`);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setIsLoading(false);
            setProgress(0);
            setStatus('Ready to upload...');
        }
    };

    if (!user) {
        return (
            <div className="text-center py-20 bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
                <ShieldAlert className="h-12 w-12 mx-auto text-purple-500"/>
                <h3 className="text-2xl font-bold mt-4">Access Denied</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Please sign in to upload and analyze your resume.</p>
                {/* The login button is in the main layout */}
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-bold text-center">Upload Your Resume</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 text-center mt-2">Get instant AI-powered feedback and job matches. Supports PDF and DOCX files.</p>
            </motion.div>

            <div className="mt-8">
                {file ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <File className="h-8 w-8 text-purple-500" />
                            <div>
                                <p className="font-semibold">{file.name}</p>
                                <p className="text-sm text-gray-500">{Math.round(file.size / 1024)} KB</p>
                            </div>
                        </div>
                        <button onClick={() => setFile(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div {...getRootProps()} className={`p-12 border-2 border-dashed rounded-xl cursor-pointer text-center transition-colors ${isDragActive ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-purple-400'}`}>
                            <input {...getInputProps()} />
                            <UploadCloud className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-4 font-semibold">Drag & drop your resume here</p>
                            <p className="text-sm text-gray-500">or click to select a file</p>
                        </div>
                    </motion.div>
                )}
            </div>
            
            {error && <p className="mt-4 text-center text-red-500">{error}</p>}
            
            <div className="mt-8">
                <button 
                    onClick={handleAnalyze} 
                    disabled={!file || isLoading}
                    className="w-full px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                >
                    {isLoading ? <><Loader className="animate-spin h-5 w-5" /> Analyzing...</> : 'Analyze My Resume'}
                </button>
            </div>

            {isLoading && (
                <div className="mt-8 text-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <motion.div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress}%` }} transition={{ duration: 0.5 }}></motion.div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{status}</p>
                </div>
            )}
        </div>
    );
};

export default Upload;