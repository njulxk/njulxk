# Render 部署指南

## 为什么选择Render？

✅ **支持SQLite持久化** - 数据不会丢失
✅ **免费额度充足** - 750小时/月
✅ **自动HTTPS** - 无需额外配置
✅ **部署简单** - 3分钟完成
✅ **稳定可靠** - 适合生产环境

## 部署步骤

### 第一步：准备代码

#### 1.1 初始化Git仓库

```bash
cd /Users/a017020/Documents/日报周报/dailywork
git init
```

#### 1.2 添加所有文件

```bash
git add .
```

#### 1.3 提交代码

```bash
git commit -m "Initial commit - 日报周报系统"
```

### 第二步：创建GitHub仓库

#### 2.1 访问GitHub

打开 https://github.com/new

#### 2.2 创建新仓库

- **Repository name**: `dailywork-system`
- **Description**: `日报周报收集汇总系统`
- **Public/Private**: 选择 Public 或 Private（根据需要）
- **不要勾选** "Add a README file"
- 点击 "Create repository"

#### 2.3 推送代码到GitHub

GitHub会显示推送命令，类似这样：

```bash
git remote add origin https://github.com/你的用户名/dailywork-system.git
git branch -M main
git push -u origin main
```

### 第三步：在Render部署

#### 3.1 访问Render

打开 https://dashboard.render.com/

#### 3.2 注册/登录

- 使用GitHub账号登录（推荐）
- 或使用邮箱注册

#### 3.3 创建新服务

1. 点击右上角 "+ New"
2. 选择 "Web Service"
3. 点击 "Connect" 连接GitHub仓库

#### 3.4 配置服务

在配置页面填写：

| 配置项 | 值 |
|--------|-----|
| **Name** | `dailywork-system` |
| **Region** | 选择 `Singapore` 或 `Oregon`（离你最近） |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

#### 3.5 高级设置（可选）

点击 "Advanced" 可以配置：

- **Instance Type**: 选择 `Free`（免费）
- **Environment Variables**: 添加环境变量（见下方）

#### 3.6 点击部署

点击 "Create Web Service" 开始部署

### 第四步：配置环境变量（可选）

在Render项目的 "Environment" 标签页添加：

| 变量名 | 说明 | 示例值 |
|--------|------|---------|
| `JWT_SECRET` | JWT密钥 | `your-secret-key-here` |
| `PORT` | 端口号 | `3000` |

如果需要邮件功能，添加：

| 变量名 | 说明 | 示例值 |
|--------|------|---------|
| `EMAIL_HOST` | SMTP服务器 | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP端口 | `587` |
| `EMAIL_USER` | 发件邮箱 | `your-email@gmail.com` |
| `EMAIL_PASS` | 邮箱密码 | `your-app-password` |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@example.com` |

### 第五步：等待部署

- 首次部署需要 3-5 分钟
- Render会自动安装依赖
- 部署完成后会显示URL

### 第六步：访问应用

部署成功后，Render会提供一个URL：

```
https://dailywork-system.onrender.com
```

或类似的格式。

## 常见问题

### Q1: 部署失败怎么办？

**检查点**：
1. 查看 Render 的 "Logs" 标签页
2. 确认 `package.json` 中的依赖都正确
3. 检查 `server.js` 语法是否正确

### Q2: 如何更新代码？

**自动部署**：
1. 修改本地代码
2. `git add . && git commit -m "更新"`
3. `git push`
4. Render会自动检测并重新部署

### Q3: 免费额度够用吗？

**足够使用**：
- 免费版：750小时/月
- 你的应用：24小时/天 × 30天 = 720小时/月
- 完全够用！

### Q4: 数据会丢失吗？

**不会**：
- Render支持SQLite持久化
- 数据存储在磁盘上
- 重启不会丢失

### Q5: 如何查看日志？

在Render控制台：
1. 点击你的服务
2. 选择 "Logs" 标签页
3. 实时查看应用日志

### Q6: 如何配置自定义域名？

1. 在Render项目设置中点击 "Custom Domains"
2. 添加你的域名（如：`daily.yourdomain.com`）
3. 按照提示配置DNS
4. 等待SSL证书生成

## 管理员账户

部署后，使用以下账户登录：

- **用户名**: `admin`
- **密码**: `admin123`

**重要**：首次登录后请修改密码！

## 团队使用

### 访问地址

将以下地址分享给团队成员：

```
https://dailywork-system.onrender.com
```

### 使用说明

1. **普通用户**：
   - 直接访问地址
   - 输入姓名、日期、内容
   - 提交报告

2. **管理员**：
   - 登录账户
   - 查看汇总
   - 导出Word文档

## 监控和维护

### 查看部署状态

在Render控制台可以查看：
- 部署历史
- 实时日志
- 资源使用情况
- 错误报告

### 备份数据

定期备份数据库：

```bash
# 在Render控制台使用SSH连接
# 或通过Render的Shell功能
cp database.db database_backup_$(date +%Y%m%d).db
```

## 成本说明

### 免费版限制

- ✅ 750小时/月（够用）
- ✅ 512MB RAM
- ✅ SQLite数据库
- ✅ 自动HTTPS
- ✅ 自定义域名支持

### 何时需要付费？

- 超过750小时/月
- 需要更多RAM
- 需要更高性能

付费版：$7/月起

## 总结

Render是部署这个项目的最佳选择：

1. ✅ 完全免费
2. ✅ 支持SQLite
3. ✅ 部署简单
4. ✅ 自动HTTPS
5. ✅ 稳定可靠
6. ✅ 适合团队使用

**开始部署吧！** 🚀