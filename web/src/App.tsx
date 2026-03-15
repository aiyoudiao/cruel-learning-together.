import { useState } from 'react';
import { GitHubAPI, type GitHubConfig } from './githubApi';
import { Dashboard } from './Dashboard';
import { RichEditor } from './editor/RichEditor';
import { createAssetUploader, type AssetUploader } from './github/uploadAsset';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [view, setView] = useState<'checkin' | 'dashboard'>('checkin');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  const handleImageUpload = async (file: File): Promise<string> => {
    const config: GitHubConfig = { owner, repo, token };
    const uploader = createAssetUploader(config);
    
    try {
      const result = await uploader.uploadImage(file, new Date().toISOString().split('T')[0]);
      return result.url;
    } catch (error) {
      throw error;
    }
  };

  const handleVideoUpload = async (file: File): Promise<string> => {
    const config: GitHubConfig = { owner, repo, token };
    const uploader = createAssetUploader(config);
    
    try {
      const result = await uploader.uploadVideo(file, new Date().toISOString().split('T')[0]);
      return result.url;
    } catch (error) {
      throw error;
    }
  };

  const handleAudioUpload = async (file: File): Promise<string> => {
    const config: GitHubConfig = { owner, repo, token };
    const uploader = createAssetUploader(config);
    
    try {
      const result = await uploader.uploadAudio(file, new Date().toISOString().split('T')[0]);
      return result.url;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !content || !token || !owner || !repo) {
      setMessage('请填写所有必填字段');
      return;
    }

    setLoading(true);
    setMessage('');
    setUploadProgress(0);

    try {
      const config: GitHubConfig = { owner, repo, token };
      const api = new GitHubAPI(config);
      
      const totalFiles = images.length;
      for (let i = 0; i < totalFiles; i++) {
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
        await api.submitCheckin(username, content, [images[i]], '');
      }
      
      setMessage('打卡成功！');
      setContent('');
      setImages([]);
      setUploadProgress(0);
    } catch (error) {
      setMessage(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const config: GitHubConfig | null = (token && owner && repo) 
    ? { owner, repo, token } 
    : null;

  return (
    <div className="app">
      <div className="container">
        <h1>学习打卡系统</h1>
        
        <div className="config-section">
          <h2>GitHub 配置</h2>
          <input
            type="text"
            placeholder="仓库所有者"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="仓库名称"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            className="input"
          />
          <input
            type="password"
            placeholder="GitHub Personal Access Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="input"
          />
        </div>

        <div className="view-tabs">
          <button 
            className={`tab-btn ${view === 'checkin' ? 'active' : ''}`}
            onClick={() => setView('checkin')}
          >
            打卡
          </button>
          <button 
            className={`tab-btn ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
            disabled={!config || !username}
          >
            统计面板
          </button>
        </div>

        {view === 'checkin' && (
          <div className="checkin-section">
            <div className="editor-section">
              <RichEditor
                content={content}
                onChange={setContent}
                onImageUpload={handleImageUpload}
                onVideoUpload={handleVideoUpload}
                onAudioUpload={handleAudioUpload}
                placeholder="开始输入你的学习内容..."
              />
            </div>

            <div className="preview-toggle">
              <button 
                className={`preview-btn ${previewMode ? 'active' : ''}`}
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? '编辑模式' : '预览模式'}
              </button>
            </div>

            {previewMode && (
              <div className="preview-content">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="checkin-form">
              <div className="form-group">
                <label>GitHub 用户名 *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="输入你的 GitHub 用户名"
                  required
                />
              </div>

              <div className="form-group">
                <label>上传图片</label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) {
                      setImages(Array.from(e.target.files));
                    }
                  }}
                  className="input"
                  accept="image/*"
                  multiple
                />
                {images.length > 0 && (
                  <div className="image-preview">
                    {images.map((img, index) => (
                      <div key={index} className="image-item">
                        {img.name}
                      <button 
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                        className="remove-btn"
                      >
                        ×
                      </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '提交中...' : '提交打卡'}
              </button>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">{uploadProgress}%</div>
                </div>
              )}

              {message && (
                <div className={`message ${message.includes('错误') ? 'error' : 'success'}`}>
                  {message}
                </div>
              )}
            </form>
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
