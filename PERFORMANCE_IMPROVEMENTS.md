# 性能改进说明

## 资源去重

### 实现原理

避免重复上传相同的文件，节省存储空间和上传时间。

### 实现方案

```typescript
class AssetDeduplicator {
  private cache: Map<string, string> = new Map();
  private hashCache: Map<string, string> = new Map();

  async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async getOrUpload(file: File, uploadFn: (file: File) => Promise<string>): Promise<string> {
    const hash = await this.generateFileHash(file);
    
    if (this.cache.has(hash)) {
      console.log('文件已存在，使用缓存:', hash);
      return this.cache.get(hash)!;
    }
    
    const url = await uploadFn(file);
    this.cache.set(hash, url);
    return url;
  }

  clearCache() {
    this.cache.clear();
    this.hashCache.clear();
  }
}

// 使用示例
const deduplicator = new AssetDeduplicator();

const uploadWithDeduplication = async (file: File) => {
  return deduplicator.getOrUpload(file, async (f) => {
    return uploader.uploadAsset(f, date);
  });
};
```

### 优势

1. **节省存储空间**：避免重复文件占用空间
2. **提高上传速度**：已存在的文件无需重新上传
3. **减少 API 调用**：降低 GitHub API 使用量
4. **提升用户体验**：减少等待时间

## 懒加载图片

### 实现原理

只在图片进入视口时才加载，减少初始页面加载时间。

### 实现方案

```typescript
import { useEffect, useRef, useState } from 'react';

function LazyImage({ src, alt, ...props }: ImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setImageSrc(src);
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      loading="lazy"
      {...props}
      style={{
        ...props.style,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
}

// 在 Markdown 渲染中使用
function MarkdownRenderer({ content }: { content: string }) {
  const renderImage = (src: string, alt: string) => {
    return <LazyImage src={src} alt={alt} />;
  };

  return <Markdown content={content} components={{ img: renderImage }} />;
}
```

### 优势

1. **减少初始加载时间**：只加载可见区域的图片
2. **节省带宽**：用户不滚动到图片就不加载
3. **提升性能**：减少内存占用
4. **改善体验**：页面响应更快

## CDN 使用（可选）

### 实现原理

使用 GitHub 的 raw.githubusercontent.com 作为 CDN，提供更快的访问速度。

### 实现方案

```typescript
class CDNManager {
  private useCDN: boolean;
  private cdnBase: string;
  private directBase: string;

  constructor(owner: string, repo: string, branch: string = 'main', useCDN: boolean = true) {
    this.useCDN = useCDN;
    this.cdnBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
    this.directBase = `https://github.com/${owner}/${repo}/blob/${branch}`;
  }

  getAssetUrl(path: string): string {
    if (this.useCDN) {
      return `${this.cdnBase}/${path}`;
    }
    return `${this.directBase}/${path}`;
  }

  toggleCDN(useCDN: boolean) {
    this.useCDN = useCDN;
  }
}

// 使用示例
const cdnManager = new CDNManager('owner', 'repo', 'main', true);

const imageUrl = cdnManager.getAssetUrl('assets/images/2026-03-16-a81sd.png');
// 返回: https://raw.githubusercontent.com/owner/repo/main/assets/images/2026-03-16-a81sd.png
```

### 优势

1. **全球分发**：GitHub CDN 在全球有多个节点
2. **缓存友好**：CDN 自动缓存静态资源
3. **加载速度快**：CDN 通常比直接访问 GitHub 快
4. **高可用性**：CDN 提供更好的可用性

## 图片优化

### 实现方案

```typescript
class ImageOptimizer {
  static async optimizeImage(file: File, maxWidth: number = 1920, quality: number = 0.85): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve: blob);
            } else {
              reject(new Error('图片优化失败'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  static async compressImage(file: File): Promise<File> {
    const optimizedBlob = await this.optimizeImage(file);
    return new File([optimizedBlob], file.name, {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  }
}

// 使用示例
const handleImageUpload = async (file: File) => {
  try {
    const optimizedFile = await ImageOptimizer.compressImage(file);
    const result = await uploader.uploadImage(optimizedFile, date);
    return result.url;
  } catch (error) {
    console.error('图片上传失败:', error);
    throw error;
  }
};
```

### 优势

1. **减少文件大小**：压缩图片减少存储空间
2. **提升加载速度**：更小的文件加载更快
3. **保持质量**：在可接受的范围内压缩
4. **自动转换**：统一转换为 JPEG 格式

## 缓存策略

### 实现方案

```typescript
class CacheManager {
  private cache: Map<string, any> = new Map();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number = 100, ttl: number = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key: string, value: any) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// 使用示例
const cacheManager = new CacheManager(100, 5 * 60 * 1000);

const fetchWithCache = async (url: string) => {
  const cached = cacheManager.get(url);
  if (cached) {
    return cached;
  }

  const response = await fetch(url);
  const data = await response.json();
  cacheManager.set(url, data);
  return data;
};
```

### 优势

1. **减少网络请求**：缓存数据避免重复请求
2. **提升响应速度**：从缓存读取更快
3. **自动过期**：TTL 机制确保数据新鲜
4. **内存管理**：限制缓存大小防止内存溢出

## 性能监控

### 实现方案

```typescript
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startMeasure(name: string) {
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const measure = performance.getEntriesByName(name)[0];
    if (measure) {
      const duration = measure.duration;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      this.metrics.get(name)!.push(duration);
      
      console.log(`${name}: ${duration.toFixed(2)}ms`);
    }
  }

  getAverage(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;

    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  getMetrics() {
    const result: Record<string, any> = {};
    
    for (const [name, values] of this.metrics.entries()) {
      result[name] = {
        count: values.length,
        average: this.get