'use client';
import { useState } from 'react';
import { Bug, X, Loader2 } from 'lucide-react';

export function BugModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [reporter, setReporter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/daimon/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc, reporter })
      });
      setIsOpen(false);
      setDesc('');
      setReporter('');
      alert('Bug reported successfully. Our daimons are on it.');
    } catch (e) {
      alert('Failed to report bug');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-900/50 hover:bg-red-900/80 text-red-400 p-3 rounded-full transition-all border border-red-900 shadow-lg z-50 flex items-center justify-center group"
        title="Report a Bug"
      >
        <Bug className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-4">
          <Bug className="w-5 h-5" /> Report a Bug
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Issue Description</label>
            <textarea 
              required
              className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 h-24 resize-none"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="What went wrong?"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Your Name (Optional)</label>
            <input 
              type="text" 
              className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
              value={reporter}
              onChange={e => setReporter(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-red-900/50 hover:bg-red-800/80 text-red-400 font-medium p-3 rounded-xl transition-colors border border-red-900 flex justify-center"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
