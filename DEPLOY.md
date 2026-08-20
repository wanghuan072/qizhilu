# 部署指南

本项目支持两种部署方式：

## 方式一：Vercel 自动构建（推荐）⭐

### 优点
- ✅ 自动化：推送代码自动构建和部署
- ✅ 无需手动操作
- ✅ 支持预览部署（PR 自动部署预览）
- ✅ 自动 HTTPS 和 CDN

### 步骤

1. **在 Vercel 连接 GitHub 仓库**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库

2. **配置环境变量**
   在 Vercel 项目设置中添加：
   ```
   NEXT_PUBLIC_PROJECT_ID=你的项目ID
   NEXT_PUBLIC_WEB_API_URL=你的API地址
   NEXT_PUBLIC_DEFAULT_LOCALE=en
   NEXT_PUBLIC_DOMAIN=你的域名
   ```

3. **配置构建设置**
   - Framework Preset: Next.js
   - Build Command: `bun run fetch-site-settings && bun run build`
   - Output Directory: `out`
   - Install Command: `bun install`

4. **部署**
   - 点击 Deploy
   - Vercel 会自动构建并部署

---

## 方式二：本地构建后上传静态文件

### 适用场景
- 需要在本地构建后手动上传
- 想要完全控制构建过程
- 不想让 Vercel 访问源代码

### 步骤

#### 方法 A：使用自动化脚本（推荐）

```bash
# 1. 构建并自动推送到静态分支
bun run deploy-static

# 2. 在 Vercel 中配置
#    - 连接 GitHub 仓库
#    - 部署分支: static-output
#    - 输出目录: / (根目录)
#    - 构建命令: (留空)
```

#### 方法 B：手动操作

```bash
# 1. 构建项目
bun run fetch-site-settings
bun run build

# 2. 创建静态文件分支
git checkout --orphan static-output
git rm -rf . --ignore-unmatch

# 3. 复制构建文件
cp -r out/* .
cp out/.gitignore .gitignore 2>/dev/null || echo "# Static" > .gitignore

# 4. 提交并推送
git add .
git commit -m "Deploy static files"
git push origin static-output --force

# 5. 切换回主分支
git checkout main
```

#### 在 Vercel 中配置
1. 连接 GitHub 仓库
2. 设置部署分支为：`static-output`
3. 输出目录：`/` (根目录)
4. 构建命令：留空（因为已经是静态文件）

---

## 两种方式对比

| 特性 | 方式一（自动构建） | 方式二（静态文件） |
|------|------------------|-------------------|
| 自动化程度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 构建速度 | 快（云端） | 取决于本地机器 |
| 预览部署 | ✅ 支持 | ❌ 不支持 |
| 环境变量 | 在 Vercel 配置 | 本地构建时设置 |
| 源代码隐私 | 需要访问 | 不需要 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 注意事项

1. **环境变量**
   - 确保所有 `NEXT_PUBLIC_*` 环境变量都已配置
   - 构建时需要这些变量来获取站点设置

2. **构建输出**
   - 静态文件输出在 `out/` 目录
   - 构建后会自动处理默认语言文件

3. **Git 分支**
   - 主分支：存放源代码
   - `static-output` 分支：存放构建后的静态文件（如果使用方式二）

4. **Vercel 配置**
   - 如果使用方式一，确保 Framework 设置为 Next.js
   - 如果使用方式二，Framework 可以设置为 Other 或 Static

---

## 故障排查

### 构建失败
- 检查环境变量是否配置正确
- 检查 `fetch-site-settings` 是否能正常访问 API
- 查看构建日志中的错误信息

### 部署后页面空白
- 检查输出目录配置是否正确
- 确认 `out/` 目录中有 `index.html`
- 检查浏览器控制台的错误信息

### 静态文件分支冲突
- 使用 `--force` 强制推送（会覆盖远程分支）
- 或者先删除远程分支再推送
