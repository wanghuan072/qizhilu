/**
 * TikTok Pixel 工具类
 * 提供TikTok Pixel事件追踪功能
 */

// TikTok Pixel 全局变量类型声明
declare global {
	interface Window {
		ttq?: {
			track: (eventName: string, parameters?: Record<string, any>) => void
			page: () => void
		}
	}
}

// TikTok Pixel 事件类型
export interface TikTokPixelParameters {
	contents?: Array<{
		content_id?: string
		content_type?: string
		content_name?: string
		price?: number
		quantity?: number
	}>
	value?: number
	currency?: string
	description?: string
	query?: string
	status?: string
}

// TikTok Pixel 事件名称
export enum TikTokPixelEvent {
	PAGE_VIEW = "PageView", // 页面浏览
	VIEW_CONTENT = "ViewContent", // 查看内容
	SEARCH = "Search", // 搜索
	CONTACT = "Contact", // 联系
	CLICK_GAME = "ClickGame", // 自定义：点击游戏开始按钮
	PLAY_GAME = "PlayGame", // 自定义：开始玩游戏
	ADD_TO_WISHLIST = "AddToWishlist", // 添加到愿望单
	SIGN_UP = "SignUp", // 注册
	CHECKOUT = "Checkout", // 结账
	PAYMENT = "Payment", // 支付
	COMPLETE_PAYMENT = "CompletePayment", // 完成支付
	ENGAGEMENT = "Engagement", // 自定义：用户参与度事件（包含停留时长）
}

/**
 * TikTok Pixel 追踪类
 */
export class TikTokPixelTracker {
	private static instance: TikTokPixelTracker
	private isInitialized = false
	private engagementTimer: NodeJS.Timeout | null = null
	private pageStartTime: number = 0
	private lastEngagementTime: number = 0
	private engagementIntervalSeconds: number = 30 // 每30秒发送一次参与度事件

	private constructor() {}

	/**
	 * 获取单例实例
	 */
	public static getInstance(): TikTokPixelTracker {
		if (!TikTokPixelTracker.instance) {
			TikTokPixelTracker.instance = new TikTokPixelTracker()
		}
		return TikTokPixelTracker.instance
	}

	/**
	 * 检查 TikTok Pixel 是否可用
	 */
	public isAvailable(): boolean {
		return typeof window !== "undefined" && !!window.ttq
	}

	/**
	 * 初始化 TikTok Pixel
	 * 注意：初始化代码需要用户通过自定义头部内容引入
	 */
	public initialize(): void {
		if (typeof window === "undefined") {
			return // 服务端渲染时不执行
		}

		if (this.isAvailable()) {
			this.isInitialized = true
			console.log("TikTok Pixel 已准备就绪")
		}
	}

	/**
	 * 追踪页面浏览
	 */
	public trackPageView(): void {
		if (!this.canTrack()) return

		try {
			window.ttq!.page()
			console.log("TikTok Pixel: 页面浏览事件已触发")
		} catch (error) {
			console.error("TikTok Pixel 页面浏览追踪失败:", error)
		}
	}

	/**
	 * 追踪自定义事件
	 */
	public trackEvent(
		eventName: TikTokPixelEvent,
		parameters?: TikTokPixelParameters,
	): void {
		if (!this.canTrack()) return

		try {
			window.ttq!.track(eventName, parameters)
			console.log(`TikTok Pixel: ${eventName} 事件已触发`, parameters)
		} catch (error) {
			console.error(`TikTok Pixel ${eventName} 事件追踪失败:`, error)
		}
	}

	/**
	 * 追踪游戏点击事件
	 */
	public trackGameClick(gameInfo: {
		id: string
		name: string
		category?: string
	}): void {
		this.trackEvent(TikTokPixelEvent.CLICK_GAME, {
			contents: [
				{
					content_id: gameInfo.id,
					content_type: "game",
					content_name: gameInfo.name,
					quantity: 1,
				},
			],
			description: `用户点击开始游戏: ${gameInfo.name}`,
			query: gameInfo.category || "game",
		})
	}

	/**
	 * 追踪游戏开始事件
	 */
	public trackGameStart(gameInfo: {
		id: string
		name: string
		category?: string
	}): void {
		this.trackEvent(TikTokPixelEvent.PLAY_GAME, {
			contents: [
				{
					content_id: gameInfo.id,
					content_type: "game",
					content_name: gameInfo.name,
					quantity: 1,
				},
			],
			description: `用户开始玩游戏: ${gameInfo.name}`,
			query: gameInfo.category || "game",
		})
	}

	/**
	 * 追踪查看内容事件（游戏详情页）
	 */
	public trackViewContent(gameInfo: {
		id: string
		name: string
		category?: string
	}): void {
		this.trackEvent(TikTokPixelEvent.VIEW_CONTENT, {
			contents: [
				{
					content_id: gameInfo.id,
					content_type: "game",
					content_name: gameInfo.name,
					quantity: 1,
				},
			],
			description: `用户查看游戏详情: ${gameInfo.name}`,
			query: gameInfo.category || "game",
		})
	}

	/**
	 * 开始追踪页面停留时长
	 */
	public startPageEngagementTracking(pageInfo?: {
		pageType?: string
		pageName?: string
		contentId?: string
	}): void {
		if (typeof window === "undefined") {
			return // 服务端渲染时不执行
		}

		// 清除之前的追踪
		this.stopPageEngagementTracking()

		this.pageStartTime = Date.now()
		this.lastEngagementTime = this.pageStartTime

		// 立即发送第一次参与度事件
		this.sendEngagementEvent(pageInfo, 0)

		// 设置定时器，每隔指定时间发送参与度事件
		this.engagementTimer = setInterval(() => {
			this.sendEngagementEvent(pageInfo)
		}, this.engagementIntervalSeconds * 1000)
	}

	/**
	 * 停止追踪页面停留时长
	 */
	public stopPageEngagementTracking(): void {
		if (this.engagementTimer) {
			clearInterval(this.engagementTimer)
			this.engagementTimer = null
		}
	}

	/**
	 * 发送参与度事件
	 */
	private sendEngagementEvent(
		pageInfo?: {
			pageType?: string
			pageName?: string
			contentId?: string
		},
		forcedDuration?: number
	): void {
		const currentTime = Date.now()
		const timeOnPage = forcedDuration || Math.floor((currentTime - this.pageStartTime) / 1000)
		const timeSinceLastEngagement = Math.floor(
			(currentTime - this.lastEngagementTime) / 1000
		)

		// 更新最后参与时间
		this.lastEngagementTime = currentTime

		// 构建事件参数
		const parameters: TikTokPixelParameters = {
			description: `页面停留时长: ${timeOnPage}秒`,
			query: pageInfo?.pageType || "page_engagement",
		}

		// 如果有页面信息，添加到参数中
		if (pageInfo) {
			if (pageInfo.contentId) {
				parameters.contents = [
					{
						content_id: pageInfo.contentId,
						content_type: pageInfo.pageType || "page",
						content_name: pageInfo.pageName || "Unknown Page",
						quantity: 1,
					},
				]
			}
		}

		// 添加自定义参数来传递停留时长信息
		const customParameters = {
			...parameters,
			time_on_page: timeOnPage,
			time_since_last_engagement: timeSinceLastEngagement,
			page_type: pageInfo?.pageType || "unknown",
			page_name: pageInfo?.pageName || "unknown",
		}

		this.trackEvent(TikTokPixelEvent.ENGAGEMENT, customParameters)
	}

	/**
	 * 检查是否可以进行追踪
	 */
	private canTrack(): boolean {
		if (!this.isInitialized) {
			console.warn("TikTok Pixel 未初始化，请检查是否正确引入 Pixel 代码")
			return false
		}

		if (!this.isAvailable()) {
			console.warn("TikTok Pixel 不可用")
			return false
		}

		return true
	}
}

// 导出单例实例
export const tikTokPixel = TikTokPixelTracker.getInstance()

// 导出便捷方法
export const trackPageView = () => tikTokPixel.trackPageView()
export const trackGameClick = (gameInfo: {
	id: string
	name: string
	category?: string
}) => tikTokPixel.trackGameClick(gameInfo)
export const trackGameStart = (gameInfo: {
	id: string
	name: string
	category?: string
}) => tikTokPixel.trackGameStart(gameInfo)
export const trackViewContent = (gameInfo: {
	id: string
	name: string
	category?: string
}) => tikTokPixel.trackViewContent(gameInfo)
export const startPageEngagementTracking = (pageInfo?: {
	pageType?: string
	pageName?: string
	contentId?: string
}) => tikTokPixel.startPageEngagementTracking(pageInfo)
export const stopPageEngagementTracking = () => tikTokPixel.stopPageEngagementTracking()
