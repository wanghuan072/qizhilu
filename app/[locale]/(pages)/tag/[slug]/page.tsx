import { Sidebar } from "../../games/components/Sidebar"
import { JsonLd } from "@/lib/components/seo/JsonLd"
import { SidebarProvider } from "@/lib/components/ui/sidebar"
import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import { GameCard } from "@/lib/components/ui/view/GamePage/components/GameCard"
import {
	alternatesCanonical,
	alternatesLanguage,
	defaultLocale,
	getPathnameWithLocale,
	isSupportedLocale,
	locales,
} from "@/lib/i18n/locales"
import { getAllGamesPageData, getGamesByTag } from "@/lib/services/game"
import { getSiteSettings } from "@/lib/services/site"
import { getGameTagBySlug, getGameTags } from "@/lib/services/site"
import {
	BreadcrumbItem,
	GameDataBase,
	GameTemplateType,
	OptimizedGameData,
} from "@/lib/types"
import {
	generateBreadcrumbJsonLd,
	generateCollectionPageJsonLd,
	generateJsonLdGraph,
} from "@/lib/utils/seo/jsonld-generators"
import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

export const dynamic = "force-static"

// 转换标签页面游戏数据为优化格式
function transformToOptimizedGames(games: GameDataBase[]): OptimizedGameData[] {
	return games.map((game) => ({
		id: game.id,
		name: game.name,
		slug: game.slug,
		screenshotUrl: game.screenshotUrl,
		rating: game.gameInfo?.rating,
		isPrimary: game.isPrimary,
	}))
}

type Props = {
	params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
	const tags = await getGameTags(defaultLocale)
	if (tags.length <= 0) {
		const values = locales.map((locale) => ({
			locale,
			slug: "not-found",
		}))
		// console.log("StaticParams => values", values)
		return values
	}

	const values = locales.flatMap((locale) => {
		return tags
			.filter((tag) => tag.slug)
			.map((tag) => ({
				locale,
				slug: tag.slug,
			}))
	})
	// console.log("StaticParams => ", tags, values)
	return values
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, slug } = await params
	if (!isSupportedLocale(locale)) {
		return {}
	}
	setRequestLocale(locale)
	const tagSlug = decodeURIComponent(slug)
	const tag = await getGameTagBySlug(locale, tagSlug)
	const hreflangData = alternatesLanguage(`/tag/${tagSlug}`)
	// 获取 canonical 数据
	const canonical = alternatesCanonical(locale, `/tag/${tagSlug}`)
	return {
		title: tag?.metaTitle || tag?.name,
		description: tag?.metaDescription || tag?.description,
		alternates: {
			languages: hreflangData,
			canonical: canonical,
		},
	}
}

export default async function TagDetailPage({ params }: Props) {
	const { locale, slug } = await params
	if (!isSupportedLocale(locale)) {
		return notFound()
	}

	setRequestLocale(locale)

	const t = await getTranslations("Common")
	const tagT = await getTranslations("TagPage")
	const gameT = await getTranslations("Game")
	const tagSlug = decodeURIComponent(slug)

	try {
		const { games, tagName, tagDescription } = await getGamesByTag(
			locale,
			tagSlug,
		)
		// 转换为优化的游戏数据，减少传递给客户端的数据量
		const gamesWithLocaleContent = transformToOptimizedGames(games)

		// 获取所有游戏页面数据以获取 categories 和 tags
		const allGamesData = await getAllGamesPageData(
			locale,
			undefined,
			undefined,
			`/tag/${tagSlug}`,
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

		// 获取网站设置以检测模板类型
		const siteSettingsData = await getSiteSettings()
		const isGameBox = siteSettingsData.templateType === GameTemplateType.GameBox

		// 获取面包屑数据
		const breadcrumbItems: BreadcrumbItem[] = [
			{ label: t("Home"), href: "/" },
			{ label: t("tags"), href: "", isActive: true },
			{
				label: tagName,
				href: `/tag/${slug}`,
				isActive: true,
			},
		]

		const baseUrl = alternatesCanonical(locale, `/tag/${tagSlug}`)
		// 游戏URL应该基于网站根域名
		const gameSiteUrl = alternatesCanonical(locale, "")

		// 转换广告数据格式
		const adsData = {
			banner: ads.find((ad) => ad.type === "banner"),
			block: ads.find((ad) => ad.type === "block"),
		}

		// 组合所有 JSON-LD 实体到 @graph 结构
		const jsonLdEntities = [
			generateCollectionPageJsonLd(
				tagName,
				tagDescription || `Games tagged with ${tagName}`,
				gamesWithLocaleContent,
				siteSettingsData,
				baseUrl,
				gameSiteUrl,
			),
			generateBreadcrumbJsonLd(breadcrumbItems, baseUrl, gameSiteUrl),
		]
		const jsonLdGraph = generateJsonLdGraph(jsonLdEntities)

		const content = (
			<>
				{/* 组合的 JSON-LD 结构化数据（使用 @graph） */}
				<JsonLd data={jsonLdGraph} />

				<Breadcrumb items={breadcrumbItems} />

				<div className="container mx-auto px-4 py-6">
					<div className="bg-background flex flex-col lg:flex-row">
						{/* 左侧边栏 - 移动端隐藏，桌面端显示，盒子模板下完全隐藏 */}
						{!isGameBox && (
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
								className={`p-4 sm:p-6 lg:p-8 ${isGameBox ? "lg:pt-8" : "lg:pt-16"}`}
							>
								<header className="mb-8 text-center">
									<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
										{tagName}
									</h1>
									{tagDescription && (
										<p className="mt-2 max-w-2xl mx-auto text-base text-muted-foreground">
											{tagDescription}
										</p>
									)}
									<p className="mt-2 text-sm text-muted-foreground">
										{tagT("gamesFound", {
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
											No games found with this tag
										</p>
									</div>
								)}
							</div>
						</main>
					</div>
				</div>
			</>
		)

		// 只在GameBox模板下使用SidebarProvider
		return isGameBox ? <SidebarProvider>{content}</SidebarProvider> : content
	} catch (error) {
		console.error(`Tag page error: ${tagSlug}`, error)
		notFound()
	}
}
