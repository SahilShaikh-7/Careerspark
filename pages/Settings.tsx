import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Check, ShieldAlert } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Settings: React.FC = () => {
    const { user, profile, updateProfile } = useAppContext();
    const [fullName, setFullName] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    
    // Email is managed by Supabase Auth, so we only allow changing the full name.
    const email = user?.email || '';

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name);
        }
    }, [profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProfile({ full_name: fullName });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    if (!user) {
         return (
            <div className="text-center py-20 bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
                <ShieldAlert className="h-12 w-12 mx-auto text-purple-500"/>
                <h3 className="text-2xl font-bold mt-4">Access Denied</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Please sign in to access your settings.</p>
            </div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
        >
            <h1 className="text-4xl font-bold text-center">Settings</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-center mt-2">
                Manage your personal details.
            </p>

            <form 
                onSubmit={handleSave}
                className="mt-8 bg-white dark:bg-dark-card p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 space-y-6"
            >
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                    </label>
                     <input
                        type="email"
                        id="email"
                        value={email}
                        disabled
                        className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400"
                    />
                </div>
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g., Jane Doe"
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${isSaved ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors`}
                    >
                        {isSaved ? <Check className="h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                        {isSaved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default Settings;