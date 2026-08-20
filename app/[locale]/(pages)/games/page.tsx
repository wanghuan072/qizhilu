import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import { siteSettings } from "@/lib/config/siteSettings"
import {
	alternatesCanonical,
	alternatesLanguage,
	isSupportedLocale,
	locales,
} from "@/lib/i18n/locales"
import { getAllGamesPageData } from "@/lib/services/game"
import { BreadcrumbItem, OptimizedGameData } from "@/lib/types"
import { JsonLd, generateJsonLdGraph } from "@/lib/utils/seo"
import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { AllGamesContent } from "./components/AllGamesContent"

export const dynamic = "force-static"

// 在服务端转换为优化的游戏数据
function transformToOptimizedGames(games: any[]): OptimizedGameData[] {
	return games
		.filter((game) => !("codeText" in game && "type" in game)) // 过滤掉广告
		.map((game) => ({
			id: game.id,
			name: game.name,
			slug: game.slug,
			screenshotUrl: game.screenshotUrl,
			rating: game.gameInfo?.rating,
			description: game.gameLocaleDescription,
			isPrimary: game.isPrimary || false,
			categories:
				game.categories?.map((cat: any) => ({
					slug: cat.slug,
					name: cat.name,
				})) || [],
			tags:
				game.tags?.map((tag: any) => ({
					slug: tag.slug,
					name: tag.name,
				})) || [],
		}))
}

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
	const hreflangData = alternatesLanguage("/games")
	// 获取 canonical 数据
	const canonical = alternatesCanonical(locale, "/games")
	return {
		title: `${t("AllGames.title")} - ${siteSettings.siteName}`,
		alternates: {
			languages: hreflangData,
			canonical: canonical,
		},
		description: t("AllGames.description"),
		openGraph: {
			title: `${t("AllGames.title")} - ${siteSettings.siteName}`,
			description: t("AllGames.description"),
			url: canonical,
		},
	}
}

export default async function GamesPage({ params }: Props) {
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
		"/games",
		t,
	)
	const { games, categories, tags, jsonLdData, ads } = allGamesData
	// 转换为优化的游戏数据，减少传递给客户端的数据量
	const optimizedGames = transformToOptimizedGames(
		Array.isArray(games.data) ? games.data : [],
	)

	// 面包屑导航
	const breadcrumbItems: BreadcrumbItem[] = [
		{ label: t("Common.Home"), href: "/" },
		{ label: t("Common.Games"), href: "/games", isActive: true },
	]

	// 构建页面标题和描述
	const pageTitle = t("AllGames.title")
	const pageDescription = t("AllGames.description")

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
					games={optimizedGames as any}
					categories={categories?.data || []}
					tags={tags?.data || []}
					ads={ads}
				/>
			</main>
		</>
	)
}
