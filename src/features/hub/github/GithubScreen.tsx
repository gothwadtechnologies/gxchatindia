import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Plus, 
  Search, 
  ExternalLink, 
  Star, 
  GitFork, 
  Lock, 
  Globe,
  RefreshCw,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SettingHeader from '../../../components/layout/SettingHeader.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../../services/StorageService.ts';
import { Button, Card, Input } from '../../../components/ui';

export default function GithubScreen() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = storage.getItem('github_token');
    if (token) {
      setIsConnected(true);
      fetchRepos(token);
    }
  }, []);

  const fetchRepos = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRepos(data);
      } else {
        // Token might be invalid
        storage.removeItem('github_token');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error fetching repos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // For now, we'll use a prompt to get the token as a simple way to "connect"
    // In a real app, this would be an OAuth flow.
    const token = window.prompt('Please enter your GitHub Personal Access Token (with repo scope):');
    if (token) {
      storage.setItem('github_token', token);
      setIsConnected(true);
      fetchRepos(token);
    }
  };

  const handleDisconnect = () => {
    storage.removeItem('github_token');
    setIsConnected(false);
    setRepos([]);
  };

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] font-sans overflow-hidden">
      <SettingHeader 
        title="GitHub" 
        rightElement={
          isConnected && (
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleDisconnect}
              className="text-red-500 hover:bg-red-500/10"
              icon={LogOut}
            />
          )
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl mb-8">
              <Github size={48} />
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mb-3">Connect GitHub</h2>
            <p className="text-[var(--text-secondary)] font-medium mb-8 leading-relaxed">
              Connect your GitHub account to manage your repositories, upload files, and more directly from GxChat.
            </p>
            <Button 
              onClick={handleConnect}
              icon={Github}
              fullWidth
              className="max-w-xs bg-zinc-900"
            >
              Connect with GitHub
            </Button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Search Bar */}
            <Input 
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />

            {/* Repos List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Your Repositories</h3>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => fetchRepos(storage.getItem('github_token') || '')}
                  className="text-[var(--primary)]"
                  icon={RefreshCw}
                  loading={loading && repos.length > 0}
                />
              </div>

              {loading && repos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Fetching Repositories...</p>
                </div>
              ) : filteredRepos.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {filteredRepos.map((repo) => (
                    <Card
                      key={repo.id}
                      hoverable
                      onClick={() => navigate(`/hub/github/repo/${repo.owner.login}/${repo.name}`)}
                      className="group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-900">
                            {repo.private ? <Lock size={18} /> : <Globe size={18} />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[15px] font-black text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
                              {repo.name}
                            </h4>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                              {repo.owner.login}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors" />
                      </div>

                      {repo.description && (
                        <p className="text-xs text-[var(--text-secondary)] font-medium mb-4 line-clamp-2 leading-relaxed">
                          {repo.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)]">
                          <Star size={14} className="text-amber-500" />
                          {repo.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)]">
                          <GitFork size={14} className="text-blue-500" />
                          {repo.forks_count}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)] ml-auto">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          {repo.language || 'Mixed'}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                  <div className="w-16 h-16 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center text-[var(--text-secondary)] mb-4">
                    <Search size={32} />
                  </div>
                  <p className="text-sm font-bold text-[var(--text-secondary)]">No repositories found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
