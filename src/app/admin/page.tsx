'use client';

import { useEffect, useState } from 'react';
import { Download, Upload, Trophy, Check, Loader2 } from 'lucide-react';
import { feedbackConfig } from '@/config/feedback.config';

interface Feedback {
  id: string;
  answers: string; // JSON
  isWinner: boolean;
  videoPath: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const { branding, questions } = feedbackConfig;

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/admin/feedback');
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks);
      }
    } catch (error) {
      console.error('Failed to fetch feedbacks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkWinner = async (id: string, isWinner: boolean) => {
    try {
      const res = await fetch('/api/admin/winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isWinner }),
      });
      if (res.ok) {
        fetchFeedbacks();
      }
    } catch (error) {
      console.error('Failed to mark winner');
    }
  };

  const handleVideoUpload = async (id: string, file: File) => {
    if (!file) return;
    setUploadingId(id);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('feedbackId', id);

    try {
      const res = await fetch('/api/admin/upload-video', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchFeedbacks();
      } else {
        alert('Upload failed. The file might be too large or server error.');
      }
    } catch (error) {
      alert('Upload error.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleExport = () => {
    window.open('/api/admin/export', '_blank');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto space-y-8 flex-grow w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
          <div className="flex items-center space-x-4">
            <img src={branding.logoPath} alt="Logo" className="h-8 invert mix-blend-screen" onError={(e) => e.currentTarget.style.display = 'none'} />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-zinc-400 text-sm">{branding.eventName} Feedback</p>
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-sm uppercase tracking-wider">
                {questions.map((q) => (
                  <th key={q.id} className="p-4 font-medium">{q.label}</th>
                ))}
                <th className="p-4 font-medium text-center">Winner</th>
                <th className="p-4 font-medium text-center">Video</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {feedbacks.length === 0 ? (
                <tr><td colSpan={questions.length + 2} className="p-8 text-center text-zinc-500">No feedbacks yet.</td></tr>
              ) : feedbacks.map((fb) => {
                let parsedAnswers: Record<string, any> = {};
                try {
                  parsedAnswers = JSON.parse(fb.answers);
                } catch(e) {}

                return (
                  <tr key={fb.id} className={`hover:bg-zinc-800/30 transition-colors ${fb.isWinner ? 'bg-blue-900/10' : ''}`}>
                    {questions.map((q) => (
                      <td key={q.id} className="p-4 text-sm text-zinc-300 max-w-[200px] truncate" title={parsedAnswers[q.id]?.toString()}>
                        {q.type === 'star' ? (
                          <span className="inline-block bg-zinc-800 px-2 py-1 rounded text-yellow-400 text-xs font-medium border border-zinc-700">
                            {parsedAnswers[q.id] || 0} ⭐
                          </span>
                        ) : q.type === 'checkbox' ? (
                          parsedAnswers[q.id] ? 'Yes' : 'No'
                        ) : (
                          parsedAnswers[q.id]?.toString() || '-'
                        )}
                      </td>
                    ))}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleMarkWinner(fb.id, !fb.isWinner)}
                        className={`p-2 rounded-full transition-all ${fb.isWinner ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}
                        title={fb.isWinner ? 'Unmark Winner' : 'Mark as Winner'}
                      >
                        <Trophy className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      {fb.videoPath ? (
                        <a href={fb.videoPath} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-xs font-medium text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20 hover:bg-green-400/20 transition-colors">
                          <Check className="w-3 h-3" />
                          <span>Uploaded</span>
                        </a>
                      ) : fb.isWinner ? (
                        <div className="relative inline-block">
                          <input 
                            type="file" 
                            accept="video/*" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            title="Upload Testimonial Video"
                            disabled={uploadingId === fb.id}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleVideoUpload(fb.id, e.target.files[0]);
                              }
                            }}
                          />
                          <button disabled={uploadingId === fb.id} className="inline-flex items-center space-x-1 text-xs font-medium text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20 hover:bg-blue-400/20 transition-colors disabled:opacity-50">
                            {uploadingId === fb.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                            <span>Upload</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
      
      <div className="mt-8 text-center text-zinc-500 text-sm">
        {branding.footerText}
      </div>
    </div>
  );
}
