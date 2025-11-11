import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Resume } from '../types';

interface AssessmentRadarChartProps {
    resume: Resume;
}

const AssessmentRadarChart: React.FC<AssessmentRadarChartProps> = ({ resume }) => {
    // Derive scores for the radar chart from the resume data.
    // This creates a more comprehensive visual assessment for the user.
    const technicalSkillsCount = resume.skills.filter(s => s.category === 'technical').length;
    const totalSkills = resume.skills.length > 0 ? resume.skills.length : 1; // Avoid division by zero
    
    const skillScore = resume.skills.reduce((acc, s) => acc + s.confidence, 0) / totalSkills * 100;

    const data = [
        { subject: 'Overall Score', A: resume.score, fullMark: 100 },
        { subject: 'Skills', A: Math.min(skillScore, 100) || 50, fullMark: 100 },
        { subject: 'Experience', A: Math.min((resume.total_experience / 10) * 100, 100) || 20, fullMark: 100 },
        { subject: 'Keyword Strength', A: Math.min((technicalSkillsCount / 15) * 100, 100) || 40, fullMark: 100 },
        { subject: 'Feedback Actionability', A: 100 - (resume.feedback.length * 10), fullMark: 100 },
    ];
    
    // Determine the active theme to apply appropriate colors.
    const isDarkMode = document.documentElement.classList.contains('dark');
    const strokeColor = isDarkMode ? "#8B5CF6" : "#6D28D9";
    const fillColor = isDarkMode ? "#8B5CF6" : "#8B5CF6";
    const tickColor = isDarkMode ? "#9ca3af" : "#4b5563";

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke={isDarkMode ? "#374151" : "#e5e7eb"}/>
                <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false}/>
                <Radar 
                    name="Assessment" 
                    dataKey="A" 
                    stroke={strokeColor}
                    fill={fillColor}
                    fillOpacity={0.6} 
                />
                 <Tooltip 
                    contentStyle={{ 
                        background: 'rgba(30, 41, 59, 0.8)', 
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        color: '#cbd5e1'
                    }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default AssessmentRadarChart;
