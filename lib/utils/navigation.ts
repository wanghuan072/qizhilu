/**
 * 导航和面包屑工具函数
 * 处理导航路径生成、面包屑构建等纯计算逻辑
 */

import { BreadcrumbItem, GameCategory, GameData, GameTag } from "@/lib/types"

/**
 * 构建主页面包屑
 * @param locale 语言代码
 * @returns 主页面包屑
 */
export function buildHomeBreadcrumb(locale: string): BreadcrumbItem[] {
	return [
		{
			label: "首页",
			href: `/${locale}`,
			isActive: true,
		},
	]
}

/**
 * 构建游戏详情页面包屑
 * @param locale 语言代码
 * @param game 游戏内容
 * @param categories 分类列表（用于构建分类路径）
 * @returns 游戏详情页面包屑
 */
export function buildGameBreadcrumb(
	locale: string,
	game: GameData,
	categories: GameCategory[] = [],
): BreadcrumbItem[] {
	const breadcrumbs: BreadcrumbItem[] = [
		{
			label: "首页",
			href: `/${locale}`,
			isActive: false,
		},
		{
			label: "游戏",
			href: `/${locale}/games`,
			isActive: false,
		},
	]

	// 如果游戏有分类，添加分类路径
	if (game.categories && game.categories.length > 0) {
		const primaryCategory = game.categories[0]

		if (primaryCategory) {
			// 如果有父分类，先添加父分类
			if (primaryCategory.parentCode) {
				const parentCategory = categories.find(
					(cat) => cat.code === primaryCategory.parentCode,
				)
				if (parentCategory) {
					breadcrumbs.push({
						label: parentCategory.name,
						href: `/${locale}/c/${parentCategory.slug}`,
						isActive: false,
					})
				}
			}

			// 添加当前分类
			breadcrumbs.push({
				label: primaryCategory.name,
				href: `/${locale}/c/${primaryCategory.slug}`,
				isActive: false,
			})
		}
	}

	// 添加游戏本身
	breadcrumbs.push({
		label: game.gameLocaleName || game.name,
		href: `/${locale}/games/${game.slug}`,
		isActive: true,
	})

	return breadcrumbs
}

/**
 * 构建分类页面包屑
 * @param locale 语言代码
 * @param category 当前分类
 * @param parentCategories 父分类列表
 * @returns 分类页面包屑
 */
export function buildCategoryBreadcrumb(
	locale: string,
	category: GameCategory,
	parentCategories: GameCategory[] = [],
): BreadcrumbItem[] {
	const breadcrumbs: BreadcrumbItem[] = [
		{
			label: "首页",
			href: `/${locale}`,
			isActive: false,
		},
		{
			label: "游戏分类",
			href: `/${locale}/categories`,
			isActive: false,
		},
	]

	// 添加父分类路径
	parentCategories.forEach((parentCategory) => {
		breadcrumbs.push({
			label: parentCategory.name,
			href: `/${locale}/c/${parentCategory.slug}`,
			isActive: false,
		})
	})

	// 添加当前分类
	breadcrumbs.push({
		label: category.name,
		href: `/${locale}/c/${category.slug}`,
		isActive: true,
	})

	return breadcrumbs
}

/**
 * 构建标签页面包屑
 * @param locale 语言代码
 * @param tag 标签
 * @returns 标签页面包屑
 */
export function buildTagBreadcrumb(
	locale: string,
	tag: GameTag,
): BreadcrumbItem[] {
	return [
		{
			label: "首页",
			href: `/${locale}`,
			isActive: false,
		},
		{
			label: "游戏标签",
			href: `/${locale}/tags`,
			isActive: false,
		},
		{
			label: tag.name,
			href: `/${locale}/tag/${tag.slug}`,
			isActive: true,
		},
	]
}

/**
 * 构建搜索页面包屑
 * @param locale 语言代码
 * @param searchQuery 搜索关键词
 * @returns 搜索页面包屑
 */
export function buildSearchBreadcrumb(
	locale: string,
	searchQuery?: string,
): BreadcrumbItem[] {
	const breadcrumbs: BreadcrumbItem[] = [
		{
			label: "首页",
			href: `/${locale}`,
			isActive: false,
		},
		{
			label: "搜索",
			href: `/${locale}/search`,
			isActive: !searchQuery,
		},
	]

	if (searchQuery) {
		breadcrumbs.push({
			label: `搜索结果: ${searchQuery}`,
			href: `/${locale}/search?q=${encodeURIComponent(searchQuery)}`,
			isActive: true,
		})
	}

	return breadcrumbs
}

/**
 * 构建通用页面面包屑
 * @param locale 语言代码
 * @param pageTitle 页面标题
 * @param pagePath 页面路径
 * @param parentPages 父页面列表
 * @returns 通用页面面包屑
 */
export function buildGenericBreadcrumb(
	locale: string,
	pageTitle: string,
	pagePath: string,
	parentPages: Array<{ title: string; path: string }> = [],
): BreadcrumbItem[] {
	const breadcrumbs: BreadcrumbItem[] = [
		{
			label: "首页",
			href: `/${locale}`,
			isActive: false,
		},
	]

	// 添加父页面
	parentPages.forEach((parent) => {
		breadcrumbs.push({
			label: parent.title,
			href: `/${locale}${parent.path}`,
			isActive: false,
		})
	})

	// 添加当前页面
	breadcrumbs.push({
		label: pageTitle,
		href: `/${locale}${pagePath}`,
		isActive: true,
	})

	return breadcrumbs
}

/**
 * 获取分类层级路径
 * @param category 当前分类
 * @param allCategories 所有分类列表
 * @returns 从根分类到当前分类的路径
 */
export function getCategoryPath(
	category: GameCategory,
	allCategories: GameCategory[],
): GameCategory[] {
	const path: GameCategory[] = []
	let currentCategory: GameCategory | undefined = category

	while (currentCategory) {
		path.unshift(currentCategory)

		if (currentCategory.parentCode) {
			currentCategory = allCategories.find(
				(cat) => cat.code === currentCategory!.parentCode,
			)
		} else {
			break
		}
	}

	return path
}

/**
 * 生成规范化的 URL 路径
 * @param locale 语言代码
 * @param segments 路径片段
 * @returns 完整的 URL 路径
 */
export function buildPath(locale: string, ...segments: string[]): string {
	const cleanSegments = segments
		.filter(Boolean)
		.map((segment) => (segment.startsWith("/") ? segment.slice(1) : segment))

	return `/${locale}/${cleanSegments.join("/")}`
}

/**
 * 生成游戏相关页面的路径
 */
export const GamePaths = {
	/**
	 * 游戏详情页路径
	 */
	detail: (locale: string, slug: string) => buildPath(locale, "games", slug),

	/**
	 * 游戏列表页路径
	 */
	list: (locale: string) => buildPath(locale, "games"),

	/**
	 * 分类页路径
	 */
	category: (locale: string, slug: string) => buildPath(locale, "c", slug),

	/**
	 * 标签页路径
	 */
	tag: (locale: string, slug: string) => buildPath(locale, "tag", slug),

	/**
	 * 搜索页路径
	 */
	search: (locale: string, query?: string) => {
		const path = buildPath(locale, "search")
		return query ? `${path}?q=${encodeURIComponent(query)}` : path
	},
}

/**
 * 获取游戏页面路径（首页不需要/games/）
 * @param slug 游戏slug（首页不需要/games/）
 * @returns 游戏页面路径
 */
export function getGameSlug(slug: string): string {
	return slug === "/" ? "/" : `/games/${slug}`
}
