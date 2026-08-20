import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import { GamePageContainer } from "@/lib/components/ui/view/GamePage"
import { TikTokPixel } from "@/lib/components/analytics"
import { SupportGameContentIds } from "@/lib/consts/games"
import { defaultLocale, isSupportedLocale, locales } from "@/lib/i18n/locales"
import { getAllGames, getGamePageData } from "@/lib/services/game"
import { BreadcrumbItem } from "@/lib/types"
import { processGameContents } from "@/lib/utils/markdownProcessor"
import { JsonLd, generateJsonLdGraph } from "@/lib/utils/seo"
import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { redirect } from "next/navigation"
export const dynamic = "force-static"
type Props = {
	params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
	const games = await getAllGames(defaultLocale)
	if (games.length === 0) {
		return locales.map((locale) => ({
			locale,
			slug: "",
		}))
	}
	return locales.flatMap((locale) => {
		return games.map((game) => ({
			locale,
			slug: game.slug,
		}))
	})
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, slug } = await params
	if (!isSupportedLocale(locale)) {
		return {}
	}
	setRequestLocale(locale)
	const gameSlug = decodeURIComponent(slug)
	const { metadata } = await getGamePageData(gameSlug, locale)

	return metadata
}

export default async function GamePage({ params }: Props) {
	const { locale, slug } = await params
	if (!isSupportedLocale(locale)) {
		redirect(`/${locale}/page-not-found`)
	}
	setRequestLocale(locale)

	// slug中可能包含url编码，需要解码
	const gameSlug = decodeURIComponent(slug)
	const { game, jsonLdData, relatedGames, popularGames, latestGames, ads } =
		await getGamePageData(gameSlug, locale)

	if (!game) {
		console.log(`获取游戏信息失败:${gameSlug}`)
		redirect(`/${locale}/page-not-found`)
	}

	// 预处理游戏内容中的 markdown
	const processedContents = await processGameContents(game.contents)
	const processedGame = { ...game, contents: processedContents }

	const tabs = processedGame.contents
		.filter((it) => SupportGameContentIds.includes(it.tabId))
		.map((it) => ({
			tabId: it.tabId,
			title: it.title,
			icon: it.icon,
		}))

	const t = await getTranslations()

	// 构建面包屑导航
	const breadcrumbItems: BreadcrumbItem[] = [
		{ label: t("Common.Home"), href: "/" },
		{ label: t("Common.Games"), href: "/games" },
		{ label: game.name, href: `/games/${gameSlug}`, isActive: true },
	]

	// 组合所有 JSON-LD 实体到 @graph 结构
	const jsonLdEntities = [
		jsonLdData.webPage,
		jsonLdData.faq,
		jsonLdData.website,
		jsonLdData.organization,
		...(jsonLdData.videos || []), // 视频数据是数组，使用扩展运算符
	]
	const jsonLdGraph = generateJsonLdGraph(jsonLdEntities)

	return (
		<>
			{/* 组合的 JSON-LD 结构化数据（使用 @graph） */}
			<JsonLd data={jsonLdGraph} />

			{/* 游戏详情页专用的 TikTok Pixel 追踪 */}
			<TikTokPixel
				autoTrack={false} // 避免重复追踪，因为布局中已经有全局追踪
				trackEngagement={true}
				pageInfo={{
					pageType: "game_detail",
					pageName: processedGame.gameLocaleName,
					contentId: processedGame.id.toString(),
				}}
			/>

			<Breadcrumb items={breadcrumbItems} />
			<main className="container mx-auto px-4 py-6">
				<GamePageContainer
					game={processedGame}
					ads={ads}
					relatedGames={relatedGames}
					popularGames={popularGames}
					latestGames={latestGames}
					tabs={tabs}
				/>
			</main>
		</>
	)
}
