/**
 * 数据过滤和排序工具函数
 * 包含各种数据处理的纯计算函数
 */

import { ArticlePost, GameCategory, GameTag } from "@/lib/types"

// ==================== 文章相关工具函数 ====================

/**
 * 根据分类筛选文章
 * @param articles 文章列表
 * @param categoryId 分类 ID
 * @returns 筛选后的文章列表
 */
export function filterArticlesByCategory(
	articles: ArticlePost[],
	categoryId: string,
): ArticlePost[] {
	return articles.filter((article) => article.category?.id === categoryId)
}

/**
 * 根据标签筛选文章
 * @param articles 文章列表
 * @param tag 标签名称
 * @returns 筛选后的文章列表
 */
export function filterArticlesByTag(
	articles: ArticlePost[],
	tag: string,
): ArticlePost[] {
	return articles.filter((article) => article.tags?.includes(tag))
}

/**
 * 根据作者筛选文章
 * @param articles 文章列表
 * @param author 作者名称
 * @returns 筛选后的文章列表
 */
export function filterArticlesByAuthor(
	articles: ArticlePost[],
	author: string,
): ArticlePost[] {
	return articles.filter((article) => article.author === author)
}

/**
 * 根据更新时间排序文章
 * @param articles 文章列表
 * @param order 排序方向
 * @returns 排序后的文章列表
 */
export function sortArticlesByUpdateTime(
	articles: ArticlePost[],
	order: "asc" | "desc" = "desc",
): ArticlePost[] {
	return [...articles].sort((a, b) => {
		const timeA = new Date(a.updateTime).getTime()
		const timeB = new Date(b.updateTime).getTime()
		return order === "desc" ? timeB - timeA : timeA - timeB
	})
}

/**
 * 根据 ID 查找文章
 * @param articles 文章列表
 * @param id 文章 ID
 * @returns 文章详情或 undefined
 */
export function findArticleById(
	articles: ArticlePost[],
	id: string,
): ArticlePost | undefined {
	return articles.find((article) => article.id === id)
}

/**
 * 根据 slug 查找文章
 * @param articles 文章列表
 * @param slug 文章 slug
 * @returns 文章详情或 undefined
 */
export function findArticleBySlug(
	articles: ArticlePost[],
	slug: string,
): ArticlePost | undefined {
	return articles.find((article) => article.slug === slug)
}

/**
 * 根据文章 ID 列表获取文章详情
 * @param articles 文章列表
 * @param articleIds 文章 ID 列表
 * @returns 文章详情列表
 */
export function getArticlesByIds(
	articles: ArticlePost[],
	articleIds: string[],
): ArticlePost[] {
	return articleIds
		.map((id) => findArticleById(articles, id))
		.filter((article): article is ArticlePost => article !== undefined)
}

// ==================== 分类相关工具函数 ====================

/**
 * 根据父分类筛选子分类
 * @param categories 分类列表
 * @param parentCode 父分类编号
 * @returns 子分类列表
 */
export function filterCategoriesByParent(
	categories: GameCategory[],
	parentCode?: string,
): GameCategory[] {
	return categories.filter((category) => category.parentCode === parentCode)
}

/**
 * 根据分类编号查找分类
 * @param categories 分类列表
 * @param code 分类编号
 * @returns 分类详情或 undefined
 */
export function findCategoryByCode(
	categories: GameCategory[],
	code: string,
): GameCategory | undefined {
	return categories.find((category) => category.code === code)
}

/**
 * 根据 slug 查找分类
 * @param categories 分类列表
 * @param slug 分类 slug
 * @returns 分类详情或 undefined
 */
export function findCategoryBySlug(
	categories: GameCategory[],
	slug: string,
): GameCategory | undefined {
	return categories.find((category) => category.slug === slug)
}

/**
 * 构建分类树结构
 * @param categories 扁平分类列表
 * @returns 分类树
 */
export function buildCategoryTree(categories: GameCategory[]): GameCategory[] {
	const categoryMap = new Map<string, GameCategory>()
	const rootCategories: GameCategory[] = []

	// 创建分类映射
	categories.forEach((category) => {
		categoryMap.set(category.code, { ...category, children: [] })
	})

	// 构建树结构
	categories.forEach((category) => {
		const categoryNode = categoryMap.get(category.code)!

		if (category.parentCode) {
			const parent = categoryMap.get(category.parentCode)
			if (parent) {
				parent.children = parent.children || []
				parent.children.push(categoryNode)
			}
		} else {
			rootCategories.push(categoryNode)
		}
	})

	return rootCategories
}

/**
 * 根据排序字段排序分类
 * @param categories 分类列表
 * @param order 排序方向
 * @returns 排序后的分类列表
 */
export function sortCategoriesByOrder(
	categories: GameCategory[],
	order: "asc" | "desc" = "desc",
): GameCategory[] {
	return [...categories].sort((a, b) => {
		const orderA = a.sortOrder || 0
		const orderB = b.sortOrder || 0
		return order === "desc" ? orderB - orderA : orderA - orderB
	})
}

// ==================== 标签相关工具函数 ====================

/**
 * 根据 ID 查找标签
 * @param tags 标签列表
 * @param id 标签 ID
 * @returns 标签详情或 undefined
 */
export function findTagById(tags: GameTag[], id: string): GameTag | undefined {
	return tags.find((tag) => tag.id === id)
}

/**
 * 根据 slug 查找标签
 * @param tags 标签列表
 * @param slug 标签 slug
 * @returns 标签详情或 undefined
 */
export function findTagBySlug(
	tags: GameTag[],
	slug: string,
): GameTag | undefined {
	return tags.find((tag) => tag.slug === slug)
}

/**
 * 根据名称查找标签
 * @param tags 标签列表
 * @param name 标签名称
 * @returns 标签详情或 undefined
 */
export function findTagByName(
	tags: GameTag[],
	name: string,
): GameTag | undefined {
	return tags.find((tag) => tag.name === name)
}

/**
 * 根据游戏数量排序标签
 * @param tags 标签列表
 * @param order 排序方向
 * @returns 排序后的标签列表
 */
export function sortTagsByCount(
	tags: GameTag[],
	order: "asc" | "desc" = "desc",
): GameTag[] {
	return [...tags].sort((a, b) => {
		const countA = a.count || 0
		const countB = b.count || 0
		return order === "desc" ? countB - countA : countA - countB
	})
}

/**
 * 根据标签名称排序
 * @param tags 标签列表
 * @param order 排序方向
 * @returns 排序后的标签列表
 */
export function sortTagsByName(
	tags: GameTag[],
	order: "asc" | "desc" = "asc",
): GameTag[] {
	return [...tags].sort((a, b) => {
		const comparison = a.name.localeCompare(b.name)
		return order === "desc" ? -comparison : comparison
	})
}

/**
 * 筛选热门标签
 * @param tags 标签列表
 * @param minCount 最小游戏数量
 * @returns 热门标签列表
 */
export function filterPopularTags(tags: GameTag[], minCount = 5): GameTag[] {
	return tags.filter((tag) => (tag.count || 0) >= minCount)
}

/**
 * 根据标签 ID 列表获取标签详情
 * @param tags 标签列表
 * @param tagIds 标签 ID 列表
 * @returns 标签详情列表
 */
export function getTagsByIds(tags: GameTag[], tagIds: string[]): GameTag[] {
	return tagIds
		.map((id) => findTagById(tags, id))
		.filter((tag): tag is GameTag => tag !== undefined)
}
