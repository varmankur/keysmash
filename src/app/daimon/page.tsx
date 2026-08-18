'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, Bug, Loader2, Users, Plus } from 'lucide-react';

interface BugReport {
  id: string;
  description: string;
  reporter: string | null;
  createdAt: string;
}

interface AdminUser {
  id: string;
  username: string;
  createdAt: string;
  requirePasswordChange: boolean;
}

export default function DaimonDashboard() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New admin form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bugsRes, adminsRes] = await Promise.all([
        fetch('/api/daimon/bugs'),
        fetch('/api/daimon/admins')
      ]);
      
      if (bugsRes.ok) {
        const data = await bugsRes.json();
        setBugs(data.bugs);
      }
      
      if (adminsRes.ok) {
        const data = await adminsRes.json();
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/daimon/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });
      if (res.ok) {
        setNewUsername('');
        setNewPassword('');
        fetchData();
        alert('Admin created successfully.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create admin');
      }
    } catch (error) {
      alert('Error creating admin');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-red-500"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center space-x-4 bg-red-900/20 p-6 rounded-2xl border border-red-900/50">
          <div className="bg-red-500/20 p-3 rounded-xl text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-red-500 tracking-wider uppercase">Daimon Overwatch</h1>
            <p className="text-red-500/60 text-sm font-mono">Top Secret Admin Interface</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Management Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-zinc-300">
              <Users className="w-5 h-5 text-blue-500" /> Manage Admins
            </h2>
            
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">Provision New Admin</h3>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    placeholder="Username" 
                    required
                    className="w-full bg-black border border-zinc-800 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Temporary Password" 
                    required
                    minLength={6}
                    className="w-full bg-black border border-zinc-800 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <p className="text-xs text-zinc-500 mt-1">Admin will be forced to change this upon first login.</p>
                </div>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium p-3 rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Create Admin</>}
                </button>
              </form>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-sm uppercase tracking-wider">
                    <th className="p-4 font-medium">Username</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {admins.length === 0 ? (
                    <tr><td colSpan={2} className="p-4 text-zinc-500 text-sm text-center">No admins provisioned.</td></tr>
                  ) : admins.map(admin => (
                    <tr key={admin.id} className="hover:bg-zinc-800/30">
                      <td className="p-4 text-sm font-mono text-zinc-300">{admin.username}</td>
                      <td className="p-4">
                        {admin.requirePasswordChange ? (
                          <span className="text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded">Pending Setup</span>
                        ) : (
                          <span className="text-xs bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bug Reports Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-zinc-300">
              <Bug className="w-5 h-5 text-red-500" /> Bug Reports
            </h2>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-sm uppercase tracking-wider">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Reporter</th>
                    <th className="p-4 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {bugs.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center text-zinc-500">No bugs reported. System nominal.</td></tr>
                  ) : bugs.map((bug) => (
                    <tr key={bug.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 text-sm text-zinc-400 whitespace-nowrap">
                        {new Date(bug.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-sm font-mono text-blue-400">
                        {bug.reporter || 'Anonymous'}
                      </td>
                      <td className="p-4 text-sm text-zinc-300">
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
    </div>
  );
}
