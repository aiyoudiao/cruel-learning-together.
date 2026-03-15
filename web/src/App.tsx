import { useState, useEffect, useCallback } from 'react';
import { GitHubAPI, type GitHubConfig } from './githubApi';
import { Dashboard } from './Dashboard';
import { RichEditor } from './editor/RichEditor';
import { createAssetUploader } from './github/uploadAsset';
import { useTheme } from './context/ThemeContext';
import { UIButton } from './components/ui/UIButton';
import { UICard } from './components/ui/UICard';
import { UIInput } from './components/ui/UIInput';
import { useLocalDraft } from './hooks/useLocalDraft';
import { useGitHubConfig } from './hooks/useGitHubConfig';
import './App.css';

// 映射分类名称到中文
const CATEGORY_MAP: Record<string, string> = {
  'AI': '人工智能',
  'Frontend': '前端开发',
  'English': '英语学习',
  'Math': '数学基础',
  'Reading': '阅读积累',
  'General': '综合学习'
};

const CATEGORIES = ['AI', 'Frontend', 'English', 'Math', 'Reading'];

function App() {
  const { theme, setTheme } = useTheme();
  
  // Use config hook for persistent settings
  const { config, updateConfig } = useGitHubConfig();
  const { owner, repo, token, username } = config;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [view, setView] = useState<'checkin' | 'dashboard'>('checkin');
  const [previewMode, setPreviewMode] = useState(false);
  const [assets, setAssets] = useState<string[]>([]);
  const [draftStatus, setDraftStatus] = useState<'saved' | 'saving' | 'unsaved' | 'restored' | ''>('');

  const { saveDraft, loadDraft, clearDraft } = useLocalDraft();

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      if (draft.title) setTitle(draft.title);
      if (draft.category) setCategory(draft.category);
      if (draft.tags) setTags(draft.tags.join(', '));
      if (draft.content_md) setContent(draft.content_md);
      if (draft.assets) setAssets(draft.assets);
      setDraftStatus('restored');
      setTimeout(() => setDraftStatus(''), 3000);
    }
  }, [loadDraft]);

  // Auto-save draft
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only save if there is some content
      if (title || content || tags) {
        setDraftStatus('saving');
        const success = saveDraft({
          title,
          category,
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          content_md: content,
          assets,
          timestamp: new Date().toISOString()
        });
        setDraftStatus(success ? 'saved' : 'unsaved');
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [title, category, tags, content, assets, saveDraft]);

  // Prevent accidental unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (draftStatus === 'unsaved' || draftStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [draftStatus]);

  // Asset upload handlers
  const handleAssetUpload = useCallback(async (file: File, type: 'image' | 'video' | 'audio'): Promise<string> => {
    if (!navigator.onLine) {
      const errorMsg = '离线模式无法上传媒体文件，请连接网络后重试。';
      setMessage(errorMsg);
      throw new Error(errorMsg);
    }

    if (!owner || !repo || !token) {
      const errorMsg = '请先配置 GitHub 连接信息 (Owner, Repo, Token)';
      setMessage(errorMsg);
      throw new Error(errorMsg);
    }

    const ghConfig: GitHubConfig = { owner, repo, token };
    const uploader = createAssetUploader(ghConfig);
    try {
      let result;
      const dateStr = new Date().toISOString().split('T')[0];
      if (type === 'image') result = await uploader.uploadImage(file, dateStr);
      else if (type === 'video') result = await uploader.uploadVideo(file, dateStr);
      else result = await uploader.uploadAudio(file, dateStr);
      
      setAssets(prev => [...prev, result.url]);
      return result.url;
    } catch (error) {
      const errorMsg = `上传失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(errorMsg);
      setMessage(errorMsg);
      throw error;
    }
  }, [owner, repo, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !title || !content || !token || !owner || !repo) {
      setMessage('请填写所有必填字段 (用户名, 标题, 内容, 连接配置)');
      return;
    }

    if (!navigator.onLine) {
      setMessage('当前离线。草稿已保存，请联网后提交。');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const ghConfig: GitHubConfig = { owner, repo, token };
      const api = new GitHubAPI(ghConfig);
      
      const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
      
      await api.submitCheckin(
        username, 
        title,
        category, 
        content, 
        assets,
        tagList, 
        ''
      );
      
      setMessage('学习打卡铸造成功！');
      // Clear form and draft
      setTitle('');
      setContent('');
      setTags('');
      setAssets([]);
      clearDraft();
      setDraftStatus('');
    } catch (error) {
      setMessage(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const ghConfig: GitHubConfig | null = (token && owner && repo) 
    ? { owner, repo, token } 
    : null;

  const toggleTheme = () => {
    const themes: ('solana' | 'cyberpunk' | 'dark' | 'light')[] = ['solana', 'cyberpunk', 'dark', 'light'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors duration-500 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center py-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-solana-primary to-solana-secondary animate-pulse-slow tracking-tight">
              GitHub 学习操作系统
            </h1>
            <p className="text-gray-500 mt-2 font-mono text-xs md:text-sm tracking-wide">v4.0 // 持久化系统已激活</p>
          </div>
          <UIButton variant="outline" size="sm" onClick={toggleTheme} className="font-mono text-xs">
            主题: {theme}
          </UIButton>
        </header>

        {/* Config Section */}
        <UICard className="space-y-4">
          <h2 className="text-lg font-bold text-solana-primary mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-solana-primary rounded-full"/>
            连接配置
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UIInput
              label="仓库所有者 (Owner)"
              placeholder="github-username"
              value={owner}
              onChange={(e) => updateConfig({ owner: e.target.value })}
            />
            <UIInput
              label="仓库名称 (Repo)"
              placeholder="study-tracker"
              value={repo}
              onChange={(e) => updateConfig({ repo: e.target.value })}
            />
            <UIInput
              label="访问令牌 (Token)"
              type="password"
              placeholder="ghp_..."
              value={token}
              onChange={(e) => updateConfig({ token: e.target.value })}
            />
          </div>
        </UICard>

        {/* Navigation */}
        <div className="flex gap-4 border-b border-white/10 pb-1">
          <UIButton 
            variant={view === 'checkin' ? 'primary' : 'ghost'} 
            onClick={() => setView('checkin')}
            glow={view === 'checkin'}
            className="rounded-b-none border-b-2 border-transparent hover:border-solana-primary"
          >
            打卡登记
          </UIButton>
          <UIButton 
            variant={view === 'dashboard' ? 'primary' : 'ghost'} 
            onClick={() => setView('dashboard')}
            disabled={!ghConfig || !username}
            glow={view === 'dashboard'}
            className="rounded-b-none border-b-2 border-transparent hover:border-solana-primary"
          >
            数据仪表盘
          </UIButton>
        </div>

        {/* Main Content */}
        {view === 'checkin' && (
          <div className="space-y-6 animate-fade-in">
            <UICard>
              {/* Draft Status Indicator */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  {draftStatus && (
                    <span className={`text-[10px] font-mono px-2 py-1 rounded border uppercase tracking-wider ${
                      draftStatus === 'saved' ? 'text-solana-secondary border-solana-secondary/50 bg-solana-secondary/10' :
                      draftStatus === 'saving' ? 'text-cyberpunk-yellow border-cyberpunk-yellow/50 bg-cyberpunk-yellow/10' :
                      draftStatus === 'restored' ? 'text-cyberpunk-neon border-cyberpunk-neon/50 bg-cyberpunk-neon/10' :
                      'text-gray-400 border-gray-600'
                    }`}>
                      {draftStatus === 'saved' && '草稿已保存'}
                      {draftStatus === 'saving' && '正在保存...'}
                      {draftStatus === 'restored' && '草稿已恢复'}
                      {draftStatus === 'unsaved' && '有未保存更改'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => saveDraft({
                    title, category, tags: tags.split(','), content_md: content, assets, timestamp: new Date().toISOString()
                  }) && setDraftStatus('saved')}
                  className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span className="w-2 h-2 rounded-full bg-gray-500 hover:bg-white"></span>
                  强制保存
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <UIInput
                    label="GitHub 用户名"
                    value={username}
                    onChange={(e) => updateConfig({ username: e.target.value })}
                    placeholder="输入你的 GitHub 用户名"
                    required
                  />
                  <UIInput
                    label="学习主题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="今天学习了什么？"
                    required
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">分类领域</label>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300
                          ${category === cat 
                            ? 'bg-solana-primary text-white shadow-neon-purple transform scale-105' 
                            : 'bg-solana-surface/50 text-gray-400 hover:text-white hover:bg-solana-surface'}
                        `}
                      >
                        {CATEGORY_MAP[cat] || cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">详细内容</label>
                    <button
                      type="button"
                      onClick={() => setPreviewMode(!previewMode)}
                      className="text-xs text-solana-secondary hover:text-white transition-colors font-mono"
                    >
                      {previewMode ? '[切换编辑模式]' : '[切换预览模式]'}
                    </button>
                  </div>
                  
                  {previewMode ? (
                    <div 
                      className="min-h-[300px] p-6 bg-solana-surface/30 rounded-xl border border-white/10 prose prose-invert max-w-none shadow-inner"
                      dangerouslySetInnerHTML={{ __html: content }} 
                    />
                  ) : (
                    <div className="border border-white/10 rounded-xl overflow-hidden shadow-lg bg-black/20">
                      <RichEditor
                        content={content}
                        onChange={setContent}
                        onImageUpload={(f) => handleAssetUpload(f, 'image')}
                        onVideoUpload={(f) => handleAssetUpload(f, 'video')}
                        onAudioUpload={(f) => handleAssetUpload(f, 'audio')}
                        placeholder="记录你的学习历程..."
                      />
                    </div>
                  )}
                </div>

                <UIInput
                  label="标签 (逗号分隔)"
                  placeholder="react, typescript, design"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />

                <div className="pt-6 border-t border-white/5">
                  <UIButton 
                    type="submit" 
                    className="w-full py-4 text-lg" 
                    disabled={loading}
                    glow
                  >
                    {loading ? '正在铸造打卡记录...' : '铸造学习打卡'}
                  </UIButton>
                </div>

                {message && (
                  <div className={`p-4 rounded-lg text-center font-bold animate-fade-in ${
                    message.includes('错误') || message.includes('离线') || message.includes('失败') || message.includes('配置')
                      ? 'bg-red-500/10 text-red-500 border border-red-500/30' 
                      : 'bg-solana-secondary/10 text-solana-secondary border border-solana-secondary/30'
                  }`}>
                    {message}
                  </div>
                )}
              </form>
            </UICard>
          </div>
        )}

        {view === 'dashboard' && ghConfig && username && (
          <Dashboard config={ghConfig} username={username} />
        )}
      </div>
    </div>
  );
}

export default App;
