import {
	GoogleAnalytics,
	MicrosoftClarity,
	TikTokPixel,
} from "@/lib/components/analytics"
import { GameBoxLayout } from "@/lib/components/layout/GameBoxLayout"
import { DynamicFooter } from "@/lib/components/ui/view/DynamicFooter"
import { DynamicHeader } from "@/lib/components/ui/view/DynamicHeader"
import { isSupportedLocale } from "@/lib/i18n/locales"
import { SiteService } from "@/lib/services"
import { getAllGamesPageData } from "@/lib/services/game"
import type { PropsWithChildren } from "react"
import { setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import Script from "next/script"

type Props = PropsWithChildren<{ params: Promise<{ locale: string }> }>

export default async function PagesLayout({ children, params }: Props) {
	const { locale } = await params
	if (!isSupportedLocale(locale)) {
		return notFound()
	}
	setRequestLocale(locale)

	// 获取站点基本信息
	const data = await SiteService.getSiteLayoutData(locale)
	const {
		logo,
		locales,
		isGameBox,
		categories,
		analytics,
		navigations,
		metadata,
	} = data

	// 获取搜索数据（为搜索功能准备）
	const gamePageData = await getAllGamesPageData(
		locale,
		undefined,
		undefined,
		"/games",
	)
	const searchData = {
		games: Array.isArray(gamePageData.games.data)
			? gamePageData.games.data
					.filter((game: any) => !("codeText" in game && "type" in game))
					.map((game: any) => ({
						id: game.id,
						slug: game.slug,
						name: game.name,
						gameLocaleName: game.gameLocaleName,
						gameLocaleDescription: game.gameLocaleDescription,
						screenshotUrl: game.screenshotUrl,
						rating: game.gameInfo?.rating,
					}))
			: [],
		categories: gamePageData.categories?.data || [],
		tags: gamePageData.tags?.data || [],
	}

	return (
		<>
			<DynamicHeader
				logo={logo}
				name={data.siteName}
				locales={locales}
				navigations={navigations}
				searchData={searchData}
			/>
			{isGameBox ? (
				<GameBoxLayout categories={categories || []}>
					{children}
					<DynamicFooter
						name={data.siteName}
						logo={logo}
						locales={locales}
						contactEmail={data.contactEmail}
						friendLinks={data.friendLinks}
						socials={data.socials}
						metadata={metadata}
					/>
				</GameBoxLayout>
			) : (
				<>
					{children}
					<DynamicFooter
						name={data.siteName}
						logo={logo}
						locales={locales}
						contactEmail={data.contactEmail}
						friendLinks={data.friendLinks}
						socials={data.socials}
						metadata={metadata}
					/>
				</>
			)}
			{/* AdSense 脚本现在通过各个广告组件自动加载 */}

			{/* 统计代码，仅在非开发环境下加载 */}
			{analytics.isShouldLoad && analytics && (
				<>
					{analytics.gaId && <GoogleAnalytics gaId={analytics.gaId} />}
					{analytics.plausible && (
						<Script
							defer
							data-domain={analytics.domain}
							src={analytics.plausible}
						/>
					)}
					{analytics.clarityId && (
						<MicrosoftClarity clarityId={analytics.clarityId} />
					)}
					{/* TikTok Pixel - 自动追踪页面访问和页面停留时长 */}
					<TikTokPixel autoTrack={true} trackEngagement={true} />
					{analytics.adsenseClientId && (
						<Script
							async
							src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${analytics.adsenseClientId}`}
							crossOrigin="anonymous"
						/>
					)}
				</>
			)}
		</>
	)
}
