import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, PlusCircle, Loader, BarChart2, Calendar, ShieldAlert } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getResumesForUser } from '../services/supabaseService';
import { Resume } from '../types';

const Dashboard: React.FC = () => {
    const { user, session } = useAppContext();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (session === undefined) return; // Wait for session to be determined

        if (!session?.user) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        getResumesForUser(session.user.id)
            .then(data => {
                setResumes(data);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [user, session]);

    const getScoreColor = (score: number) => {
        if (score > 85) return 'text-green-500';
        if (score > 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-10 w-10 text-purple-500" /></div>;
    }
    
    if (!user) {
        return (
            <div className="text-center py-20 bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
                <ShieldAlert className="h-12 w-12 mx-auto text-purple-500"/>
                <h3 className="text-2xl font-bold mt-4">Access Denied</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Please sign in to view your dashboard.</p>
            </div>
        )
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Dashboard</h1>
                <button onClick={() => navigate('/upload')} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700">
                    <PlusCircle className="h-5 w-5" /> Analyze New Resume
                </button>
            </div>

            {resumes.length === 0 ? (
                <div className="text-center py-20 bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
                    <h3 className="text-2xl font-bold">No Resumes Analyzed Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Upload your first resume to get started.</p>
                    <button onClick={() => navigate('/upload')} className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700">
                        Upload Resume
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.map((resume, index) => (
                        <motion.div 
                            key={resume.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={`/results/${resume.id}`} className="block bg-white dark:bg-dark-card p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200 dark:border-gray-800 h-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                        <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h2 className="font-bold text-lg truncate flex-1" title={resume.filename}>{resume.filename}</h2>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <BarChart2 className="h-4 w-4 text-gray-400"/>
                                        <span>AI Score: <span className={`font-bold ${getScoreColor(resume.score)}`}>{resume.score}/100</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400"/>
                                        <span>Analyzed: {new Date(resume.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default Dashboard;
