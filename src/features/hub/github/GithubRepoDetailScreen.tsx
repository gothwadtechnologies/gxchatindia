import React, { useState, useEffect } from 'react';
import { 
  Github, 
  ArrowLeft, 
  Upload, 
  FileArchive, 
  File, 
  Folder, 
  ExternalLink, 
  Star, 
  GitFork, 
  Lock, 
  Globe,
  Plus,
  ChevronRight,
  MoreVertical,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import SettingHeader from '../../../components/layout/SettingHeader.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../../services/StorageService.ts';

export default function GithubRepoDetailScreen() {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  const [repoData, setRepoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  useEffect(() => {
    const token = storage.getItem('github_token');
    if (!token) {
      navigate('/hub/github');
      return;
    }
    fetchRepoDetails(token);
  }, [owner, repo]);

  const fetchRepoDetails = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRepoData(data);
      } else {
        console.error('Error fetching repo details:', response.status);
      }
    } catch (error) {
      console.error('Error fetching repo details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[var(--bg-main)] font-sans">
        <SettingHeader title="Repository" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Loading Repository...</p>
        </div>
      </div>
    );
  }

  if (!repoData) {
    return (
      <div className="flex flex-col h-full bg-[var(--bg-main)] font-sans">
        <SettingHeader title="Error" />
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-black text-[var(--text-primary)] mb-2">Repository Not Found</h2>
          <p className="text-sm text-[var(--text-secondary)] font-medium mb-6">We couldn't find the repository you're looking for.</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-bold shadow-lg shadow-[var(--primary-shadow)]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] font-sans overflow-hidden">
      <SettingHeader 
        title={repoData.name} 
        rightElement={
          <button 
            onClick={() => window.open(repoData.html_url, '_blank')}
            className="p-2 hover:bg-[var(--primary)]/10 rounded-full text-[var(--primary)] transition-colors"
          >
            <ExternalLink size={20} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Repo Header Card */}
        <div className="p-6 bg-gradient-to-b from-[var(--primary)]/5 to-transparent border-b border-[var(--border-color)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center text-white shadow-xl">
              {repoData.private ? <Lock size={32} /> : <Globe size={32} />}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight truncate">{repoData.name}</h2>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">{repoData.owner.login}</p>
            </div>
          </div>

          {repoData.description && (
            <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed mb-6 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)]">
              {repoData.description}
            </p>
          )}

          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star size={16} fill="currentColor" />
                <span className="text-sm font-black text-[var(--text-primary)]">{repoData.stargazers_count}</span>
              </div>
              <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Stars</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-blue-500">
                <GitFork size={16} fill="currentColor" />
                <span className="text-sm font-black text-[var(--text-primary)]">{repoData.forks_count}</span>
              </div>
              <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Forks</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-emerald-500">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-sm font-black text-[var(--text-primary)]">{repoData.language || 'Mixed'}</span>
              </div>
              <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Language</span>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Actions</h3>
            <div className="h-[1px] flex-1 bg-[var(--border-color)] ml-4 opacity-50"></div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUploadMenu(true)}
              className="w-full bg-[var(--primary)] text-white p-5 rounded-3xl font-black flex items-center justify-between shadow-xl shadow-[var(--primary-shadow)] active:scale-95 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Upload size={20} />
                </div>
                <div className="text-left">
                  <span className="block text-[15px]">Upload Content</span>
                  <span className="block text-[10px] opacity-70 font-bold uppercase tracking-wider">Push to repository</span>
                </div>
              </div>
              <Plus size={20} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Upload Menu Bottom Sheet */}
      <AnimatePresence>
        {showUploadMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[var(--bg-main)] rounded-t-[3rem] z-[101] p-8 shadow-2xl border-t border-[var(--border-color)]"
            >
              <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full mx-auto mb-8 opacity-50" />
              
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Upload to Repo</h3>
                <button 
                  onClick={() => setShowUploadMenu(false)}
                  className="p-2 hover:bg-[var(--bg-card)] rounded-full text-[var(--text-secondary)] transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-full p-6 bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] flex items-center gap-5 group hover:border-[var(--primary)]/30 transition-all"
                >
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <File size={28} />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="text-[17px] font-black text-[var(--text-primary)] mb-1">Upload Files</h4>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">Select and upload individual files</p>
                  </div>
                  <ChevronRight size={20} className="text-[var(--text-secondary)]" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-full p-6 bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] flex items-center gap-5 group hover:border-[var(--primary)]/30 transition-all"
                >
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <FileArchive size={28} />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="text-[17px] font-black text-[var(--text-primary)] mb-1">Upload via ZIP</h4>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">Extract and push ZIP contents</p>
                  </div>
                  <ChevronRight size={20} className="text-[var(--text-secondary)]" />
                </motion.button>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
                <p className="text-[10px] text-[var(--text-secondary)] font-bold text-center uppercase tracking-[0.2em] opacity-50">
                  Powered by GitHub API v3
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
