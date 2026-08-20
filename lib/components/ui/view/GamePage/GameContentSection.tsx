"use client"

import {
	CommentsBottomSlot,
	CommentsTopSlot,
	ContentMiddleBannerSlot,
	GameAreaBottomSlot,
} from "@/lib/components/ads"
import { SupportGameContentIds } from "@/lib/consts/games"
import { AdSettings, GameData } from "@/lib/types/api-types"
import { GameDataListType } from "@/lib/types/game"
import { Suspense, lazy } from "react"
import { GameInfoContent } from "./components/GameInfoContent"
import { GameTabContent } from "./components/GameTabContent"
import RelatedGamesContent from "./components/RelatedGamesContent"
import RelatedGamesTextLinks from "./components/RelatedGamesTextLinks"

// 动态导入大组件
const ContentNavigationTabs = lazy(() =>
	import("./components/ContentNavigationTabs").then((m) => ({
		default: m.ContentNavigationTabs,
	})),
)
const GameComments = lazy(() =>
	import("./components/GameComments").then((m) => ({
		default: m.GameComments,
	})),
)

interface GameContentSectionProps {
	game: GameData
	relatedGames: GameDataListType
	ads: AdSettings[]
	tabs: Array<{
		tabId: string
		title: string
		icon?: string
	}>
}

export default function GameContentSection({
	game,
	relatedGames,
	ads,
	tabs,
}: GameContentSectionProps) {
	return (
		<>
			{/* 游戏区域下方广告 */}
			<GameAreaBottomSlot />

			<RelatedGamesContent items={relatedGames} />
			<div className="mt-6">
				<ContentMiddleBannerSlot />
			</div>
			{/* Tab 内容区域 */}
			<div className="grid grid-cols-1 xl:grid-cols-12 gap-2 lg:gap-4">
				<div className="space-y-4 lg:space-y-10 lg:col-span-8">
					{/* 游戏信息段落 - 游戏设置和标签 */}
					<div className="bg-card rounded-xl shadow-md overflow-hidden p-4 sm:p-6 mt-4">
						<GameInfoContent
							gameInfo={game.gameInfo}
							categories={game.categories}
							tags={game.tags}
						/>
					</div>

					<Suspense
						fallback={
							<div className="h-12 bg-muted/30 rounded animate-pulse" />
						}
					>
						<ContentNavigationTabs tabs={tabs} />
					</Suspense>

					{/* 动态渲染Tab内容 - 根据tab.type类型渲染不同内容 */}
					{game.contents
						.filter((it) => SupportGameContentIds.includes(it.tabId))
						.map((tab) => (
							<GameTabContent key={tab.tabId} content={tab} />
						))}

					{/* 关联游戏纯文本链接列表 */}
					{game.relatedLinks && game.relatedLinks.length > 0 && (
						<RelatedGamesTextLinks items={game.relatedLinks} />
					)}
				</div>

				{/* 评论区域 - 在大屏幕上作为第二列，小屏幕上在底部 */}
				<div className="lg:col-span-4 flex flex-col gap-4 mt-4">
					{/* 评论区顶部广告 */}
					<CommentsTopSlot />
					<div className="w-full rounded-lg">
						<Suspense
							fallback={
								<div className="h-96 bg-muted/30 rounded animate-pulse" />
							}
						>
							<GameComments comments={game.comments} gameId={game.id} />
						</Suspense>
					</div>
					{/* 评论区底部广告 */}
					<CommentsBottomSlot />
				</div>
			</div>
		</>
	)
}
