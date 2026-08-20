#!/bin/bash

# 部署静态文件到 GitHub 的静态分支
# 使用方法: bun run deploy-static

set -e

echo "🚀 开始构建和部署静态文件..."

# 1. 构建项目
echo "📦 构建项目..."
bun run fetch-site-settings
bun run build

# 2. 检查构建输出
if [ ! -d "out" ]; then
    echo "❌ 构建失败：out 目录不存在"
    exit 1
fi

echo "✅ 构建成功！"

# 3. 切换到静态文件分支（如果不存在则创建）
BRANCH_NAME="static-output"
CURRENT_BRANCH=$(git branch --show-current)

echo "📝 准备切换到静态文件分支: $BRANCH_NAME"

# 检查分支是否存在
if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    echo "分支 $BRANCH_NAME 已存在，切换到该分支..."
    git checkout $BRANCH_NAME
    # 清空分支内容（保留 .git）
    git rm -rf . --ignore-unmatch || true
else
    echo "创建新分支: $BRANCH_NAME"
    git checkout --orphan $BRANCH_NAME
    git rm -rf . --ignore-unmatch || true
fi

# 4. 复制构建输出到根目录
echo "📋 复制构建文件..."
cp -r out/* .
cp out/.gitignore .gitignore 2>/dev/null || echo "# Static files" > .gitignore

# 5. 添加文件并提交
echo "💾 提交文件..."
git add .
git commit -m "Deploy static files - $(date +'%Y-%m-%d %H:%M:%S')" || echo "没有更改需要提交"

# 6. 推送到远程
echo "🚀 推送到 GitHub..."
git push origin $BRANCH_NAME --force

# 7. 切换回原分支
git checkout $CURRENT_BRANCH

echo "✅ 部署完成！"
echo "📌 静态文件已推送到分支: $BRANCH_NAME"
echo "🔗 在 Vercel 中配置部署分支为: $BRANCH_NAME"
echo "📁 输出目录设置为: / (根目录)"
