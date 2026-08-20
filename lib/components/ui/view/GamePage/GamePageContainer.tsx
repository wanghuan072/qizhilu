"use client"
import { GamePageHeaderTopSlot } from "@/lib/components/ads"
import { createDynamicSection } from "@/lib/components/ui/view/DynamicSection"
import { siteSettings } from "@/lib/config/siteSettings"
import { useRecentlyPlayedGames } from "@/lib/hooks/useRecentlyPlayedGames"
import { AdSettings, GameData, GameType } from "@/lib/types/api-types"
import { GameDataListType } from "@/lib/types/game"
import React, { useMemo, useEffect } from "react"
import { GamePlayer } from "./components/GamePlayer"


// 创建动态组件
const DynamicGameContentSection = createDynamicSection(
	() => import("./GameContentSection"),
	{ ssr: true }, // SEO友好：包含游戏信息、标签、FAQ等重要内容
)

const DynamicGameSidebar = createDynamicSection(
	() => import("./GameSidebar"),
	{ ssr: true }, // SEO友好：包含相关游戏链接
)

const DynamicGameFloatingAction = createDynamicSection(
	() => import("./GameFloatingAction"),
	{ ssr: false }, // 纯客户端功能：浮动按钮无SEO价值
)

interface GamePageContainerProps {
	game: GameData
	popularGames: GameDataListType
	latestGames: GameDataListType
	relatedGames: GameDataListType
	ads: AdSettings[]
	tabs: Array<{
		tabId: string
		title: string
		icon?: string
	}>
}

export const GamePageContainer: React.FC<GamePageContainerProps> = ({
	game,
	popularGames,
	latestGames,
	relatedGames,
	ads,
	tabs,
}) => {
	const { addRecentlyPlayedGame } = useRecentlyPlayedGames()
	const isBoxTemplate = siteSettings.templateType === "game-box"

	// 检查右侧边栏是否有内容（盒子模板下隐藏右侧边栏）
	const hasRightSidebarContent = useMemo(() => {
		return (
			(popularGames && popularGames.length > 0) ||
			(latestGames && latestGames.length > 0) ||
			(ads && ads.length > 0)
		)
	}, [popularGames, latestGames, ads, isBoxTemplate])

	// 在组件加载时记录游戏访问历史
	useEffect(() => {
		if (game?.id) {
			addRecentlyPlayedGame(game.id.toString())
		}
	}, [game?.id, addRecentlyPlayedGame])

	return (
		<div className="mb-10">
			{/* 主要内容区域 */}
			<div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
				<div
					className={`w-full flex flex-col ${hasRightSidebarContent ? "lg:w-3/4" : ""}`}
				>
					{/* 头部广告位 */}
					<div className="mb-6">
						<GamePageHeaderTopSlot />
					</div>

					{/* Game Player with integrated Player Info */}
					<GamePlayer
						variant={
							game.type === GameType.Download
								? "download"
								: game.type === GameType.Popup
									? "popup"
									: game.type === GameType.Placeholder
										? "placeholder"
										: game.type === GameType.Link
											? "link"
											: "iframe"
						}
						url={game.iframeUrl}
						title={game.gameLocaleName}
						slogan={game.gameLocaleSlogan}
						image={game.screenshotUrl || ""}
						rating={game.gameInfo.rating}
						gameId={game.id}
						gameLocaleContent={game}
						fullWidth={!hasRightSidebarContent}
            adsSettings={siteSettings.adsSettings}
					/>

					{/* 游戏内容区域 - 动态加载 */}
					<DynamicGameContentSection
						game={game}
						relatedGames={relatedGames}
						ads={ads}
						tabs={tabs}
					/>

					{/* 移动端内联显示右侧边栏内容 - 在游戏内容区域后 */}
					{hasRightSidebarContent && (
						<div className="lg:hidden">
							<DynamicGameSidebar
								ads={ads}
								popularGames={popularGames}
								latestGames={latestGames}
								variant="inline"
							/>
						</div>
					)}
				</div>

				{/* Right Sidebar - 大屏幕侧边栏显示 */}
				{hasRightSidebarContent && (
					<DynamicGameSidebar
						ads={ads}
						popularGames={popularGames}
						latestGames={latestGames}
						variant="sidebar"
						className="hidden lg:block lg:w-1/4"
					/>
				)}
			</div>

			{/* Floating Action Buttons - 动态加载 */}
			<DynamicGameFloatingAction />
		</div>
	)
}

export default GamePageContainer
