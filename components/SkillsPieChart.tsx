import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skill } from '../types';

interface SkillsPieChartProps {
    skills: Skill[];
}

const COLORS = {
    technical: '#8B5CF6', // Purple
    soft: '#3B82F6',      // Blue
    domain: '#14B8A6',     // Teal
};

const SkillsDistributionPieChart: React.FC<SkillsPieChartProps> = ({ skills }) => {
    if (!skills || skills.length === 0) {
        return <p className="text-center text-gray-500 h-full flex items-center justify-center">No skill data available.</p>;
    }

    const data = Object.entries(
        skills.reduce((acc, skill) => {
            acc[skill.category] = (acc[skill.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name: `${name.charAt(0).toUpperCase() + name.slice(1)} Skills`, value }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name.split(' ')[0].toLowerCase() as keyof typeof COLORS]} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ 
                        background: 'rgba(30, 41, 59, 0.8)', 
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        color: '#cbd5e1'
                    }}
                />
                <Legend iconType="circle"/>
            </PieChart>
        </ResponsiveContainer>
    );
};

export default SkillsDistributionPieChart;
