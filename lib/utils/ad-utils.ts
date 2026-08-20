import { AdSettings } from "@/lib/types"

/**
 * 广告相关工具函数
 */

/**
 * 检查是否有可用的弹窗广告
 * @param adsSettings 广告设置数组
 * @returns boolean 是否有弹窗广告
 */
export function hasModalAd(adsSettings?: AdSettings[]): boolean {
	console.log("🔍 hasModalAd called with:", adsSettings)

	if (!adsSettings || adsSettings.length === 0) {
		console.log("❌ No adsSettings provided")
		return false
	}

	const modalAds = adsSettings.filter(ad => ad.position === "modal_ad")
	console.log("📋 Found modal ads:", modalAds.length, modalAds)

	const hasAd = adsSettings.some(
		(ad) => ad.position === "modal_ad" && ad.enabled && ad.codeText,
	)
	console.log("✅ hasModalAd result:", hasAd)

	return hasAd
}

/**
 * 获取弹窗广告配置
 * @param adsSettings 广告设置数组
 * @returns AdSettings | null 弹窗广告配置
 */
export function getModalAd(adsSettings?: AdSettings[]): AdSettings | null {
	console.log("🎯 getModalAd called with:", adsSettings)

	if (!adsSettings || adsSettings.length === 0) {
		console.log("❌ No adsSettings provided in getModalAd")
		return null
	}

	const modalAd = adsSettings.find(
		(ad) => ad.position === "modal_ad" && ad.enabled && ad.codeText,
	) || null
	console.log("🎯 getModalAd result:", modalAd)

	return modalAd
}

/**
 * 检查是否有任何类型的广告
 * @param adsSettings 广告设置数组
 * @returns boolean 是否有任何广告
 */
export function hasAnyAd(adsSettings?: AdSettings[]): boolean {
	if (!adsSettings || adsSettings.length === 0) {
		return false
	}

	return adsSettings.some((ad) => ad.enabled && ad.codeText)
}

/**
 * 根据位置检查广告
 * @param adsSettings 广告设置数组
 * @param position 广告位置
 * @returns boolean 是否有指定位置的广告
 */
export function hasAdByPosition(
	adsSettings?: AdSettings[],
	position?: string,
): boolean {
	if (!adsSettings || adsSettings.length === 0 || !position) {
		return false
	}

	return adsSettings.some(
		(ad) => ad.position === position && ad.enabled && ad.codeText,
	)
}

/**
 * 获取指定位置的广告配置
 * @param adsSettings 广告设置数组
 * @param position 广告位置
 * @returns AdSettings | null 指定位置的广告配置
 */
export function getAdByPosition(
	adsSettings?: AdSettings[],
	position?: string,
): AdSettings | null {
	if (!adsSettings || adsSettings.length === 0 || !position) {
		return null
	}

	return (
		adsSettings.find(
			(ad) => ad.position === position && ad.enabled && ad.codeText,
		) || null
	)
}
