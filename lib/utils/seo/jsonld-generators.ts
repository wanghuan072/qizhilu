import type { MdxFrontMatter } from "@/lib/services/custom-pages"
import type { ArticlePost, BreadcrumbItem, SiteSettings } from "@/lib/types"
import type { GameData } from "@/lib/types/api-types"
import type {
	Article,
	BreadcrumbList,
	CollectionPage,
	FAQPage,
	ItemList,
	Organization,
	SoftwareApplication,
	VideoGame,
	VideoObject,
	WebPage,
	WebSite,
	WithContext,
} from "schema-dts"

/**
 * 从游戏评论中计算平均评分
 * @param comments 游戏评论数组
 * @returns 平均评分，如果没有有效评分则返回null
 */
function calculateAverageRatingFromComments(comments: any[]): number | null {
	if (!comments || comments.length === 0) {
		return null
	}

	// 过滤出有有效评分的评论
	const validRatings = comments
		.map((comment) => comment.rating)
		.filter(
			(rating): rating is number =>
				typeof rating === "number" && rating > 0 && rating <= 5,
		)

	if (validRatings.length === 0) {
		return null
	}

	// 计算平均值并保留一位小数
	const average =
		validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
	return Math.round(average * 10) / 10 // 保留一位小数
}

/**
 * 生成游戏应用的 JSON-LD 数据
 * @param game 游戏数据（如果是平台级别，可以传 null）
 * @param gameName 游戏名称或平台名称
 * @param gameDescription 游戏描述或平台描述
 * @param gameImage 游戏图片
 * @param gameSettings 游戏设置
 * @param siteSettings 网站设置
 * @param baseUrl 基础URL
 * @param isPlatform 是否为平台级别（默认false为单个游戏）
 * @param totalGames 总游戏数量（仅平台级别使用）
 */
export function generateSoftwareApplicationJsonLd(
	game: any | null,
	gameName: string,
	gameDescription: string,
	gameImage?: string,
	gameSettings?: any,
	siteSettings?: SiteSettings,
	baseUrl = "",
	isPlatform = false,
	totalGames?: number,
): WithContext<VideoGame | SoftwareApplication> {
	// 平台级别的结构化数据
	if (isPlatform) {
		return {
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: gameName,
			description: totalGames
				? `${gameDescription} - Featuring ${totalGames}+ premium games`
				: gameDescription,
			applicationCategory: "Game",
			operatingSystem: "Web Browser",
			url: baseUrl,
			offers: {
				"@type": "Offer",
				price: "0",
				priceCurrency: "USD",
				availability: "https://schema.org/InStock",
			},
			// 使用真实评分数据计算平均评分
			...(() => {
				// 优先使用gameSettings中的rating
				let rating =
					gameSettings?.rating && gameSettings.rating > 0
						? gameSettings.rating
						: null

				// 如果gameSettings没有评分，从评论中计算平均评分
				if (rating === null && game?.comments) {
					rating = calculateAverageRatingFromComments(game.comments)
				}

				// 如果仍然没有评分，则不显示评分信息
				if (rating === null) {
					return {}
				}

				const reviewCount = game?.comments?.length || 1000
				return {
					aggregateRating: {
						"@type": "AggregateRating",
						ratingValue: rating.toString(),
						reviewCount: reviewCount.toString(),
						bestRating: "5",
						worstRating: "1",
					},
				}
			})(),
			// 平台特定属性
			genre: "Gaming Platform",
			isAccessibleForFree: true,
			inLanguage: siteSettings?.supportedLocales || ["en"],
			...(game?.tagList && {
				keywords: game.tagList.map((it: any) => it.name).join(", "),
			}),
			// 功能特性
			featureList: game?.tagList?.map((it: any) => it.name) || [],
		}
	}
	const gameSlug = game.isPrimary ? "" : `/games/${game.slug}`
	// 单个游戏的结构化数据
	return {
		"@context": "https://schema.org",
		"@type": ["VideoGame", "SoftwareApplication"],
		name: gameName,
		description: gameDescription,
		applicationCategory: "Game",
		operatingSystem: gameSettings?.platform || "Web Browser",
		url: game ? `${baseUrl}${gameSlug}` : baseUrl,
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
			availability: "https://schema.org/InStock",
		},
		// 使用真实评分数据计算平均评分
		...(() => {
			// 优先使用gameSettings中的rating
			let rating =
				gameSettings?.rating && gameSettings.rating > 0
					? gameSettings.rating
					: null

			// 如果gameSettings没有评分，从评论中计算平均评分
			if (rating === null && game?.comments) {
				rating = calculateAverageRatingFromComments(game.comments)
			}

			// 如果仍然没有评分，则不显示评分信息
			if (rating === null) {
				return {}
			}

			const reviewCount = game?.comments?.length || 100
			return {
				aggregateRating: {
					"@type": "AggregateRating",
					ratingValue: rating.toString(),
					reviewCount: reviewCount.toString(),
					bestRating: "5",
					worstRating: "1",
				},
			}
		})(),
		// 确保总是有图片属性
		image: {
			"@type": "ImageObject",
			url:
				gameImage || siteSettings?.logo || `${baseUrl}/default-game-image.jpg`,
			caption: `${gameName} screenshot`,
			width: "1200",
			height: "630",
		},
		...(gameSettings?.releaseDate && {
			datePublished: gameSettings.releaseDate,
		}),
		...(gameSettings?.version && { softwareVersion: gameSettings.version }),
		...(gameSettings?.size && { fileSize: gameSettings.size }),
		...(game?.tagList && {
			keywords: game.tagList.map((it: any) => it.name).join(", "),
		}),
		// 游戏特定属性
		genre: "Browser Game",
		gamePlatform: "Web Browser",
		playMode: "SinglePlayer",
		isAccessibleForFree: true,
		inLanguage: siteSettings?.supportedLocales || ["en"],
	}
}

/**
 * 生成面包屑导航的 JSON-LD 数据
 */
export function generateBreadcrumbJsonLd(
	breadcrumbItems: BreadcrumbItem[],
	baseUrl = "",
	siteBaseUrl?: string,
): WithContext<BreadcrumbList> {
	// 从baseUrl提取网站根域名，用于面包屑中的根路径
	const siteDomain = siteBaseUrl || baseUrl.replace(/\/[^\/]*$/, "")

	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: breadcrumbItems.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.label,
			item: buildBreadcrumbUrl(siteDomain, item.href),
		})),
	}
}

/**
 * 构建面包屑URL - 处理各种href格式
 */
function buildBreadcrumbUrl(siteDomain: string, href: string): string {
	// 处理空字符串或当前页面引用
	if (!href || href === "" || href === "#") {
		return siteDomain
	}

	// 处理根路径
	if (href === "/") {
		return siteDomain
	}

	// 处理相对路径 - 确保以/开头
	if (!href.startsWith("/")) {
		href = `/${href}`
	}

	// 构建完整URL，避免双斜杠
	const cleanSiteDomain = siteDomain.replace(/\/$/, "")
	return `${cleanSiteDomain}${href}`
}

/**
 * 生成文章的 JSON-LD 数据
 */
export function generateArticleJsonLd(
	post: ArticlePost,
	_siteSettings: SiteSettings,
	postUrl = "",
): WithContext<Article> {
	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: post.title,
		description: post.metadata?.description || post.title,
		image: post.titleImageUrl,
		datePublished: post.updateTime,
		dateModified: post.updateTime,
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `${postUrl}`,
		},
		isAccessibleForFree: true,
		...(post.category?.name && { articleSection: post.category.name }),
	}
}

/**
 * 生成集合页面的 JSON-LD 数据（用于分类和标签页面）
 */
export function generateCollectionPageJsonLd(
	name: string,
	description: string,
	games: Array<{
		name: string
		slug: string
		screenshotUrl?: string
		isPrimary?: boolean
	}>,
	_siteSettings: SiteSettings,
	baseUrl = "",
	gameBaseUrl?: string,
): WithContext<CollectionPage> {
	// 如果没有提供游戏基础URL，则从 baseUrl 中提取域名部分
	const gameSiteUrl = gameBaseUrl || baseUrl.replace(/\/[^\/]*$/, "")
	return {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name,
		description,
		url: `${baseUrl}`,
		hasPart: games.map((game) => ({
			"@type": "VideoGame",
			name: game.name,
			description: `Play ${game.name} online for free`,
			url: game.isPrimary
				? `${gameSiteUrl}`
				: `${gameSiteUrl}/games/${game.slug}`.replace(/\/$/, ""),
			image: {
				"@type": "ImageObject",
				url: game.screenshotUrl || "",
				caption: `${game.name} screenshot`,
				width: "1200",
				height: "630",
			},
			applicationCategory: "Game",
			operatingSystem: "Web Browser",
			isAccessibleForFree: true,
		})),
	}
}

/**
 * 生成视频的 JSON-LD 数据
 */
export function generateVideoObjectJsonLd(
	videos: any[],
	gameName: string,
	gameImage: string | undefined,
	siteSettings: SiteSettings,
	releaseDate?: string,
	_baseUrl = "",
): WithContext<VideoObject>[] {
	return videos.map((video, index) => ({
		"@context": "https://schema.org",
		"@type": "VideoObject",
		name: `${gameName} - Game Video ${index + 1}`,
		description: `Watch ${gameName} gameplay demonstration video`,
		contentUrl: video.url,
		embedUrl: video.url,
		uploadDate: releaseDate || new Date().toISOString(),
		// duration: "PT5M", // Default 5 minutes
		thumbnailUrl: gameImage || "",
		// 游戏相关的附加信息
		genre: "Gaming",
		inLanguage: siteSettings.supportedLocales || ["en"],
		isAccessibleForFree: true,
		// 关联的游戏
		about: {
			"@type": "VideoGame",
			name: gameName,
			description: `${gameName} game demonstration`,
			applicationCategory: "Game",
			operatingSystem: "Web Browser",
		},
	}))
}

/**
 * 生成组织的 JSON-LD 数据（专门用于社交媒体和联系信息）
 * 注意：此函数主要用于提供组织的社交媒体信息，不适合作为首页的主要结构化数据
 * @deprecated
 */
export function generateOrganizationJsonLd(
	siteSettings: SiteSettings,
	baseUrl = "",
): WithContext<Organization> {
	// 构建社交媒体链接
	const socialUrls = siteSettings.socialLinks
		? ([
				siteSettings.socialLinks.twitter &&
					`${siteSettings.socialLinks.twitter.replace("@", "")}`,
				siteSettings.socialLinks.facebook &&
					`${siteSettings.socialLinks.facebook}`,
				siteSettings.socialLinks.instagram &&
					`${siteSettings.socialLinks.instagram}`,
				siteSettings.socialLinks.youtube &&
					`${siteSettings.socialLinks.youtube}`,
				siteSettings.socialLinks.linkedin &&
					`${siteSettings.socialLinks.linkedin}`,
			].filter(Boolean) as string[])
		: []

	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		"@id": `${baseUrl}#organization`,
		name: siteSettings.siteName,
		url: baseUrl,
		logo: {
			"@type": "ImageObject",
			url: siteSettings.logo || "",
			caption: `${siteSettings.siteName} logo`,
			width: "200",
			height: "200",
		},
		// 社交媒体链接（主要用途）
		...(socialUrls.length > 0 && { sameAs: socialUrls }),
		// 联系信息
		...(siteSettings.contactEmail && {
			contactPoint: {
				"@type": "ContactPoint",
				email: siteSettings.contactEmail,
				contactType: "customer service",
				availableLanguage: siteSettings.supportedLocales || ["en-US", "en"],
			},
		}),
		// 基本组织信息
		// foundingDate: "2024", // 可根据实际情况调整
	}
}

/**
 * 生成 FAQ 页面的 JSON-LD 数据
 */
export function generateFAQPageJsonLd(faqContent: any[]): WithContext<FAQPage> {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqContent.map((faq: any) => ({
			"@type": "Question",
			name: faq.question || faq.title,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer || faq.content,
			},
		})),
	}
}

/**
 * 生成网站的 JSON-LD 数据（用于首页）
 */
export function generateWebSiteJsonLd(
	siteSettings: SiteSettings,
	baseUrl = "",
	hasSearchFunction = false,
): WithContext<WebSite> {
	const websiteData: WithContext<WebSite> = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${baseUrl}`,
		name: siteSettings.siteName,
		url: baseUrl,
		description: `${siteSettings.siteName} - Free Online Gaming Platform with H5 Games`,
		inLanguage: siteSettings.supportedLocales || ["en-US"],
		copyrightYear: new Date().getFullYear(),
		copyrightHolder: {
			"@id": `${baseUrl}`,
		},
	}

	// 如果有搜索功能，添加搜索操作
	if (hasSearchFunction) {
		websiteData.potentialAction = {
			"@type": "SearchAction",
			target: `${baseUrl}/search?q={search_term_string}`,
			"query-input": "required name=search_term_string",
		} as any
	}

	return websiteData
}

/**
 * 生成网页的 JSON-LD 数据（用于各个页面）
 */
export function generateWebPageJsonLd(
	pageTitle: string,
	pageDescription: string,
	pageUrl: string,
	siteSettings: SiteSettings,
	breadcrumbItems?: BreadcrumbItem[],
	mainEntity?: any,
	siteBaseUrl?: string,
): WithContext<WebPage> {
	const webPageData: WithContext<WebPage> = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: pageTitle,
		description: pageDescription,
		url: pageUrl,
		inLanguage: siteSettings.supportedLocales || ["en"],
		datePublished: new Date().toISOString(),
		dateModified: new Date().toISOString(),
	}

	// 添加面包屑导航
	if (breadcrumbItems && breadcrumbItems.length > 0) {
		// 从 pageUrl 或 siteBaseUrl 中提取网站根域名
		const siteDomain = siteBaseUrl || pageUrl.replace(/\/[^\/]*$/, "")

		webPageData.breadcrumb = {
			"@type": "BreadcrumbList",
			itemListElement: breadcrumbItems.map((item, index) => ({
				"@type": "ListItem",
				position: index + 1,
				name: item.label,
				item: buildBreadcrumbUrl(siteDomain, item.href),
			})),
		}
	}

	// 添加主要实体
	if (mainEntity) {
		webPageData.mainEntity = mainEntity
	}

	return webPageData
}

/**
 * 生成列表的 JSON-LD 数据（用于游戏列表、分类列表等）
 */
export function generateItemListJsonLd(
	listName: string,
	listDescription: string,
	items: any[],
): WithContext<ItemList> {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: listName,
		description: listDescription,
		numberOfItems: items.length,
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name || item.gameName,
			url: item.url,
			...(item.image && {
				image: {
					"@type": "ImageObject",
					url: item.image,
					caption: `${item.name || item.gameName} screenshot`,
					width: "1200",
					height: "630",
				},
			}),
		})),
	}
}

/**
 * 将多个 JSON-LD 实体组合成一个 @graph 结构
 * @param entities 要组合的 JSON-LD 实体数组
 * @returns 包含 @graph 的 JSON-LD 对象
 */
export function generateJsonLdGraph(entities: any[]): any {
	// 过滤掉空值并移除每个实体的 @context
	const validEntities = entities.filter(Boolean).map((entity) => {
		// 移除 @context，因为它会在顶层定义
		const { "@context": _, ...entityWithoutContext } = entity
		return entityWithoutContext
	})

	if (validEntities.length === 0) {
		return null
	}

	return {
		"@context": "https://schema.org",
		"@graph": validEntities,
	}
}

/**
 * 生成自定义页面的 JSON-LD 数据
 * @param frontMatter 页面front matter数据
 * @param pageUrl 页面完整URL
 * @param siteSettings 网站设置
 * @returns WebPage结构化数据
 */
export function generateCustomPageJsonLd(
	frontMatter: MdxFrontMatter,
	pageUrl: string,
	siteSettings: SiteSettings,
): WithContext<WebPage> {
	return {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: frontMatter.title || "Page",
		description: frontMatter.description || siteSettings.siteName,
		url: pageUrl,
		inLanguage: siteSettings.supportedLocales || ["en"],
		datePublished: new Date().toISOString(),
		dateModified: new Date().toISOString(),
		isAccessibleForFree: true,
		potentialAction: {
			"@type": "ReadAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: pageUrl,
			},
		},
	}
}
