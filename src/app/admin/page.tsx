'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, ArrowRight, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';

interface FormSummary {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  _count: {
    feedbacks: number;
  };
}

export default function AdminFormsDashboard() {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await fetch('/api/admin/forms');
      if (res.ok) {
        const data = await res.json();
        setForms(data.forms);
      }
    } catch (error) {
      console.error('Failed to fetch forms');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col">
      <div className="max-w-6xl mx-auto space-y-8 flex-grow w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold">Forms Dashboard</h1>
            <p className="text-zinc-400 text-sm">Manage your event forms and view submissions</p>
          </div>
          <Link 
            href="/admin/forms/new"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl transition-colors font-medium mt-4 md:mt-0"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Form</span>
          </Link>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-2xl">
              <LayoutTemplate className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400">You haven't created any forms yet.</p>
              <Link href="/admin/forms/new" className="text-blue-500 hover:underline mt-2 inline-block">Create your first form</Link>
            </div>
          ) : forms.map(form => (
            <Link key={form.id} href={`/admin/forms/${form.id}`} className="group block bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 p-6 rounded-2xl transition-all hover:bg-zinc-900/50">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">{form.title}</h2>
                <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-mono text-zinc-500 bg-black/50 px-2 py-1 rounded inline-block">/{form.slug}</div>
                <div className="flex justify-between items-center text-sm text-zinc-400 mt-4 pt-4 border-t border-zinc-800">
                  <span>{form._count.feedbacks} responses</span>
                  <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
