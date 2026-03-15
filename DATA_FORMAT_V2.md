# 数据格式说明（版本 2）

## 打卡记录 JSON 格式

打卡记录存储在 `checkins/YYYY-MM-DD.json` 文件中，每个文件包含当天的所有打卡记录。

### 新格式（版本 2）

```json
{
  "date": "2026-03-16",
  "users": [
    {
      "github": "username",
      "content_md": "# 今天的学习内容\n\n## 重点\n- 学习了 React Hooks\n- 掌握了 TypeScript 类型系统",
      "assets": [
        "assets/images/2026-03-16-a81sd.png",
        "assets/videos/2026-03-16-x92jd.mp4"
      ],
      "timestamp": "2026-03-16T10:30:00.000Z"
    }
  ]
}
```

### 字段说明

- **date**: 打卡日期，格式为 YYYY-MM-DD
- **users**: 用户打卡记录数组
  - **github**: GitHub 用户名
  - **content_md**: Markdown 格式的学习内容（版本 2 新增）
  - **assets**: 资源文件路径数组（版本 2 新增）
  - **timestamp**: 打卡时间戳（ISO 8601 格式）

### 为什么使用 Markdown？

1. **GitHub 原生支持**：GitHub 完美渲染 Markdown 格式
2. **富文本支持**：支持标题、列表、代码块、链接等
3. **易于编辑**：用户可以直接在 GitHub 上编辑内容
4. **版本控制友好**：Markdown 的变更历史更清晰
5. **标准化**：Markdown 是技术文档的标准格式

### Markdown 内容示例

```markdown
# 今天的学习内容

## 重点
- 学习了 React Hooks
- 掌握了 TypeScript 类型系统
- 实现了自定义 Hook

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

## 参考资料

- [React 官方文档](https://react.dev)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
```

## 旧格式（版本 1）

```json
{
  "date": "2026-03-15",
  "users": [
    {
      "github": "username",
      "content": "今天学习了 React Hooks 的使用方法，包括 useState、useEffect 和自定义 Hook 的创建。还学习了 TypeScript 在 React 项目中的应用。",
      "images": [
        "https://raw.githubusercontent.com/owner/repo/main/assets/images/2026-03-15-abc123.png"
      ],
      "timestamp": "2026-03-15T10:30:00.000Z"
    }
  ]
}
```

### 版本对比

| 特性 | 版本 1 | 版本 2 |
|------|---------|---------|
| 内容格式 | 纯文本 | Markdown |
| 媒体支持 | ❌ | ✅ |
| 代码块 | ❌ | ✅ |
| 链接 | `images` 数组 | Markdown 链接 |
| 视频 | ❌ | ✅ |
| 音频 | ❌ | ✅ |
| 其他文件 | ❌ | ✅ |
| GitHub 渲染 | 基础 | 完整 |

### 迁移指南

从版本 1 迁移到版本 2：

1. **内容转换**：将纯文本转换为 Markdown 格式
2. **资源路径**：将 `images` 数组转换为 `assets` 数组
3. **向后兼容**：版本 2 可以读取版本 1 的数据

### 向后兼容性

版本 2 系统可以读取和处理版本 1 的数据：

```typescript
function convertV1ToV2(v1Data: any): V2CheckinData {
  return {
    date: v1Data.date,
    users: v1Data.users.map((user: any) => ({
      github: user.github,
      content_md: user.content, // 将纯文本转换为 Markdown
      assets: user.images || [], // 将 images 数组转换为 assets
      timestamp: user.timestamp
    }))
  };
}
```

## 用户资料 Markdown 格式

用户资料存储在 `users/{username}.md` 文件中。

### 格式说明

```markdown
# username



## Stats

Total Check-ins: 12
Current Streak: 5 days
Longest Streak: 10 days

## History

### 2026-03-16

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

![学习截图](../assets/images/2026-03-16-a81sd.png)

<video controls src="../assets/videos/2026-03-16-x92jd.mp4"></video>

### 2026-03-15

学习了 TypeScript 类型系统。

![代码截图](../assets/images/2026-03-15-def456.png)
```

### 字段说明

- **Total Check-ins**: 总打卡次数
- **Current Streak**: 当前连续打卡天数
- **Longest Streak**: 最长连续打卡天数
- **History**: 按日期倒序排列的打卡历史
  - 每个日期包含完整的 Markdown 内容

### 设计优势

1. **GitHub 原生渲染**：所有 Markdown 内容都能正确显示
2. **媒体支持**：图片、视频、音频都能正常播放
3. **代码高亮**：代码块有语法高亮
4. **易于维护**`：用户可以直接编辑 Markdown 文件
5. **版本控制**：每次变更都有清晰的记录
