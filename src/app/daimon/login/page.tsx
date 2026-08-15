'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function DaimonLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/daimon/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/daimon');
      } else {
        setError('Invalid credentials.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-zinc-950 p-8 rounded-xl border border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.15)]"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-red-500 tracking-widest">SYSTEM OVERRIDE</h1>
          <p className="text-zinc-600 text-xs mt-1 uppercase">Daimon Level Access Required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-red-400 focus:outline-none focus:border-red-500 transition-colors font-mono placeholder:text-zinc-800"
              placeholder="IDENTIFIER"
            />
          </div>
          
          <div className="space-y-2">
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-red-400 focus:outline-none focus:border-red-500 transition-colors font-mono placeholder:text-zinc-800"
              placeholder="PASSPHRASE"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-mono text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-red-950/50 border border-red-900 text-red-500 font-mono text-sm py-3 rounded hover:bg-red-900/50 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'VERIFYING...' : 'INITIALIZE'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
