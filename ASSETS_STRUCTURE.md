# Assets 文件夹结构说明

## 目录结构

```
assets/
├── images/    # 图片资源
├── videos/    # 视频资源
├── audio/    # 音频资源
└── files/     # 其他文件资源
```

## 文件夹用途说明

### images/
**用途**：存储所有图片类型的媒体文件

**支持的格式**：
- PNG (.png)
- JPEG (.jpg, .jpeg)
- GIF (.gif)
- SVG (.svg)
- WebP (.webp)

**命名格式**：`YYYY-MM-DD-{randomid}.ext`

**示例**：
- `2026-03-16-a81sd.png`
- `2026-03-16-x92jd.jpg`

**使用场景**：
- 学习截图
- 笔记图片
- 代码截图
- 思维导图

### videos/
**用途**：存储所有视频类型的媒体文件

**支持的格式**：
- MP4 (.mp4)
- WebM (.webm)
- OGG (.ogg)

**命名格式**：`YYYY-MM-DD-{randomid}.ext`

**示例**：
- `2026-03-16-k22la.mp4`
- `2026-03-16-m83nb.webm`

**使用场景**：
- 学习视频记录
- 屏幕录制
- 演示视频
- 课程视频片段

### audio/
**用途**：存储所有音频类型的媒体文件

**支持的格式**：
- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- M4A (.m4a)

**命名格式**：`YYYY-MM-DD-{randomid}.ext`

**示例**：
- `2026-03-16-p91qr.mp3`
- `2026-03-16-t72ws.wav`

**使用场景**：
- 学习笔记录音
- 课程录音
- 语音备忘录
- 播客片段

### files/
**用途**：存储其他类型的文件资源

**支持的格式**：
- PDF (.pdf)
- 文档 (.doc, .docx, .txt, .md)
- 压缩文件 (.zip, .rar)
- 代码文件 (.js, .py, .java, etc.)
- 其他文件

**命名格式**：`YYYY-MM-DD-{randomid}.ext`

**示例**：
- `2026-03-16-d45fk.pdf`
- `2026-03-16-l78gh.zip`
- `2026-03-16-n23jm.py solution`

**使用场景**：
- 学习资料文档
- 代码文件
- 作业提交
- 参考资料

## 文件命名规则

### 格式说明
```
YYYY-MM-DD-{randomid}.ext
```

### 各部分说明
- **YYYY-MM-DD**：文件上传日期
- **randomid**：随机生成的唯一标识符（8-12位字符）
- **ext**：文件扩展名

### 生成示例
```javascript
const generateFileName = (date, extension) => {
  const randomId = Math.random().toString(36).substring(2, 14);
  return `${date}-${randomId}.${extension}`;
};

// 示例输出
// "2026-03-16-a81sd9x2kp.png"
// "2026-03-16-x92jd7m3nb.mp4"
```

## 文件大小限制

### GitHub 限制
- **单个文件**：最大 25MB
- **仓库总大小**：最大 1GB

### 推荐限制
- **图片**：建议 < 5MB
- **视频**：建议 < 20MB
- **音频**：建议 < 10MB
- **其他文件**：建议 < 10MB

## 访问 URL 格式

所有资源都可以通过以下 URL 格式访问：

```
https://raw.githubusercontent.com/{owner}/{repo}/branch/assets/{type}/{filename}
```

### 示例
```
# 图片
https://raw.githubusercontent.com/username/repo/main/assets/images/2026-03-16-a81sd.png

# 视频
https://raw.githubusercontent.com/username/repo/main/assets/videos/2026-03-16-x92jd.mp4

# 音频
https://raw.githubusercontent.com/username/repo/main/assets/audio/2026-03-16-k22la.mp3

# 文件
https://raw.githubusercontent.com/username/repo/main/assets/files/2026-03-16-d45fk.pdf
```

## 相对路径引用

在 Markdown 内容中，使用相对路径引用资源：

```markdown
# 图片
![描述](../assets/images/2026-03-16-a81sd.png)

# 视频
<video controls src="../assets/videos/2026-03-16-x92jd.mp4"></video>

# 音频
<audio controls src="../assets/audio/2026-03-16-k22la.mp3"></audio>

# 文件链接
[下载文件](../assets/files/2026-03-16-d45fk.pdf)
```

## 版本 2 升级说明

### 新增功能
1. **多类型媒体支持**：不再仅限于图片
2. **结构化存储**：按媒体类型分类存储
3. **统一命名规则**：所有资源使用相同的命名格式
4. **更好的组织**：便于管理和查找资源

### 向后兼容性
- 旧版本的图片文件仍然有效
- 新系统会继续支持现有的图片资源
- 建议逐步迁移到新的文件夹结构

### 迁移建议
如果需要迁移旧资源：

```bash
# 将现有图片移动到新的 images 文件夹
# （如果之前直接存储在 assets/ 目录下）
mv assets/*.png assets/images/
mv assets/*.jpg assets/images/
mv assets/*.jpeg assets/images/
mv assets/*.gif assets/images/
```

## 最佳实践

1. **文件命名**：使用自动生成的随机 ID，避免冲突
2. **文件大小**：在上传前验证文件大小，避免超限
3. **文件类型**：严格验证文件类型，确保安全
4. **路径引用**：使用相对路径，便于移植
5. **定期清理**：定期清理不再使用的资源文件
