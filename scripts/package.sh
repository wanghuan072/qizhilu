#!/bin/bash

# 设置输出文件名
PROJECT_NAME="qizhilu-template-v3"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="${PROJECT_NAME}_source_${TIMESTAMP}.zip"

# 检查 zip 命令是否存在
if ! command -v zip &> /dev/null; then
    echo "错误: 未找到 zip 命令，请先安装。"
    exit 1
fi

echo "📦 正在打包项目..."
echo "🚫 已自动排除: .git, node_modules 及所有 .gitignore 中的文件"

# 使用 git ls-files 获取文件列表
# -c: 缓存的文件（已跟踪）
# -o: 其他文件（未跟踪）
# --exclude-standard: 应用标准 git 忽略规则（读取 .gitignore）
# 这样可以确保只打包 git 认为"有效"的代码文件，同时排除 .env.local 等敏感文件
git ls-files -c -o --exclude-standard | zip -@ "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ 打包成功!"
    echo "📁 文件位置: $(pwd)/$OUTPUT_FILE"
    
    # 显示文件大小
    FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
    echo "📊 文件大小: $FILE_SIZE"
else
    echo "❌ 打包失败"
    exit 1
fi
