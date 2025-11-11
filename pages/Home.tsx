import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Search, BarChart } from 'lucide-react';
import ParticleCanvas from '../components/ParticleCanvas';
import { useAppContext } from '../context/AppContext';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { session, openAuthModal } = useAppContext();

    const stats = [
        { value: '10,000+', label: 'Resumes Analyzed' },
        { value: '95%', label: 'Success Rate' },
        { value: '500+', label: 'Daily Job Matches' },
        { value: '24/7', label: 'AI Support' },
    ];

    const features = [
        { icon: <BrainCircuit className="h-8 w-8 text-purple-400" />, title: 'AI Analysis', description: 'Our NLP models extract skills, score your resume, and provide actionable feedback.' },
        { icon: <Search className="h-8 w-8 text-blue-400" />, title: 'Live Job Matching', description: 'We find relevant job opportunities in India from LinkedIn and other top sources.' },
        { icon: <BarChart className="h-8 w-8 text-teal-400" />, title: 'Interactive Visuals', description: 'Understand your strengths with beautiful charts and 3D skill visualizations.' },
    ];

    const handleAction = (path: string) => {
        if (session) {
            navigate(path);
        } else {
            openAuthModal();
        }
    };

    return (
        <div className="relative overflow-hidden">
            <ParticleCanvas />
            <div className="relative z-10 text-center py-20 md:py-32">
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight"
                >
                    <span className="bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent">CareerSpark AI</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300"
                >
                    Transform Your Career with AI-Powered Resume Analysis.
                </motion.p>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-8 flex justify-center gap-4"
                >
                    <button onClick={() => handleAction('/upload')} className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 transition-transform hover:scale-105">
                        Analyze My Resume
                    </button>
                    <button onClick={() => handleAction('/dashboard')} className="px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-300 font-semibold rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform hover:scale-105">
                        View Dashboard
                    </button>
                </motion.div>
            </div>
            
            <div className="relative z-10 container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 my-16 text-center">
                {stats.map((stat, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent">{stat.value}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="relative z-10 container mx-auto my-24">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            viewport={{ once: true }}
                            className="bg-white/50 dark:bg-dark-card backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800"
                        >
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-teal-100 dark:from-purple-900/50 dark:to-teal-900/50 mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 container mx-auto my-24">
                 <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-purple-600 to-blue-500 p-12 rounded-2xl text-white text-center shadow-2xl"
                >
                    <h2 className="text-4xl font-bold mb-4">Ready to Get Hired?</h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">Let our AI be your personal career coach. Get started now and take the next step in your professional journey.</p>
                    <button onClick={() => handleAction('/upload')} className="px-10 py-4 bg-white text-purple-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-transform hover:scale-105 flex items-center gap-2 mx-auto">
                        Get Started Free <ArrowRight className="h-5 w-5" />
                    </button>
                 </motion.div>
            </div>
        </div>
    );
};

export default Home;