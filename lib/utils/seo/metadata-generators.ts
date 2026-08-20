import { alternatesCanonical } from "@/lib/i18n/locales"
import { SiteService } from "@/lib/services"

import { getGameBySlug, getProjectGameMetadata } from "@/lib/repositories/game"
import type { MdxFrontMatter } from "@/lib/services/custom-pages"
import { getSiteMetadata, getSiteSettings } from "@/lib/services/site"
import type {
	ArticlePost,
	GameCategory,
	GameTag,
	SiteSettings,
} from "@/lib/types"
import { buildIconsMetadata } from "@/lib/utils"
import { getGameSlug } from "@/lib/utils/navigation"
import { isGameBoxTemplate } from "@/lib/utils/site-utils"
import { alternatesLanguage } from "@lib/i18n"
import type { Metadata } from "next"

/**
 * 生成游戏页面的 Metadata
 * @param locale 语言
 * @param game 游戏数据
 * @param gameSlug 游戏slug
 * @returns 游戏页面的元数据
 */
export async function generateGameMetadata(
	locale: string,
	gameSlug: string,
	homePage = false,
): Promise<Metadata> {
	const path = getGameSlug(gameSlug)
	const siteConfig = await getSiteSettings()

	// 如果是首頁且模板是盒子游戏，则使用首页全局配置，否则使用游戏作为元数据
	const metadataInfo =
		isGameBoxTemplate(siteConfig) && homePage
			? await getSiteMetadata(locale)
			: await getProjectGameMetadata(locale, gameSlug)

	// 获取 hreflang 数据
	const hreflangData = alternatesLanguage(path)
	// 获取 canonical 数据
	const canonical = alternatesCanonical(locale, path)

	if (!metadataInfo) {
		console.warn("当前游戏渲染时没有找到元数据")
		return { title: "MetadataInfo Not Found" }
	}
	let image = ""
	if (isGameBoxTemplate(siteConfig)) {
		image = siteConfig.logo || ""
	} else {
		const game = await getGameBySlug(gameSlug, locale)
		image = game?.screenshotUrl || ""
	}

	// 构建游戏元数据
	return {
		title: metadataInfo.title,
		description: metadataInfo.description,
		alternates: {
			languages: hreflangData,
			canonical: canonical,
		},
		openGraph: {
			title: metadataInfo.ogTitle || metadataInfo.title,
			description: metadataInfo.ogDescription || metadataInfo.description,
			images: metadataInfo.ogImage
				? [{ url: metadataInfo.ogImage }]
				: image
					? [{ url: image }]
					: undefined,
			url: canonical,
			type: "website",
			siteName: siteConfig.siteName,
			locale: locale.replace("-", "_"),
		},
		twitter: {
			card: "summary_large_image",
			site: siteConfig.socialLinks?.twitter
				? `@${siteConfig.socialLinks.twitter.replace("@", "")}`
				: undefined,
			title: metadataInfo.title,
			description: metadataInfo.description,
			images: metadataInfo.twitterImage
				? [metadataInfo.twitterImage]
				: image
					? [image]
					: undefined,
		},
	}
}

/**
 * 生成博客文章的 Metadata
 */
export async function generateBlogMetadata(
	post: ArticlePost,
	locale: string,
	siteSettings: SiteSettings,
): Promise<Metadata> {
	const canonical = alternatesCanonical(locale, `/t/${post.slug}`)
	const hreflangData = alternatesLanguage(`/t/${post.slug}`)

	return {
		title: post.title,
		description: post.metadata?.description || post.title,
		alternates: {
			languages: hreflangData,
			canonical,
		},
		openGraph: {
			title: post.metadata?.ogTitle || post.title,
			description:
				post.metadata?.ogDescription ||
				post.metadata?.description ||
				post.title,
			url: canonical,
			type: "article",
			siteName: siteSettings.siteName,
			images: post.titleImageUrl
				? [
						{
							url: post.titleImageUrl,
							width: 1200,
							height: 630,
							alt: post.title,
						},
					]
				: undefined,
			locale: locale === "zh-TW" ? "zh_TW" : locale === "zh" ? "zh_CN" : locale,
			publishedTime: post.updateTime,
			authors: post.author ? [post.author] : undefined,
			tags: post.category?.name ? [post.category.name] : undefined,
		},
		twitter: {
			card: "summary_large_image",
			site: siteSettings.socialLinks?.twitter
				? `@${siteSettings.socialLinks.twitter.replace("@", "")}`
				: undefined,
			title: post.title,
			description: post.metadata?.description || post.title,
			images: post.titleImageUrl ? [post.titleImageUrl] : undefined,
		},
	}
}

/**
 * 生成分类页面的 Metadata
 */
export async function generateCategoryMetadata(
	category: GameCategory,
	locale: string,
): Promise<Metadata> {
	const siteSettings = await getSiteSettings()
	const canonical = alternatesCanonical(locale, `/c/${category.slug}`)
	const hreflangData = alternatesLanguage(`/c/${category.slug}`)

	const title = category.metadata?.title || `${category.name}游戏`
	const description =
		category.metadata?.description || `浏览所有${category.name}类型的游戏`

	return {
		title,
		description,
		alternates: {
			languages: hreflangData,
			canonical,
		},
		openGraph: {
			title,
			description,
			url: canonical,
			type: "website",
			siteName: siteSettings.siteName,
			locale: locale === "zh-TW" ? "zh_TW" : locale === "zh" ? "zh_CN" : locale,
		},
		twitter: {
			card: "summary_large_image",
			site: siteSettings.socialLinks?.twitter
				? `@${siteSettings.socialLinks.twitter.replace("@", "")}`
				: undefined,
			title,
			description,
		},
	}
}

/**
 * 生成标签页面的 Metadata
 */
export async function generateTagMetadata(
	tag: GameTag,
	locale: string,
): Promise<Metadata> {
	const siteSettings = await getSiteSettings()
	const canonical = alternatesCanonical(locale, `/tag/${tag.slug}`)
	const hreflangData = alternatesLanguage(`/tag/${tag.slug}`)

	const title = tag.metaTitle || `${tag.name}游戏`
	const description = tag.metaDescription || `浏览所有标记为${tag.name}的游戏`

	return {
		title,
		description,
		alternates: {
			languages: hreflangData,
			canonical,
		},
		openGraph: {
			title,
			description,
			url: canonical,
			type: "website",
			siteName: siteSettings.siteName,
			images: tag.imageUrl
				? [
						{
							url: tag.imageUrl,
							width: 1200,
							height: 630,
							alt: tag.name,
						},
					]
				: undefined,
			locale: locale === "zh-TW" ? "zh_TW" : locale === "zh" ? "zh_CN" : locale,
		},
		twitter: {
			card: "summary_large_image",
			site: siteSettings.socialLinks?.twitter
				? `@${siteSettings.socialLinks.twitter.replace("@", "")}`
				: undefined,
			title,
			description,
			images: tag.imageUrl ? [tag.imageUrl] : undefined,
		},
	}
}

/**
 * 生成页面 metadata（用于 Next.js generateMetadata）
 * @param locale 语言代码
 * @returns Next.js Metadata 对象
 */
export async function generateLayoutMetadata(
	locale: string,
): Promise<Metadata> {
	try {
		const siteSettings = await getSiteSettings()
		const {
			siteName: name,
			icons,
			metadata,
		} = await SiteService.getSiteLayoutData(locale)
		// 如果模板是盒子游戏，则需要检查网站名称、网站标题、网站描述是否存在，避免兜底的元数据为空
		if (isGameBoxTemplate(siteSettings)) {
			if (!name) {
				throw new Error("盒子游戏模板请在网站设置中添加网站名称")
			}
			if (!metadata?.title) {
				throw new Error("盒子游戏模板请在网站设置中添加网站标题")
			}
			if (!metadata?.description) {
				throw new Error("盒子游戏模板请在网站设置中添加网站描述")
			}
		}

		return {
			title: metadata.title ?? name,
			description: metadata.description ?? name,
			alternates: {
				languages: alternatesLanguage(""),
			},
			icons: buildIconsMetadata(icons),
		}
	} catch (error) {
		console.error(`生成页面 metadata 失败, locale: ${locale}`, error)
		throw error
	}
}

/**
 * 生成自定义页面的 Metadata
 * @param frontMatter 页面front matter数据
 * @param locale 语言
 * @param path 页面路径（用于生成hreflang和canonical）
 * @returns 页面的元数据
 */
export async function generateCustomPageMetadata(
	frontMatter: MdxFrontMatter,
	locale: string,
	path = "/",
): Promise<Metadata> {
	const siteConfig = await getSiteSettings()

	// 获取 hreflang 数据
	const hreflangData = alternatesLanguage(path)
	// 获取 canonical 数据
	const canonical = alternatesCanonical(locale, path)

	const title = frontMatter.title || "Page"
	const description = frontMatter.description || siteConfig.siteName

	return {
		title,
		description,
		alternates: {
			languages: hreflangData,
			canonical,
		},
		openGraph: {
			title,
			description,
			url: canonical,
			type: "website",
			siteName: siteConfig.siteName,
			images: siteConfig.logo ? [{ url: siteConfig.logo }] : undefined,
			locale: locale === "zh-TW" ? "zh_TW" : locale === "zh" ? "zh_CN" : locale,
		},
		twitter: {
			card: "summary_large_image",
			site: siteConfig.socialLinks?.twitter
				? `@${siteConfig.socialLinks.twitter.replace("@", "")}`
				: undefined,
			title,
			description,
			images: siteConfig.logo ? [siteConfig.logo] : undefined,
		},
	}
}
