import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import { siteSettings } from "@/lib/config/siteSettings"
import {
	alternatesCanonical,
	alternatesLanguage,
	isSupportedLocale,
	locales,
} from "@/lib/i18n/locales"
import { getAllGamesPageData } from "@/lib/services/game"
import { BreadcrumbItem } from "@/lib/types"
import { JsonLd, generateJsonLdGraph } from "@/lib/utils/seo"
import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { FavoritesContent } from "./components/FavoritesContent"

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
	const hreflangData = alternatesLanguage("/games/favorites")
	const canonical = alternatesCanonical(locale, "/games/favorites")
	return {
		title: `${t("Common.myFavorites")} - ${siteSettings.siteName}`,
		alternates: {
			languages: hreflangData,
			canonical: canonical,
		},
		description: t("Game.favoritesDescription"),
		openGraph: {
			title: `${t("Common.myFavorites")} - ${siteSettings.siteName}`,
			description: t("Game.favoritesDescription"),
			url: canonical,
		},
	}
}

export default async function FavoritesGamesPage({ params }: Props) {
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
		"/games/favorites",
		t,
	)
	const { games, categories, tags, jsonLdData, ads } = allGamesData

	// 面包屑导航
	const breadcrumbItems: BreadcrumbItem[] = [
		{ label: t("Common.Home"), href: "/" },
		{ label: t("Common.Games"), href: "/games" },
		{
			label: t("Common.myFavorites"),
			href: "/games/favorites",
			isActive: true,
		},
	]

	const pageTitle = t("Common.myFavorites")
	const pageDescription = t("Game.favoritesDescription")

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
				<FavoritesContent
					title={pageTitle}
					description={pageDescription}
					allGames={Array.isArray(games.data) ? games.data : []}
					categories={categories?.data || []}
					tags={tags?.data || []}
					ads={ads}
				/>
			</main>
		</>
	)
}
