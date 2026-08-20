/**
 * 结构化数据生成工具
 * 用于生成符合 schema.org 规范的 JSON-LD 结构化数据
 */

import { alternatesCanonical } from "../i18n"
import { ArticlePost, BreadcrumbItem, SiteSettings } from "../types"

/**
 * 生成游戏页面的结构化数据
 * @param game 游戏信息
 * @param url 页面 URL
 * @returns JSON-LD 结构化数据
 */
export function generateGameSchema(game: any, url: string) {
	return {
		"@context": "https://schema.org",
		"@type": "VideoGame",
		name: game.title,
		description: game.description,
		url: url,
		...(game.imageUrl && { image: game.imageUrl }),
		...(game.gameInfo?.developer && {
			author: {
				"@type": "Organization",
				name: game.gameInfo.developer,
			},
		}),
		...(game.gameInfo?.releaseDate && {
			datePublished: game.gameInfo.releaseDate,
		}),
		...(game.rating && {
			aggregateRating: {
				"@type": "AggregateRating",
				ratingValue: game.rating,
				bestRating: "5",
				worstRating: "1",
				ratingCount: game.playCount || 100,
			},
		}),
		...(game.category && { genre: game.category }),
		...(game.gameInfo?.platform && { gamePlatform: game.gameInfo.platform }),
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
			availability: "https://schema.org/InStock",
		},
	}
}

/**
 * 生成博客文章的结构化数据
 * @param post 博客文章信息
 * @param url 页面 URL
 * @param siteName 网站名称
 * @returns JSON-LD 结构化数据
 */
export async function generateBlogPostSchema(
	post: ArticlePost,
	locale: string,
	siteSettings: SiteSettings,
) {
	const canonicalUrl = await alternatesCanonical(locale, post.slug)
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.metadata.description,
		image: post.titleImageUrl,
		url: canonicalUrl,
		datePublished: post.updateTime,
		author: {
			"@type": "Person",
			name: post.author,
			...(post.authorImageUrl && { image: post.titleImageUrl }),
		},
		publisher: {
			"@type": "Organization",
			name: siteSettings.siteName,
			logo: {
				"@type": "ImageObject",
				url: siteSettings.logo,
			},
		},
		...(post.category && {
			articleSection: post.category,
			keywords: post.category,
		}),
	}
}

/**
 * 生成分类页面的结构化数据
 * @param category 分类信息
 * @param url 页面 URL
 * @returns JSON-LD 结构化数据
 */
export function generateCategorySchema(category: any, url: string) {
	return {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: category.name,
		description: category.description,
		url: url,
		...(category.imageUrl && { image: category.imageUrl }),
	}
}

/**
 * 生成面包屑导航的结构化数据
 * @param items 面包屑项目
 * @param canonicalUrl 基础 URL
 * @returns JSON-LD 结构化数据
 */
export function generateBreadcrumbSchema(
	items: BreadcrumbItem[],
	canonicalUrl: string,
) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.label,
			item: item.isActive ? undefined : `${canonicalUrl}`,
		})),
	}
}

/**
 * 生成 FAQ 的结构化数据
 * @param questions 问题和答案数组
 * @returns JSON-LD 结构化数据
 */
export function generateFAQSchema(
	questions: { question: string; answer: string }[],
) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: questions.map((q) => ({
			"@type": "Question",
			name: q.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: q.answer,
			},
		})),
	}
}

/**
 * 合并多个结构化数据
 * @param schemas 结构化数据数组
 * @returns 合并后的结构化数据
 */
export function combineSchemas(...schemas: any[]) {
	return schemas.filter(Boolean)
}
