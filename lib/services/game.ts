/**
 * 游戏业务逻辑层
 * 处理游戏相关的业务规则、数据聚合、内容组合等
 */

import * as categoryRepository from "@/lib/repositories/category"
import * as gameRepository from "@/lib/repositories/game"
import * as tagRepository from "@/lib/repositories/tag"
import { getSiteSettings } from "@/lib/services/site"
import {
	AllGameDataBase,
	AllGameDataListType,
	AllGamesPageData,
	GameData,
	GameDataBase,
	GamePageData,
	GameType,
	SearchGamePageData,
} from "@/lib/types"
import { FetchOptions } from "@/lib/utils/fetch/fetch-utils"
import {
	generateFAQPageJsonLd,
	generateGameMetadata,
	generateItemListJsonLd,
	generateSoftwareApplicationJsonLd,
	generateWebPageJsonLd,
	generateWebSiteJsonLd,
} from "@/lib/utils/seo"
import { alternatesCanonical } from "../i18n/locales"

export async function getAllGames(locale: string): Promise<GameDataBase[]> {
	const localeData = await gameRepository.getAllGamesByLocale(locale)
	if (!localeData) return []

	return localeData.map((it) => ({
		id: it.id,
		name: it.gameLocaleName || it.name,
		slug: it.isPrimary ? "/" : it.slug,
		screenshotUrl: it.screenshotUrl || "",
		gameLocaleName: it.gameLocaleName,
		gameLocaleSlogan: it.gameLocaleSlogan,
		gameLocaleDescription: it.gameLocaleDescription,
		gameInfo: it.gameInfo,
		isPrimary: it.isPrimary,
		recommendToHome: it.recommendToHome,
	}))
}

export async function getGameBySlug(
	locale: string,
	slug: string,
): Promise<GameDataBase> {
	const game = await gameRepository.getGameBySlug(slug, locale)
	return {
		id: game.id,
		name: game.gameLocaleName || game.name,
		slug: game.slug,
		screenshotUrl: game.screenshotUrl || "",
		gameLocaleName: game.gameLocaleName,
		gameLocaleSlogan: game.gameLocaleSlogan,
		gameLocaleDescription: game.gameLocaleDescription,
		gameInfo: game.gameInfo,
		isPrimary: game.isPrimary,
		metadataInfo: game.metadataInfo,
		recommendToHome: game.recommendToHome,
	}
}

// 已移除过时的本地化内容获取函数，现在直接使用 GameData 结构

/**
 * 根据分类获取游戏列表
 * @param locale 语言代码
 * @param slug 分类 slug
 * @param options 请求选项
 * @returns 分类下的游戏列表和分类信息
 */
export async function getGamesByCategory(
	locale: string,
	slug: string,
	options: FetchOptions = {},
): Promise<{
	games: GameDataBase[]
	categoryName: string
	categoryDescription: string
}> {
	try {
		const [category, gameDataList] = await Promise.all([
			categoryRepository.getGameCategoryDetailByLocale(locale, slug),
			gameRepository.getAllGamesByLocale(locale, options),
		])

		if (!category) {
			throw new Error(`Category not found: ${slug}`)
		}

		// 提取对应语言的游戏数据

		if (!gameDataList) {
			return {
				games: [],
				categoryName: category.name,
				categoryDescription:
					category.metadata?.description || `Explore ${category.name} games`,
			}
		}

		// 根据分类筛选游戏
		const categoryGames = gameDataList.filter((game) => {
			const gameCategories = game.categories || []
			return gameCategories.some(
				(cat) => cat.code === category.code || cat.slug === slug,
			)
		})

		const games: GameDataBase[] = categoryGames.map((game) => ({
			id: game.id,
			name: game.gameLocaleName || game.name,
			slug: game.slug,
			screenshotUrl: game.screenshotUrl,
			gameLocaleName: game.gameLocaleName,
			gameLocaleSlogan: game.gameLocaleSlogan,
			gameLocaleDescription: game.gameLocaleDescription,
			gameInfo: game.gameInfo,
			isPrimary: game.isPrimary,
			recommendToHome: game.recommendToHome,
		}))

		return {
			games,
			categoryName: category.name,
			categoryDescription:
				category.metadata?.description || `Explore ${category.name} games`,
		}
	} catch (error) {
		console.error(`获取分类游戏失败: ${slug}, locale: ${locale}`, error)
		// 返回空的分类游戏数据作为回退，兼容构建时API不可用的情况
		return {
			games: [],
			categoryName: slug,
			categoryDescription: `Explore ${slug} games`,
		}
	}
}

/**
 * 根据标签获取游戏列表
 * @param locale 语言代码
 * @param slug 标签 slug
 * @returns 标签下的游戏列表和标签信息
 */
export async function getGamesByTag(
	locale: string,
	slug: string,
): Promise<{
	games: GameDataBase[]
	tagName: string
	tagDescription: string
}> {
	try {
		const [tag, gameDataList] = await Promise.all([
			tagRepository.getGameTagBySlug(locale, slug),
			gameRepository.getGamesByLocaleAndTag(locale, slug),
		])

		if (!tag) {
			throw new Error(`Tag not found: ${slug}`)
		}

		// 提取对应语言的游戏数据

		if (!gameDataList) {
			return {
				games: [],
				tagName: tag.name,
				tagDescription: tag.description || `Games tagged with ${tag.name}`,
			}
		}

		// 根据标签筛选游戏 - 使用简化的筛选逻辑
		const tagGames = gameDataList.filter((game) =>
			game.tags?.some(
				(gameTag) => gameTag.slug === slug || gameTag.id === tag.id,
			),
		)

		const games: GameDataBase[] = tagGames.map((game) => ({
			id: game.id,
			name: game.gameLocaleName || game.name,
			slug: game.slug,
			screenshotUrl: game.screenshotUrl,
			gameLocaleName: game.gameLocaleName,
			gameLocaleSlogan: game.gameLocaleSlogan,
			gameLocaleDescription: game.gameLocaleDescription,
			gameInfo: game.gameInfo,
			isPrimary: game.isPrimary,
			recommendToHome: game.recommendToHome,
		}))

		return {
			games,
			tagName: tag.name,
			tagDescription: tag.description || `Games tagged with ${tag.name}`,
		}
	} catch (error) {
		console.error(`获取标签游戏失败: ${slug}, locale: ${locale}`, error)
		// 返回空的标签游戏数据作为回退，兼容构建时API不可用的情况
		return {
			games: [],
			tagName: slug,
			tagDescription: `Games tagged with ${slug}`,
		}
	}
}

// 已移除 extractLocaleContent 函数，现在直接使用 GameData 结构

// 已移除 calculateRelatedGames 函数，现在在 getGamePageData 中使用简化逻辑

/**
 * 获取游戏页面完整数据
 * @param slug 游戏 slug，当 slug === "/" 时表示获取首页游戏
 * @param locale 语言代码
 * @param options 请求选项
 * @returns 游戏页面完整数据
 */
export async function getGamePageData(
	slug: string,
	locale: string,
	options: FetchOptions = {},
): Promise<GamePageData> {
	try {
		let game: GameData
		let allGames: GameData[]

		// 根据 slug 获取游戏数据
		if (slug === "/") {
			// 首页游戏：获取所有游戏并筛选 isPrimary 为 true 的游戏
			const gameDataList = await gameRepository.getAllGamesByLocale(
				locale,
				options,
			)
			if (!gameDataList) {
				console.error("No locale data found for homepage")
				return createFallbackGamePageData(locale)
			}
			allGames = gameDataList
			const primaryGame = allGames.find((g) => g.isPrimary)
			if (!primaryGame) {
				console.error("No primary game found for homepage")
				return createFallbackGamePageData(locale)
			}
			game = primaryGame
		} else {
			// 普通游戏：并行获取游戏和所有游戏列表
			try {
				const [gameResult, allGamesResult] = await Promise.all([
					gameRepository.getGameBySlug(slug, locale, options),
					gameRepository.getAllGamesByLocale(locale, options),
				])
				game = gameResult
				allGames = allGamesResult || []
			} catch (error) {
				console.error(`Failed to fetch game data for ${slug}`, error)
				return createFallbackGamePageData(locale)
			}
		}

		// 获取站点设置
		const siteSettings = await getSiteSettings()

		if (!game) {
			console.error(`Game not found: ${slug}`)
			return createFallbackGamePageData(locale)
		}

		// 计算相关游戏 - 优先相同分类游戏，不足时随机获取其他游戏，优先包含主页游戏
		const availableGamesForRelated = allGames.filter((g) => g.id !== game.id)
		const relatedGamesRaw: GameData[] = []

		// 1. 优先添加主页游戏（如果当前游戏不是主页游戏）
		if (!game.isPrimary) {
			const primaryGame = availableGamesForRelated.find((g) => g.isPrimary)
			if (primaryGame) {
				relatedGamesRaw.push(primaryGame)
			}
		}

		// 2. 添加相同分类的游戏
		if (game.categories && game.categories.length > 0) {
			const sameCategoryGames = availableGamesForRelated.filter((g) => {
				if (g.id === game.id || relatedGamesRaw.some((rg) => rg.id === g.id))
					return false
				if (!g.categories || g.categories.length === 0) return false

				return game.categories!.some((gameCategory) =>
					g.categories!.some(
						(gCategory) =>
							gCategory.code === gameCategory.code ||
							gCategory.slug === gameCategory.slug,
					),
				)
			})
			relatedGamesRaw.push(
				...sameCategoryGames.slice(0, 6 - relatedGamesRaw.length),
			)
		}

		// 3. 如果数量不足，随机添加其他游戏
		if (relatedGamesRaw.length < 6) {
			const remainingGames = availableGamesForRelated.filter(
				(g) => !relatedGamesRaw.some((rg) => rg.id === g.id),
			)
			const shuffledRemaining = [...remainingGames].sort(
				() => Math.random() - 0.5,
			)
			relatedGamesRaw.push(
				...shuffledRemaining.slice(0, 6 - relatedGamesRaw.length),
			)
		}

		// GameData 已经包含了 GameDataBase 所需的所有属性，直接使用
		const relatedGames: GameDataBase[] = relatedGamesRaw as GameDataBase[]
		// 获取最新游戏 - 按创建时间倒序排序
		const latestGamesRaw = allGames
			.filter((g) => g.id !== game.id)
			.sort((a, b) => {
				if (!a.createTime && !b.createTime) return 0
				if (!a.createTime) return 1
				if (!b.createTime) return -1
				// 直接比较字符串日期（ISO格式可以直接比较）
				return b.createTime.localeCompare(a.createTime)
			})
			.slice(0, 8)
		// GameData 已经包含了 GameDataBase 所需的所有属性，直接使用
		const latestGames: GameDataBase[] = latestGamesRaw as GameDataBase[]
		// 获取热门游戏 - 随机获取最多8个游戏
		const availableGamesForPopular = allGames.filter((g) => g.id !== game.id)
		const shuffledPopularGames = [...availableGamesForPopular].sort(
			() => Math.random() - 0.5,
		)
		const popularGamesRaw = shuffledPopularGames.slice(0, 8)
		// GameData 已经包含了 GameDataBase 所需的所有属性，直接使用
		const popularGames: GameDataBase[] = popularGamesRaw as GameDataBase[]
		// 生成页面元数据
		const metadata = await generateGameMetadata(locale, slug)

		// 获取 baseUrl 数据
		const baseUrl = alternatesCanonical(locale, "/")
		// 首先生成VideoGame实体（不包含@context）
		const videoGameEntity = generateSoftwareApplicationJsonLd(
			game,
			game.gameLocaleName || game.name,
			game.gameLocaleDescription || "",
			game.screenshotUrl,
			game.gameInfo,
			siteSettings,
			baseUrl,
			false,
		)
		// 移除@context，因为它将作为mainEntity嵌入到WebPage中
		const { "@context": _, ...videoGameWithoutContext } = videoGameEntity
		const gameSlug = game.isPrimary ? "" : `/games/${game.slug}`
		// 构建面包屑导航
		const breadcrumbItems = [
			{ label: "Home", href: "" },
			...(!game.isPrimary ? [{ label: "Games", href: "/games" }] : []),
			{
				label: game.gameLocaleName || game.name,
				href: gameSlug,
				isActive: true,
			},
		]

		const jsonLdData: {
			website?: any
			webPage?: any
			faq?: any
			videos?: any[]
			organization?: any
		} = {
			website: generateWebSiteJsonLd(siteSettings, baseUrl, true),
			// 生成WebPage JSON-LD，将VideoGame作为mainEntity
			webPage: generateWebPageJsonLd(
				game.gameLocaleName || game.name,
				game.gameLocaleDescription ||
					`Play ${game.gameLocaleName || game.name} online`,
				`${baseUrl}${gameSlug}`,
				siteSettings,
				breadcrumbItems,
				videoGameWithoutContext, // 作为mainEntity传入
				baseUrl, // 传入网站基础URL
			),
		}

		// 查找 FAQ 内容
		const faqContent = game.contents?.find((content) => content.type === "faq")
		if (faqContent && faqContent.type === "faq") {
			jsonLdData.faq = generateFAQPageJsonLd(faqContent.items)
		}

		return {
			game: game,
			relatedGames,
			popularGames,
			latestGames,
			metadata,
			jsonLdData,
			ads: siteSettings.adsSettings || [],
		}
	} catch (error) {
		console.error(`获取游戏页面数据失败: ${slug}, locale: ${locale}`, error)
		return createFallbackGamePageData(locale)
	}
}

/**
 * 创建空的游戏页面数据作为回退
 */
function createFallbackGamePageData(locale: string): GamePageData {
	const emptyGames: GameDataBase[] = []

	const fallbackGame: GameData = {
		id: "",
		name: "Game Not Found",
		slug: "",
		screenshotUrl: "",
		type: GameType.Iframe,
		iframeUrl: "",
		isPrimary: false,
		recommendToHome: false,
		gameLocaleName: "Game Not Found",
		gameLocaleDescription: "",
		gameLocaleSlogan: "",
		metadataInfo: {
			title: "Game Not Found",
			name: "Game Not Found",
			description: "",
		},
		gameInfo: {
			id: "",
			developer: "",
			releaseDate: "",
			technology: "HTML5",
			platform: "Web Browser",
			ageRating: "Everyone",
			localization: locale,
			screenOrientation: "Any",
			cloudSaves: "Not Available",
			authorizationSupport: "No",
			rating: 0,
		},
		categories: [],
		tags: [],
		contents: [],
		relatedLinks: [],
		comments: [],
	}

	return {
		game: fallbackGame,
		relatedGames: emptyGames,
		popularGames: emptyGames,
		latestGames: emptyGames,
		metadata: {
			title: "Game Not Found",
			description: "",
		},
		jsonLdData: {},
		ads: [],
	}
}

/**
 * 获取所有游戏页面数据
 * 用于游戏列表页面，包含游戏列表、热门游戏、最新游戏、最近更新游戏、分类和标签数据
 * @param locale 语言代码
 * @param categorySlug 可选的分类slug，用于筛选特定分类的游戏。支持特殊值：
 *   - "popular": 热门游戏，按更新时间倒序排序
 *   - "latest": 最新游戏，按创建时间倒序排序
 *   - "recent": 最近更新游戏，按更新时间倒序排序
 *   - 其他值: 按分类slug筛选游戏
 * @param tagSlug 可选的标签slug，用于筛选特定标签的游戏
 * @param currentPath 当前页面路径，用于生成正确的结构化数据URL，如 "/games", "/games/popular", "/games/new-game"
 * @param t 国际化翻译函数，用于生成本地化的面包屑标签
 * @returns 所有游戏页面数据，包含游戏列表、热门游戏、最新游戏、最近更新游戏、分类和标签数据
 */
export async function getAllGamesPageData(
	locale: string,
	categorySlug?: string,
	tagSlug?: string,
	currentPath = "/games",
	t?: (key: string) => string,
): Promise<AllGamesPageData> {
	try {
		// 获取所有游戏、分类、标签数据和站点设置
		const [gameDataList, categories, tags, siteSettings] = await Promise.all([
			gameRepository.getAllGamesByLocale(locale),
			categoryRepository.getGameCategoriesByLocale(locale),
			tagRepository.getGameTagsByLocale(locale),
			getSiteSettings(),
		])

		// 提取对应语言的游戏数据
		if (!gameDataList) {
			throw new Error(`No games found for locale: ${locale}`)
		}

		// 从 GameData[] 开始筛选
		let filteredGames = gameDataList

		// 根据分类筛选游戏
		if (categorySlug) {
			// 检查是否为特殊值
			if (
				categorySlug === "popular" ||
				categorySlug === "latest" ||
				categorySlug === "recent"
			) {
				// 这些特殊分类不需要额外筛选，只是排序不同
				// 排序逻辑将在后面处理
			} else {
				// 普通分类筛选
				const targetCategory = categories.find(
					(cat) => cat.slug === categorySlug,
				)
				if (targetCategory) {
					filteredGames = filteredGames.filter((game) => {
						const gameCategories = game.categories || []
						return gameCategories.some(
							(cat) =>
								cat.code === targetCategory.code || cat.slug === categorySlug,
						)
					})
				}
			}
		}

		// 根据标签筛选游戏
		if (tagSlug) {
			const targetTag = tags.find((tag) => tag.slug === tagSlug)
			if (targetTag) {
				filteredGames = filteredGames.filter((game) => {
					const gameTags = game.tags || []
					return gameTags.some(
						(tag) => tag.slug === tagSlug || tag.id === targetTag.id,
					)
				})
			}
		}

		// 转换为 AllGameDataBase 格式
		const gamesData: AllGameDataBase[] = filteredGames.map((game) => {
			const gameDataBase: AllGameDataBase = {
				id: game.id,
				name: game.gameLocaleName || game.name,
				slug: game.slug,
				recommendToHome: game.recommendToHome,
				screenshotUrl: game.screenshotUrl || "",
				gameLocaleName: game.gameLocaleName,
				gameLocaleSlogan: game.gameLocaleSlogan,
				gameLocaleDescription: game.gameLocaleDescription,
				gameInfo: game.gameInfo,
				isPrimary: game.isPrimary,
				categories: (game.categories || []).map((cat) => ({
					code: cat.code,
					slug: cat.slug || cat.code,
					name:
						categories.find((c) => c.code === cat.code || c.slug === cat.slug)
							?.name ||
						cat.name ||
						cat.code,
				})),
				tags: (game.tags || []).map((tag) => ({
					slug: tag.slug,
					name:
						tags.find((t) => t.id === tag.id || t.slug === tag.slug)?.name ||
						tag.name,
				})),
				// 创建时间和更新时间使用当前时间作为占位符
				createTime: game.createTime || "",
				updateTime: game.updateTime || "",
			}
			return gameDataBase
		})

		// 生成 JSON-LD 结构化数据
		const baseUrl = alternatesCanonical(locale, "")

		const gamesWithLocaleContent = gamesData
			.filter((item): item is AllGameDataBase => !("type" in item))
			.map((game) => {
				const slug = game.isPrimary ? "" : `/games/${game.slug}`
				return {
					name: game.name,
					slug: game.slug,
					image: game.screenshotUrl || "",
					url: `${baseUrl}${slug}`,
				}
			})

		// 构建页面标题和描述
		const pageTitle = categorySlug
			? `${categories.find((c) => c.code === categorySlug)?.name || categorySlug} - All Games`
			: tagSlug
				? `${tags.find((t) => t.id === tagSlug)?.name || tagSlug} - All Games`
				: "All Games"

		const pageDescription = categorySlug
			? `Browse ${categories.find((c) => c.code === categorySlug)?.name || categorySlug} games`
			: tagSlug
				? `Browse games tagged with ${tags.find((t) => t.id === tagSlug)?.name || tagSlug}`
				: "Browse all available games"

		// 面包屑导航 - 使用国际化翻译
		const breadcrumbItems = [
			{ label: t?.("Common.Home") || "Home", href: "/" },
			{
				label: t?.("Common.Games") || "Games",
				href: "/games",
				isActive: currentPath === "/games",
			},
		]

		// 根据 currentPath 构建正确的页面URL和面包屑
		let pageUrl = `${baseUrl}${currentPath}`

		// 如果不是基础的 /games 路径，添加对应的面包屑项
		if (currentPath !== "/games" && breadcrumbItems[1]) {
			breadcrumbItems[1].isActive = false

			if (currentPath === "/games/popular") {
				breadcrumbItems.push({
					label: t?.("Game.hotGamesTitle") || "Popular Games",
					href: "/games/popular",
					isActive: true,
				})
			} else if (currentPath === "/games/new-game") {
				breadcrumbItems.push({
					label: t?.("Game.latestGamesTitle") || "New Games",
					href: "/games/new-game",
					isActive: true,
				})
			} else if (currentPath === "/games/recently-played") {
				breadcrumbItems.push({
					label: t?.("Game.recentlyPlayed") || "Recently Played",
					href: "/games/recently-played",
					isActive: true,
				})
			} else if (currentPath === "/games/favorites") {
				breadcrumbItems.push({
					label: t?.("Common.myFavorites") || "My Favorites",
					href: "/games/favorites",
					isActive: true,
				})
			} else if (currentPath.startsWith("/c/")) {
				// 分类页面的面包屑会在后面的分类处理部分添加
			} else if (currentPath.startsWith("/tag/")) {
				// 标签页面的面包屑会在后面的标签处理部分添加
			} else if (currentPath === "/") {
				// 首页不需要额外的面包屑
				breadcrumbItems[1].isActive = false
			}
		}

		// 如果有分类或标签过滤，在现有路径基础上继续构建
		// 但要避免重复添加已经在 currentPath 中包含的部分
		if (categorySlug) {
			// 特殊的功能性分类（popular, latest, recent）不应该被添加到URL中
			// 因为它们已经通过 currentPath 体现了
			const functionalCategories = ["popular", "latest", "recent"]
			const isFunctionalCategory = functionalCategories.includes(categorySlug)

			// 只有在当前路径不是特殊分类页面且不是功能性分类时，才添加分类到URL
			if (
				!isFunctionalCategory &&
				!currentPath.includes(categorySlug) &&
				!currentPath.startsWith("/c/")
			) {
				breadcrumbItems.push({
					label:
						categories.find((c) => c.code === categorySlug)?.name ||
						categorySlug,
					href: `/c/${categorySlug}`,
					isActive: true,
				})
				pageUrl = `${pageUrl}/${categorySlug}`
			} else if (currentPath.startsWith("/c/")) {
				// 对于 /c/[slug] 页面，面包屑已经在页面中处理
			}
		}
		if (tagSlug) {
			// 只有在当前路径不包含该标签时，才添加标签到URL
			if (!currentPath.includes(tagSlug) && !currentPath.startsWith("/tag/")) {
				breadcrumbItems.push({
					label: tags.find((t) => t.id === tagSlug)?.name || tagSlug,
					href: `/tag/${tagSlug}`,
					isActive: true,
				})
				pageUrl = `${pageUrl}/${tagSlug}`
			} else if (currentPath.startsWith("/tag/")) {
				// 对于 /tag/[slug] 页面，面包屑已经在页面中处理
			}
		}

		const jsonLdData = {
			webPage: generateWebPageJsonLd(
				pageTitle,
				pageDescription,
				pageUrl,
				siteSettings,
				breadcrumbItems,
				generateItemListJsonLd(
					pageTitle,
					pageDescription,
					gamesWithLocaleContent,
				),
				baseUrl, // 传入网站基础URL
			),
		}

		return {
			ads: siteSettings.adsSettings || [],
			games: {
				locale,
				data: gamesData,
			},
			categories: {
				locale,
				data: categories,
			},
			tags: {
				locale,
				data: tags,
			},
			jsonLdData,
		}
	} catch (error) {
		console.error(`获取所有游戏页面数据失败, locale: ${locale}`, error)
		throw error
	}
}

/**
 * 获取搜索页面数据
 * 用于搜索页面，仅包含游戏、分类和标签数据，不支持文章搜索
 * @param locale 语言代码
 * @param options 请求选项
 * @returns 搜索页面数据，包含游戏、分类和标签数据
 */
export async function getSearchGamePageData(
	locale: string,
	options: FetchOptions = {},
): Promise<SearchGamePageData> {
	try {
		// 获取所有游戏、分类、标签数据
		const [gameDataList, categories, tags] = await Promise.all([
			gameRepository.getAllGamesByLocale(locale, options),
			categoryRepository.getGameCategoriesByLocale(locale),
			tagRepository.getGameTagsByLocale(locale),
		])

		// 提取对应语言的游戏数据
		if (!gameDataList) {
			throw new Error(`No games found for locale: ${locale}`)
		}

		// 转换为 GameDataBase 格式（注意：SearchGamePageData 使用的是 GameDataBase[]，不是 AllGameDataBase[]）
		const gamesData: GameDataBase[] = gameDataList.map((game) => ({
			id: game.id,
			name: game.gameLocaleName || game.name,
			slug: game.slug,
			screenshotUrl: game.screenshotUrl || "",
			gameLocaleName: game.gameLocaleName,
			gameLocaleSlogan: game.gameLocaleSlogan,
			gameLocaleDescription: game.gameLocaleDescription,
			gameInfo: game.gameInfo,
			isPrimary: game.isPrimary,
			metadataInfo: game.metadataInfo,
			recommendToHome: game.recommendToHome,
		}))

		return {
			games: {
				locale,
				data: gamesData,
			},
			categories: {
				locale,
				data: categories,
			},
			tags: {
				locale,
				data: tags,
			},
		}
	} catch (error) {
		console.error(`获取搜索页面数据失败, locale: ${locale}`, error)
		// 返回空的搜索页面数据作为回退，兼容构建时API不可用的情况
		return {
			games: {
				locale,
				data: [],
			},
			categories: {
				locale,
				data: [],
			},
			tags: {
				locale,
				data: [],
			},
		}
	}
}

// 注意：getGameSlug 工具函数已移至 @/lib/utils/navigation.ts
// 请直接从该文件导入使用
