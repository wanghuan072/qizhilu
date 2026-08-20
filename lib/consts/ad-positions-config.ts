/**
 * 广告位置完整配置
 *
 * 此文件定义了所有页面和对应的广告位置标识符
 * 用于在 UI 工具中生成广告配置界面
 */

import { GamePageAdPosition } from "./ad-positions"

/**
 * 页面类型枚举
 */
export enum PageType {
	/** 游戏详情页（单游戏站首页也使用此类型） */
	GamePage = "game_page",
	/** 首页（仅 GameBox 模板使用） */
	HomePage = "home_page",
	/** 所有游戏列表页 */
	AllGamesPage = "all_games_page",
}

/**
 * 广告位置完整配置接口
 */
export interface AdPositionFullConfig {
	/** 页面类型 */
	pageType: PageType
	/** 页面名称（中文） */
	pageName: string
	/** 页面描述 */
	pageDescription: string
	/** 页面路径（示例） */
	pagePath: string
	/** 适用的模板类型（undefined 表示适用于所有模板） */
	templateTypes?: ("single-game" | "game-box")[]
	/** 广告位置列表 */
	positions: Array<{
		/** 位置唯一标识符 */
		positionId: string
		/** 位置名称（中文） */
		positionName: string
		/** 位置描述 */
		positionDescription: string
		/** 推荐尺寸类型 */
		recommendedSizeType: "banner" | "block"
		/** 是否首屏（影响加载策略） */
		isAboveTheFold?: boolean
		/** 对应的 GamePageAdPosition（如果适用） */
		gamePageAdPosition?: GamePageAdPosition
	}>
}

/**
 * 所有广告位置配置
 */
export const AD_POSITIONS_CONFIG: AdPositionFullConfig[] = [
	{
		pageType: PageType.GamePage,
		pageName: "游戏详情页",
		pageDescription:
			"单个游戏的详情页面，包含游戏播放器、内容、评论等。单游戏站首页也使用此类型。",
		pagePath: "/[locale]/[gameSlug]",
		templateTypes: ["single-game", "game-box"], // 两种模板都支持
		positions: [
			{
				positionId: "game_page_header_top",
				positionName: "游戏页面头部顶部",
				positionDescription: "位于游戏页面头部，游戏播放器上方的大型横幅广告位",
				recommendedSizeType: "banner",
				isAboveTheFold: true,
				gamePageAdPosition: GamePageAdPosition.GameAreaTop,
			},
			{
				positionId: "game_area_bottom",
				positionName: "游戏区域底部",
				positionDescription: "位于游戏播放器下方，相关游戏区域上方的横幅广告位",
				recommendedSizeType: "banner",
				gamePageAdPosition: GamePageAdPosition.GameAreaBottom,
			},
			{
				positionId: "content_middle_banner",
				positionName: "内容区域中部横幅",
				positionDescription: "位于相关游戏区域下方，内容区域中部的横幅广告位",
				recommendedSizeType: "banner",
				gamePageAdPosition: GamePageAdPosition.ContentMiddle,
			},
			{
				positionId: "comments_top",
				positionName: "评论区顶部",
				positionDescription: "位于评论区域顶部的方形广告位（桌面端显示在右侧）",
				recommendedSizeType: "block",
				gamePageAdPosition: GamePageAdPosition.CommentsTop,
			},
			{
				positionId: "comments_bottom",
				positionName: "评论区底部",
				positionDescription: "位于评论区域底部的方形广告位（桌面端显示在右侧）",
				recommendedSizeType: "block",
				gamePageAdPosition: GamePageAdPosition.CommentsBottom,
			},
			{
				positionId: "sidebar_top",
				positionName: "侧边栏顶部",
				positionDescription: "位于右侧边栏顶部的方形广告位（仅桌面端显示）",
				recommendedSizeType: "block",
				gamePageAdPosition: GamePageAdPosition.SidebarTop,
			},
			{
				positionId: "sidebar_middle",
				positionName: "侧边栏中部",
				positionDescription:
					"位于右侧边栏中部，热门游戏和最新游戏之间的方形广告位（仅桌面端显示）",
				recommendedSizeType: "block",
				gamePageAdPosition: GamePageAdPosition.SidebarMiddle,
			},
			{
				positionId: "sidebar_bottom",
				positionName: "侧边栏底部",
				positionDescription: "位于右侧边栏底部的方形广告位（仅桌面端显示）",
				recommendedSizeType: "block",
				gamePageAdPosition: GamePageAdPosition.SidebarBottom,
			},
			{
				positionId: "related_games",
				positionName: "相关游戏区域",
				positionDescription: "位于相关游戏列表中的广告位（会插入到游戏卡片中）",
				recommendedSizeType: "block",
				gamePageAdPosition: GamePageAdPosition.RelatedGames,
			},
		],
	},
	{
		pageType: PageType.HomePage,
		pageName: "首页（GameBox 模板）",
		pageDescription:
			"游戏盒子模板的首页，展示所有游戏分类和推荐游戏。注意：单游戏站首页使用 game_page 类型，自定义页面没有广告位置。",
		pagePath: "/[locale]",
		templateTypes: ["game-box"], // 仅 GameBox 模板支持
		positions: [
			{
				positionId: "home_top_banner",
				positionName: "首页顶部横幅",
				positionDescription: "位于首页顶部，推荐游戏区域上方的横幅广告位",
				recommendedSizeType: "banner",
				isAboveTheFold: true,
			},
			{
				positionId: "home_middle_banner",
				positionName: "首页中部横幅",
				positionDescription: "位于首页中部，热门游戏和新游戏之间的横幅广告位",
				recommendedSizeType: "banner",
			},
		],
	},
	{
		pageType: PageType.AllGamesPage,
		pageName: "所有游戏列表页",
		pageDescription: "显示所有游戏的列表页面，包含筛选和搜索功能",
		pagePath: "/[locale]/games",
		positions: [
			{
				positionId: "all_games_top_banner",
				positionName: "所有游戏页面顶部横幅",
				positionDescription:
					"位于所有游戏页面顶部，搜索和筛选区域下方的横幅广告位",
				recommendedSizeType: "banner",
				isAboveTheFold: true,
			},
			{
				positionId: "all_games_content_right_top",
				positionName: "内容右侧顶部（桌面端）",
				positionDescription:
					"位于游戏列表右侧顶部的垂直广告位（仅桌面端显示，宽度约300px）",
				recommendedSizeType: "block",
			},
			{
				positionId: "all_games_content_right_bottom",
				positionName: "内容右侧底部（桌面端）",
				positionDescription:
					"位于游戏列表右侧底部的垂直广告位（仅桌面端显示，宽度约300px）",
				recommendedSizeType: "block",
			},
			{
				positionId: "all_games_mobile_vertical",
				positionName: "移动端垂直广告",
				positionDescription: "位于游戏列表下方的垂直广告位（仅移动端显示）",
				recommendedSizeType: "block",
			},
			{
				positionId: "all_games_bottom_banner",
				positionName: "所有游戏页面底部横幅",
				positionDescription: "位于所有游戏页面底部的横幅广告位",
				recommendedSizeType: "banner",
			},
			{
				positionId: "all_games_sidebar_top",
				positionName: "左侧边栏顶部",
				positionDescription:
					"位于游戏列表页左侧边栏顶部的方形广告位（仅桌面端显示）",
				recommendedSizeType: "block",
			},
			{
				positionId: "all_games_sidebar_bottom",
				positionName: "左侧边栏底部",
				positionDescription:
					"位于游戏列表页左侧边栏底部的方形广告位（仅桌面端显示，固定在底部）",
				recommendedSizeType: "block",
			},
		],
	},
]

/**
 * 获取所有广告位置 ID 列表
 */
export function getAllAdPositionIds(): string[] {
	return AD_POSITIONS_CONFIG.flatMap((page) =>
		page.positions.map((pos) => pos.positionId),
	)
}

/**
 * 根据位置 ID 获取配置
 */
export function getAdPositionConfigById(
	positionId: string,
): AdPositionFullConfig["positions"][0] | undefined {
	for (const page of AD_POSITIONS_CONFIG) {
		const position = page.positions.find((p) => p.positionId === positionId)
		if (position) return position
	}
	return undefined
}

/**
 * 根据模板类型获取可用的页面配置
 */
export function getAdPositionsByTemplateType(
	templateType: "single-game" | "game-box",
): AdPositionFullConfig[] {
	return AD_POSITIONS_CONFIG.filter((config) => {
		// 如果没有指定 templateTypes，则适用于所有模板
		if (!config.templateTypes || config.templateTypes.length === 0) {
			return true
		}
		// 检查是否包含当前模板类型
		return config.templateTypes.includes(templateType)
	})
}

/**
 * 根据页面类型获取配置
 */
export function getAdPositionsByPageType(
	pageType: PageType,
): AdPositionFullConfig | undefined {
	return AD_POSITIONS_CONFIG.find((config) => config.pageType === pageType)
}
