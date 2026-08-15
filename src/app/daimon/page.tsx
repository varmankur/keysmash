'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, Shield, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Bug {
  id: string;
  description: string;
  reporter: string | null;
  createdAt: string;
}

export default function DaimonDashboard() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      const res = await fetch('/api/daimon/bugs');
      if (res.ok) {
        const data = await res.json();
        setBugs(data.bugs);
      }
    } catch (error) {
      console.error('Failed to fetch bugs');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-red-500"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-4 md:p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-red-900/50 pb-6">
          <div className="flex items-center space-x-4">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-red-500">DAIMON OVERWATCH</h1>
              <p className="text-zinc-500 text-xs uppercase">System Status & Anomaly Reports</p>
            </div>
          </div>
          
          <Link 
            href="/admin"
            className="mt-4 md:mt-0 flex items-center space-x-2 text-zinc-400 hover:text-white bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded transition-colors text-sm"
          >
            <Shield className="w-4 h-4" />
            <span>Standard Admin Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bug Reports Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
            Active Bug Reports
          </h2>
          
          <div className="bg-zinc-950 border border-zinc-900 rounded overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-500">
                  <th className="p-4 font-normal">Timestamp</th>
                  <th className="p-4 font-normal">Reporter</th>
                  <th className="p-4 font-normal">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {bugs.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-zinc-700">No anomalies detected.</td></tr>
                ) : bugs.map((bug) => (
                  <tr key={bug.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4 whitespace-nowrap text-zinc-500">
                      {new Date(bug.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-medium text-red-400">
                      {bug.reporter || 'Anonymous'}
                    </td>
                    <td className="p-4 text-zinc-300">
                      {bug.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
