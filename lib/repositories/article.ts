/**
 * 文章数据访问层
 * 负责文章相关原始数据访问
 */

import fs from "fs"
import path from "path"
import { ApiRequestParams, ArticleCategory, ArticlePost } from "@/lib/types"

// 数据文件路径
const DATA_DIR = path.resolve(process.cwd(), "lib/data")

// 缓存变量
let articlesCache: ArticlePost[] | null = null

/**
 * 读取文章数据（带缓存）
 */
function loadArticlesData(): ArticlePost[] {
	if (articlesCache) {
		return articlesCache
	}

	try {
		const filePath = path.join(DATA_DIR, "articles.json")
		const fileContent = fs.readFileSync(filePath, "utf8")
		articlesCache = JSON.parse(fileContent)
		return articlesCache!
	} catch (error) {
		console.error("读取文章数据失败:", error)
		return []
	}
}

// 为了保持向后兼容，我们保留原有的函数签名，但忽略 FetchOptions 参数
interface FetchOptions {
	[key: string]: any
}

/**
 * 根据语言获取文章列表
 * @param locale 语言代码
 * @param params 请求参数
 * @param options 请求选项
 * @returns 文章列表
 */
export async function getArticlesByLocale(
	locale: string,
	params: ApiRequestParams = {},
	options: FetchOptions = {},
): Promise<ArticlePost[]> {
	// 从本地JSON文件中读取文章列表
	const articlesData = loadArticlesData()
	return Promise.resolve(
		articlesData.filter((article: ArticlePost) => article.locale === locale),
	)
}

/**
 * 根据语言和 slug 获取文章详情
 * @param locale 语言代码
 * @param slug 文章 slug
 * @param params 请求参数
 * @param options 请求选项
 * @returns 文章详情
 */
export async function getArticleBySlug(
	locale: string,
	slug: string,
	params: ApiRequestParams = {},
	options: FetchOptions = {},
): Promise<ArticlePost | null> {
	// 从本地JSON文件中查找文章
	const articlesData = loadArticlesData()
	const article = articlesData.find(
		(article: ArticlePost) =>
			article.locale === locale && article.slug === slug,
	)
	if (!article) {
		return null
	}
	return Promise.resolve(article)
}

// 注意：数据处理工具函数已移至 @/lib/utils/data-filters.ts
// 请直接从该文件导入使用
