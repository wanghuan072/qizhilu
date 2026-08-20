/**
 * 站点数据访问层(需要调用api接口获取数据)
 * 负责站点配置、导航、多语言等原始数据访问
 */

import fs from "fs"
import path from "path"
import {
	ApiRequestParams,
	GameCategory,
	Language,
	MetadataInfo,
	NavigationItem,
	ProjectLocaleSiteSetting,
	ProjectLocaleSiteSettingType,
	SiteSettings,
} from "@/lib/types"

// 数据文件路径
const DATA_DIR = path.resolve(process.cwd(), "lib/data")

// 缓存变量
let localeSiteSettingsCache: ProjectLocaleSiteSetting[] | null = null

/**
 * 读取多语言站点设置数据（带缓存）
 */
function loadLocaleSiteSettingsData(): ProjectLocaleSiteSetting[] {
	if (localeSiteSettingsCache) {
		return localeSiteSettingsCache
	}

	try {
		const filePath = path.join(DATA_DIR, "localeSiteSettings.json")
		const fileContent = fs.readFileSync(filePath, "utf8")
		localeSiteSettingsCache = JSON.parse(fileContent)
		return localeSiteSettingsCache!
	} catch (error) {
		console.error("读取多语言站点设置数据失败:", error)
		return []
	}
}

/**
 * 获取多语言站点设置(包含所有语言的国际化网站设置)
 * @returns 多语言站点设置
 */
export async function getLocaleSiteSettings(): Promise<
	ProjectLocaleSiteSetting[]
> {
	// 从本地JSON文件中读取多语言站点设置
	return Promise.resolve(loadLocaleSiteSettingsData())
}

/**
 * 获取指定语言导航菜单项(content为NavigationItem[])
 * @param locale 语言代码
 * @returns 导航菜单项列表
 */
export async function getNavigationMenu(
	locale: string,
): Promise<NavigationItem[]> {
	const localeSiteSettings = await getLocaleSiteSettings()
	const localeSiteSetting = localeSiteSettings.find(
		(item) =>
			item.locale === locale && item.type === ProjectLocaleSiteSettingType.Nav,
	)
	if (!localeSiteSetting) {
		return []
	}
	return localeSiteSetting.content as NavigationItem[]
}

/**
 * 获取指定语言元数据设置(content为MetadataInfo)
 * @param locale 语言代码
 * @returns 元数据设置
 */
export async function getMetadata(
	locale: string,
): Promise<MetadataInfo | null> {
	const localeSiteSettings = await getLocaleSiteSettings()
	const localeSiteSetting = localeSiteSettings.find(
		(item) =>
			item.locale === locale &&
			item.type === ProjectLocaleSiteSettingType.Metadata,
	)
	if (!localeSiteSetting || !localeSiteSetting) {
		return null
	}
	return localeSiteSetting.content as MetadataInfo
}

/**
 * 获取指定语言游戏分类(content为GameCategory[])
 * @param locale 语言代码
 * @returns 游戏分类列表
 */
export async function getGameCategories(
	locale: string,
): Promise<GameCategory[]> {
	const localeSiteSettings = await getLocaleSiteSettings()
	const localeSiteSetting = localeSiteSettings.find(
		(item) =>
			item.locale === locale &&
			item.type === ProjectLocaleSiteSettingType.GameCategories,
	)
	if (!localeSiteSetting) {
		return []
	}
	return localeSiteSetting.content as GameCategory[]
}
