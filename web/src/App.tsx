import { useState } from 'react';
import { GitHubAPI, type GitHubConfig } from './githubApi';
import { Dashboard } from './Dashboard';
import { RichEditor } from './editor/RichEditor';
import { createAssetUploader } from './github/uploadAsset';
import { useTheme } from './context/ThemeContext';
import { UIButton } from './components/ui/UIButton';
import { UICard } from './components/ui/UICard';
import { UIInput } from './components/ui/UIInput';
import './App.css';

const CATEGORIES = ['AI', 'Frontend', 'English', 'Math', 'Reading'];

function App() {
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [view, setView] = useState<'checkin' | 'dashboard'>('checkin');
  const [previewMode, setPreviewMode] = useState(false);

  // Asset upload handlers
  const handleImageUpload = async (file: File): Promise<string> => {
    const config: GitHubConfig = { owner, repo, token };
    const uploader = createAssetUploader(config);
    const result = await uploader.uploadImage(file, new Date().toISOString().split('T')[0]);
    return result.url;
  };

  const handleVideoUpload = async (file: File): Promise<string> => {
    const config: GitHubConfig = { owner, repo, token };
    const uploader = createAssetUploader(config);
    const result = await uploader.uploadVideo(file, new Date().toISOString().split('T')[0]);
    return result.url;
  };

  const handleAudioUpload = async (file: File): Promise<string> => {
    const config: GitHubConfig = { owner, repo, token };
    const uploader = createAssetUploader(config);
    const result = await uploader.uploadAudio(file, new Date().toISOString().split('T')[0]);
    return result.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !content || !token || !owner || !repo) {
      setMessage('请填写所有必填字段');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const config: GitHubConfig = { owner, repo, token };
      const api = new GitHubAPI(config);
      
      const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
      
      // We pass empty assets array here because assets are already uploaded and embedded in content
      await api.submitCheckin(
        username, 
        category, 
        content, 
        [], // assets are in content
        tagList, 
        ''
      );
      
      setMessage('打卡成功！');
      setContent('');
      setTags('');
    } catch (error) {
      setMessage(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const config: GitHubConfig | null = (token && owner && repo) 
    ? { owner, repo, token } 
    : null;

  const toggleTheme = () => {
    const themes: ('solana' | 'cyberpunk' | 'dark' | 'light')[] = ['solana', 'cyberpunk', 'dark', 'light'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-solana-primary to-solana-secondary animate-pulse-slow">
              GitHub Study Tracker
            </h1>
            <p className="text-gray-500 mt-2 font-mono text-sm">v3.0 // Web3 Edition</p>
          </div>
          <UIButton variant="outline" size="sm" onClick={toggleTheme}>
            Theme: {theme}
          </UIButton>
        </header>

        {/* Config Section */}
        <UICard className="space-y-4">
          <h2 className="text-xl font-bold text-solana-primary mb-4">Connection</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UIInput
              label="Owner"
              placeholder="github-username"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
            <UIInput
              label="Repository"
              placeholder="study-tracker"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
            />
            <UIInput
              label="Token"
              type="password"
              placeholder="ghp_..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
        </UICard>

        {/* Navigation */}
        <div className="flex gap-4">
          <UIButton 
            variant={view === 'checkin' ? 'primary' : 'ghost'} 
            onClick={() => setView('checkin')}
            glow={view === 'checkin'}
          >
            Check-in
          </UIButton>
          <UIButton 
            variant={view === 'dashboard' ? 'primary' : 'ghost'} 
            onClick={() => setView('dashboard')}
            disabled={!config || !username}
            glow={view === 'dashboard'}
          >
            Dashboard
          </UIButton>
        </div>

        {/* Main Content */}
        {view === 'checkin' && (
          <div className="space-y-6 animate-fade-in">
            <UICard>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UIInput
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your GitHub username"
                    required
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`
                            px-4 py-2 rounded-lg text-sm font-bold transition-all
                            ${category === cat 
                              ? 'bg-solana-primary text-white shadow-neon-purple' 
                              : 'bg-solana-surface/50 text-gray-500 hover:text-solana-primary'}
                          `}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-500">Content</label>
                    <button
                      type="button"
                      onClick={() => setPreviewMode(!previewMode)}
                      className="text-xs text-solana-secondary hover:underline"
                    >
                      {previewMode ? 'Edit Mode' : 'Preview Mode'}
                    </button>
                  </div>
                  
                  {previewMode ? (
                    <div 
                      className="min-h-[300px] p-4 bg-solana-surface/50 rounded-lg border border-white/10 prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: content }} 
                    />
                  ) : (
                    <div className="border border-white/10 rounded-lg overflow-hidden">
                      <RichEditor
                        content={content}
                        onChange={setContent}
                        onImageUpload={handleImageUpload}
                        onVideoUpload={handleVideoUpload}
                        onAudioUpload={handleAudioUpload}
                        placeholder="What did you learn today?"
                      />
                    </div>
                  )}
                </div>

                <UIInput
                  label="Tags (comma separated)"
                  placeholder="react, typescript, design"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />

                <div className="pt-4">
                  <UIButton 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                    glow
                  >
                    {loading ? 'Minting Check-in...' : 'Mint Check-in'}
                  </UIButton>
                </div>

                {message && (
                  <div className={`p-4 rounded-lg text-center font-bold ${
                    message.includes('错误') 
                      ? 'bg-red-500/20 text-red-500 border border-red-500/50' 
                      : 'bg-solana-secondary/20 text-solana-secondary border border-solana-secondary/50'
                  }`}>
                    {message}
                  </div>
                )}
              </form>
            </UICard>
          </div>
        )}

        {view === 'dashboard' && config && username && (
          <Dashboard config={config} username={username} />
        )}
      </div>
    </div>
  );
}

export default App;
