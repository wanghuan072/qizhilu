import type {
	AdSettings,
	FontsConfig,
	FriendLink,
	GameCategory,
	Language,
	MetadataInfo,
	NavigationItem,
	SocialLinksConfig,
	ThemeConfig,
} from "./api-types"

export interface LocaleConfig {
	defaultLocale: string
	supportedLocales: string[]
	supportedLanguages: Record<string, Language>
}

/**
 * 分析脚本配置数据
 */
export interface AnalyticsData {
	isShouldLoad: boolean
	gaId?: string
	plausible?: string
	clarityId?: string
	adsenseClientId?: string
	domain?: string
}

/**
 * 面包屑导航项
 */
export interface BreadcrumbItem {
	label: string
	href: string
	isActive?: boolean
}

/**
 * Layout 页面所需的完整数据模型
 */
export interface SiteLayoutData {
	siteName: string
	isGameBox: boolean
	locales: LocaleConfig
	logo: {
		light: string
		dark: string
	}
	icons: {
		favicon?: string
		apple?: string
		shortcut?: string
	}
	contactEmail: string
	metadata: MetadataInfo
	navigations: NavigationItem[]
	categories?: GameCategory[]
	socials: SocialLinksConfig
	friendLinks: FriendLink[]
	fonts: FontsConfig
	theme: ThemeConfig
	analytics: AnalyticsData
	ads: AdSettings[]
}
