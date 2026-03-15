# 学习打卡系统 - 版本 2

一个基于 GitHub 的学习打卡系统，支持富文本内容、多种媒体类型和自动统计功能。

## 版本 2 新特性

✅ **富文本编辑器**：支持 Markdown 格式的内容编辑
✅ **多媒体支持**：图片、视频、音频、文件上传
✅ **拖拽上传**：直接拖拽文件到编辑器
✅ **粘贴图片**：从剪贴板粘贴图片
✅ **上传进度**：实时显示上传进度
✅ **预览模式**：实时预览 Markdown 渲染效果
✅ **性能优化**：资源去重、懒加载、CDN 支持

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    用户界面层                        │
│  ┌──────────────┐  ┌──────────────┐          │
│  │  打卡界面    │  │  统计面板    │          │
│  │  (富文本编辑器) │  │  (排行榜)    │          │
│  └──────┬───────┘  └──────┬───────┘          │
│         │                   │                      │
│         └───────────┬───────┘                      │
│                     │                              │
│         ┌───────────▼───────────┐                  │
│         │   GitHub API 集成层   │                  │
│         │  - 媒体上传          │                  │
│         │  - 数据存储          │                  │
│         │  - 文件管理          │                  │
│         └───────────┬───────────┘                  │
│                     │                              │
└─────────────────────▼──────────────────────────────────┘
                      │
         ┌────────────▼────────────┐
         │   GitHub 仓库层        │
         │  - checkins/          │
         │  - users/             │
         │  - assets/             │
         │    - images/          │
         │    - videos/          │
         │    - audio/           │
         │    - files/           │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │  GitHub Actions 层     │
         │  - 自动统计           │
         │  - 文件生成           │
         │  - README 更新        │
         └───────────────────────┘
```

## 项目结构

```
cruel-english-learning-together./
├── web/                          # Web 应用程序
│   ├── src/
│   │   ├── App.tsx              # 主应用组件
│   │   ├── App.css              # 应用样式
│   │   ├── Dashboard.tsx          # 统计面板组件
│   │   ├── editor/
│   │   │   ├── RichEditor.tsx    # 富文本编辑器
│   │   │   └── RichEditor.css    # 编辑器样式
│   │   ├── github/
│   │   │   ├── githubApi.ts      # GitHub API 集成
│   │   │   └── uploadAsset.ts  # 媒体上传模块
│   │   └── main.tsx             # 应用入口
│   ├── package.json
│   └── vite.config.ts
├── checkins/                     # 打卡记录
│   └── example.json              # 示例数据
├── users/                        # 用户资料（自动生成）
├── assets/                       # 媒体资源
│   ├── images/                  # 图片资源
│   ├── videos/                  # 视频资源
│   ├── audio/                   # 音频资源
│   └── files/                   # 其他文件
├── scripts/                      # Python 脚本
│   └── sync.py                  # 统计同步脚本
├── .github/workflows/            # GitHub Actions
│   └── sync.yml                 # 自动同步工作流
├── README.md                     # 项目说明
├── DATA_FORMAT_V2.md           # 数据格式说明
├── ASSETS_STRUCTURE.md         # 资源结构说明
├── IMAGE_HANDLING.md          # 图片处理说明
├── SECURITY.md                # 安全改进说明
└── PERFORMANCE_IMPROVEMENTS.md # 性能改进说明
```

## 核心功能

### 1. 富文本打卡

**功能描述**：
- 使用 TipTap 编辑器支持 Markdown 格式
- 支持标题、列表、代码块、链接等
- 支持图片、视频、音频插入
- 支持拖拽上传和粘贴图片

**技术实现**：
- React + TipTap 编辑器
- 实时 Markdown 预览
- 媒体自动上传到 GitHub

**使用示例**：
```markdown
# 今天的学习内容

## 重点
- 学习了 React Hooks
- 掌握了 TypeScript 类型系统

## 代码示例

```typescript
const useCustomHook = () => {
  const [state, setState] = useState(null);
  return { state, setState };
};
```

## 学习资源

![学习截图](../assets/images/2026-03-16-a81sd.png)

<video controls src="../assets/videos/2026-03-16-x92jd.mp4"></video>
```

### 2. 媒体上传

**功能描述**：
- 支持图片、视频、音频、文件上传
- 自动检测文件类型并分类存储
- 实时上传进度显示
- 文件大小验证

**技术实现**：
- GitHub REST API
- Base64 编码转换
- 文件类型检测
- 错误处理和重试

**存储格式**：
```
assets/images/2026-03-16-a81sd.png
assets/videos/2026-03-16-x92jd.mp4
assets/audio/2026-03-16-k22la.mp3
assets/files/2026-03-16-d45fk.pdf
```

### 3. 自动统计

**功能描述**：
- 自动计算用户打卡次数
- 计算连续打卡天数
- 生成排行榜
- 更新用户个人页面
- 自动更新 README

**技术实现**：
- Python 统计脚本
- GitHub Actions 自动触发
- Markdown 文件生成
- 数据聚合和分析

**触发条件**：
```yaml
on:
  push:
    paths:
      - 'checkins/**'
      - 'assets/**'
```

### 4. 统计面板

**功能描述**：
- 显示个人统计数据
- 显示排行榜
- 显示最新打卡记录
- 实时数据更新

**技术实现**：
- React 组件
- GitHub API 数据获取
- 响应式布局
- 数据可视化

## 数据流程

### 打卡流程

```
用户操作
    ↓
富文本编辑器
    ↓
内容 + 媒体
    ↓
上传到 GitHub
    ↓
checkins/YYYY-MM-DD.json
    ↓
GitHub Actions 触发
    ↓
统计脚本执行
    ↓
更新 users/{username}.md
    ↓
更新 README.md
```

### 媒体上传流程

```
用户选择文件
    ↓
文件类型检测
    ↓
转换为 Base64
    ↓
上传到 GitHub API
    ↓
获取下载 URL
    ↓
插入到编辑器
    ↓
保存到打卡记录
```

## 技术栈

### 前端
- **React 18**：UI 框架
- **TypeScript**：类型安全
- **Vite**：构建工具
- **TipTap**：富文本编辑器
- **CSS3**：样式

### 后端
- **Python 3.11**：统计脚本
- **GitHub REST API**：数据存储
- **GitHub Actions**：自动化

### 基础设施
- **GitHub**：代码托管和 CI/CD
- **Git**：版本控制
- **Markdown**：文档格式

## 使用方法

### 1. 配置 GitHub Token

1. 访问 GitHub Settings → Developer settings → Personal access tokens
2. 点击 "Generate new token (classic)"
3. 选择必要的权限：
   - `repo` (完整仓库访问权限)
   - `workflow` (GitHub Actions 访问权限)
4. 生成并复制 token

### 2. 启动 Web 应用

```bash
cd web
npm install
npm run dev
```

### 3. 提交打卡

1. 在 Web 界面输入 GitHub 配置信息
2. 填写用户名和学习内容
3. 使用富文本编辑器格式化内容
4. 上传媒体文件（可选）
5. 点击提交按钮

### 4. 查看统计

1. 切换到"统计面板"标签
2. 查看个人统计、排行榜和最新打卡

## 设计决策

### 为什么使用 GitHub 作为数据库？

1. **免费**：GitHub 提供免费的存储和 API 访问
2. **版本控制**：所有变更都有历史记录
3. **易于访问**：通过 raw.githubusercontent.com 直接访问
4. **自动化**：GitHub Actions 提供强大的自动化能力
5. **协作友好**：天然支持多人协作

### 为什么使用 Markdown 格式？

1. **GitHub 原生支持**：GitHub 完美渲染 Markdown 格式
2. **富文本支持**：支持标题、列表、代码块、链接等
3. **易于编辑**：用户可以直接在 GitHub 上编辑内容
4. **版本控制友好**：Markdown 的变更历史更清晰
5. **标准化**：Markdown 是技术文档的标准格式

### 为什么使用 TipTap 编辑器？

1. **模块化**：基于 ProseMirror，高度可扩展
2. **性能优秀**：虚拟滚动，处理大文档
3. **类型安全**：完整的 TypeScript 支持
4. **易于定制**：可以轻松添加自定义扩展
5. **社区活跃**：丰富的插件生态系统

### 为什么使用 GitHub Actions？

1. **自动化**：无需手动触发统计
2. **实时更新**：代码提交后立即更新
3. **免费使用**：GitHub Actions 完全免费
4. **易于调试**：详细的执行日志
5. **可扩展**：支持复杂的工作流

## 安全考虑

### Token 管理
- ✅ 使用环境变量存储 Token
- ✅ 不要在代码中硬编码 Token
- ✅ 定期轮换 Token
- ✅ 限制 Token 权限

### 文件验证
- ✅ 验证文件类型
- ✅ 检查文件大小
- ✅ 防止恶意文件上传
- ✅ 文件名安全处理

### API 限制
- ✅ 实现速率限制
- ✅ 错误重试机制
- ✅ 请求超时处理
- ✅ 资源使用监控

## 性能优化

### 前端优化
- ✅ 资源去重：避免重复上传
- ✅ 懒加载：按需加载图片
- ✅ 图片压缩：减少文件大小
- ✅ CDN 使用：提升访问速度
- ✅ 缓存策略：减少网络请求

### 后端优化
- ✅ 批量操作：减少 API 调用
- ✅ 并发处理：提升处理速度
- ✅ 错误重试：提高可靠性
- ✅ 进度反馈：改善用户体验

## 扩展建议

### 短期改进
1. 添加重复打卡检查
2. 实现前端速率限制
3. 添加输入验证
4. 优化图片上传（并发上传）

### 长期改进
1. 实现后端 API
2. 添加用户认证系统
3. 实现数据缓存
4. 添加通知功能
5. 实现数据导出功能

## 文档

- [README.md](file:///Users/zakj/Desktop/block_mac/do/2026/AI 大模型应用/cruel-english-learning-together./README.md) - 项目概述
- [DATA_FORMAT_V2.md](file:///Users/zakj/Desktop/block_mac/do/2026/AI 大模型应用/cruel-english-learning-together./DATA_FORMAT_V2.md) - 数据格式说明
- [ASSETS_STRUCTURE.md](file:///Users/zakj/Desktop/block_mac/do/2026/AI 大模型应用/cruel-english-learning-together./ASSETS_STRUCTURE.md) - 资源结构说明
- [IMAGE_HANDLING.md](file:///Users/zakj/Desktop/block_mac/do/2026/AI 大模型应用/cruel-english-learning-together./IMAGE_HANDLING.md) - 图片处理说明
- [SECURITY.md](file:///Users/zakj/Desktop/block_mac/do/2026/AI 大模型应用/cruel-english-learning-together./SECURITY.md) - 安全改进说明
- [PERFORMANCE_IMPROVEMENTS.md](file:///Users/zakj/Desktop/block_mac/do/2026/AI 大模型应用/cruel-english-learning-together./PERFORMANCE_IMPROVEMENTS.md) - 性能改进说明

## 总结

版本 2 的学习打卡系统通过以下改进显著提升了用户体验：

1. **富文本支持**：从纯文本升级到 Markdown
2. **多媒体支持**：支持图片、视频、音频等多种媒体
3. **更好的编辑体验**：拖拽、粘贴、预览等功能
4. **性能优化**：资源去重、懒加载等优化措施
5. **完整的文档**：详细的技术文档和使用说明

系统设计简洁、易于使用，适合个人或小团队的学习打卡需求。通过 GitHub 的强大功能，实现了数据存储、版本控制和自动化的完美结合。
