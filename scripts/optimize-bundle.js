#!/usr/bin/env node

/**
 * Bundle优化脚本
 * 用于安装必要的依赖和运行bundle分析
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始Bundle优化流程...\n');

// 检查是否已安装@next/bundle-analyzer
try {
	require.resolve('@next/bundle-analyzer');
	console.log('✅ @next/bundle-analyzer 已安装');
} catch (e) {
	console.log('📦 正在安装 @next/bundle-analyzer...');
	try {
		execSync('bun add -D @next/bundle-analyzer', { stdio: 'inherit' });
		console.log('✅ @next/bundle-analyzer 安装完成');
	} catch (installError) {
		console.log('⚠️  bun 安装失败，尝试使用 npm...');
		execSync('npm install -D @next/bundle-analyzer', { stdio: 'inherit' });
		console.log('✅ @next/bundle-analyzer 安装完成');
	}
}

console.log('\n📊 开始分析Bundle大小...');
console.log('这可能需要几分钟时间，请耐心等待...\n');

try {
	// 运行bundle分析
	execSync('bun run analyze', { stdio: 'inherit' });
	
	console.log('\n🎉 Bundle分析完成！');
	console.log('浏览器将自动打开两个页面显示分析结果：');
	console.log('- Client Bundle 分析');
	console.log('- Server Bundle 分析');
	console.log('\n💡 优化建议：');
	console.log('1. 查看最大的chunks，考虑是否可以进一步拆分');
	console.log('2. 检查重复的依赖包');
	console.log('3. 考虑懒加载较大的组件');
	console.log('4. 优化图片和静态资源');
	
} catch (error) {
	console.error('❌ 分析过程中出现错误：', error.message);
	process.exit(1);
}