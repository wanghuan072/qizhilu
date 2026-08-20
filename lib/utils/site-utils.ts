/**
 * 站点相关工具函数
 * 包含站点配置处理的纯计算函数
 */

import { AnalyticsData, GameTemplateType, SiteSettings } from "@/lib/types"

/**
 * 检查是否为 GameBox 模板
 * @param siteSettings 站点配置
 * @returns 是否为 GameBox 模板
 */
export function isGameBoxTemplate(siteSettings: SiteSettings): boolean {
	return siteSettings.templateType === GameTemplateType.GameBox
}

/**
 * 获取分析脚本配置
 * @param siteSettings 站点配置
 * @returns 分析脚本配置
 */
export function getAnalyticsConfig(siteSettings: SiteSettings): AnalyticsData {
	const isDev = process.env.NODE_ENV === "development"

	if (isDev) {
		return {
			isShouldLoad: false,
		}
	}

	return {
		isShouldLoad: true,
		gaId: siteSettings.analytics?.gaId,
		plausible: siteSettings.analytics?.plausible,
		clarityId: siteSettings.analytics?.clarityId,
		adsenseClientId: siteSettings.analytics?.adsenseClientId,
		domain: siteSettings.domain?.replace("https://", "") || "",
	}
}
