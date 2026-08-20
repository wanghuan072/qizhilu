import {
	Bolt,
	Car,
	Crown,
	Diamond,
	Flame,
	Gamepad2,
	Heart,
	Music,
	Music2,
	Plane,
	Puzzle,
	Rocket,
	Shield,
	Sparkles,
	Star,
	Sword,
	Target,
	Trophy,
	Wand2,
	Zap,
} from "lucide-react"
import { isEmpty } from "radash"
import React from "react"
/**
 * 验证图标 URL 是否有效
 * @param url 图标URL
 * @returns 是否为有效的图标URL
 */
const isValidIconUrl = (url: string): boolean => {
	if (!url || typeof url !== "string") return false

	// 检查是否为有效的 URL 格式（绝对路径或相对路径）
	try {
		// 允许相对路径（以 / 开头）和绝对 URL
		return (
			url.startsWith("/") ||
			url.startsWith("http://") ||
			url.startsWith("https://") ||
			url.startsWith("data:")
		)
	} catch {
		return false
	}
}

/**
 * 图标配置接口
 */
export interface IconsConfig {
	favicon?: string | string[]
	appleTouchIcon?: string
	androidIcon?: string
	[key: string]: any
}

/**
 * Next.js Metadata API 图标格式
 */
export interface MetadataIcons {
	icon?: string | string[]
	apple?: string
	shortcut?: string
}

/**
 * 构建 Next.js Metadata API 兼容的 icons 对象
 * 只包含有效的图标，避免生成空的 <link> 标签
 *
 * @param icons 图标配置对象
 * @returns 处理后的图标元数据对象，如果没有有效图标则返回 undefined
 */
export function buildIconsMetadata(
	icons: IconsConfig | null | undefined,
): MetadataIcons | undefined {
	if (!icons || typeof icons !== "object") return undefined

	const iconsMetadata: MetadataIcons = {}

	// 处理 favicon (网站图标)
	// 支持字符串或字符串数组格式
	if (!isEmpty(icons?.favicon)) {
		if (typeof icons.favicon === "string" && isValidIconUrl(icons.favicon)) {
			iconsMetadata.icon = icons.favicon
		} else if (Array.isArray(icons.favicon)) {
			const validFavicons = icons.favicon.filter(
				(url: any) => typeof url === "string" && isValidIconUrl(url),
			)
			if (validFavicons.length > 0) {
				iconsMetadata.icon = validFavicons
			}
		}
	}

	// 处理 Apple Touch Icon (iOS 添加到主屏幕图标)
	if (
		!isEmpty(icons?.appleTouchIcon) &&
		typeof icons.appleTouchIcon === "string" &&
		isValidIconUrl(icons.appleTouchIcon)
	) {
		iconsMetadata.apple = icons.appleTouchIcon
	}

	// 处理 Android Icon (Android 快捷方式图标)
	if (
		!isEmpty(icons?.androidIcon) &&
		typeof icons.androidIcon === "string" &&
		isValidIconUrl(icons.androidIcon)
	) {
		iconsMetadata.shortcut = icons.androidIcon
	}

	// 如果没有任何有效的图标，返回 undefined
	// 这样可以避免生成空的 <link> 标签
	const hasValidIcons = Object.keys(iconsMetadata).length > 0

	if (process.env.NODE_ENV === "development" && !hasValidIcons && icons) {
		console.warn(
			"[buildIconsMetadata] No valid icons found in configuration:",
			icons,
		)
	}

	return hasValidIcons ? iconsMetadata : undefined
}

/**
 * 验证单个图标URL的有效性（导出供外部使用）
 * @param url 图标URL
 * @returns 是否为有效的图标URL
 */
export function validateIconUrl(url: string): boolean {
	return isValidIconUrl(url)
}

// 创建一个静态的、从名称到组件的映射对象
const iconComponents = {
	Gamepad2,
	Zap,
	Target,
	Sword,
	Car,
	Plane,
	Music2,
	Music,
	Puzzle,
	Trophy,
	Heart,
	Star,
	Rocket,
	Shield,
	Crown,
	Diamond,
	Flame,
	Bolt,
	Wand2,
	Sparkles,
}

// 创建一个只包含名称的数组，用于哈希选择
const gameIconNames = Object.keys(
	iconComponents,
) as (keyof typeof iconComponents)[]

// 基于字符串生成稳定的随机图标JSX元素
export function getStableRandomIcon(
	str: string,
	className?: string,
): React.ReactElement {
	const iconClassName = className || "w-4 h-4"

	if (!str || gameIconNames.length <= 0) {
		const DefaultIcon = Gamepad2
		return React.createElement(DefaultIcon, { className: iconClassName })
	}

	// 简单的哈希函数
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash // 转换为32位整数
	}

	// 确保返回正数索引
	const iconIndex = Math.abs(hash) % gameIconNames.length
	// 通过索引获取图标的【名称】
	const iconName = gameIconNames[iconIndex]

	// 使用 switch 语句，这是静态可分析的，避免整个icons文件被打包
	switch (iconIndex) {
		case 0:
			return <Gamepad2 className={iconClassName} />
		case 1:
			return <Zap className={iconClassName} />
		case 2:
			return <Target className={iconClassName} />
		case 3:
			return <Sword className={iconClassName} />
		case 4:
			return <Car className={iconClassName} />
		case 5:
			return <Plane className={iconClassName} />
		case 6:
			return <Music2 className={iconClassName} />
		case 7:
			return <Music className={iconClassName} />
		case 8:
			return <Puzzle className={iconClassName} />
		case 9:
			return <Trophy className={iconClassName} />
		case 10:
			return <Heart className={iconClassName} />
		case 11:
			return <Star className={iconClassName} />
		case 12:
			return <Rocket className={iconClassName} />
		case 13:
			return <Shield className={iconClassName} />
		case 14:
			return <Crown className={iconClassName} />
		case 15:
			return <Diamond className={iconClassName} />
		case 16:
			return <Flame className={iconClassName} />
		case 17:
			return <Bolt className={iconClassName} />
		case 18:
			return <Wand2 className={iconClassName} />
		case 19:
			return <Sparkles className={iconClassName} />
		default:
			// 默认情况，保证总有返回值
			return <Gamepad2 className={iconClassName} />
	}
}
