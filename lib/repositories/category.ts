/**
 * 分类数据访问层
 * 负责分类相关原始数据访问
 */

import { GameCategory } from "@/lib/types"
import * as siteRepository from "./site"

/**
 * 根据语言和 slug 获取分类详情
 * @param locale 语言代码
 * @param slug 分类 slug
 * @returns 分类详情
 */
export async function getGameCategoryDetailByLocale(
	locale: string,
	slug: string,
): Promise<GameCategory> {
	return siteRepository.getGameCategories(locale).then((categories) => {
		const category = categories.find((category) => category.slug === slug)
		if (!category) {
			throw new Error(`Category not found: ${slug}`)
		}
		return category
	})
}

/**
 * 根据语言获取分类列表
 * @param locale 语言代码
 * @returns 分类列表
 */
export async function getGameCategoriesByLocale(
	locale: string,
): Promise<GameCategory[]> {
	return siteRepository.getGameCategories(locale)
}

// 注意：数据处理工具函数已移至 @/lib/utils/data-filters.ts
// 请直接从该文件导入使用
