# Vercel 部署指南

## 前置要求

1. [GitHub账号](https://github.com/)
2. [Vercel账号](https://vercel.com/)
3. Git已安装

## 部署步骤

### 1. 初始化Git仓库

```bash
cd /Users/a017020/Documents/日报周报/dailywork
git init
git add .
git commit -m "Initial commit"
```

### 2. 创建GitHub仓库

1. 访问 https://github.com/new
2. 创建新仓库（例如：dailywork-system）
3. 按照GitHub提示推送代码：

```bash
git remote add origin https://github.com/你的用户名/dailywork-system.git
git branch -M main
git push -u origin main
```

### 3. 连接到Vercel

#### 方式A：通过Vercel网站部署

1. 访问 https://vercel.com/
2. 点击 "Add New Project"
3. 导入GitHub仓库
4. Vercel会自动检测到Node.js项目
5. 点击 "Deploy"

#### 方式B：通过Vercel CLI部署

```bash
npm install -g vercel
vercel login
vercel
```

### 4. 配置环境变量（可选）

在Vercel项目设置中添加环境变量：

- `JWT_SECRET`: 你的JWT密钥
- `EMAIL_HOST`: SMTP服务器地址
- `EMAIL_PORT`: SMTP端口
- `EMAIL_USER`: 发件邮箱
- `EMAIL_PASS`: 邮箱密码
- `ADMIN_EMAIL`: 管理员邮箱

### 5. 访问应用

部署完成后，Vercel会提供一个URL：
- 例如：https://dailywork-system.vercel.app

## 注意事项

### 数据库问题

⚠️ **重要**：Vercel是Serverless环境，每次函数调用都是无状态的。SQLite数据库文件不会持久化。

**解决方案**：

#### 方案1：使用外部数据库（推荐）

修改 [database.js](file:///Users/a017020/Documents/日报周报/dailywork/database.js) 使用云数据库：

```javascript
const { Pool } = require('pg2');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
```

推荐的免费云数据库：
- [Supabase](https://supabase.com/) - PostgreSQL，免费500MB
- [Neon](https://neon.tech/) - PostgreSQL，免费0.5GB
- [PlanetScale](https://planetscale.com/) - MySQL，免费5GB

#### 方案2：使用Vercel Postgres

Vercel提供免费的Postgres数据库：
1. 在Vercel项目中添加Postgres
2. 获取连接字符串
3. 修改代码使用Postgres

#### 方案3：使用文件存储（不推荐，仅用于测试）

将数据存储在Vercel的临时存储中，重启后数据会丢失。

### 建议的完整部署方案

**推荐使用Render或Railway**，它们支持持久化存储：

#### Render部署

1. 访问 https://render.com/
2. 连接GitHub仓库
3. 选择 "Web Service"
4. 自动部署，支持SQLite持久化

#### Railway部署

1. 访问 https://railway.app/
2. 连接GitHub仓库
3. 自动部署，支持SQLite持久化

## Vercel部署的替代方案

如果需要持久化数据库，建议使用以下平台：

| 平台 | 免费额度 | 数据库 | 推荐度 |
|-------|---------|--------|---------|
| Render | 750小时/月 | 支持SQLite | ⭐⭐⭐⭐⭐⭐ |
| Railway | $5免费额度 | 支持SQLite | ⭐⭐⭐⭐⭐ |
| Fly.io | 3个应用 | 支持SQLite | ⭐⭐⭐⭐ |
| Vercel | 无限 | 需外部数据库 | ⭐⭐ |

## 快速开始（推荐使用Render）

### 1. 准备代码

确保代码已推送到GitHub

### 2. 在Render部署

1. 访问 https://dashboard.render.com/
2. 点击 "New +"
3. 选择 "Web Service"
4. 连接GitHub仓库
5. 配置：
   - Name: dailywork-system
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
6. 点击 "Create Web Service"

### 3. 配置环境变量

在Render中添加环境变量（同Vercel）

### 4. 访问应用

Render会提供一个URL：
- 例如：https://dailywork-system.onrender.com

## 总结

- **Vercel**：适合前端，不适合需要持久化数据库的后端
- **Render**：最适合这个项目，支持SQLite持久化
- **Railway**：也是不错的选择，支持SQLite持久化

**推荐使用Render部署**，因为：
1. 免费额度充足
2. 支持SQLite数据库持久化
3. 部署简单
4. 自动HTTPS
5. 稳定可靠