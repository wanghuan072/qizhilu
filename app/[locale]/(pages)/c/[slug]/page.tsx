import { Sidebar } from "../../games/components/Sidebar"
import { JsonLd } from "@/lib/components/seo/JsonLd"
import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import { GameCard } from "@/lib/components/ui/view/GamePage/components/GameCard"
import { siteSettings } from "@/lib/config/siteSettings"
import {
	alternatesCanonical,
	alternatesLanguage,
	defaultLocale,
	isSupportedLocale,
	locales,
} from "@/lib/i18n/locales"
import { getAllGamesPageData, getGamesByCategory } from "@/lib/services/game"
import {
	getGameCategories,
	getGameCategoryBySlug,
	getSiteSettings,
} from "@/lib/services/site"
import { BreadcrumbItem, GameDataBase, OptimizedGameData } from "@/lib/types"
import {
	generateBreadcrumbJsonLd,
	generateCollectionPageJsonLd,
	generateJsonLdGraph,
} from "@/lib/utils/seo/jsonld-generators"
import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

export const dynamic = "force-static"

// 转换分类页面游戏数据为优化格式
function transformToOptimizedGames(games: GameDataBase[]): OptimizedGameData[] {
	return games.map((game) => ({
		id: game.id,
		name: game.name,
		slug: game.slug,
		screenshotUrl: game.screenshotUrl,
		rating: game.gameInfo?.rating,
		description: game.metadataInfo?.description,
		isPrimary: game.isPrimary,
	}))
}

type Props = {
	params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
	const categories = await getGameCategories(defaultLocale)
	if (categories.length === 0) {
		return locales.map((locale) => ({
			locale,
			slug: "not-found",
		}))
	}
	return locales.flatMap((locale) => {
		return categories
			.filter((category) => category.slug)
			.map((category) => ({
				locale,
				slug: category.slug,
			}))
	})
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, slug } = await params
	if (!isSupportedLocale(locale)) {
		return {}
	}
	setRequestLocale(locale)
	const categorySlug = decodeURIComponent(slug)
	const category = await getGameCategoryBySlug(locale, categorySlug)
	const hreflangData = alternatesLanguage(`/c/${categorySlug}`)
	// 获取 canonical 数据
	const canonical = alternatesCanonical(locale, `/c/${categorySlug}`)
	return {
		title: category?.metadata?.title || category?.name,
		description: category?.metadata?.description,
		alternates: {
			languages: hreflangData,
			canonical: canonical,
		},
	}
}

export default async function CategoryPage({ params }: Props) {
	const { locale, slug } = await params
	if (!isSupportedLocale(locale)) {
		return notFound()
	}

	setRequestLocale(locale)

	const t = await getTranslations("Common")
	const categoryT = await getTranslations("CategoryPage")
	const gameT = await getTranslations("Game")
	const categorySlug = decodeURIComponent(slug)

	try {
		const { games, categoryName, categoryDescription } =
			await getGamesByCategory(locale, categorySlug)
		// 转换为优化的游戏数据，减少传递给客户端的数据量
		const gamesWithLocaleContent = transformToOptimizedGames(games)

		// 获取所有游戏页面数据以获取 categories 和 tags
		const allGamesData = await getAllGamesPageData(
			locale,
			undefined,
			undefined,
			`/c/${categorySlug}`,
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
		const { categories, tags, ads } = allGamesData

		const breadcrumbItems: BreadcrumbItem[] = [
			{ label: t("Home"), href: "/" },
			{ label: t("Category"), href: "", isActive: true },
			{
				label: categoryName,
				href: `/c/${slug}`,
				isActive: true,
			},
		]

		const siteSettingsData = await getSiteSettings()
		const baseUrl = alternatesCanonical(locale, `/c/${categorySlug}`)
		// 游戏URL应该基于网站根域名
		const gameSiteUrl = alternatesCanonical(locale, "")
		const isBoxTemplate = siteSettings.templateType === "game-box"

		// 转换广告数据格式
		const adsData = {
			banner: ads.find((ad) => ad.type === "banner"),
			block: ads.find((ad) => ad.type === "block"),
		}

		// 组合所有 JSON-LD 实体到 @graph 结构
		const jsonLdEntities = [
			generateCollectionPageJsonLd(
				categoryName,
				categoryDescription || `${categoryName} games collection`,
				gamesWithLocaleContent,
				siteSettingsData,
				baseUrl,
				gameSiteUrl,
			),
			generateBreadcrumbJsonLd(breadcrumbItems, baseUrl, gameSiteUrl),
		]
		const jsonLdGraph = generateJsonLdGraph(jsonLdEntities)

		return (
			<>
				{/* 组合的 JSON-LD 结构化数据（使用 @graph） */}
				<JsonLd data={jsonLdGraph} />

				<Breadcrumb items={breadcrumbItems} />

				<div className="container mx-auto px-4 py-6">
					<div className="bg-background flex flex-col lg:flex-row">
						{/* 左侧边栏 - 移动端隐藏，桌面端显示，盒子模板下完全隐藏 */}
						{!isBoxTemplate && (
							<div className="hidden lg:block">
								<Sidebar
									ads={adsData}
									categories={categories?.data || []}
									tags={tags?.data || []}
								/>
							</div>
						)}

						{/* 主内容区 */}
						<main className="flex-1 bg-background relative min-h-screen">
							<div
								className={`p-4 sm:p-6 lg:p-8 ${isBoxTemplate ? "lg:pt-8" : "lg:pt-16"}`}
							>
								<header className="mb-8 text-center">
									<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
										{categoryName}
									</h1>
									{categoryDescription && (
										<p className="mt-2 max-w-2xl mx-auto text-base text-muted-foreground">
											{categoryDescription}
										</p>
									)}
									<p className="mt-2 text-sm text-muted-foreground">
										{categoryT("gamesFound", {
											count: gamesWithLocaleContent.length,
										})}
									</p>
								</header>

								{/* 游戏网格 */}
								{gamesWithLocaleContent.length > 0 ? (
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
										{gamesWithLocaleContent.map((game) => (
											<div key={game.id} className="w-full">
												<GameCard
													name={game.name}
													slug={game.slug}
													image={game.screenshotUrl}
													rating={game.rating}
												/>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12 bg-muted rounded-lg">
										<p className="text-muted-foreground text-lg">
											No games found in this category
										</p>
									</div>
								)}
							</div>
						</main>
					</div>
				</div>
			</>
		)
	} catch (error) {
		console.error(`Category page error: ${categorySlug}`, error)
		notFound()
	}
}
