export const dynamic = "force-static"
import { defaultLocale, locales } from "@/lib/i18n/locales"
import { getArticlesByLocale } from "@/lib/repositories/article"
import { getGameCategoriesByLocale } from "@/lib/repositories/category"
import { getGameTagsByLocale } from "@/lib/repositories/tag"
import { getCustomPageSlugs } from "@/lib/services/custom-pages"
import { getAllGames } from "@/lib/services/game"
import { getGameSlug } from "@/lib/utils/navigation"

// 定义页面信息类型
type PageInfo = {
	path: string
	changeFrequency:
		| "always"
		| "hourly"
		| "daily"
		| "weekly"
		| "monthly"
		| "yearly"
		| "never"
	priority: number
}

/**
 * 生成带有XSL样式的 sitemap.xml
 * 包含所有页面的 URL，包括不同语言版本
 * 使用 XSL 样式表在浏览器中显示为美观的 HTML 页面
 */
export async function GET() {
	const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || ""

	// 获取所有游戏、分类、标签、文章、自定义页面
	const [gamesData, categories, tags, articles, customPageSlugs] =
		await Promise.all([
			getAllGames(defaultLocale),
			getGameCategoriesByLocale(defaultLocale),
			getGameTagsByLocale(defaultLocale),
			getArticlesByLocale(defaultLocale),
			getCustomPageSlugs(),
		])

	const games = gamesData

	// 定义页面信息
	const pageInfos: PageInfo[] = [
		// 首页
		{ path: "", changeFrequency: "daily", priority: 1.0 },
	]

	// 如果有文章，添加博客页面和分页
	if (articles && articles.length > 0) {
		// 博客主页
		pageInfos.push({
			path: "/blogs",
			changeFrequency: "daily",
			priority: 0.9,
		})

		// 添加博客分页
		const postsPerPage = 20
		const totalPages = Math.ceil(articles.length / postsPerPage)

		for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
			pageInfos.push({
				path: `/blogs/${pageNum}`,
				changeFrequency: "daily",
				priority: 0.7,
			})
		}
	}

	// 添加游戏页面
	if (games && games.length > 0) {
		pageInfos.push({
			path: "/games",
			changeFrequency: "daily",
			priority: 0.9,
		})
	}
	for (const game of games) {
		if (game.slug === "/" || game.isPrimary) {
			continue
		}
		pageInfos.push({
			path: `${getGameSlug(game.slug)}`,
			changeFrequency: "weekly",
			priority: 0.8,
		})
	}

	// 添加分类页面
	for (const category of categories) {
		// 主分类页面
		pageInfos.push({
			path: `/c/${category.slug}`,
			changeFrequency: "weekly",
			priority: 0.7,
		})
	}
	// 添加标签页面
	for (const tag of tags) {
		// 主标签页面
		pageInfos.push({
			path: `/tag/${tag.slug}`,
			changeFrequency: "weekly",
			priority: 0.7,
		})
	}

	// 添加博客文章页面
	if (articles && articles.length > 0) {
		for (const article of articles) {
			pageInfos.push({
				path: `/t/${article.slug}`,
				changeFrequency: "monthly",
				priority: 0.6,
			})
		}
	}

	// 添加自定义页面
	if (customPageSlugs && customPageSlugs.length > 0) {
		for (const slug of customPageSlugs) {
			pageInfos.push({
				path: `/${slug}`,
				changeFrequency: "monthly",
				priority: 0.6,
			})
		}
	}

	// 生成XML内容
	let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${baseUrl}/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`

	// 为每个页面创建XML条目，包含多语言 alternates
	for (const pageInfo of pageInfos) {
		// 生成多语言 alternates 对象
		const alternateLinks: string[] = []

		for (const locale of locales) {
			if (locale !== defaultLocale) {
				const localizedPath = `/${locale}${pageInfo.path}`
				alternateLinks.push(
					`		<xhtml:link rel="alternate" hreflang="${locale}" href="${baseUrl}${localizedPath}" />`,
				)
			}
		}

		// 创建条目
		xml += `	<url>
		<loc>${baseUrl}${pageInfo.path}</loc>
		<lastmod>${new Date().toISOString()}</lastmod>
		<changefreq>${pageInfo.changeFrequency}</changefreq>
		<priority>${pageInfo.priority}</priority>
${alternateLinks.join("\n")}
	</url>
`
	}

	xml += `</urlset>`

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
		},
	})
}
