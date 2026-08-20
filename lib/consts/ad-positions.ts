/**
 * 广告位置常量定义
 *
 * 定义了项目中所有可用的广告位置，确保类型安全和一致性
 */

/**
 * 游戏页面广告位置枚举
 *
 * 命名规范：
 * - 使用 snake_case 命名法
 * - 格式：{区域}_{位置}
 * - 区域：game_area, content, sidebar, comments 等
 * - 位置：top, middle, bottom 等
 */
export enum GamePageAdPosition {
	/** 游戏区域顶部广告 */
	GameAreaTop = "game_area_top",
	/** 游戏区域底部广告 */
	GameAreaBottom = "game_area_bottom",

	/** 内容区域顶部广告 */
	ContentTop = "content_top",
	/** 内容区域中部广告 */
	ContentMiddle = "content_middle",
	/** 内容区域底部广告 */
	ContentBottom = "content_bottom",

	/** 内容区域中部横幅广告（兼容性） */
	ContentMiddleBanner = "content_middle_banner",

	/** 侧边栏顶部广告 */
	SidebarTop = "sidebar_top",
	/** 侧边栏中部广告 */
	SidebarMiddle = "sidebar_middle",
	/** 侧边栏底部广告 */
	SidebarBottom = "sidebar_bottom",

	/** 相关游戏区域广告 */
	RelatedGames = "related_games",

	/** 评论区顶部广告 */
	CommentsTop = "comments_top",
	/** 评论区底部广告 */
	CommentsBottom = "comments_bottom",
}

// 移除了对已删除组件的引用

/**
 * 断点规则接口
 */
export interface BreakpointRules {
	/** 基础断点（移动端） */
	base: {
		maxWidth: number
		maxHeight: number
		minHeight: number
	}
	/** 小屏断点 */
	sm?: {
		maxWidth: number
		maxHeight: number
		minHeight: number
	}
	/** 中等断点 */
	md?: {
		maxWidth: number
		maxHeight: number
		minHeight: number
	}
	/** 大断点 */
	lg?: {
		maxWidth: number
		maxHeight: number
		minHeight: number
	}
}

/**
 * 广告位置类型联合类型
 */
export type GamePageAdPositionType = GamePageAdPosition

/**
 * 广告位置配置接口
 */
export interface AdPositionConfig {
	/** 位置标识 */
	position: GamePageAdPosition
	/** 位置名称 */
	name: string
	/** 位置描述 */
	description: string
	/** 推荐尺寸（兼容旧版本） */
	recommendedSize: {
		width: number
		height: number
	}
	/** 是否支持响应式 */
	responsive: boolean
	/** 适用设备 */
	devices: ("desktop" | "tablet" | "mobile")[]
	/** 断点尺寸规则（新版本推荐使用） */
	breakpointRules?: BreakpointRules
	/** 最大高度占视口高度的百分比（0-1），默认 0.6（60%） */
	maxHeightViewportRatio?: number
}

/**
 * 游戏页面广告位置配置
 */
export const GAME_PAGE_AD_POSITIONS: Record<
	GamePageAdPosition,
	AdPositionConfig
> = {
	[GamePageAdPosition.GameAreaTop]: {
		position: GamePageAdPosition.GameAreaTop,
		name: "游戏区域顶部",
		description: "位于游戏iframe上方的横幅广告位",
		recommendedSize: { width: 1000, height: 90 }, // PC端：100%宽度，90px高度
		responsive: true,
		devices: ["desktop", "tablet", "mobile"],
		breakpointRules: {
			base: { maxWidth: 1000, maxHeight: 50, minHeight: 50 }, // 移动端：100%宽度，50px高度
			sm: { maxWidth: 1000, maxHeight: 50, minHeight: 50 }, // 小平板：100%宽度，50px高度
			md: { maxWidth: 1000, maxHeight: 90, minHeight: 90 }, // 平板：100%宽度，90px高度
			lg: { maxWidth: 1000, maxHeight: 90, minHeight: 90 }, // 桌面：100%宽度，90px高度
		},
		maxHeightViewportRatio: 0.12, // 增加高度比例
	},
	[GamePageAdPosition.GameAreaBottom]: {
		position: GamePageAdPosition.GameAreaBottom,
		name: "游戏区域底部",
		description: "位于游戏iframe下方的横幅广告位",
		recommendedSize: { width: 1000, height: 90 }, // PC端：100%宽度，90px高度
		responsive: true,
		devices: ["desktop", "tablet", "mobile"],
		breakpointRules: {
			base: { maxWidth: 1000, maxHeight: 50, minHeight: 50 }, // 移动端：100%宽度，50px高度
			sm: { maxWidth: 1000, maxHeight: 50, minHeight: 50 }, // 小平板：100%宽度，50px高度
			md: { maxWidth: 1000, maxHeight: 90, minHeight: 90 }, // 平板：100%宽度，90px高度
			lg: { maxWidth: 1000, maxHeight: 90, minHeight: 90 }, // 桌面：100%宽度，90px高度
		},
		maxHeightViewportRatio: 0.15,
	},
	[GamePageAdPosition.ContentTop]: {
		position: GamePageAdPosition.ContentTop,
		name: "内容区域顶部",
		description: "位于游戏内容区域顶部的广告位",
		recommendedSize: { width: 336, height: 280 }, // 更新为block类型
		responsive: true,
		devices: ["desktop", "tablet", "mobile"],
		breakpointRules: {
			base: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 移动端：300x250px
			sm: { maxWidth: 336, maxHeight: 280, minHeight: 280 }, // 平板端：336x280px
			md: { maxWidth: 336, maxHeight: 280, minHeight: 280 }, // 小桌面：336x280px
			lg: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 大桌面：300x250px
		},
		maxHeightViewportRatio: 0.2,
	},
	[GamePageAdPosition.ContentMiddle]: {
		position: GamePageAdPosition.ContentMiddle,
		name: "内容区域中部",
		description: "位于游戏内容区域中部的广告位",
		recommendedSize: { width: 336, height: 280 }, // 更新为block类型
		responsive: true,
		devices: ["desktop", "tablet", "mobile"],
		breakpointRules: {
			base: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 移动端：300x250px
			sm: { maxWidth: 336, maxHeight: 280, minHeight: 280 }, // 平板端：336x280px
			md: { maxWidth: 336, maxHeight: 280, minHeight: 280 }, // 小桌面：336x280px
			lg: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 大桌面：300x250px
		},
		maxHeightViewportRatio: 0.2,
	},
	[GamePageAdPosition.ContentBottom]: {
		position: GamePageAdPosition.ContentBottom,
		name: "内容区域底部",
		description: "位于游戏内容区域底部的广告位",
		recommendedSize: { width: 336, height: 280 }, // 更新为block类型
		responsive: true,
		devices: ["desktop", "tablet", "mobile"],
		breakpointRules: {
			base: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 移动端：300x250px
			sm: { maxWidth: 336, maxHeight: 280, minHeight: 280 }, // 平板端：336x280px
			md: { maxWidth: 336, maxHeight: 280, minHeight: 280 }, // 小桌面：336x280px
			lg: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 大桌面：300x250px
		},
		maxHeightViewportRatio: 0.2,
	},
	[GamePageAdPosition.ContentMiddleBanner]: {
		position: GamePageAdPosition.ContentMiddleBanner,
		name: "内容区域中部横幅",
		description: "位于游戏内容区域中部的横幅广告位（兼容性）",
		recommendedSize: { width: 336, height: 280 }, // 更新为block类型
		responsive: true,
		devices: ["desktop", "tablet", "mobile"],
		breakpointRules: {
			base: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 移动端：300x250px
			sm: { maxWidth: 336, maxHeight: 280, minHeight: 280 }, // 平板端：336x280px
			md: { maxWidth: 336, maxHeight: 280, minHeight: 280 }, // 小桌面：336x280px
			lg: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 大桌面：300x250px
		},
		maxHeightViewportRatio: 0.2,
	},
	[GamePageAdPosition.SidebarTop]: {
		position: GamePageAdPosition.SidebarTop,
		name: "侧边栏顶部",
		description: "位于右侧边栏顶部的广告位",
		recommendedSize: { width: 300, height: 250 }, // 保持统一尺寸
		responsive: true,
		devices: ["desktop", "tablet", "mobile"], // 添加移动端支持
		breakpointRules: {
			base: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 移动端：300x250px
			sm: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 平板端：300x250px
			md: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 小桌面：300x250px
			lg: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 大桌面：300x250px
		},
		maxHeightViewportRatio: 0.3,
	},
	[GamePageAdPosition.SidebarMiddle]: {
		position: GamePageAdPosition.SidebarMiddle,
		name: "侧边栏中部",
		description: "位于右侧边栏中部的广告位",
		recommendedSize: { width: 300, height: 250 }, // 保持统一尺寸
		responsive: true,
		devices: ["desktop", "tablet", "mobile"], // 添加移动端支持
		breakpointRules: {
			base: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 移动端：300x250px
			sm: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 平板端：300x250px
			md: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 小桌面：300x250px
			lg: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 大桌面：300x250px
		},
		maxHeightViewportRatio: 0.3,
	},
	[GamePageAdPosition.SidebarBottom]: {
		position: GamePageAdPosition.SidebarBottom,
		name: "侧边栏底部",
		description: "位于右侧边栏底部的广告位",
		recommendedSize: { width: 300, height: 250 }, // 保持统一尺寸
		responsive: true,
		devices: ["desktop", "tablet", "mobile"], // 添加移动端支持
		breakpointRules: {
			base: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 移动端：300x250px
			sm: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 平板端：300x250px
			md: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 小桌面：300x250px
			lg: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 大桌面：300x250px
		},
		maxHeightViewportRatio: 0.3,
	},
	[GamePageAdPosition.RelatedGames]: {
		position: GamePageAdPosition.RelatedGames,
		name: "相关游戏区域",
		description: "位于相关游戏列表中的广告位",
		recommendedSize: { width: 300, height: 250 },
		responsive: true,
		devices: ["desktop", "tablet", "mobile"],
		breakpointRules: {
			base: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 移动端：300x250px
			sm: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 平板端：300x250px
			md: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 小桌面：300x250px
			lg: { maxWidth: 300, maxHeight: 250, minHeight: 250 }, // 大桌面：300x250px
		},
		maxHeightViewportRatio: 0.3,
	},
	[GamePageAdPosition.CommentsTop]: {
		position: GamePageAdPosition.CommentsTop,
		name: "评论区顶部",
		description: "位于评论区域顶部的广告位",
		recommendedSize: { width: 728, height: 60 }, // 更新为与banner一致的60px高度
		responsive: true,
		devices: ["desktop", "tablet", "mobile"],
		breakpointRules: {
			base: { maxWidth: 300, maxHeight: 50, minHeight: 50 }, // 移动端：300x50px
			sm: { maxWidth: 468, maxHeight: 60, minHeight: 60 }, // 平板端：468x60px
			md: { maxWidth: 728, maxHeight: 60, minHeight: 60 }, // 小桌面：728x60px
			lg: { maxWidth: 728, maxHeight: 60, minHeight: 60 }, // 大桌面：728x60px
		},
		maxHeightViewportRatio: 0.15,
	},
	[GamePageAdPosition.CommentsBottom]: {
		position: GamePageAdPosition.CommentsBottom,
		name: "评论区底部",
		description: "位于评论区域底部的广告位（仅桌面端和平板显示）",
		recommendedSize: { width: 728, height: 60 }, // 更新为与banner一致的60px高度
		responsive: true,
		devices: ["desktop", "tablet"], // 移除mobile设备，避免与右侧广告重复
		breakpointRules: {
			base: { maxWidth: 1, maxHeight: 1, minHeight: 1 }, // 移动端隐藏：设置为极小尺寸
			sm: { maxWidth: 468, maxHeight: 60, minHeight: 60 }, // 平板端：468x60px
			md: { maxWidth: 728, maxHeight: 60, minHeight: 60 }, // 小桌面：728x60px
			lg: { maxWidth: 728, maxHeight: 60, minHeight: 60 }, // 大桌面：728x60px
		},
		maxHeightViewportRatio: 0.15,
	},
}

/**
 * 获取广告位置配置
 */
export const getAdPositionConfig = (
	position: GamePageAdPosition,
): AdPositionConfig => {
	return GAME_PAGE_AD_POSITIONS[position]
}

/**
 * 字符串位置到GamePageAdPosition枚举的映射
 */
const positionStringToEnum: Record<string, GamePageAdPosition> = {
	game_page_header_top: GamePageAdPosition.GameAreaTop,
	game_area_bottom: GamePageAdPosition.GameAreaBottom,
	game_area_top: GamePageAdPosition.GameAreaTop,
	content_top: GamePageAdPosition.ContentTop,
	content_middle: GamePageAdPosition.ContentMiddle,
	content_middle_banner: GamePageAdPosition.ContentMiddleBanner,
	content_bottom: GamePageAdPosition.ContentBottom,
	sidebar_top: GamePageAdPosition.SidebarTop,
	sidebar_middle: GamePageAdPosition.SidebarMiddle,
	sidebar_bottom: GamePageAdPosition.SidebarBottom,
	comments_top: GamePageAdPosition.CommentsTop,
	comments_bottom: GamePageAdPosition.CommentsBottom,
	related_games: GamePageAdPosition.RelatedGames,
}

/**
 * 根据字符串位置获取广告位置配置
 */
export const getAdPositionConfigByString = (
	position: string,
): AdPositionConfig | undefined => {
	const enumPosition = positionStringToEnum[position]
	if (!enumPosition) {
		console.warn(`Unknown ad position: ${position}`)
		return undefined
	}
	return GAME_PAGE_AD_POSITIONS[enumPosition]
}

/**
 * 获取指定设备类型的广告位置列表
 */
export const getAdPositionsByDevice = (
	device: "desktop" | "tablet" | "mobile",
): GamePageAdPosition[] => {
	return Object.values(GamePageAdPosition).filter((position) =>
		GAME_PAGE_AD_POSITIONS[position].devices.includes(device),
	)
}

/**
 * 检查广告位置是否支持指定设备
 */
export const isAdPositionSupportedOnDevice = (
	position: GamePageAdPosition,
	device: "desktop" | "tablet" | "mobile",
): boolean => {
	return GAME_PAGE_AD_POSITIONS[position].devices.includes(device)
}
