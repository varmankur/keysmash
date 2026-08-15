'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, StarHalf, Sparkles, Send, Menu, X, Bug, Shield } from 'lucide-react';
import Link from 'next/link';
import { feedbackConfig, Question } from '@/config/feedback.config';

export default function Home() {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [hoverRating, setHoverRating] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Hamburger Menu & Bug Modal state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [bugDescription, setBugDescription] = useState('');
  const [bugReporter, setBugReporter] = useState('');
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);

  const { branding, questions } = feedbackConfig;

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRatingHover = (id: string, value: number) => {
    setHoverRating((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert('Something went wrong, please try again!');
      }
    } catch (error) {
      alert('Network error, please try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBug(true);
    try {
      const res = await fetch('/api/bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: bugDescription, reporter: bugReporter }),
      });
      if (res.ok) {
        setIsBugModalOpen(false);
        setBugDescription('');
        setBugReporter('');
        alert('Bug reported successfully!');
      } else {
        alert('Failed to report bug.');
      }
    } catch (error) {
      alert('Network error.');
    } finally {
      setIsSubmittingBug(false);
    }
  };

  const renderField = (q: Question) => {
    const value = formData[q.id];

    switch (q.type) {
      case 'text':
        return (
          <input 
            required={q.required}
            type="text" 
            value={value || ''}
            onChange={(e) => handleChange(q.id, e.target.value)}
            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
            placeholder={q.placeholder}
          />
        );
      case 'number':
        return (
          <input 
            required={q.required}
            type="number" 
            min={q.min} max={q.max}
            value={value || ''}
            onChange={(e) => handleChange(q.id, e.target.value)}
            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
            placeholder={q.placeholder}
          />
        );
      case 'textarea':
        return (
          <textarea 
            required={q.required}
            rows={3}
            value={value || ''}
            onChange={(e) => handleChange(q.id, e.target.value)}
            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700 resize-none"
            placeholder={q.placeholder}
          />
        );
      case 'radio':
        return (
          <div className="flex flex-wrap gap-4 mt-2">
            {q.options?.map((option) => (
              <label key={option} className={`flex-1 flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${value === option ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900'}`}>
                <input type="radio" name={q.id} value={option} className="hidden" required={q.required} onChange={(e) => handleChange(q.id, e.target.value)} />
                <span className="font-medium text-lg">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="flex items-start space-x-3 bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/50">
            <input 
              type="checkbox" 
              required={q.required}
              id={q.id}
              checked={value || false}
              onChange={(e) => handleChange(q.id, e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-zinc-700 text-blue-600 focus:ring-blue-500/50 focus:ring-offset-zinc-900 bg-zinc-900"
            />
            <label htmlFor={q.id} className="text-sm text-zinc-400 leading-tight cursor-pointer">
              {q.label}
            </label>
          </div>
        );
      case 'star':
        return (
          <div className="p-6 bg-zinc-950/40 rounded-2xl border border-zinc-800/50">
            <label className="block text-center text-lg font-medium text-white mb-6">{q.label}</label>
            <div className="flex justify-center space-x-2" onMouseLeave={() => handleRatingHover(q.id, 0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="relative cursor-pointer w-12 h-12">
                  <div 
                    className="absolute left-0 top-0 w-1/2 h-full z-10"
                    onMouseEnter={() => handleRatingHover(q.id, star - 0.5)}
                    onClick={() => handleChange(q.id, star - 0.5)}
                  />
                  <div 
                    className="absolute right-0 top-0 w-1/2 h-full z-10"
                    onMouseEnter={() => handleRatingHover(q.id, star)}
                    onClick={() => handleChange(q.id, star)}
                  />
                  <Star 
                    className={`w-12 h-12 transition-all duration-200 ${
                      (hoverRating[q.id] || value) >= star 
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]' 
                        : (hoverRating[q.id] || value) >= star - 0.5
                          ? 'text-yellow-400' 
                          : 'text-zinc-700'
                    }`} 
                  />
                  {(hoverRating[q.id] || value) >= star - 0.5 && (hoverRating[q.id] || value) < star && (
                    <StarHalf className="w-12 h-12 text-yellow-400 fill-yellow-400 absolute top-0 left-0 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-zinc-900/50 p-12 rounded-3xl border border-zinc-800 backdrop-blur-md"
        >
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 glow-border"
          >
            <Sparkles className="w-12 h-12 text-blue-400 glow-text" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">Awesome!</h1>
          <p className="text-xl text-zinc-300">Your feedback has been beamed to the server.</p>
          <button 
            onClick={() => {
              setIsSuccess(false);
              setFormData({});
            }}
            className="mt-8 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors"
          >
            Submit Another
          </button>
        </motion.div>
        
        <div className="mt-12 text-zinc-500 text-sm">{branding.footerText}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Hamburger Button */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="absolute top-6 right-6 z-50 p-3 bg-zinc-900/80 border border-zinc-800 rounded-full hover:bg-zinc-800 transition-colors"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Slide-out Menu Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-64 bg-zinc-950 border-l border-zinc-800 z-50 p-6 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-white font-bold text-lg">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <Link href="/admin/login" className="flex items-center space-x-3 w-full p-4 rounded-xl bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 border border-blue-900/50 transition-colors">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Admin Login</span>
                </Link>
                <button 
                  onClick={() => { setIsMenuOpen(false); setIsBugModalOpen(true); }}
                  className="flex items-center space-x-3 w-full p-4 rounded-xl bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50 transition-colors"
                >
                  <Bug className="w-5 h-5" />
                  <span className="font-medium">Report a Bug</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bug Report Modal */}
      <AnimatePresence>
        {isBugModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBugModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Bug className="w-5 h-5 mr-2 text-red-500" /> Report an Anomaly
                </h2>
                <button onClick={() => setIsBugModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleBugSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-red-500/50 outline-none resize-none"
                    placeholder="What went wrong?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Your Name (Optional)</label>
                  <input 
                    type="text"
                    value={bugReporter}
                    onChange={(e) => setBugReporter(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-red-500/50 outline-none"
                    placeholder="Anonymous"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmittingBug}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmittingBug ? 'Submitting...' : 'Submit Bug Report'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-zinc-800/50 p-8 md:p-12 shadow-2xl relative z-10 my-8"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          <img src={branding.logoPath} alt="Logo" className="h-12 mb-6 opacity-90 invert mix-blend-screen" onError={(e) => e.currentTarget.style.display = 'none'} />
          <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">{branding.eventName}</h1>
          <p className="text-zinc-400 text-lg">{branding.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q) => (
            <div key={q.id} className={q.type === 'star' || q.type === 'checkbox' ? '' : 'space-y-2'}>
              {q.type !== 'star' && q.type !== 'checkbox' && (
                <label className="text-sm font-medium text-zinc-300 uppercase tracking-wider">{q.label}</label>
              )}
              {renderField(q)}
            </div>
          ))}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full relative group flex items-center justify-center space-x-2 bg-white text-black font-bold text-lg py-4 px-8 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span>{isSubmitting ? 'Sending...' : 'Submit Feedback'}</span>
            {!isSubmitting && <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
          </button>
        </form>
      </motion.div>
      
      <div className="relative z-10 text-zinc-500 text-sm pb-8">{branding.footerText}</div>
    </main>
  );
}
