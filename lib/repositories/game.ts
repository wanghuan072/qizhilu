/**
 * 游戏数据访问层
 * 负责游戏相关数据的原始访问和简单筛选
 */

import fs from "fs"
import path from "path"
import {
	ApiRequestParams,
	GameData,
	GameDataList,
	GameTag,
	MetadataInfo,
} from "@/lib/types"

// 数据文件路径
const DATA_DIR = path.resolve(process.cwd(), "lib/data")

// 缓存变量
const gamesCache: GameDataList | null = null
let gameTagsCache: { locale: string; tags: GameTag[] }[] | null = null
// 按语言缓存游戏数据
const localeGamesCache: { [locale: string]: GameData[] } = {}

/**
 * 读取指定语言的游戏数据（带缓存）
 * @param locale 语言代码
 * @returns 游戏数据列表
 */
function loadGamesByLocale(locale: string): GameData[] {
	if (localeGamesCache[locale]) {
		return localeGamesCache[locale]
	}

	try {
		const filePath = path.join(DATA_DIR, `games-${locale}.json`)
		const fileContent = fs.readFileSync(filePath, "utf8")
		const games = JSON.parse(fileContent)
		localeGamesCache[locale] = games
		return games
	} catch (error) {
		console.error(`读取 ${locale} 语言游戏数据失败:`, error)
		return []
	}
}

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

// 为了保持向后兼容，我们保留原有的函数签名，但忽略 FetchOptions 参数
interface FetchOptions {
	[key: string]: any
}

/**
 * 获取指定语言的所有游戏
 * @param locale 语言代码
 * @param params 请求参数
 * @param options 请求选项
 * @returns 游戏列表
 */
export async function getAllGamesByLocale(
	locale: string,
	params: ApiRequestParams = {},
	options: FetchOptions = {},
): Promise<GameData[]> {
	// 从本地JSON文件中读取指定语言的游戏列表
	return Promise.resolve(loadGamesByLocale(locale))
}

/**
 * 根据语言和标签获取游戏列表
 * @param locale 语言代码
 * @param tagSlug 标签 slug
 * @param params 请求参数
 * @param options 请求选项
 * @returns 游戏列表
 */
export async function getGamesByLocaleAndTag(
	locale: string,
	tagSlug: string,
): Promise<GameData[]> {
	// 获取指定语言的所有游戏
	const games = await getAllGamesByLocale(locale)
	// 如果标签为空，返回所有游戏
	if (!tagSlug) {
		return games
	}
	// 过滤出包含指定标签的游戏
	return games.filter((game) => {
		const gameTags = game.tags || []
		return gameTags.some((tag) => tag.slug === tagSlug || tag.id === tagSlug)
	})
}

/**
 * 根据 slug 获取游戏
 * @param slug 游戏 slug
 * @param locale 语言代码
 * @param params 请求参数
 * @param options 请求选项
 * @returns 游戏详情
 */
export async function getGameBySlug(
	slug: string,
	locale: string,
	params: ApiRequestParams = {},
	options: FetchOptions = {},
): Promise<GameData> {
	// 直接从对应语言的游戏数据中查找
	const games = await getAllGamesByLocale(locale, params, options)

	if (slug === "/") {
		const primaryGame = games.find((game) => game.isPrimary)
		if (!primaryGame) {
			throw new Error("No primary game found for homepage")
		}
		return primaryGame
	}

	// 根据 slug 查找游戏
	const game = games.find((game) => game.slug === slug)
	if (!game) {
		throw new Error(`Game not found: ${slug} for locale: ${locale}`)
	}
	return game
}

/**
 * 根据语言获取游戏标签
 * @param locale 语言代码
 * @param params 请求参数
 * @param options 请求选项
 * @returns 游戏标签列表
 */
export async function getGameTagsByLocale(
	locale: string,
	params: ApiRequestParams = {},
	options: FetchOptions = {},
): Promise<GameTag[]> {
	// 从本地JSON文件中读取游戏标签
	const gameTagsData = loadGameTagsData()
	const localeData = gameTagsData.find((item) => item.locale === locale)
	return Promise.resolve(localeData?.tags || [])
}

/**
 * 根据 slug 获取游戏标签详情
 * @param tagSlug 标签 slug
 * @param locale 语言代码
 * @param params 请求参数
 * @param options 请求选项
 * @returns 游戏标签详情
 */
export async function getGameTagBySlug(
	tagSlug: string,
	locale: string,
	params: ApiRequestParams = {},
	options: FetchOptions = {},
): Promise<GameTag> {
	// 从本地JSON文件中查找标签
	const gameTagsData = loadGameTagsData()
	const localeData = gameTagsData.find((item) => item.locale === locale)
	if (!localeData) {
		throw new Error(`No tags found for locale: ${locale}`)
	}
	const tag = localeData.tags.find((tag) => tag.slug === tagSlug)
	if (!tag) {
		throw new Error(`Tag not found: ${tagSlug} for locale: ${locale}`)
	}
	return Promise.resolve(tag)
}

export async function getProjectGameMetadata(
	locale: string,
	gameSlug: string,
): Promise<MetadataInfo> {
	const game = await getGameBySlug(gameSlug, locale)
	return game.metadataInfo || ({} as MetadataInfo)
}
