import React from 'react';
import { User, Milestone } from '../types';

interface CertificateProps {
  user: User;
  milestone: Milestone;
  id: string; // DOM ID for html2canvas to target
}

const Certificate: React.FC<CertificateProps> = ({ user, milestone, id }) => {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getReasonText = () => {
    if (milestone.requiredWpm) {
        return `Demonstrating exceptional speed by reaching ${milestone.requiredWpm} WPM.`;
    }
    return `Completing ${milestone.requiredTests} typing proficiency tests.`;
  };

  return (
    <div className="overflow-hidden bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
      {/* Container for the certificate */}
      <div 
        id={id} 
        className="relative w-[800px] h-[600px] bg-white text-slate-900 shadow-xl mx-auto p-12 flex flex-col items-center justify-between border-[20px] border-double border-indigo-900"
        style={{ fontFamily: "'Playfair Display', serif" }} 
      >
        {/* Watermark/Background decoration */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <i className="fa-solid fa-keyboard text-[400px]"></i>
        </div>

        {/* Header */}
        <div className="text-center z-10">
          <h1 className="text-5xl font-bold uppercase tracking-widest text-indigo-900 mb-4">Certificate</h1>
          <h2 className="text-2xl font-light uppercase tracking-wide text-slate-600">of Achievement</h2>
        </div>

        {/* Body */}
        <div className="text-center z-10 w-full">
          <p className="text-lg text-slate-500 italic mb-6">This is to certify that</p>
          <h3 className="text-4xl font-bold text-indigo-700 border-b-2 border-indigo-200 pb-4 mx-auto w-2/3 mb-8">
            {user.username}
          </h3>
          <p className="text-lg text-slate-600">
            Has successfully achieved the milestone:
          </p>
          <div className="flex items-center justify-center gap-3 my-6">
             <i className={`fa-solid ${milestone.icon} text-4xl`}></i>
             <span className="text-3xl font-bold text-slate-800">{milestone.name}</span>
          </div>
          <p className="text-slate-500 font-medium">
             For {getReasonText()}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between w-full items-end z-10 mt-8">
          <div className="text-center">
            <div className="w-48 border-b border-slate-400 mb-2"></div>
            <p className="text-sm text-slate-500 uppercase">Date</p>
            <p className="font-semibold">{date}</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-amber-400 flex items-center justify-center mb-2 shadow-lg">
                <i className="fa-solid fa-ribbon text-white text-4xl"></i>
            </div>
            <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Official</p>
          </div>

          <div className="text-center">
            <div className="w-48 border-b border-slate-400 mb-2 font-dancing text-xl text-indigo-800">TypeMaster AI</div>
            <p className="text-sm text-slate-500 uppercase">System Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;