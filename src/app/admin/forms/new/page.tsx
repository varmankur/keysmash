'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface QuestionDef {
  id: string;
  type: 'text' | 'textarea' | 'star' | 'checkbox' | 'photo' | 'video';
  label: string;
  required: boolean;
}

export default function FormBuilder() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [questions, setQuestions] = useState<QuestionDef[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = (type: QuestionDef['type']) => {
    const newQ: QuestionDef = {
      id: `q_${Date.now()}`,
      type,
      label: `New ${type} question`,
      required: false
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<QuestionDef>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const handleSave = async () => {
    if (!title || !slug || questions.length === 0) {
      setError('Title, URL Slug, and at least one question are required.');
      return;
    }
    
    setIsSaving(true);
    setError('');

    try {
      const res = await fetch('/api/admin/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          slug,
          primaryColor,
          questions
        })
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/admin/forms/${data.formId}`);
      } else {
        setError(data.error || 'Failed to save form');
      }
    } catch {
      setError('Connection failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
          </Link>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Save Form
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 border border-red-500/50 p-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form Settings */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-semibold border-b border-zinc-800 pb-2">Form Details</h2>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Form Title</label>
                <input 
                  type="text" 
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                  placeholder="e.g. Workshop Feedback"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">URL Slug</label>
                <div className="flex items-center">
                  <span className="bg-zinc-800 border border-r-0 border-zinc-700 rounded-l-lg p-2.5 text-zinc-500 text-sm">/</span>
                  <input 
                    type="text" 
                    value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full bg-black border border-zinc-700 rounded-r-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                    placeholder="my-cool-event"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Description</label>
                <textarea 
                  value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none h-24 resize-none"
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Brand Color (HEX)</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input 
                    type="text" 
                    value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-black border border-zinc-700 rounded-lg p-2.5 text-sm uppercase font-mono outline-none"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Form Builder Canvas */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl min-h-[400px]">
              <h2 className="text-lg font-semibold border-b border-zinc-800 pb-2 mb-6">Questions</h2>
              
              <div className="space-y-4 mb-8">
                {questions.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No questions added yet. Use the buttons below.</p>
                ) : questions.map((q, index) => (
                  <div key={q.id} className="bg-black border border-zinc-800 p-4 rounded-xl flex gap-4 items-start group">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded font-mono uppercase">{q.type}</span>
                        <input 
                          type="text" 
                          value={q.label}
                          onChange={e => updateQuestion(q.id, { label: e.target.value })}
                          className="flex-1 bg-transparent border-b border-dashed border-zinc-600 focus:border-blue-500 outline-none text-white pb-1"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`req_${q.id}`}
                          checked={q.required}
                          onChange={e => updateQuestion(q.id, { required: e.target.checked })}
                          className="rounded bg-zinc-800 border-zinc-700 text-blue-500"
                        />
                        <label htmlFor={`req_${q.id}`} className="text-xs text-zinc-500 cursor-pointer">Required Question</label>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeQuestion(q.id)}
                      className="text-zinc-600 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => addQuestion('text')} className="flex items-center text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors border border-zinc-700">
                  <Plus className="w-4 h-4 mr-2 text-zinc-400" /> Short Text
                </button>
                <button onClick={() => addQuestion('textarea')} className="flex items-center text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors border border-zinc-700">
                  <Plus className="w-4 h-4 mr-2 text-zinc-400" /> Long Text
                </button>
                <button onClick={() => addQuestion('star')} className="flex items-center text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors border border-zinc-700">
                  <Plus className="w-4 h-4 mr-2 text-yellow-500" /> Star Rating
                </button>
                <button onClick={() => addQuestion('checkbox')} className="flex items-center text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors border border-zinc-700">
                  <Plus className="w-4 h-4 mr-2 text-blue-500" /> Checkbox
                </button>
                <button onClick={() => addQuestion('photo')} className="flex items-center text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors border border-zinc-700">
                  <Plus className="w-4 h-4 mr-2 text-purple-500" /> Photo Upload
                </button>
                <button onClick={() => addQuestion('video')} className="flex items-center text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors border border-zinc-700">
                  <Plus className="w-4 h-4 mr-2 text-pink-500" /> Video Record
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
