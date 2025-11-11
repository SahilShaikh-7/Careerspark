import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, AlertTriangle, Download, ArrowLeft, Star, Briefcase, Lightbulb, TrendingUp, PieChart, GitCommit } from 'lucide-react';
import { getResumeData } from '../services/supabaseService';
import { Resume, Job } from '../types';
import { generateTxtReport } from '../utils/helpers';
import SkillMeter from '../components/SkillMeter';
import SkillsDistributionPieChart from '../components/SkillsPieChart';
import AssessmentRadarChart from '../components/AssessmentRadarChart';

const ScoreCircle: React.FC<{ score: number, color: string }> = ({ score, color }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    return (
        <svg width="160" height="160" viewBox="0 0 120 120" className="transform -rotate-90">
            <circle
                cx="60"
                cy="60"
                r={radius}
                strokeWidth="10"
                className="stroke-gray-200 dark:stroke-gray-700"
                fill="transparent"
            />
            <motion.circle
                cx="60"
                cy="60"
                r={radius}
                strokeWidth="10"
                stroke={color}
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                strokeLinecap="round"
            />
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="transform rotate-90 origin-center font-bold" style={{ fontSize: '24px', fill: color }}>
                {score}%
            </text>
        </svg>
    );
};

const Results: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [resume, setResume] = useState<Resume | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('No resume ID provided.');
            setIsLoading(false);
            return;
        }

        const fetchResume = async () => {
            try {
                // Now fetches directly from Supabase, relying on RLS for security
                const data = await getResumeData(id);
                if (!data) throw new Error('Resume not found or you do not have permission to view it.');
                setResume(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch resume data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchResume();
    }, [id]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-10 w-10 text-purple-500" /></div>;
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
                <h2 className="mt-4 text-2xl font-bold">An Error Occurred</h2>
                <p className="text-red-500 mt-2">{error}</p>
                <Link to="/dashboard" className="mt-6 inline-block px-6 py-2 bg-purple-600 text-white rounded-lg">Go to Dashboard</Link>
            </div>
        );
    }
    
    if (!resume) {
        return <div className="text-center py-10"><h2>No resume data available.</h2></div>;
    }

    const scoreColor = resume.score > 85 ? '#10B981' : resume.score > 60 ? '#F59E0B' : '#EF4444';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 mb-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold">Analysis for: <span className="text-purple-500">{resume.filename}</span></h1>
                    <p className="text-gray-500 dark:text-gray-400">Analyzed on {new Date(resume.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => generateTxtReport(resume)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    <Download className="h-5 w-5" /> Download Report
                </button>
            </div>
            
            <div className="space-y-8">
                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Star className="text-yellow-400" /> Overall Score</h2>
                            <div className="flex justify-center items-center my-4">
                                <ScoreCircle score={resume.score} color={scoreColor} />
                            </div>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400">Based on skills, experience, and clarity.</p>
                        </div>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Lightbulb className="text-blue-400" /> Actionable Feedback</h2>
                            <ul className="mt-4 space-y-3 list-disc list-inside text-gray-600 dark:text-gray-300">
                                {resume.feedback.map((fb, index) => <li key={index}>{fb.suggestion}</li>)}
                            </ul>
                        </div>
                    </div>
                     <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="text-indigo-400" /> Top Skills Analysis</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">AI confidence in your most prominent skills.</p>
                            <SkillMeter skills={resume.skills} />
                        </div>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Briefcase className="text-green-400" /> Top Job Matches ({resume.matched_jobs.length})</h2>
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                               {resume.matched_jobs.length > 0 ? resume.matched_jobs.map((job: Job, index) => (
                                    <div key={job.id || index} className="p-4 border dark:border-gray-700 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-purple-600 dark:text-purple-400">{job.title}</h3>
                                                <p className="text-sm font-medium">{job.company}</p>
                                                <p className="text-sm text-gray-500">{job.location}</p>
                                            </div>
                                            <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200">Apply</a>
                                        </div>
                                    </div>
                                )) : <p className="text-gray-500">No matching jobs found at the moment.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* New Assessment Section */}
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold mb-6 text-center">Comprehensive Assessment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-center mb-2 flex items-center justify-center gap-2"><PieChart className="text-purple-400"/>Skills Distribution</h3>
                            <div className="h-80">
                                <SkillsDistributionPieChart skills={resume.skills} />
                            </div>
                        </div>
                        <div>
                           <h3 className="text-lg font-semibold text-center mb-2 flex items-center justify-center gap-2"><GitCommit className="text-teal-400"/>Strength Analysis</h3>
                            <div className="h-80">
                                <AssessmentRadarChart resume={resume} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

export default Results;