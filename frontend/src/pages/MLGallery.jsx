import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Image as ImageIcon } from 'lucide-react';

export default function MLGallery() {
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/figures-list')
      .then(res => {
        setFigures(res.data.figures || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Group figures by directory (e.g., phase1, phase2)
  const groupedFigures = figures.reduce((acc, fig) => {
    const parts = fig.split('/');
    const folder = parts.length > 1 ? parts[0] : 'General';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(fig);
    return acc;
  }, {});

  // Sort groups: General first, then phase1, phase2...
  const sortedFolders = Object.keys(groupedFigures).sort((a, b) => {
    if (a === 'General') return -1;
    if (b === 'General') return 1;
    const numA = parseInt(a.replace('phase', '')) || 0;
    const numB = parseInt(b.replace('phase', '')) || 0;
    return numA - numB;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">ML Figures Library</h1>
        <p className="text-slate-400">All graphs and visualizations generated during the ML pipeline training phases.</p>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-500">
          Loading figures... (ensure backend is running)
        </div>
      ) : (
        <div className="space-y-12">
          {sortedFolders.map(folder => (
            <div key={folder} className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/30 shadow-sm">
              <h2 className="text-xl font-semibold text-white mb-6 capitalize flex items-center gap-2 border-b border-slate-700/50 pb-2">
                <ImageIcon size={20} className="text-indigo-400" />
                {folder.replace(/_/g, ' ')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedFigures[folder].map((fig, idx) => (
                  <div key={idx} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50 shadow-lg group">
                    <div className="p-2 bg-slate-800/80 border-b border-slate-700/50 text-xs font-medium text-slate-300 truncate">
                      {fig.split('/').pop()}
                    </div>
                    <div className="aspect-[4/3] w-full overflow-hidden bg-white/5 flex items-center justify-center p-2">
                      <img 
                        src={`http://localhost:8000/figures/${fig}`} 
                        alt={fig}
                        className="max-h-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-105"
                        onClick={() => window.open(`http://localhost:8000/figures/${fig}`, '_blank')}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {figures.length === 0 && (
            <div className="text-slate-400 p-8 text-center bg-slate-800/20 rounded-xl border border-slate-700/30">
              No figures found in the ML reports directory.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
