/**
 * 站点业务逻辑层
 * 处理站点全局业务逻辑，如站点配置、语言、导航等
 */

import { siteSettings } from "@/lib/config/siteSettings"
import * as categoryRepository from "@/lib/repositories/category"
import * as siteRepository from "@/lib/repositories/site"
import * as tagRepository from "@/lib/repositories/tag"
import {
	AnalyticsData,
	GameCategory,
	GameTag,
	GameTemplateType,
	Language,
	Localized,
	MetadataInfo,
	NavigationItem,
	SiteLayoutData,
	SiteSettings,
} from "@/lib/types"
import { getAnalyticsConfig, isGameBoxTemplate } from "@/lib/utils/site-utils"

/**
 * 获取站点配置（包含所有非国际化配置和基础信息）
 * @returns 完整的站点配置信息
 */
export async function getSiteSettings(): Promise<SiteSettings> {
	return siteSettings
}

/**
 * 获取支持的语言列表（仅有语言代码值，不包含语言名称）
 * @param params 请求参数
 * @param options 请求选项
 * @returns 语言代码列表
 */
export async function getSupportedLocales(): Promise<string[]> {
	return siteSettings.supportedLocales
}

/**
 * 获取带有name的语言列表（包含语言代码和语言名称和中文名称）
 * @param params 请求参数
 * @param options 请求选项
 * @returns 语言名称映射
 */
export async function getLanguages(): Promise<Record<string, Language>> {
	return siteSettings.languages
}

/**
 * 获取默认语言
 * @param params 请求参数
 * @param options 请求选项
 * @returns 默认语言代码
 */
export async function getDefaultLocale(): Promise<string> {
	return siteSettings.defaultLocale
}

/**
 * 获取导航菜单
 * @param locale 语言代码（可选，不传时使用默认语言）
 * @returns 导航菜单
 */
export async function getNavigationMenu(
	locale: string,
): Promise<NavigationItem[]> {
	try {
		return await siteRepository.getNavigationMenu(locale)
	} catch (error) {
		console.error(`获取导航菜单失败, locale: ${locale || "default"}`, error)
		return []
	}
}

/**
 * 获取元数据设置
 * @param locale 语言代码（可选，不传时使用默认语言）
 * @returns 元数据设置
 */
export async function getMetadata(
	locale: string,
): Promise<MetadataInfo | null> {
	try {
		return await siteRepository.getMetadata(locale)
	} catch (error) {
		console.error(`获取元数据设置失败, locale: ${locale || "default"}`, error)
		return null
	}
}

/**
 * 获取游戏分类数据
 * @param locale 语言代码
 * @returns 游戏分类列表
 */
export async function getGameCategories(
	locale: string,
): Promise<GameCategory[]> {
	try {
		return await siteRepository.getGameCategories(locale)
	} catch (error) {
		console.error(`获取游戏分类数据失败, locale: ${locale}`, error)
		return []
	}
}

/**
 * 根据 slug 获取游戏分类详情
 * @param locale 语言代码
 * @param slug 分类 slug
 * @returns 游戏分类详情
 */
export async function getGameCategoryBySlug(
	locale: string,
	slug: string,
): Promise<GameCategory | null> {
	try {
		return await categoryRepository.getGameCategoryDetailByLocale(locale, slug)
	} catch (error) {
		console.error(
			`获取游戏分类详情失败, locale: ${locale}, slug: ${slug}`,
			error,
		)
		return null
	}
}

/**
 * 获取游戏标签数据
 * @param locale 语言代码
 * @returns 游戏标签列表
 */
export async function getGameTags(locale: string): Promise<GameTag[]> {
	try {
		return await tagRepository.getGameTagsByLocale(locale)
	} catch (error) {
		console.error(`获取游戏标签数据失败, locale: ${locale}`, error)
		return []
	}
}

/**
 * 根据 slug 获取游戏标签详情
 * @param locale 语言代码
 * @param slug 标签 slug
 * @returns 游戏标签详情
 */
export async function getGameTagBySlug(
	locale: string,
	slug: string,
): Promise<GameTag | null> {
	try {
		return await tagRepository.getGameTagBySlug(locale, slug)
	} catch (error) {
		console.error(
			`获取游戏标签详情失败, locale: ${locale}, slug: ${slug}`,
			error,
		)
		return null
	}
}

/**
 * 获取 GameBox 模板的分类数据
 * @param locale 语言代码
 * @returns 游戏分类列表
 */
export async function getGameBoxCategories(
	locale: string,
): Promise<GameCategory[]> {
	return getGameCategories(locale)
}

/**
 * 获取站点基本信息（用于页面渲染）
 * @param locale 语言代码（可选，不传时使用默认语言）
 * @returns 站点基本信息
 */
export async function getSiteBasicInfo(locale: string): Promise<{
	siteSettings: SiteSettings
	navigation: NavigationItem[]
	homeMetadata: MetadataInfo | null
}> {
	try {
		const [siteSettings, navigation, metadata] = await Promise.all([
			getSiteSettings(),
			getNavigationMenu(locale),
			getMetadata(locale),
		])

		return {
			siteSettings,
			navigation,
			homeMetadata: metadata,
		}
	} catch (error) {
		console.error(`获取站点基本信息失败, locale: ${locale || "default"}`, error)
		throw error
	}
}

// 注意：isGameBoxTemplate 和 getAnalyticsConfig 工具函数已移至 @/lib/utils/site-utils.ts
// 请直接从该文件导入使用

/**
 * 获取站点 Layout 页面所需的完整数据（核心 Service 函数）
 * @param locale 语言代码（可选，不传时使用默认语言）
 * @returns Layout 页面所需的完整数据模型
 */
export async function getSiteLayoutData(
	locale: string,
): Promise<SiteLayoutData> {
	try {
		// 获取基础站点配置
		const siteSettings = await getSiteSettings()

		// 检查是否为 GameBox 模板
		const isGameBox = isGameBoxTemplate(siteSettings)

		const localeToUse = locale || siteSettings.defaultLocale

		// 并行获取所有需要的数据
		const [navigation, metadata, categories] = await Promise.all([
			getNavigationMenu(localeToUse),
			getMetadata(localeToUse),
			isGameBox ? getGameCategories(localeToUse) : Promise.resolve([]),
		])

		// 转换数据格式并构建复合业务模型
		return {
			icons: {
				favicon: siteSettings.icons?.favicon,
				apple: siteSettings.icons?.appleTouchIcon,
				shortcut: siteSettings.icons?.androidIcon,
			},
			locales: {
				defaultLocale: siteSettings.defaultLocale,
				supportedLocales: siteSettings.supportedLocales || [],
				supportedLanguages: siteSettings.languages,
			},
			siteName: siteSettings.siteName,
			isGameBox,
			logo: {
				light: siteSettings.logo,
				dark: siteSettings.darkLogo || siteSettings.logo,
			},
			contactEmail: siteSettings.contactEmail || "",
			socials: siteSettings.socialLinks || {},
			metadata: metadata || ({} as MetadataInfo),
			navigations: navigation,
			categories: categories,
			friendLinks: siteSettings.friendLinks || ({} as any),
			fonts: siteSettings.fonts || ({} as any),
			theme: siteSettings.theme || ({} as any),
			analytics: getAnalyticsConfig(siteSettings),
			ads: siteSettings.adsSettings || [],
		}
	} catch (error) {
		console.error(
			`获取站点 Layout 数据失败, locale: ${locale || "default"}`,
			error,
		)
		throw error
	}
}
export async function getSiteMetadata(locale: string): Promise<MetadataInfo> {
	const metadata = await getMetadata(locale)
	return metadata || ({} as MetadataInfo)
}
