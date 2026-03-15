const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
}

export interface UploadResult {
  url: string;
  filename: string;
  path: string;
}

export class AssetUploader {
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  private getHeaders() {
    return {
      'Authorization': `token ${this.config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  private generateFileName(date: string, extension: string): string {
    const randomId = Math.random().toString(36).substring(2, 14);
    return `${date}-${randomId}.${extension}`;
  }

  private getAssetType(file: File): 'images' | 'videos' | 'audio' | 'files' {
    const mimeType = file.type;
    
    if (mimeType.startsWith('image/')) {
      return 'images';
    } else if (mimeType.startsWith('video/')) {
      return 'videos';
    } else if (mimeType.startsWith('audio/')) {
      return 'audio';
    } else {
      return 'files';
    }
  }

  private getFileExtension(file: File): string {
    const fileName = file.name;
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : '';
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async uploadAsset(file: File, date: string): Promise<UploadResult> {
    try {
      const assetType = this.getAssetType(file);
      const extension = this.getFileExtension(file);
      const fileName = this.generateFileName(date, extension);
      const path = `assets/${assetType}/${fileName}`;

      const base64 = await this.fileToBase64(file);

      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({
            message: `Upload ${assetType}/${fileName}`,
            content: base64,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`上传失败: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      const downloadUrl = data.content.download_url;

      return {
        url: downloadUrl,
        filename: fileName,
        path: path,
      };
    } catch (error) {
      console.error('上传资源失败:', error);
      throw error;
    }
  }

  async uploadImage(file: File, date: string): Promise<UploadResult> {
    if (!file.type.startsWith('image/')) {
      throw new Error('文件不是图片类型');
    }
    return this.uploadAsset(file, date);
  }

  async uploadVideo(file: File, date: string): Promise<UploadResult> {
    if (!file.type.startsWith('video/')) {
      throw new Error('文件不是视频类型');
    }
    return this.uploadAsset(file, date);
  }

  async uploadAudio(file: File, date: string): Promise<UploadResult> {
    if (!file.type.startsWith('audio/')) {
      throw new Error('文件不是音频类型');
    }
    return this.uploadAsset(file, date);
  }

  async uploadFile(file: File, date: string): Promise<UploadResult> {
    return this.uploadAsset(file, date);
  }

  validateFileSize(file: File, maxSize: number = 25 * 1024 * 1024): boolean {
    return file.size <= maxSize;
  }

  getFileSizeMB(file: File): number {
    return file.size / (1024 * 1024);
  }
}

export function createAssetUploader(config: GitHubConfig): AssetUploader {
  return new AssetUploader(config);
}
