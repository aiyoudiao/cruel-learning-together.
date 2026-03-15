import { useState, useEffect } from 'react';
import { GitHubAPI, type GitHubConfig } from './githubApi';
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
  latestCheckins: Array<{
    date: string;
    username: string;
    category: string;
    content_md: string;
    tags: string[];
    timestamp: string;
  }>;
  users: Record<string, UserStats>;
  generatedAt?: string;
}

// 映射分类名称到中文
const CATEGORY_MAP: Record<string, string> = {
  'AI': '人工智能',
  'Frontend': '前端开发',
  'English': '英语学习',
  'Math': '数学基础',
  'Reading': '阅读积累',
  'General': '综合学习'
};

const getCategoryName = (cat: string) => CATEGORY_MAP[cat] || cat;

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
      const jsonContent = await api.getFile('dashboard.json');
      
      if (!jsonContent) {
        throw new Error('未找到仪表盘数据 (dashboard.json 缺失)');
      }

      const parsedData = JSON.parse(jsonContent) as DashboardData;
      setData(parsedData);
    } catch (err) {
      setError(`加载数据失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-solana-primary animate-pulse font-mono">正在连接神经元网络...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-cyberpunk-pink mb-4 font-bold">{error}</p>
        <p className="text-gray-500 text-sm">请确认同步脚本已至少运行一次。</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center p-8 text-gray-400">矩阵中未发现数据痕迹。</div>;
  }

  const currentUserStats = data.users[username] || {
    username,
    totalCheckins: 0,
    currentStreak: 0,
    longestStreak: 0,
    categories: {}
  };

  // Find top category
  let topCategory = '暂无';
  let maxCount = 0;
  Object.entries(currentUserStats.categories).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topCategory = cat;
    }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UICard className="flex flex-col items-center justify-center space-y-2 border-solana-primary/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-solana-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-gray-400 text-xs font-mono tracking-wider">总打卡次数</span>
          <span className="text-4xl font-bold text-white shadow-neon-purple drop-shadow-md font-mono">
            {currentUserStats.totalCheckins}
          </span>
        </UICard>
        <UICard className="flex flex-col items-center justify-center space-y-2 border-solana-secondary/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-solana-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-gray-400 text-xs font-mono tracking-wider">当前连续天数</span>
          <span className="text-4xl font-bold text-solana-secondary font-mono">
            {currentUserStats.currentStreak} 🔥
          </span>
        </UICard>
        <UICard className="flex flex-col items-center justify-center space-y-2 border-cyberpunk-pink/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyberpunk-pink/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-gray-400 text-xs font-mono tracking-wider">最长连续天数</span>
          <span className="text-4xl font-bold text-cyberpunk-pink font-mono">
            {currentUserStats.longestStreak} ⚡
          </span>
        </UICard>
        <UICard className="flex flex-col items-center justify-center space-y-2 border-cyberpunk-yellow/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyberpunk-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-gray-400 text-xs font-mono tracking-wider">核心领域</span>
          <span className="text-2xl font-bold text-cyberpunk-yellow truncate max-w-full px-2">
            {getCategoryName(topCategory)}
          </span>
        </UICard>
      </div>

      {/* Category Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UICard>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-solana-primary rounded-full shadow-[0_0_8px_rgba(153,69,255,0.8)]"></span>
            技能树分布
          </h3>
          <div className="space-y-5">
            {Object.entries(currentUserStats.categories).length > 0 ? (
              Object.entries(currentUserStats.categories).map(([cat, count]) => (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between text-sm items-end">
                    <span className="text-gray-300 font-medium">{getCategoryName(cat)}</span>
                    <span className="text-solana-primary font-mono text-xs opacity-80">{count} 次</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-solana-primary to-cyberpunk-neon shadow-[0_0_10px_rgba(153,69,255,0.5)]"
                      style={{ width: `${Math.min((count / (currentUserStats.totalCheckins || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500 text-sm">
                <span>暂无技能数据</span>
                <span className="text-xs opacity-50 mt-1">开始第一次打卡来点亮技能树</span>
              </div>
            )}
          </div>
        </UICard>

        <UICard>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-solana-secondary rounded-full shadow-[0_0_8px_rgba(20,241,149,0.8)]"></span>
            贡献排行榜
          </h3>
          <div className="space-y-3">
            {data.leaderboard.length > 0 ? (
              data.leaderboard.slice(0, 5).map((user, index) => (
                <div key={user.username} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 hover:border-solana-primary/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className={`
                      w-6 h-6 flex items-center justify-center rounded text-xs font-bold font-mono
                      ${index === 0 ? 'bg-cyberpunk-yellow text-black shadow-[0_0_10px_rgba(253,238,14,0.5)]' : 
                        index === 1 ? 'bg-gray-300 text-black' : 
                        index === 2 ? 'bg-orange-700 text-white' : 'bg-gray-800 text-gray-400'}
                    `}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-200 group-hover:text-white transition-colors">{user.username}</span>
                  </div>
                  <div className="flex gap-4 text-xs font-mono">
                    <span className="text-solana-secondary flex items-center gap-1">
                      {user.currentStreak} <span className="opacity-50">连胜</span>
                    </span>
                    <span className="text-solana-primary flex items-center gap-1">
                      {user.totalCheckins} <span className="opacity-50">总计</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500 text-sm">
                <span>排行榜虚位以待</span>
              </div>
            )}
          </div>
        </UICard>
      </div>
      
      {/* Latest Checkins Feed */}
      <div className="mt-10">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-cyberpunk-neon rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)]"></span>
          实时动态流
        </h3>
        <div className="grid gap-4">
          {data.latestCheckins.map((checkin, idx) => (
            <UICard key={idx} className="border-l-2 border-l-cyberpunk-neon/50 hover:border-l-cyberpunk-neon transition-colors" hover={false}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-sm">{checkin.username}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                    {getCategoryName(checkin.category)}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono opacity-70">{checkin.date}</span>
              </div>
              <div className="text-gray-300 text-sm leading-relaxed line-clamp-2 pl-1 border-l-2 border-white/5">
                {checkin.content_md.replace(/[#*`]/g, '')}
              </div>
              {checkin.tags && checkin.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {checkin.tags.map(tag => (
                    <span key={tag} className="text-[10px] text-solana-primary bg-solana-primary/10 px-1.5 py-0.5 rounded opacity-80 hover:opacity-100 transition-opacity">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </UICard>
          ))}
        </div>
      </div>
    </div>
  );
}
