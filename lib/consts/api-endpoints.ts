/**
 * API 端点常量
 * 统一管理所有 API 端点和相关配置
 */

/**
 * API 端点映射
 */
export const API_ENDPOINTS = {
	ARTICLES: "/articles",
	GAMES: "/games",
	GAME: "/game",
	HOME_GAME: "/home-game",
	GAME_CATEGORIES: "/game-categories",
	GAME_CATEGORY: "/game-category",
	GAME_TAGS: "/game-tags",
	GAME_TAG: "/game-tag",
	GAME_TAG_LIST: "/game-tag-list",
	NAV_ITEMS: "/nav-items",
	SITE_SETTINGS: "/site-settings",
	LOCALE_SITE_SETTINGS: "/locale-site-settings",
	HOME_METADATA: "/home-metadata",
	LOCALES: "/locales",
	LOCALE_NAMES: "/locale-names",
	DEFAULT_LOCALE: "/default-locale",
} as const

/**
 * 判断端点是否应该返回对象类型的 fallback 数据
 * @param endpoint API 端点
 * @returns 是否返回对象类型数据
 */
export function isObjectEndpoint(endpoint: string): boolean {
	const objectEndpoints = [
		API_ENDPOINTS.GAME,
		API_ENDPOINTS.HOME_GAME,
		API_ENDPOINTS.GAME_CATEGORY,
		API_ENDPOINTS.GAME_TAG,
		API_ENDPOINTS.SITE_SETTINGS,
		API_ENDPOINTS.HOME_METADATA,
		API_ENDPOINTS.LOCALE_NAMES,
	]

	return (
		objectEndpoints.includes(endpoint as any) || endpoint.includes("settings")
	)
}
