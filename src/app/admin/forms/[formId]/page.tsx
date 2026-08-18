'use client';

import { useEffect, useState, use } from 'react';
import { Download, Upload, Trophy, Loader2, FileArchive, Image as ImageIcon, Video, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Media {
  id: string;
  type: string;
  path: string;
}

interface Feedback {
  id: string;
  studentId: string;
  answers: string; // JSON
  isWinner: boolean;
  media: Media[];
  createdAt: string;
}

interface QuestionDef {
  id: string;
  type: string;
  label: string;
}

interface Form {
  id: string;
  slug: string;
  title: string;
  logoPath: string | null;
  primaryColor: string;
  questions: string; // JSON
  feedbacks: Feedback[];
}

export default function FormDashboard({ params }: { params: Promise<{ formId: string }> }) {
  const resolvedParams = use(params);
  const formId = resolvedParams.formId;

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<QuestionDef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      const res = await fetch(`/api/admin/forms/${formId}`);
      if (res.ok) {
        const data = await res.json();
        setForm(data.form);
        try {
          setQuestions(JSON.parse(data.form.questions));
        } catch(e) {}
      }
    } catch (error) {
      console.error('Failed to fetch form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkWinner = async (id: string, isWinner: boolean) => {
    try {
      const res = await fetch(`/api/admin/forms/${formId}/winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isWinner }),
      });
      if (res.ok) {
        fetchForm();
      }
    } catch (error) {
      console.error('Failed to mark winner');
    }
  };

  const handleMediaUpload = async (id: string, files: FileList) => {
    if (!files || files.length === 0) return;
    setUploadingId(id);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('media', file));
    formData.append('feedbackId', id);

    try {
      const res = await fetch(`/api/admin/forms/${formId}/upload-media`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchForm();
      } else {
        alert('Upload failed. Server error or file too large.');
      }
    } catch (error) {
      alert('Upload error.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleExportExcel = () => {
    window.open(`/api/admin/forms/${formId}/export`, '_blank');
  };

  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      const res = await fetch(`/api/admin/forms/${formId}/export-zip`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const disposition = res.headers.get('Content-Disposition');
        let filename = `${form?.slug}-export.zip`;
        if (disposition && disposition.indexOf('filename=') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) { 
              filename = matches[1].replace(/['"]/g, '');
            }
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to connect to export server.');
      }
    } catch (error) {
      alert('Export error.');
    } finally {
      setIsExportingZip(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  if (!form) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">Form not found.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto space-y-8 flex-grow w-full">
        
        {/* Navigation */}
        <Link href="/admin" className="flex items-center text-zinc-400 hover:text-white transition-colors w-fit">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            {form.logoPath && (
              <img src={form.logoPath} alt="Logo" className="h-8 invert mix-blend-screen" onError={(e) => e.currentTarget.style.display = 'none'} />
            )}
            <div>
              <h1 className="text-2xl font-bold" style={{ color: form.primaryColor }}>{form.title}</h1>
              <p className="text-zinc-400 text-sm font-mono">/{form.slug}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleExportExcel}
              className="flex items-center space-x-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/50 px-4 py-2 rounded-xl transition-colors font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
            <button 
              onClick={handleExportZip}
              disabled={isExportingZip}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-500 px-5 py-2 rounded-xl transition-colors font-medium text-sm disabled:opacity-50"
            >
              {isExportingZip ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileArchive className="w-4 h-4" />}
              <span>Export All Data (ZIP)</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Student ID</th>
                {questions.map((q) => (
                  <th key={q.id} className="p-4 font-medium">{q.label}</th>
                ))}
                <th className="p-4 font-medium text-center">Winner</th>
                <th className="p-4 font-medium text-center">Media</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {form.feedbacks.length === 0 ? (
                <tr><td colSpan={questions.length + 3} className="p-8 text-center text-zinc-500">No feedbacks yet. Share your form URL to get started!</td></tr>
              ) : form.feedbacks.map((fb) => {
                let parsedAnswers: Record<string, any> = {};
                try {
                  parsedAnswers = JSON.parse(fb.answers);
                } catch(e) {}

                return (
                  <tr key={fb.id} className={`hover:bg-zinc-800/30 transition-colors ${fb.isWinner ? 'bg-blue-900/10' : ''}`}>
                    <td className="p-4 text-sm font-mono text-blue-400">{fb.studentId}</td>
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
                    <td className="p-4">
                      <div className="flex flex-col items-center gap-2">
                        {fb.media.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-center max-w-[120px]">
                            {fb.media.map(m => (
                              <a key={m.id} href={m.path} target="_blank" rel="noopener noreferrer" className="p-1 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors" title={m.type}>
                                {m.type === 'video' ? <Video className="w-3 h-3 text-blue-400" /> : <ImageIcon className="w-3 h-3 text-green-400" />}
                              </a>
                            ))}
                          </div>
                        )}
                        <div className="relative inline-block w-full max-w-[100px]">
                          <input 
                            type="file" 
                            multiple
                            accept="image/*,video/*" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            title="Upload Photos or Videos"
                            disabled={uploadingId === fb.id}
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleMediaUpload(fb.id, e.target.files);
                              }
                            }}
                          />
                          <button disabled={uploadingId === fb.id} className="w-full inline-flex items-center justify-center space-x-1 text-xs font-medium text-zinc-300 bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors disabled:opacity-50">
                            {uploadingId === fb.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
