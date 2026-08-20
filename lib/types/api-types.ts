/**
 * 通用API请求参数接口
 */
export interface ApiRequestParams {
	locale?: string
	projectId?: string
	[key: string]: any
}

/**
 * 带本地化信息的通用泛型类型
 * 为任何数据类型添加 locale 字段
 */
export interface Localized<T> {
	locale: string
	data: T
}

// =================================== [ 站点 ] ===================================

/**
 * API客户端类型定义
 * 包含所有与API交互相关的类型定义
 */
export enum ProjectLocaleSiteSettingType {
	// 元数据
	Metadata = "Metadata",
	// 导航
	Nav = "Nav",
	// 游戏分类
	GameCategories = "GameCategories",
	// 文章分类
	ArticleCategories = "ArticleCategories",
}

export interface ProjectLocaleSiteSetting {
	type: ProjectLocaleSiteSettingType | string
	locale: string
	content: any
}

// 定义导航项类型
export interface NavigationItem {
	id: string
	label: string
	href: string
	target?: string
	iconName?: string // 图标名称，用于动态选择图标
	children?: NavigationItem[] // 子菜单项
}

// 广告类型
export enum AdSettingsType {
	// 横幅广告
	Banner = "banner",
	// 方块广告
	Block = "block",
}

/**
 * 语言类型
 */
export type Language = {
	// 语言代码
	code: string
	// 中文语言名称
	name: string
	// 本地语言名称
	localName: string
}
/**
 * 友情链接类型
 */
export interface FriendLink {
	name: string
	url: string
}

/**
 * 图标配置接口
 */
export interface IconsConfig {
	favicon?: string
	appleTouchIcon?: string
	androidIcon?: string
}

/**
 * 分析工具配置接口
 */
export interface AnalyticsConfig {
	gaId?: string
	clarityId?: string
	plausible?: string
	adsenseClientId?: string
}

/**
 * 社交媒体链接配置接口
 */
export interface SocialLinksConfig {
	twitter?: string
	facebook?: string
	instagram?: string
	youtube?: string
	linkedin?: string
}

/**
 * 字体配置接口
 */
export interface FontsConfig {
	sans?: string
	serif?: string
	mono?: string
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
	// 主题名称
	name?: string
	// 主色调
	mainColor?: string
	// 次色调
	secondaryColor?: string
}

export type PublishWeekday =
	| "monday"
	| "tuesday"
	| "wednesday"
	| "thursday"
	| "friday"
	| "saturday"
	| "sunday"

export interface PublishDaySchedule {
	enabled: boolean
	time?: string | null
}

export interface PublishScheduleConfig {
	useUnifiedTime: boolean
	unifiedTime?: string | null
	days: Record<PublishWeekday, PublishDaySchedule>
}

export interface PublishStrategyConfig {
	// 是否启用定时发布
	enabled: boolean
	// 每周发布频次
	releasesPerWeek: number
	// 每次发布的游戏数量
	gamesPerRelease: number
	// 下次发布时间 (ISO字符串)
	nextReleaseAt?: string | null
	// 最近一次发布时间 (ISO字符串)
	lastReleaseAt?: string | null
	// 每周排程设置
	schedule?: PublishScheduleConfig
}

/**
 * 网站设置信息接口(与数据库结构保持一致，全局配置，与多语言无关)
 */
export interface SiteSettings {
	// 网站名称
	siteName: string
	// 网站模板类型
	templateType: string
	// 网站Logo
	logo: string
	// 暗色模式Logo
	darkLogo?: string
	// 网站域名
	domain?: string
	// 联系邮箱
	contactEmail?: string
	// 是否为演示站点
	isDemoSite?: boolean
	// 社交媒体链接
	socialLinks?: SocialLinksConfig
	// 分析工具配置
	analytics?: AnalyticsConfig
	// 字体配置
	fonts?: FontsConfig
	// 主题配置
	theme?: ThemeConfig
	// 默认语言
	defaultLocale: string
	// 支持的语言列表
	supportedLocales: string[]
	// 语言名称映射(key为语言代码，value为语言类型对象)
	languages: Record<string, Language>
	// 自定义头部内容
	customHeaderContent?: string
	// ads.txt 内容
	adsTxtContent?: string
	// 头部和底部数据在模板页面渲染时动态生成
	// 图标和图片
	icons?: IconsConfig
	// 友情链接
	friendLinks?: FriendLink[]
	// 广告配置(当前网站所有的广告配置)
	adsSettings?: AdSettings[]
	// 发布策略配置
	publishStrategy?: PublishStrategyConfig
	// 是否已经配置过发布策略
	publishStrategyConfigured?: boolean
}

// ===================================[ 游戏 ]===================================

// 游戏模板分类
export enum GameTemplateType {
	// 单游戏模板
	Single = "single-game",
	// 游戏盒子模板
	GameBox = "game-box",
}

/**
 * 项目游戏详情内容类型
 */
export enum ProjectGameLocaleType {
	// @see api-types.ts MetadataInfo
	Metadata = "metadata",
	// 游戏内容（包含游戏玩法、攻略、截图、FAQ等，使用json格式存放每种语言的所有内容）
	Content = "content",
	// 游戏基本信息（比如需要国际化的名称，游戏描述等）
	BasicInfo = "basicInfo",
}

/**
 * 游戏类型
 */
export enum GameType {
	// iframe嵌入
	Iframe = "iframe",
	// 下载
	Download = "download",
	// 弹窗
	Popup = "popup",
	// 占位类型（没有任何可操作的内容，用于占位）
	Placeholder = "placeholder",
	// 链接跳转
	Link = "link",
}

/**
 * 游戏详情内容类型(根据这个类型来渲染不同的内容)
 */
export enum GameDetailContentType {
	// 推荐游戏
	RelatedGames = "relatedGames",
	// 相关视频
	RelatedVideos = "relatedVideos",
	// 文章
	Article = "article",
	// 评论
	Comments = "comments",
}

// 定义元数据类型
export interface MetadataInfo {
	// 标题（网页标题、SEO使用的标题）
	title?: string
	// 名称（用于需要国际化的名称，如果游戏名称，与title不一定相同）
	name?: string
	// 标语（游戏标语或口号）
	slogan?: string
	// 描述
	description: string
	// 社交分享标题
	ogTitle?: string
	// 社交分享描述
	ogDescription?: string
	// 社交分享图片
	ogImage?: string
	// 社交分享链接
	ogUrl?: string
	// 社交分享类型
	twitterCard?: string
	// 社交分享标题
	twitterTitle?: string
	// 社交分享描述
	twitterDescription?: string
	// 社交分享图片
	twitterImage?: string
}

/**
 * 游戏FAQ项目接口
 */
export interface FAQItem {
	// 问题
	question: string
	// 答案
	answer: string
}

/**
 * 截图项目接口
 */
export interface Screenshot {
	// 截图ID
	id: string
	// 截图描述
	alt: string
	// 截图URL
	url: string
}

// 定义评论类型
export interface GameComment {
	// 评论ID
	id: string
	// 评论者
	author: string
	// 评论时间
	timestamp: string
	// 评论内容
	text: string
	// 评论评分
	rating?: number
	// 点赞数
	likes: number
	// 不喜欢数
	dislikes: number
	// 回复
	replies?: GameComment[]
	// 是否为用户评论（本地存储的评论）
	isUserComment?: boolean
}

/**
 * 广告类型枚举
 */
export type AdType = "adsense" | "third-party"

/**
 * 广告位置标识符
 */
export type AdPosition = string

/**
 * 页面类型
 */
export type AdPageType =
	| "game_page" // 游戏详情页（单游戏站首页也使用此类型）
	| "home_page" // 首页（仅 GameBox 模板使用）
	| "all_games_page" // 所有游戏列表页
	| "article_page" // 文章详情页

/**
 * 广告位置常量
 */
export const AD_PAGE_TYPES = {
	GAME_PAGE: "game_page" as const,
	HOME_PAGE: "home_page" as const,
	ALL_GAMES_PAGE: "all_games_page" as const,
	ARTICLE_PAGE: "article_page" as const,
} as const

export const AD_POSITIONS = {
	// 游戏页面广告位
	GAME_AREA_BOTTOM: "game_area_bottom",
	CONTENT_MIDDLE_BANNER: "content_middle_banner",
	COMMENTS_TOP: "comments_top",
	COMMENTS_BOTTOM: "comments_bottom",

	// 首页广告位
	HOME_TOP_BANNER: "home_top_banner",
	HOME_MIDDLE_BANNER: "home_middle_banner",

	// 游戏列表页广告位
	ALL_GAMES_SIDEBAR_TOP: "all_games_sidebar_top",
	ALL_GAMES_TOP_BANNER: "all_games_top_banner",
} as const

/**
 * 广告设置接口
 */
export interface AdSettings {
	// 广告名称
	name: string
	// 广告类型：adsense（Google AdSense）或 third-party（第三方广告）
	// 历史兼容：支持 "banner" 和 "block"（会自动转换为 "third-party"）
	type: AdType | "banner" | "block"
	// 广告代码（对于 AdSense，包含完整的 <ins> 标签和 script；对于第三方，包含完整的 HTML 代码）
	codeText: string
	// 页面类型（可选，用于区分是哪个页面）
	page?: AdPageType
	// 广告位置（可选，用于标识广告在页面中的位置）
	// 历史兼容：如果没有 position，会根据 type 和 page 推断位置
	position?: AdPosition
	// 模板类型（可选，用于区分代码模板："single-game" | "game-box"）
	// 如果未指定，则适用于所有模板类型
	templateType?: "single-game" | "game-box"
	// 是否启用
	enabled?: boolean
	// 优先级（数字越大优先级越高）
	priority?: number
}

/**
 * 游戏下载配置
 */
export interface GameDownloadSettings {
	url?: string
	// 下载链接
	ios?: string
	android?: string
	pc?: string
	steam?: string
	mac?: string
}

/**
 * 游戏区域背景配置
 */
export interface GameBackgroundSettings {
	type: "image" | "video"
	imageUrl?: string
	videoUrl?: string
}

/**
 * 游戏标签
 */
/**
 * 游戏标签接口
 */
export interface GameTag {
	// 标签唯一标识
	id: string
	// 标签名称
	name: string
	// 标签所属语言
	locale: string
	// 标签URL友好的名称
	slug: string
	// 标签描述
	description?: string
	// 标签图片URL
	imageUrl?: string
	// 标签图标名称
	iconName?: string
	// 使用该标签的游戏数量
	count?: number
	// SEO标题
	metaTitle?: string
	// SEO描述
	metaDescription?: string
}

/**
 * 游戏分类
 */
export interface GameCategory {
	// 分类编号
	code: string
	// 父分类编号
	parentCode?: string
	// 分类名称
	name: string
	// 所属语言（冗余字段）
	locale: string
	// 分类访问路径
	slug: string
	// 分类图标（支持icon\image）
	icon?: string
	// 分类下的游戏数量
	count?: number
	// 分类排序(数字越大越靠前)
	sortOrder?: number
	// 分类元数据
	metadata?: MetadataInfo
	// 子分类
	children?: GameCategory[]
}

/**
 * 游戏信息
 */
export interface GameInfo {
	// 游戏ID
	id: string
	// 游戏开发商
	developer: string
	// 游戏发布日期
	releaseDate: string
	// 游戏使用的技术
	technology: string
	// 游戏支持的平台
	platform: string
	// 游戏年龄分级
	ageRating: string
	// 游戏本地化支持的语言
	localization: string
	// 游戏屏幕方向
	screenOrientation: string
	// 是否支持云存档
	cloudSaves: string
	// 是否支持授权
	authorizationSupport: string
	// 游戏评分
	rating: number
}

/**
 * 游戏内容 Tab 区域
 */
export interface GameContentBase {
	tabId: string
	title: string
	icon?: string
	sort?: number
}

/**
 * 游戏 Markdown 内容
 */
export interface GameMarkdownContent extends GameContentBase {
	type: "markdown"
	content: string
}

/**
 * 游戏视频内容
 */
export interface GameVideoContent extends GameContentBase {
	type: "video"
	items: {
		title: string
		url: string
	}[]
}

/**
 * 游戏 FAQ 内容
 */
export interface GameFAQContent extends GameContentBase {
	type: "faq"
	items: {
		question: string
		answer: string
	}[]
}

/**
 * 游戏图片内容
 */
export interface GameImageContent extends GameContentBase {
	type: "image"
	items: {
		id: string
		alt: string
		url: string
	}[]
}

/**
 * 游戏内容类型
 */
export type GameContentType =
	| GameMarkdownContent
	| GameVideoContent
	| GameFAQContent
	| GameImageContent

/**
 * 游戏链接
 */
export interface GameTextLink {
	id: string
	title: string
	url: string
}
/**
 * 游戏数据 -- 单语言本地化后
 */
export interface GameData {
	// 游戏唯一标识
	id: string
	// 游戏名称
	name: string
	// URL友好的游戏名称
	slug: string
	// 游戏截图URL
	screenshotUrl?: string
	// 游戏类型(iframe/download/popup/placeholder)
	type: GameType | string
	// 是否推荐到首页
	recommendToHome: boolean
	// 游戏URL
	iframeUrl: string
	// 是否为主要游戏
	isPrimary: boolean
	// 本地化名称
	gameLocaleName: string
	// 本地化描述
	gameLocaleDescription?: string
	// 本地化标语
	gameLocaleSlogan?: string
	// 创建时间
	createTime?: string
	// 更新时间
	updateTime?: string
	// 游戏下载配置
	gameDownload?: GameDownloadSettings
	// 游戏区域的背景配置
	background?: GameBackgroundSettings
	// metadataInfo
	metadataInfo?: MetadataInfo
	// 游戏信息
	gameInfo: GameInfo
	// 游戏分类
	categories: GameCategory[]
	// 游戏标签
	tags: GameTag[]
	// 游戏内容
	contents: GameContentType[]
	// 相关链接
	relatedLinks: GameTextLink[]
	// 游戏评论
	comments: GameComment[]
}

/**
 * 游戏数据列表 -- 所有语言
 */
export type GameDataList = Localized<GameData[]>[]

// ===================================[ 博客 ]===================================

// 定义博客文章数据类型
export interface ArticlePost {
	id: string
	slug: string
	title: string
	locale: string
	titleImageUrl: string
	category?: ArticleCategory
	author?: string
	readTime?: string
	authorImageUrl?: string
	updateTime: string
	tags?: string[]
	relatedPosts?: ArticlePost[]
	mdxContent: string
	status?: string
	metadata: MetadataInfo
}

// 定义博客分类数据类型
export interface ArticleCategory {
	id: string
	name: string
	slug: string
	description?: string
	count: number
	image?: string
}

// ===================================[ 自定义页面 ]===================================

/**
 * 自定义页面类型枚举
 */
export enum CustomPageType {
	// 普通页面
	Page = "PAGE",
	// 法律相关页面
	Legal = "LEGAL",
	// 关于页面
	About = "ABOUT",
	// 隐私政策
	Privacy = "PRIVACY",
	// 服务条款
	Terms = "TERMS",
}

/**
 * 自定义页面状态枚举
 */
export enum CustomPageStatus {
	// 草稿
	Draft = "DRAFT",
	// 已发布
	Published = "PUBLISHED",
	// 已归档
	Archived = "ARCHIVED",
}

/**
 * 自定义页面数据类型
 */
export interface CustomPage {
	// 页面唯一标识
	id: string
	// 页面标题
	title: string
	// URL友好的页面名称
	slug: string
	// 页面所属语言
	locale: string
	// 页面内容（MDX格式）
	content: string
	// 页面描述
	description?: string
	// 页面图标
	icon?: string
	// 页面类型
	pageType: CustomPageType | string
	// 页面元数据
	metadata?: MetadataInfo
	// 页面状态
	status: CustomPageStatus | string
	// 是否为首页（仅对CMS模板有效）
	isHomePage?: boolean
	// 源页面ID（用于页面翻译或复制追踪）
	sourcePageId?: string
	// 创建时间
	createdAt?: string
	// 更新时间
	updatedAt?: string
}
