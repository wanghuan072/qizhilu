/**
 * 广告平台全局类型声明
 */

declare global {
	interface Window {
		// Google AdSense
		adsbygoogle: any[]

		// 常见第三方广告平台
		// AdButler
		AdButler?: any
		// BuySellAds
		_bsa?: any
		// Carbon Ads
		carbon?: any
		// Media.net
		medianet?: any
		// Amazon Ads
		amznads?: any
		// 其他第三方广告平台可以在这里添加
	}
}

export {}
