import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import { siteSettings } from "@/lib/config/siteSettings"
import {
	alternatesCanonical,
	alternatesLanguage,
	isSupportedLocale,
	locales,
} from "@/lib/i18n/locales"
import { getAllGamesPageData } from "@/lib/services/game"
import {
	AllGameDataBase,
	BreadcrumbItem,
	GameAd,
	GameDataBase,
	OptimizedGameData,
} from "@/lib/types"
import { JsonLd, generateJsonLdGraph } from "@/lib/utils/seo"
import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { AllGamesContent } from "../components/AllGamesContent"

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
	const t = await getTranslations()
	const hreflangData = alternatesLanguage("/games/new-game")
	const canonical = alternatesCanonical(locale, "/games/new-game")
	return {
		title: `${t("Game.latestGamesTitle")} - ${siteSettings.siteName}`,
		alternates: {
			languages: hreflangData,
			canonical: canonical,
		},
		description: t("Game.latestGamesDescription"),
		openGraph: {
			title: `${t("Game.latestGamesTitle")} - ${siteSettings.siteName}`,
			description: t("Game.latestGamesDescription"),
			url: canonical,
		},
	}
}

export default async function NewGamesPage({ params }: Props) {
	const { locale } = await params

	if (!isSupportedLocale(locale)) {
		return notFound()
	}

	setRequestLocale(locale)
	const t = await getTranslations()

	// 获取所有游戏页面数据
	const allGamesData = await getAllGamesPageData(
		locale,
		undefined,
		undefined,
		"/games/new-game",
		t,
	)
	const { games, categories, tags, jsonLdData, ads } = allGamesData

	// 选择最新游戏（按更新时间排序，选择30%的游戏数量）
	// 使用类型守卫过滤出AllGameDataBase类型的游戏，排除GameAd类型
	const totalGames = Array.isArray(games.data)
		? games.data.filter((game: any) => !("codeText" in game && "type" in game))
		: []
	const newGamesCount = Math.floor(totalGames.length * 0.3)

	// 按创建时间排序选择最新的游戏
	const sortedGames = [...totalGames].sort((a, b) => {
		// 优先使用 updateTime 字段排序
		if (
			"updateTime" in a &&
			"updateTime" in b &&
			a.updateTime &&
			b.updateTime
		) {
			const dateA = new Date(a.updateTime as string | number | Date)
			const dateB = new Date(b.updateTime as string | number | Date)
			return dateB.getTime() - dateA.getTime()
		}
		// 如果没有 updateTime，尝试使用 createTime
		if (
			"createTime" in a &&
			"createTime" in b &&
			a.createTime &&
			b.createTime
		) {
			const dateA = new Date(a.createTime as string | number | Date)
			const dateB = new Date(b.createTime as string | number | Date)
			return dateB.getTime() - dateA.getTime()
		}
		return 0
	})

	const newGames = sortedGames.slice(0, newGamesCount)

	// 面包屑导航
	const breadcrumbItems: BreadcrumbItem[] = [
		{ label: t("Common.Home"), href: "/" },
		{ label: t("Common.Games"), href: "/games" },
		{
			label: t("Game.latestGamesTitle"),
			href: "/games/new-game",
			isActive: true,
		},
	]

	const pageTitle = t("Game.latestGamesTitle")
	const pageDescription = t("Game.latestGamesDescription")

	// 组合所有 JSON-LD 实体到 @graph 结构
	const jsonLdEntities = [jsonLdData.webPage, jsonLdData.organization]
	const jsonLdGraph = generateJsonLdGraph(jsonLdEntities)

	return (
		<>
			{/* 组合的 JSON-LD 结构化数据（使用 @graph） */}
			<JsonLd data={jsonLdGraph} />

			{/* 面包屑导航 */}
			<Breadcrumb items={breadcrumbItems} />
			<main className="container mx-auto px-4 py-6">
				<AllGamesContent
					title={pageTitle}
					description={pageDescription}
					games={newGames}
					categories={categories?.data || []}
					tags={tags?.data || []}
					ads={ads}
				/>
			</main>
		</>
	)
}
