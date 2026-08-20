/**
 * 标签数据访问层
 * 负责标签相关原始数据访问
 */

import fs from "fs"
import path from "path"
import { GameTag } from "@/lib/types"

// 数据文件路径
const DATA_DIR = path.resolve(process.cwd(), "lib/data")

// 缓存变量
let gameTagsCache: { locale: string; tags: GameTag[] }[] | null = null

/**
 * 读取游戏标签数据（带缓存）
 */
function loadGameTagsData(): { locale: string; tags: GameTag[] }[] {
	if (gameTagsCache) {
		return gameTagsCache
	}

	try {
		const filePath = path.join(DATA_DIR, "gameTags.json")
		const fileContent = fs.readFileSync(filePath, "utf8")
		gameTagsCache = JSON.parse(fileContent)
		return gameTagsCache!
	} catch (error) {
		console.error("读取游戏标签数据失败:", error)
		return []
	}
}

/**
 * 根据语言获取游戏标签
 * @param locale 语言代码
 * @param params 请求参数
 * @param options 请求选项
 * @returns 游戏标签列表
 */
export async function getGameTagsByLocale(locale: string): Promise<GameTag[]> {
	// 从本地JSON文件中读取游戏标签
	const gameTagsData = loadGameTagsData()
	const localeData = gameTagsData.find((item) => item.locale === locale)
	return Promise.resolve(localeData?.tags || [])
}

/**
 * 根据语言和 slug 获取标签详情
 * @param locale 语言代码
 * @param tagSlug 标签 slug
 * @param params 请求参数
 * @param options 请求选项
 * @returns 标签详情
 */
export async function getGameTagBySlug(
	locale: string,
	tagSlug: string,
): Promise<GameTag> {
	return getGameTagsByLocale(locale).then((tags) => {
		const tag = tags.find((tag) => tag.slug === tagSlug)
		if (!tag) {
			throw new Error(`Tag not found: ${tagSlug}`)
		}
		return tag
	})
}

// 注意：数据处理工具函数已移至 @/lib/utils/data-filters.ts
// 请直接从该文件导入使用
