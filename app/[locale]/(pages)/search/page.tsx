import { SidebarProvider } from "@/lib/components/ui/sidebar"
import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import { siteSettings } from "@/lib/config/siteSettings"
import { locales as apiLocales } from "@/lib/i18n/locales"
import { getSearchGamePageData } from "@/lib/services/game"
import {
	BreadcrumbItem,
	GameTemplateType,
	OptimizedSearchGameData,
	OptimizedSearchGamePageData,
} from "@/lib/types"
import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Suspense } from "react"
import { SearchTitle } from "./components/SearchTitle"
import { SearchView } from "./components/SearchView"

export const dynamic = "force-static"

const RESULTS_PER_PAGE = 20

// 转换搜索页面游戏数据为优化格式
function transformToOptimizedSearchGames(
	games: any[],
): OptimizedSearchGameData[] {
	return games.map((game) => ({
		id: game.id,
		name: game.name,
		gameLocaleName: game.gameLocaleName,
		slug: game.slug,
		screenshotUrl: game.screenshotUrl,
		rating: game.gameInfo?.rating,
	}))
}

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
	return apiLocales.map((locale) => ({
		locale,
	}))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations()

	const title = `${t("Search.title")} - ${siteSettings.siteName}`

	return {
		title,
		description: t("Search.description"),
		openGraph: {
			title,
			description: t("Search.description"),
		},
		robots: {
			index: false,
			follow: false,
		},
	}
}

export default async function SearchPage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations()

	const isGameBox = siteSettings.templateType === GameTemplateType.GameBox

	// 获取搜索页面数据
	const searchPageData = await getSearchGamePageData(locale)

	// 转换为优化的数据结构，减少传递给客户端的数据量
	const optimizedSearchPageData: OptimizedSearchGamePageData = {
		games: {
			locale: searchPageData.games.locale,
			data: transformToOptimizedSearchGames(searchPageData.games.data),
		},
		categories: searchPageData.categories,
		tags: searchPageData.tags,
	}

	// 面包屑导航
	const breadcrumbItems: BreadcrumbItem[] = [
		{ label: t("Common.Home"), href: "/" },
		{ label: t("Game.allGames"), href: "/games" },
		{ label: t("Search.title"), href: "/search", isActive: true },
	]

	const content = (
		<div className="container mx-auto px-4 py-8">
			<Breadcrumb items={breadcrumbItems} />

			<Suspense
				fallback={
					<div className="text-center py-12">
						<p className="text-muted-foreground">{t("Common.loading")}</p>
					</div>
				}
			>
				<SearchTitle />

				<SearchView
					searchPageData={optimizedSearchPageData}
					resultsPerPage={RESULTS_PER_PAGE}
				/>
			</Suspense>
		</div>
	)

	// 只在GameBox模板下使用SidebarProvider
	return isGameBox ? <SidebarProvider>{content}</SidebarProvider> : content
}
