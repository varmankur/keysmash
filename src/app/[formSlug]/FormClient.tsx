/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { BugModal } from '@/components/BugModal';

interface FormClientProps {
  formId: string;
  title: string;
  description: string | null;
  logoPath: string | null;
  primaryColor: string;
  questions: any[];
}

export default function FormClient({ formId, title, description, logoPath, primaryColor, questions }: FormClientProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, answers })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSubmittedId(data.studentId);
      } else {
        alert('Failed to submit: ' + data.error);
      }
    } catch {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16" style={{ color: primaryColor }} />
          </div>
          <h1 className="text-3xl font-bold text-white">Submitted!</h1>
          <p className="text-zinc-400">Thank you for your feedback.</p>
          <div className="bg-black border border-zinc-800 rounded-xl p-4 mt-6">
            <p className="text-sm text-zinc-500 mb-1">Your Student ID</p>
            <p className="text-xl font-mono" style={{ color: primaryColor }}>{submittedId}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <header className="flex flex-col items-center space-y-6 pt-8 pb-4">
          {logoPath && (
            <img src={logoPath} alt="Logo" className="h-16 invert mix-blend-screen" />
          )}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold" style={{ color: primaryColor }}>{title}</h1>
            {description && <p className="text-zinc-400 max-w-lg mx-auto">{description}</p>}
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-colors">
              <label className="block text-lg font-medium text-zinc-200 mb-4">
                {q.label} {q.required && <span className="text-red-500">*</span>}
              </label>
              
              {q.type === 'text' && (
                <input 
                  type="text" 
                  required={q.required}
                  className="w-full bg-black border border-zinc-700 text-white rounded-xl p-3 focus:outline-none focus:ring-2 transition-all"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                />
              )}

              {q.type === 'textarea' && (
                <textarea 
                  required={q.required}
                  className="w-full bg-black border border-zinc-700 text-white rounded-xl p-3 focus:outline-none focus:ring-2 transition-all h-32 resize-none"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                />
              )}

              {q.type === 'star' && (
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setAnswers({...answers, [q.id]: star})}
                      className={`text-3xl transition-transform hover:scale-110 ${answers[q.id] >= star ? 'opacity-100' : 'opacity-20 grayscale'}`}
                      style={{ color: answers[q.id] >= star ? primaryColor : 'white' }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'checkbox' && (
                <div className="flex items-center space-x-3 bg-black p-4 rounded-xl border border-zinc-800">
                  <input 
                    type="checkbox" 
                    id={q.id}
                    required={q.required}
                    className="w-6 h-6 rounded border-zinc-700"
                    checked={answers[q.id] || false}
                    onChange={e => setAnswers({...answers, [q.id]: e.target.checked})}
                  />
                  <label htmlFor={q.id} className="text-zinc-300 cursor-pointer flex-1">Yes, I agree</label>
                </div>
              )}
            </div>
          ))}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full text-black font-bold p-4 rounded-2xl transition-all hover:opacity-90 flex justify-center items-center gap-2 mt-8"
            style={{ backgroundColor: primaryColor }}
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submit Feedback'}
          </button>
        </form>

      </div>
      <BugModal />
    </div>
  );
}
