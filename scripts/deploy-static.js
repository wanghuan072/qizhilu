#!/usr/bin/env node

/**
 * 部署静态文件到 GitHub 的静态分支
 * 使用方法: node scripts/deploy-static.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BRANCH_NAME = 'static-output';
const OUT_DIR = path.join(process.cwd(), 'out');

function exec(command, options = {}) {
  console.log(`执行: ${command}`);
  try {
    return execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      ...options 
    });
  } catch (error) {
    console.error(`❌ 命令执行失败: ${command}`);
    process.exit(1);
  }
}

function main() {
  console.log('🚀 开始构建和部署静态文件...\n');

  // 1. 构建项目
  console.log('📦 步骤 1: 构建项目...');
  exec('bun run fetch-site-settings');
  exec('bun run build');

  // 2. 检查构建输出
  if (!fs.existsSync(OUT_DIR)) {
    console.error('❌ 构建失败：out 目录不存在');
    process.exit(1);
  }
  console.log('✅ 构建成功！\n');

  // 3. 获取当前分支
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`📝 当前分支: ${currentBranch}`);

  // 4. 检查静态分支是否存在
  const branches = execSync('git branch -a', { encoding: 'utf8' });
  const branchExists = branches.includes(BRANCH_NAME);

  if (branchExists) {
    console.log(`分支 ${BRANCH_NAME} 已存在，切换到该分支...`);
    exec('git checkout ' + BRANCH_NAME);
    // 清空分支内容
    try {
      exec('git rm -rf . --ignore-unmatch');
    } catch (e) {
      // 忽略错误
    }
  } else {
    console.log(`创建新分支: ${BRANCH_NAME}`);
    exec('git checkout --orphan ' + BRANCH_NAME);
    try {
      exec('git rm -rf . --ignore-unmatch');
    } catch (e) {
      // 忽略错误
    }
  }

  // 5. 复制构建输出到根目录
  console.log('📋 步骤 2: 复制构建文件...');
  
  function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach(childItemName => {
        copyRecursiveSync(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        );
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  // 复制 out 目录下的所有文件到当前目录
  const files = fs.readdirSync(OUT_DIR);
  files.forEach(file => {
    const srcPath = path.join(OUT_DIR, file);
    const destPath = path.join(process.cwd(), file);
    copyRecursiveSync(srcPath, destPath);
  });

  // 6. 创建 .gitignore（只保留必要的忽略规则）
  const gitignoreContent = `# Static files deployment
.DS_Store
*.log
`;
  fs.writeFileSync(path.join(process.cwd(), '.gitignore'), gitignoreContent);

  // 7. 添加文件并提交
  console.log('💾 步骤 3: 提交文件...');
  exec('git add .');
  
  const timestamp = new Date().toLocaleString('zh-CN');
  try {
    exec(`git commit -m "Deploy static files - ${timestamp}"`);
  } catch (e) {
    console.log('⚠️  没有更改需要提交');
  }

  // 8. 推送到远程
  console.log('🚀 步骤 4: 推送到 GitHub...');
  exec(`git push origin ${BRANCH_NAME} --force`);

  // 9. 切换回原分支
  exec('git checkout ' + currentBranch);

  console.log('\n✅ 部署完成！');
  console.log(`📌 静态文件已推送到分支: ${BRANCH_NAME}`);
  console.log('🔗 在 Vercel 中配置：');
  console.log('   - 部署分支: static-output');
  console.log('   - 输出目录: / (根目录)');
  console.log('   - 构建命令: (留空，因为已经是静态文件)');
}

main();
