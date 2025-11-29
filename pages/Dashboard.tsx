import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../services/mockBackend';
import { TestResult, Milestone } from '../types';
import { MILESTONES, LEVELS } from '../constants';
import Certificate from '../components/Certificate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<TestResult[]>([]);
  // activeCertificate is for the Hidden High-Res version (for PDF)
  const [activeCertificate, setActiveCertificate] = useState<Milestone | null>(null);
  // viewingCertificate is for the UI Modal
  const [viewingCertificate, setViewingCertificate] = useState<Milestone | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const h = await mockDb.getHistory();
      setHistory(h);
    };
    fetchHistory();
  }, [user]);

  const downloadCertificate = async (milestone: Milestone) => {
    setIsGenerating(true);
    // Set active to render the hidden high-res component
    setActiveCertificate(milestone);
    
    // Wait for render
    setTimeout(async () => {
      const element = document.getElementById(`cert-${milestone.id}`);
      if (element) {
        try {
          const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('l', 'mm', 'a4'); // landscape, mm, a4
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`TypeMaster_Certificate_${milestone.id}.pdf`);
        } catch (err) {
          console.error("Failed to generate PDF", err);
        } finally {
          setActiveCertificate(null);
          setIsGenerating(false);
        }
      } else {
          setIsGenerating(false);
      }
    }, 1000);
  };

  if (!user) {
    return (
        <div className="min-h-screen flex items-center justify-center text-center p-4">
            <div>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Please Log In</h2>
                <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-lg">Go to Login</Link>
            </div>
        </div>
    );
  }

  const currentLevel = LEVELS.find(l => l.level === user.level);
  const nextLevel = LEVELS.find(l => l.level === user.level + 1);
  const xpForCurrent = currentLevel?.xp || 0;
  const xpForNext = nextLevel?.xp || 100000;
  const progressPercent = Math.min(100, Math.max(0, ((user.xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {user.username}!</h1>
        <p className="text-slate-500 dark:text-slate-400">Here is your typing journey overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <i className="fa-solid fa-trophy text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-slate-500">Current Level</p>
              <p className="text-2xl font-bold dark:text-white">{user.level}</p>
            </div>
          </div>
          <div className="mt-4">
             <div className="flex justify-between text-xs mb-1 dark:text-slate-400">
               <span>XP: {user.xp}</span>
               <span>Next: {xpForNext}</span>
             </div>
             <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
               <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                <i className="fa-solid fa-bolt text-xl"></i>
                </div>
                <div>
                <p className="text-sm text-slate-500">Best WPM</p>
                <p className="text-2xl font-bold dark:text-white">{user.bestWpm}</p>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                <i className="fa-solid fa-keyboard text-xl"></i>
                </div>
                <div>
                <p className="text-sm text-slate-500">Tests Completed</p>
                <p className="text-2xl font-bold dark:text-white">{user.totalTests}</p>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                <i className="fa-solid fa-calendar-day text-xl"></i>
                </div>
                <div>
                <p className="text-sm text-slate-500">Joined</p>
                <p className="text-lg font-bold dark:text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Certificates Section */}
      <h2 id="certificates" className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
        <i className="fa-solid fa-certificate text-yellow-500"></i>
        Milestones & Certificates
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {MILESTONES.map((milestone) => {
            const isUnlocked = 
                (milestone.requiredTests && user.totalTests >= milestone.requiredTests) ||
                (milestone.requiredWpm && user.bestWpm >= milestone.requiredWpm);
            
            return (
                <div key={milestone.id} className={`relative p-6 rounded-xl border flex flex-col h-full ${isUnlocked ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'}`}>
                    <div className="flex flex-col items-center text-center flex-grow">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isUnlocked ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
                            <i className={`fa-solid ${milestone.icon} text-3xl ${!isUnlocked && 'text-slate-400'}`}></i>
                        </div>
                        <h3 className="font-bold text-lg mb-1 dark:text-white">{milestone.name}</h3>
                        <p className="text-sm text-slate-500 mb-6">{milestone.description}</p>
                    </div>
                    
                    {isUnlocked ? (
                        <button 
                            onClick={() => setViewingCertificate(milestone)}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-eye"></i> View Certificate
                        </button>
                    ) : (
                        <div className="w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed text-center">
                            <i className="fa-solid fa-lock mr-2"></i> Locked
                        </div>
                    )}
                </div>
            );
        })}
      </div>

      {/* Certificate Preview Modal */}
      {viewingCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold dark:text-white">Certificate Preview</h3>
              <button 
                onClick={() => setViewingCertificate(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-red-100 hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <div className="flex-grow overflow-auto p-4 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
               <div className="transform scale-[0.4] sm:scale-[0.5] md:scale-[0.7] lg:scale-[0.8] origin-center shadow-2xl">
                 <Certificate 
                   id="preview-cert"
                   user={user} 
                   milestone={viewingCertificate} 
                 />
               </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-white dark:bg-slate-800">
               <button 
                  onClick={() => setViewingCertificate(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
               >
                 Close
               </button>
               <button 
                  onClick={() => downloadCertificate(viewingCertificate)}
                  disabled={isGenerating}
                  className="px-6 py-2 bg-primary hover:bg-indigo-600 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all"
               >
                 {isGenerating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
                 Download PDF
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden High-Res Certificate Renderer for PDF Generation */}
      {/* Moved out of screen instead of opacity-0 to ensure better canvas rendering */}
      <div style={{ position: 'fixed', left: '-10000px', top: 0 }}>
         {activeCertificate && (
             <Certificate 
                id={`cert-${activeCertificate.id}`} 
                user={user} 
                milestone={activeCertificate} 
             />
         )}
      </div>

      {/* History Table */}
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Recent Tests</h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Mode</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">WPM</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Accuracy</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">XP</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {history.length > 0 ? history.slice(0, 10).map((res, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{new Date(res.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-slate-500">
                            {res.mode === 'time' ? `${res.duration}s Sprint` : 'Text Mode'}
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">{res.wpm}</td>
                        <td className="px-6 py-4 text-secondary font-medium">{res.accuracy}%</td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">+{res.xpEarned}</td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No tests completed yet. Go type something!</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;