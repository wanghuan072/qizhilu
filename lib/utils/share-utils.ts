import { GameData, SiteSettings } from "@/lib/types/api-types"

/**
 * 分享平台枚举
 */
export enum SharePlatform {
	TWITTER = "twitter",
	FACEBOOK = "facebook",
	LINKEDIN = "linkedin",
	COPY_LINK = "copy_link",
}

/**
 * 分享选项接口
 */
export interface ShareOption {
	platform: SharePlatform
	name: string
	description: string
	icon: string
	color: string
	action: () => void | Promise<void>
}

/**
 * 分享配置接口
 */
export interface ShareConfig {
	gameTitle: string
	gameLocaleContent?: GameData
	siteSettings?: SiteSettings
	customUrl?: string
	customText?: string
}

/**
 * 构建 Twitter 分享 URL
 */
export function buildTwitterShareUrl(config: ShareConfig): string {
	const { gameTitle, gameLocaleContent, siteSettings, customUrl, customText } =
		config

	// 获取当前游戏信息
	const gameDescription = gameLocaleContent?.gameLocaleDescription || ""
	const currentUrl =
		customUrl || (typeof window !== "undefined" ? window.location.href : "")

	// 使用站点的 Twitter 配置
	const twitterHandle = siteSettings?.socialLinks?.twitter
		? new URL(siteSettings.socialLinks.twitter).pathname.replace(/\//g, "")
		: ""

	// 构建 Twitter 分享 URL
	const twitterShareUrl = new URL("https://twitter.com/intent/tweet")
	const params = new URLSearchParams()

	// 添加分享文本
	const shareText =
		customText ||
		`${gameTitle} - ${gameDescription.substring(0, 100)}${gameDescription.length > 100 ? "..." : ""}`
	params.append("text", shareText)

	// 添加分享链接
	params.append("url", currentUrl)

	// 如果有 Twitter 账号，添加 via 参数
	if (twitterHandle) {
		params.append("via", twitterHandle)
	}

	// 添加标签
	if (gameLocaleContent?.tags && gameLocaleContent.tags.length > 0) {
		const hashtags = gameLocaleContent.tags
			.slice(0, 3) // 最多取3个标签
			.map((tag) => tag.name.replace(/\s+/g, ""))
			.join(",")
		if (hashtags) {
			params.append("hashtags", hashtags)
		}
	}

	twitterShareUrl.search = params.toString()
	return twitterShareUrl.toString()
}

/**
 * 构建 Facebook 分享 URL
 */
export function buildFacebookShareUrl(config: ShareConfig): string {
	const { customUrl } = config
	const currentUrl =
		customUrl || (typeof window !== "undefined" ? window.location.href : "")

	const facebookShareUrl = new URL("https://www.facebook.com/sharer/sharer.php")
	facebookShareUrl.searchParams.append("u", currentUrl)

	return facebookShareUrl.toString()
}

/**
 * 构建 LinkedIn 分享 URL
 */
export function buildLinkedInShareUrl(config: ShareConfig): string {
	const { customUrl } = config
	const currentUrl =
		customUrl || (typeof window !== "undefined" ? window.location.href : "")

	const linkedInShareUrl = new URL(
		"https://www.linkedin.com/sharing/share-offsite/",
	)
	linkedInShareUrl.searchParams.append("url", currentUrl)

	return linkedInShareUrl.toString()
}

/**
 * 复制链接到剪贴板
 */
export async function copyLinkToClipboard(
	config: ShareConfig,
): Promise<boolean> {
	const { customUrl } = config
	const currentUrl =
		customUrl || (typeof window !== "undefined" ? window.location.href : "")

	try {
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(currentUrl)
			return true
		} else if (typeof document !== "undefined") {
			// 降级方案：使用传统的 document.execCommand (仅在客户端)
			const textArea = document.createElement("textarea")
			textArea.value = currentUrl
			textArea.style.position = "fixed"
			textArea.style.left = "-999999px"
			textArea.style.top = "-999999px"
			document.body.appendChild(textArea)
			textArea.focus()
			textArea.select()
			const result = document.execCommand("copy")
			document.body.removeChild(textArea)
			return result
		} else {
			// 在服务端环境，无法执行复制操作
			return false
		}
	} catch (error) {
		console.error("复制链接失败:", error)
		return false
	}
}

/**
 * 打开分享窗口
 */
export function openShareWindow(url: string, platform: string): void {
	if (typeof window === "undefined") {
		// 在服务端环境，无法打开窗口
		return
	}

	const width = 550
	const height = 420
	const left = (window.screen.width - width) / 2
	const top = (window.screen.height - height) / 2

	window.open(
		url,
		`share-${platform}`,
		`width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
	)
}
