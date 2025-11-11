import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, FileText, Star, Briefcase, Loader, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAppContext } from '../context/AppContext';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-lg text-white`}
    >
        <div className="flex items-center justify-between">
            <p className="font-medium">{title}</p>
            {icon}
        </div>
        <p className="text-4xl font-bold mt-4">{value}</p>
    </motion.div>
);

const Dashboard: React.FC = () => {
    const { user, profile, resumes, loading } = useAppContext();
    const navigate = useNavigate();

    if (loading) {
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

    const averageScore = resumes.length > 0
        ? Math.round(resumes.reduce((acc, r) => acc + r.score, 0) / resumes.length)
        : 0;

    const totalJobMatches = resumes.reduce((acc, r) => acc + (r.matched_jobs?.length || 0), 0);
    
    return (
        <div>
            <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold mb-2"
            >
                Welcome back, {profile?.full_name || 'User'}!
            </motion.h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Here's a summary of your analyses.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard title="Total Resumes" value={resumes.length} icon={<FileText />} color="from-purple-500 to-indigo-500" />
                <StatCard title="Average Score" value={`${averageScore}%`} icon={<Star />} color="from-blue-500 to-cyan-500" />
                <StatCard title="Job Matches" value={totalJobMatches} icon={<Briefcase />} color="from-teal-500 to-green-500" />
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Recent Analyses</h2>
                <button onClick={() => navigate('/upload')} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                    <PlusCircle className="h-5 w-5" /> New Analysis
                </button>
            </div>

            {resumes.length === 0 ? (
                <div className="text-center py-20 bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
                    <h3 className="text-xl font-semibold">No resumes analyzed yet.</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Get started by uploading your first resume!</p>
                    <button onClick={() => navigate('/upload')} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                        Upload Resume
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {resumes.map((resume, index) => (
                         <motion.div 
                            key={resume.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white dark:bg-dark-card/50 backdrop-blur-lg border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4"
                        >
                            <div className="flex-grow w-full md:w-auto">
                                <p className="font-semibold">{resume.filename}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(new Date(resume.created_at), { addSuffix: true })}
                                </p>
                            </div>
                            <div className="flex items-center gap-6 text-sm w-full md:w-auto">
                                <div className="text-center">
                                    <span className="font-bold text-lg">{resume.score}</span>
                                    <span className="text-gray-500">/100</span>
                                    <p className="text-xs text-gray-500">Score</p>
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-lg">{resume.skills?.length || 0}</span>
                                    <p className="text-xs text-gray-500">Skills</p>
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-lg">{resume.matched_jobs?.length || 0}</span>
                                    <p className="text-xs text-gray-500">Jobs</p>
                                </div>
                            </div>
                            <div className="w-full md:w-auto">
                                <button onClick={() => navigate(`/results/${resume.id}`)} className="w-full px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-semibold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 transition">
                                    View Results
                                </button>
                            </div>
                         </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;