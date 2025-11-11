import React from 'react';
import { motion } from 'framer-motion';
import { Skill } from '../types';

interface SkillMeterProps {
    skills: Skill[];
}

const SkillMeter: React.FC<SkillMeterProps> = ({ skills }) => {
    if (!skills || skills.length === 0) {
        return <p className="text-center text-gray-500">No skills identified to display.</p>;
    }

    const topSkills = [...skills].sort((a, b) => b.confidence - a.confidence).slice(0, 10);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'technical': return 'bg-purple-500';
            case 'soft': return 'bg-blue-500';
            case 'domain': return 'bg-teal-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-4">
            {topSkills.map((skill, index) => (
                <div key={skill.id || index}>
                    <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{skill.name}</span>
                        <span className="font-semibold text-gray-500 dark:text-gray-400">{Math.round(skill.confidence * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <motion.div
                            className={`h-2.5 rounded-full ${getCategoryColor(skill.category)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.confidence * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkillMeter;
