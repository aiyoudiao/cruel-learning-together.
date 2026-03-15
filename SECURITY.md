# 安全改进说明

## 1. GitHub Personal Access Token (PAT) 使用

### 如何获取 PAT

1. 访问 GitHub Settings → Developer settings → Personal access tokens
2. 点击 "Generate new token (classic)"
3. 选择必要的权限：
   - `repo` (完整仓库访问权限)
   - `workflow` (GitHub Actions 访问权限)
4. 生成并复制 token

### 安全使用原则

1. **不要在代码中硬编码 token**

   - ❌ 错误：`const token = 'ghp_xxxxxxxxxxxx'`
   - ✅ 正确：通过环境变量或用户输入获取
2. **使用环境变量（推荐）**

   ```bash
   # 在 .env 文件中（不要提交到 Git）
   VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
   ```
3. **限制 token 杈权限**

   - 只授予必要的权限
   - 定期轮换 token
   - 为不同用途创建不同的 token

## 2. 避免暴露 Token

### 前端实现

当前实现中，token 通过用户输入获取，存在以下风险：

**风险**：

- Token 可能被存储在浏览器历史记录中
- Token 可能被浏览器扩展获取
- Token 在网络传输中可能被拦截

**改进方案**：

1. **使用后端代理（推荐）**

   ```typescript
   // 前端只发送到后端
   const response = await fetch('/api/checkin', {
     method: 'POST',
     body: JSON.stringify({ username, content, images })
   });

   // 后端处理 GitHub API 调用
   // token 存储在服务器环境变量中
   ```
2. **使用 GitHub OAuth**

   - 用户通过 OAuth 授权
   - 获取短期访问令牌
   - 令牌自动过期
3. **使用 GitHub App**

   - 创建 GitHub App
   - 使用 JWT 进行认证
   - 更细粒度的权限控制

### .gitignore 配置

确保敏感文件不被提交：

```gitignore
# 环境变量
.env
.env.local
.env.*.local

# 日志文件
*.log
npm-debug.log*

# 临时文件
.DS_Store
Thumbs.db
```

## 3. 速率限制

### GitHub API 速率限制

- **认证请求**：每小时 5,000 次
- **未认证请求**：每小时 60 次

### 实现速率限制

**前端实现**：

```typescript
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
  
    if (this.requests.length >= this.maxRequests) {
      const waitTime = this.windowMs - (now - this.requests[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.checkLimit();
    }
  
    this.requests.push(now);
    return true;
  }
}

// 使用示例
const rateLimiter = new RateLimiter(10, 60000); // 每分钟最多 10 次请求

async function submitCheckin() {
  await rateLimiter.checkLimit();
  // 执行提交逻辑
}
```

**后端实现（推荐）**：

```python
from functools import wraps
from time import time
from collections import defaultdict

class RateLimiter:
    def __init__(self, max_requests=10, window=60):
        self.max_requests = max_requests
        self.window = window
        self.requests = defaultdict(list)
  
    def is_allowed(self, identifier):
        now = time()
        requests = self.requests[identifier]
      
        # 清理过期请求
        requests[:] = [r for r in requests if now - r < self.window]
      
        if len(requests) >= self.max_requests:
            return False
      
        requests.append(now)
        return True

# 使用装饰器
def rate_limit(max_requests=10, window=60):
    limiter = RateLimiter(max_requests, window)
  
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            user_id = kwargs.get('user_id') or args[0]
            if not limiter.is_allowed(user_id):
                raise Exception("Rate limit exceeded")
            return f(*args, **kwargs)
        return wrapped
    return decorator
```

## 4. 防止重复打卡

### 实现方案

**前端验证**：

```typescript
async function hasCheckedInToday(username: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const checkinPath = `checkins/${today}.json`;
  
  const data = await api.getFile(checkinPath);
  if (!data) return false;
  
  const checkinData = JSON.parse(data);
  return checkinData.users.some((u: any) => u.github === username);
}

// 在提交前检查
async function handleSubmit() {
  if (await hasCheckedInToday(username)) {
    setMessage('您今天已经打卡过了！');
    return;
  }
  
  // 继续提交逻辑
}
```

**后端验证（推荐）**：

```python
def has_checked_in_today(username: str) -> bool:
    today = datetime.now().strftime('%Y-%m-%d')
    checkin_file = CHECKINS_DIR / f"{today}.json"
  
    if not checkin_file.exists():
        return False
  
    with open(checkin_file, 'r') as f:
        data = json.load(f)
        return any(user['github'] == username for user in data['users'])
```

### 数据库约束

如果使用数据库，可以添加唯一约束：

```sql
CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    checkin_date DATE NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username, checkin_date)
);
```

## 5. 其他安全措施

### 输入验证

```typescript
function validateInput(username: string, content: string): boolean {
  // 验证用户名
  if (!/^[a-zA-Z0-9_-]{1,39}$/.test(username)) {
    throw new Error('Invalid username format');
  }
  
  // 验证内容长度
  if (content.length > 10000) {
    throw new Error('Content too long');
  }
  
  // 防止 XSS
  const sanitizedContent = content
    .replace(/</g, '<')
    .replace(/>/g, '>');
  
  return true;
}
```

### HTTPS 强制使用

```typescript
// 确保使用 HTTPS
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  window.location.href = `https:${window.location.href.substring(window.location.protocol.length)}`;
}
```

### Content Security Policy

在 `index.html` 中添加：

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https://raw.githubusercontent.com;">
```

## 6. 推荐的生产环境架构

```
┌─────────────┐
│   前端 UI   │
│  (React)    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│  后端 API   │
│  (Node.js)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  GitHub API │
│  (Token)    │
└─────────────┘
```

**优势**：

- Token 存储在服务器端
- 可以实现更复杂的速率限制
- 可以添加用户认证
- 可以记录审计日志

## 7. 监控和日志

### 实现日志记录

```typescript
class Logger {
  static log(action: string, username: string, details: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      username,
      details,
      ip: 'xxx.xxx.xxx.xxx' // 从服务器获取
    };
  
    // 发送到日志服务
    console.log(JSON.stringify(logEntry));
  }
}

// 使用示例
Logger.log('checkin_submit', username, { contentLength: content.length });
```

## 总结

安全改进的关键点：

1. ✅ **Token 管理**：使用环境变量，避免硬编码
2. ✅ **速率限制**：防止 API 滥用
3. ✅ **重复检查**：防止重复打卡
4. ✅ **输入验证**：验证所有用户输入
5. ✅ **HTTPS**：强制使用加密连接
6. ✅ **后端代理**：生产环境推荐使用后端
7. ✅ **监控日志**：记录所有操作

当前实现适合开发和测试环境，生产环境建议使用后端代理架构。
