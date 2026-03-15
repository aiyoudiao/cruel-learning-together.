import { useState, useEffect } from 'react';
import { GitHubAPI, type GitHubConfig, type CheckinData } from './githubApi';
import { UICard } from './components/ui/UICard';

interface UserStats {
  username: string;
  totalCheckins: number;
  currentStreak: number;
  longestStreak: number;
  categories: Record<string, number>;
}

interface DashboardData {
  leaderboard: UserStats[];
  latestCheckins: CheckinData[];
  userStats: UserStats | null;
}

export function Dashboard({ config, username }: { config: GitHubConfig; username: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [config, username]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const api = new GitHubAPI(config);
      const readmeContent = await api.getFile('README.md');
      const parsedData = await parseReadmeData(readmeContent || '');
      setData(parsedData);
    } catch (err) {
      setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Mock parser for now since the real data logic will be in sync.py
  // In a real app, this might fetch a generated stats.json file
  const parseReadmeData = (_content: string): DashboardData => {
    // This is a placeholder. The real logic relies on sync.py generating a JSON or structured README
    // For now, let's try to extract some basic info if possible, or return mock data for UI testing
    
    // In V3, we should probably fetch a `stats/dashboard.json` if we were fully implementing the backend part
    // But sticking to the requirement, let's parse what we can or mock it to show the UI
    
    return {
      leaderboard: [
        { username: 'zakj', totalCheckins: 42, currentStreak: 5, longestStreak: 12, categories: { AI: 20, Frontend: 15, English: 7 } },
        { username: 'alice', totalCheckins: 30, currentStreak: 2, longestStreak: 8, categories: { AI: 5, Frontend: 20, Math: 5 } },
        { username: 'bob', totalCheckins: 15, currentStreak: 0, longestStreak: 5, categories: { Reading: 15 } },
      ],
      latestCheckins: [],
      userStats: {
        username: username,
        totalCheckins: 42,
        currentStreak: 5,
        longestStreak: 12,
        categories: { AI: 20, Frontend: 15, English: 7 }
      }
    };
  };

  if (loading) {
    return <div className="text-center p-8 text-solana-primary animate-pulse">Loading neural stats...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-cyberpunk-pink">{error}</div>;
  }

  if (!data) {
    return <div className="text-center p-8 text-gray-400">No data found in the matrix.</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UICard className="flex flex-col items-center justify-center space-y-2 border-solana-primary/30">
          <span className="text-gray-400 text-sm font-mono">TOTAL MINTS</span>
          <span className="text-4xl font-bold text-white shadow-neon-purple drop-shadow-md">
            {data.userStats?.totalCheckins || 0}
          </span>
        </UICard>
        <UICard className="flex flex-col items-center justify-center space-y-2 border-solana-secondary/30">
          <span className="text-gray-400 text-sm font-mono">CURRENT STREAK</span>
          <span className="text-4xl font-bold text-solana-secondary">
            {data.userStats?.currentStreak || 0} 🔥
          </span>
        </UICard>
        <UICard className="flex flex-col items-center justify-center space-y-2 border-cyberpunk-pink/30">
          <span className="text-gray-400 text-sm font-mono">LONGEST STREAK</span>
          <span className="text-4xl font-bold text-cyberpunk-pink">
            {data.userStats?.longestStreak || 0} ⚡
          </span>
        </UICard>
        <UICard className="flex flex-col items-center justify-center space-y-2 border-cyberpunk-yellow/30">
          <span className="text-gray-400 text-sm font-mono">TOP CATEGORY</span>
          <span className="text-2xl font-bold text-cyberpunk-yellow">
            AI
          </span>
        </UICard>
      </div>

      {/* Category Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UICard>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-solana-primary rounded-full"></span>
            Category Mastery
          </h3>
          <div className="space-y-4">
            {Object.entries(data.userStats?.categories || {}).map(([cat, count]) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{cat}</span>
                  <span className="text-solana-primary font-mono">{count}</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-solana-primary to-cyberpunk-neon"
                    style={{ width: `${Math.min((count / (data.userStats?.totalCheckins || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </UICard>

        <UICard>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-solana-secondary rounded-full"></span>
            Leaderboard
          </h3>
          <div className="space-y-4">
            {data.leaderboard.slice(0, 5).map((user, index) => (
              <div key={user.username} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`
                    w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                    ${index === 0 ? 'bg-cyberpunk-yellow text-black' : 
                      index === 1 ? 'bg-gray-300 text-black' : 
                      index === 2 ? 'bg-orange-700 text-white' : 'bg-gray-700 text-gray-300'}
                  `}>
                    {index + 1}
                  </span>
                  <span className="font-medium text-white">{user.username}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-solana-secondary font-mono">{user.currentStreak}🔥</span>
                  <span className="text-solana-primary font-mono">{user.totalCheckins}💎</span>
                </div>
              </div>
            ))}
          </div>
        </UICard>
      </div>
    </div>
  );
}
