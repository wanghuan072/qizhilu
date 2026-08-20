import type { Metadata } from "next"
import type {
	AdSettings,
	GameCategory,
	GameData,
	GameTag,
	Localized,
} from "./api-types"

export interface GameAd {
	type: "banner" | "block"
	codeText: string
}

export type GameDataBase = Pick<
	GameData,
	| "id"
	| "name"
	| "slug"
	| "screenshotUrl"
	| "gameLocaleName"
	| "gameLocaleSlogan"
	| "gameLocaleDescription"
	| "gameInfo"
	| "recommendToHome"
	| "updateTime"
	| "createTime"
	| "isPrimary"
> &
	Partial<Pick<GameData, "isPrimary" | "metadataInfo">>

export type AdDataBase = GameAd

export type GameDataListType = GameDataBase[]

export type AllGameDataListType = AllGameDataBase[]

/**
 * 游戏页面数据类型
 * 包含游戏页面渲染所需的全部数据
 */
export interface GamePageData {
	/** 游戏本地化内容 */
	game: GameData
	/** 相关游戏列表 */
	relatedGames: GameDataListType
	/** 热门游戏列表 */
	popularGames: GameDataListType
	/** 最新游戏列表 */
	latestGames: GameDataListType
	/** 页面元数据 */
	metadata: Metadata
	/** JSON-LD 结构化数据 */
	jsonLdData: {
		/** 网站结构化数据 */
		website?: any
		/** 网页结构化数据（包含游戏作为mainEntity） */
		webPage?: any
		/** FAQ结构化数据 */
		faq?: any
		/** 视频结构化数据 */
		videos?: any[]
		/** 组织结构化数据 */
		organization?: any
	}
	ads: AdSettings[]
}

export interface AllGameDataBase extends GameDataBase {
	// slug
	categories: Pick<GameCategory, "code" | "slug" | "name">[]
	// slug
	tags: Pick<GameTag, "slug" | "name">[]

	// 创建时间
	createTime?: string
	// 更新时间
	updateTime?: string
}

export interface AllGamesPageData {
	/** 广告设置 */
	ads: AdSettings[]
	/** 游戏列表 */
	games: Localized<AllGameDataBase[]>
	/** 游戏分类列表 */
	categories?: Localized<GameCategory[]>
	/** 游戏标签列表 */
	tags?: Localized<GameTag[]>
	/** JSON-LD 结构化数据 */
	jsonLdData: {
		/** 网页结构化数据 */
		webPage?: any
		/** 组织结构化数据 */
		organization?: any
	}
}

export interface SearchGamePageData {
	games: Localized<GameDataBase[]>
	categories: Localized<GameCategory[]>
	tags: Localized<GameTag[]>
}

// 优化的游戏数据类型，仅包含必要字段
export interface OptimizedGameData {
	/** 游戏ID - 用于收藏功能 */
	id: string
	/** 游戏名称 - 用于显示和搜索 */
	name: string
	/** 游戏slug - 用于生成链接 */
	slug: string
	/** 游戏截图 - 用于显示 */
	screenshotUrl?: string
	/** 游戏评分 - 用于显示星级 */
	rating?: number
	description?: string
	/** 是否为主要游戏 */
	isPrimary: boolean
	/** 游戏分类 - 用于筛选 */
	categories?: Array<{
		slug: string
		name: string
	}>
	/** 游戏标签 - 用于筛选 */
	tags?: Array<{
		slug: string
		name: string
	}>
}

// 优化的游戏卡片属性
export interface OptimizedGameCardProps {
	/** 游戏名称 */
	name: string
	/** 游戏访问路径 */
	slug: string
	/** 游戏图片 */
	image?: string
	/** 游戏评分 (0-5分) */
	rating?: number
	/** 自定义样式类名 */
	className?: string
}

// 优化的搜索页面数据类型
export interface OptimizedSearchGamePageData {
	games: Localized<OptimizedSearchGameData[]>
	categories: Localized<GameCategory[]>
	tags: Localized<GameTag[]>
}

// 搜索页面专用的优化游戏数据
export interface OptimizedSearchGameData {
	/** 游戏ID - 用作 key */
	id: string
	/** 游戏名称 - 用于显示 */
	name: string
	/** 游戏本地化名称 - 用于搜索匹配 */
	gameLocaleName: string
	/** 游戏slug - 用于生成链接 */
	slug: string
	/** 游戏截图 - 用于显示 */
	screenshotUrl?: string
	/** 游戏评分 - 用于显示星级 */
	rating?: number
}
