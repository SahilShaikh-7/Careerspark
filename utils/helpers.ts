
import { Resume } from '../types';

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


export const generateTxtReport = (resume: Resume) => {
    let report = `CAREERSPARK AI - RESUME ANALYSIS REPORT\n`;
    report += `========================================\n\n`;
    report += `Filename: ${resume.filename}\n`;
    // FIX: Changed resume.createdAt to resume.created_at to match the type definition.
    report += `Analyzed On: ${new Date(resume.created_at).toLocaleString()}\n\n`;
    report += `--- OVERALL SCORE: ${resume.score}/100 ---\n\n`;
    
    report += `--- EXPERIENCE ---\n`;
    report += `Level: ${resume.experience_level}\n`;
    report += `Total Years: ${resume.total_experience}\n\n`;

    report += `--- SKILLS (${resume.skills.length}) ---\n`;
    resume.skills.forEach(skill => {
        report += `- ${skill.name} (Category: ${skill.category}, Confidence: ${Math.round(skill.confidence * 100)}%)\n`;
    });
    report += `\n`;

    report += `--- ACTIONABLE FEEDBACK ---\n`;
    resume.feedback.forEach((fb, index) => {
        report += `${index + 1}. ${fb.suggestion}\n`;
    });
    report += `\n`;

    report += `--- MATCHED JOBS (${resume.matched_jobs.length}) ---\n`;
    resume.matched_jobs.forEach(job => {
        report += `----------------------------------------\n`;
        report += `Title: ${job.title}\n`;
        report += `Company: ${job.company}\n`;
        report += `Location: ${job.location}\n`;
        report += `Match: ${job.match_percentage}%\n`;
        report += `Salary: ${job.salary_range}\n`;
        report += `Experience: ${job.experience_required}\n`;
        report += `Type: ${job.job_type}\n`;
        report += `Apply: ${job.apply_url}\n`;
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CareerSpark_Report_${resume.filename.split('.')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
};