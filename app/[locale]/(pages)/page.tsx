import { MdxArticle } from "@/lib/components/common/MdxArticle"
import {
	Breadcrumb,
	MobileBreadcrumb,
} from "@/lib/components/ui/view/Breadcrumb"
import { GamePageContainer } from "@/lib/components/ui/view/GamePage"
import GameboxHomePage from "@/lib/components/ui/view/GameboxHomePage"
import { SupportGameContentIds } from "@/lib/consts/games"
import {
	alternatesCanonical,
	isSupportedLocale,
	locales,
} from "@/lib/i18n/locales"
import { getHomeMdx } from "@/lib/services/custom-pages"
import {
	getAllGames,
	getAllGamesPageData,
	getGamePageData,
} from "@/lib/services/game"
import { getSiteSettings } from "@/lib/services/site"
import { BreadcrumbItem } from "@/lib/types"
import { processGameContents } from "@/lib/utils/markdownProcessor"
import {
	JsonLd,
	generateCustomPageJsonLd,
	generateCustomPageMetadata,
	generateGameMetadata,
	generateJsonLdGraph,
	generateSoftwareApplicationJsonLd,
	generateWebSiteJsonLd,
} from "@/lib/utils/seo"
import { isGameBoxTemplate } from "@/lib/utils/site-utils"
import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

export const dynamic = "force-static"

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
	return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	if (!isSupportedLocale(locale)) {
		return {}
	}
	setRequestLocale(locale)

	// 检查是否有自定义首页
	const customHomePage = await getHomeMdx(locale)
	if (customHomePage && customHomePage.frontMatter) {
		// 使用自定义首页的 front matter 作为元数据，包含hreflang和canonical
		return await generateCustomPageMetadata(
			customHomePage.frontMatter,
			locale,
			"/",
		)
	}

	// 否则使用原有的游戏页面元数据逻辑
	// 指定gameSlug为/，表示首页首页，如果是盒子模板，则gameSlug无意义
	return await generateGameMetadata(locale, "/", true)
}

export default async function HomePage({ params }: Props) {
	const { locale } = await params
	if (!isSupportedLocale(locale)) {
		return notFound()
	}

	setRequestLocale(locale)

	// 检查是否有自定义首页
	const customHomePage = await getHomeMdx(locale)
	if (customHomePage) {
		const siteConfig = await getSiteSettings()
		const baseUrl = alternatesCanonical(locale, "/")

		// 生成自定义首页的 JSON-LD 结构化数据
		const customPageJsonLd = generateCustomPageJsonLd(
			customHomePage.frontMatter,
			baseUrl,
			siteConfig,
		)

		// 结合网站信息和自定义页面信息的 JSON-LD
		const jsonLdEntities = [
			generateWebSiteJsonLd(siteConfig, baseUrl, false),
			customPageJsonLd,
		]
		const jsonLdGraph = generateJsonLdGraph(jsonLdEntities)

		return (
			<>
				{/* 自定义首页的 JSON-LD 结构化数据 */}
				<JsonLd data={jsonLdGraph} />

				<main className="container mx-auto px-4 py-8">
					<MdxArticle mdxData={customHomePage} />
				</main>
			</>
		)
	}

	// 使用原有的游戏首页逻辑
	const siteConfig = await getSiteSettings()

	// 为GameBox模板类型添加SEO结构化数据
	if (isGameBoxTemplate(siteConfig)) {
		// 获取翻译函数
		const t = await getTranslations("Common")
		const gameT = await getTranslations("Game")

		// 获取 baseUrl 数据
		const baseUrl = alternatesCanonical(locale, "/")

		// 获取游戏总数（用于平台描述）
		const allGames = await getAllGames(locale)
		const totalGames = allGames?.length || 0
		const metadata = await generateGameMetadata(locale, "/", true)

		// 获取首页所需的游戏数据
		const gamePageData = await getAllGamesPageData(
			locale,
			undefined,
			undefined,
			"/",
			(key: string) => {
				if (key.startsWith("Common.")) {
					return t(key.replace("Common.", ""))
				}
				if (key.startsWith("Game.")) {
					return gameT(key.replace("Game.", ""))
				}
				return key
			},
		)

		// 提取并精简数据，只传递组件需要的字段
		const simplifiedGames = Array.isArray(gamePageData.games.data)
			? gamePageData.games.data
					.filter((game: any) => !("codeText" in game && "type" in game))
					.map((game: any) => ({
						slug: game.slug,
						name: game.name,
						screenshotUrl: game.screenshotUrl,
						rating: game.gameInfo?.rating,
						categories:
							game.categories?.map((cat: any) => ({
								code: cat.code,
								slug: cat.slug,
							})) || [],
						updateTime: game.updateTime,
						recommendToHome: game.recommendToHome,
					}))
			: []

		const simplifiedCategories = gamePageData.categories?.data
			? gamePageData.categories.data.map((category) => ({
					code: category.code,
					name: category.name,
					slug: category.slug,
				}))
			: []

		// 生成所有 JSON-LD 实体
		const jsonLdEntities = [
			generateWebSiteJsonLd(siteConfig, baseUrl, true),
			generateSoftwareApplicationJsonLd(
				null, // 平台级别不需要具体游戏数据
				siteConfig.siteName,
				metadata.description || "",
				undefined,
				undefined,
				siteConfig,
				baseUrl,
				true, // isPlatform = true
				totalGames,
			),
		]

		// 使用 @graph 结构组合所有实体
		const jsonLdGraph = generateJsonLdGraph(jsonLdEntities)

		return (
			<>
				{/* 组合的 JSON-LD 结构化数据（使用 @graph） */}
				<JsonLd data={jsonLdGraph} />

				<GameboxHomePage
					games={simplifiedGames}
					categories={simplifiedCategories}
					ads={siteConfig.adsSettings || []}
				/>
			</>
		)
	}

	// 对于单游戏模板，使用新的 GamePageData 服务
	const t = await getTranslations()
	const { game, jsonLdData, relatedGames, popularGames, latestGames, ads } =
		await getGamePageData("/", locale)

	// 预处理游戏内容中的 markdown
	const processedContents = await processGameContents(game.contents)
	const processedGame = { ...game, contents: processedContents }

	// 构建面包屑导航（视图层负责）
	const breadcrumbItems: BreadcrumbItem[] = [
		{ label: t("Common.Home"), href: "/" },
		{ label: game.name, href: "/", isActive: true },
	]

	const tabs = processedGame.contents
		.filter((it) => SupportGameContentIds.includes(it.tabId))
		.map((it) => ({
			tabId: it.tabId,
			title: it.title,
			icon: it.icon,
		}))
	// 组合所有 JSON-LD 实体到 @graph 结构
	const jsonLdEntities = [
		jsonLdData.webPage,
		jsonLdData.faq,
		jsonLdData.videos,
		jsonLdData.website,
	]
	const jsonLdGraph = generateJsonLdGraph(jsonLdEntities)

	return (
		<>
			<JsonLd data={jsonLdGraph} />
			<Breadcrumb items={breadcrumbItems} />
			<main className="container mx-auto px-4 py-6">
				<GamePageContainer
					game={processedGame}
					relatedGames={relatedGames}
					popularGames={popularGames}
					latestGames={latestGames}
					ads={ads}
					tabs={tabs}
				/>
			</main>
			<MobileBreadcrumb items={breadcrumbItems} />
		</>
	)
}
