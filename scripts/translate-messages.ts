#!/usr/bin/env bun

import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { jsonrepair } from 'jsonrepair';

// 加载环境变量
config({ path: '.env.local' });

// 支持的语言列表 (基于messages目录中的文件)
const SUPPORTED_LANGUAGES = ['de', 'fr', 'ja', 'ko','zh-CN', 'zh-TW','es-ES','it','nl','pt-PT'];

// 语言代码到语言名称的映射
const LANGUAGE_NAMES: Record<string, string> = {
	de: 'German',
	fr: 'French', 
	ja: 'Japanese',
	ko: 'Korean',
	'zh-CN': 'Simplified Chinese',
	'zh-TW': 'Traditional Chinese',
	'es-ES': 'Spanish',
	it: 'Italian',
	nl: 'Dutch',
	'pt-PT': 'Portuguese',
};

interface TranslationConfig {
	baseUrl: string;
	apiKey: string;
	model: string;
	languages: string[];
}

/**
 * 从环境变量读取配置
 */
function getConfig(): TranslationConfig {
	const baseUrl = process.env.OPENAI_BASE_URL;
	const apiKey = process.env.OPENAI_API_KEY;
	const model = process.env.OPENAI_MODEL || 'gpt-4o';
	
	if (!baseUrl || !apiKey) {
		console.error('错误: 请在 .env.local 文件中设置以下环境变量:');
		console.error('OPENAI_BASE_URL=你的OpenAI基础URL');
		console.error('OPENAI_API_KEY=你的OpenAI API密钥');
		console.error('OPENAI_MODEL=gpt-4o (可选，默认为gpt-4o)');
		process.exit(1);
	}

	// 从命令行参数或使用默认语言列表
	const languages = process.argv.length > 2 
		? process.argv.slice(2).filter(lang => SUPPORTED_LANGUAGES.includes(lang))
		: SUPPORTED_LANGUAGES;

	if (languages.length === 0) {
		console.error(`错误: 无效的语言代码。支持的语言: ${SUPPORTED_LANGUAGES.join(', ')}`);
		process.exit(1);
	}

	return { baseUrl, apiKey, model, languages };
}

/**
 * 使用AI SDK进行翻译
 */
async function translateWithAI(
	text: string, 
	targetLanguage: string, 
	config: TranslationConfig
): Promise<string> {
	const languageName = LANGUAGE_NAMES[targetLanguage];
	
	const prompt = `请将以下JSON格式的英文翻译为${languageName}。
请保持JSON的结构不变，只翻译值部分，保留所有的键名和特殊语法（如 {page}、{count} 等占位符）。
请确保翻译准确、自然，符合${languageName}的表达习惯。当前需要翻译的内容是用于网站的翻译，所以用词方面注意
符合网站的习惯表达，如Home，翻译成首页，不要翻译成家。另外就是当前网站主要是游戏网站，所以用词方面注意
符合游戏网站的习惯表达

需要翻译的内容:
${text}

重要：请只返回纯JSON格式的内容，不要使用markdown代码块（\`\`\`json），不要添加任何解释或其他文本。直接返回JSON对象。`;

	try {
		// 创建OpenAI客户端
		const openai = createOpenAI({
			apiKey: config.apiKey,
			baseURL: config.baseUrl,
		});

		// 使用AI SDK生成文本
		const { text: result } = await generateText({
			model: openai(config.model),
			prompt,
			temperature: 0.3,
			maxTokens: 4000,
		});

		return result.trim();
	} catch (error) {
		console.error(`翻译到 ${languageName} 时出错:`, error);
		throw error;
	}
}

/**
 * 翻译单个模块
 */
async function translateChunk(
	key: string,
	value: any,
	targetLanguage: string,
	config: TranslationConfig
): Promise<{ key: string; data: any }> {
	console.log(`  正在翻译模块: ${key}`);
	
	const chunkData = { [key]: value };
	const jsonString = JSON.stringify(chunkData, null, 2);
	
	const translatedText = await translateWithAI(jsonString, targetLanguage, config);
	
	try {
		// 使用jsonrepair修复可能的JSON格式问题
		const repairedJson = jsonrepair(translatedText);
		const translatedData = JSON.parse(repairedJson);
		return { key, data: translatedData[key] };
	} catch (parseError) {
		console.error(`解析翻译结果时出错 (${key}):`, parseError);
		console.error('翻译结果:', translatedText);
		
		// 如果jsonrepair也失败了，尝试手动清理
		try {
			const cleanedText = translatedText
				.replace(/```json\s*/g, '')
				.replace(/```\s*/g, '')
				.replace(/^\s*[\`]+/g, '')
				.replace(/[\`]+\s*$/g, '')
				.trim();
			
			const fallbackData = JSON.parse(cleanedText);
			console.log(`✅ 使用fallback方法成功解析模块: ${key}`);
			return { key, data: fallbackData[key] };
		} catch (fallbackError) {
			console.error(`fallback解析也失败 (${key}):`, fallbackError);
			throw parseError;
		}
	}
}

/**
 * 并发翻译大型JSON对象
 */
async function translateInChunks(
	sourceData: any,
	targetLanguage: string,
	config: TranslationConfig
): Promise<any> {
	const entries = Object.entries(sourceData);
	const concurrencyLimit = 3; // 限制并发数量，避免API限制
	const result: any = {};
	
	// 分批处理，每批最多3个并发请求
	for (let i = 0; i < entries.length; i += concurrencyLimit) {
		const batch = entries.slice(i, i + concurrencyLimit);
		
		console.log(`  处理批次 ${Math.floor(i / concurrencyLimit) + 1}/${Math.ceil(entries.length / concurrencyLimit)}`);
		
		// 并发翻译当前批次
		const promises = batch.map(([key, value]) => 
			translateChunk(key, value, targetLanguage, config)
		);
		
		try {
			const results = await Promise.all(promises);
			
			// 将结果合并到最终对象中
			for (const { key, data } of results) {
				result[key] = data;
			}
			
			console.log(`  ✅ 批次完成，已翻译模块: ${batch.map(([key]) => key).join(', ')}`);
		} catch (error) {
			console.error(`  ❌ 批次翻译失败:`, error);
			throw error;
		}
		
		// 批次间添加短暂延迟，避免API限制
		if (i + concurrencyLimit < entries.length) {
			console.log(`  等待 1 秒后处理下一批次...`);
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
	}
	
	return result;
}

/**
 * 翻译指定语言
 */
async function translateLanguage(targetLanguage: string, config: TranslationConfig) {
	const messagesDir = join(process.cwd(), 'messages');
	const sourceFile = join(messagesDir, 'en.json');
	const targetFile = join(messagesDir, `${targetLanguage}.json`);
	
	if (!existsSync(sourceFile)) {
		console.error(`错误: 源文件 ${sourceFile} 不存在`);
		return false;
	}
	
	try {
		// 读取英文源文件
		const sourceContent = readFileSync(sourceFile, 'utf-8');
		const sourceData = JSON.parse(sourceContent);
		
		console.log(`开始翻译到 ${LANGUAGE_NAMES[targetLanguage]} (${targetLanguage})...`);
		
		// 分块翻译
		const translatedData = await translateInChunks(sourceData, targetLanguage, config);
		
		// 写入目标文件
		const translatedContent = JSON.stringify(translatedData, null, '\t');
		writeFileSync(targetFile, translatedContent, 'utf-8');
		
		console.log(`✅ ${LANGUAGE_NAMES[targetLanguage]} 翻译完成: ${targetFile}`);
		return true;
	} catch (error) {
		console.error(`❌ ${LANGUAGE_NAMES[targetLanguage]} 翻译失败:`, error);
		return false;
	}
}

/**
 * 主函数
 */
async function main() {
	console.log('🌍 Messages 翻译脚本启动...\n');
	
	const config = getConfig();
	
	console.log(`配置信息:`);
	console.log(`  Base URL: ${config.baseUrl}`);
	console.log(`  Model: ${config.model}`);
	console.log(`  目标语言: ${config.languages.map(lang => `${LANGUAGE_NAMES[lang]} (${lang})`).join(', ')}\n`);
	
	const languageConcurrencyLimit = 5; // 同时翻译的语言数量限制，避免文件写入冲突
	const results: { language: string; success: boolean }[] = [];
	
	console.log(`🚀 开始并发翻译，同时处理 ${languageConcurrencyLimit} 种语言...\n`);
	
	// 分批并发翻译语言
	for (let i = 0; i < config.languages.length; i += languageConcurrencyLimit) {
		const languageBatch = config.languages.slice(i, i + languageConcurrencyLimit);
		
		console.log(`📦 语言批次 ${Math.floor(i / languageConcurrencyLimit) + 1}/${Math.ceil(config.languages.length / languageConcurrencyLimit)}: ${languageBatch.map(lang => LANGUAGE_NAMES[lang]).join(', ')}`);
		
		// 并发翻译当前批次的语言
		const promises = languageBatch.map(async (language) => {
			const success = await translateLanguage(language, config);
			return { language, success };
		});
		
		try {
			const batchResults = await Promise.all(promises);
			results.push(...batchResults);
			
			const successCount = batchResults.filter(r => r.success).length;
			console.log(`✅ 语言批次完成: ${successCount}/${batchResults.length} 种语言翻译成功\n`);
		} catch (error) {
			console.error(`❌ 语言批次翻译失败:`, error);
			// 即使有错误，也继续处理下一批次
			const failedResults = languageBatch.map(language => ({ language, success: false }));
			results.push(...failedResults);
		}
		
		// 语言批次间添加延迟
		if (i + languageConcurrencyLimit < config.languages.length) {
			console.log(`⏳ 等待 3 秒后处理下一批语言...\n`);
			await new Promise(resolve => setTimeout(resolve, 3000));
		}
	}
	
	// 输出总结
	console.log('\n📊 翻译结果总结:');
	results.forEach(({ language, success }) => {
		const status = success ? '✅ 成功' : '❌ 失败';
		console.log(`  ${LANGUAGE_NAMES[language]} (${language}): ${status}`);
	});
	
	const successCount = results.filter(r => r.success).length;
	console.log(`\n🎉 完成! ${successCount}/${results.length} 种语言翻译成功`);
	
	// 显示预估的时间节省
	const totalLanguages = config.languages.length;
	const estimatedSequentialTime = totalLanguages * 30; // 假设每种语言需要30秒
	const estimatedConcurrentTime = Math.ceil(totalLanguages / languageConcurrencyLimit) * 30 + (Math.ceil(totalLanguages / languageConcurrencyLimit) - 1) * 3;
	const timeSaved = estimatedSequentialTime - estimatedConcurrentTime;
	
	console.log(`\n⚡ 性能提升:`);
	console.log(`  预估顺序执行时间: ${estimatedSequentialTime} 秒`);
	console.log(`  预估并发执行时间: ${estimatedConcurrentTime} 秒`);
	console.log(`  节省时间: ~${timeSaved} 秒 (${Math.round(timeSaved / estimatedSequentialTime * 100)}%)`);
}

// 执行主函数
main().catch(error => {
	console.error('脚本执行失败:', error);
	process.exit(1);
});