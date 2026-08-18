import Link from 'next/link';
import { KeyRound, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)]">
            <KeyRound className="w-10 h-10" />
          </div>
        </div>
        
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Key Smash
        </h1>
        
        <p className="text-zinc-400 text-lg">
          The ultimate self-hosted, multi-tenant form builder and feedback engine.
        </p>

        <Link 
          href="/auth/login"
          className="inline-flex items-center space-x-2 bg-white text-black font-semibold px-8 py-4 rounded-2xl hover:bg-zinc-200 transition-all hover:scale-105 shadow-xl"
        >
          <span>Admin Login</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
