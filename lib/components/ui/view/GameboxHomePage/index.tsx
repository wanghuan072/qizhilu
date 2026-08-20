"use client"

import { HomeMiddleBannerSlot, HomeTopBannerSlot } from "@/lib/components/ads"
import { ScrollArea } from "@/lib/components/ui/scroll-area"
import { createDynamicSection } from "@/lib/components/ui/view/DynamicSection"
import { GameCard } from "@/lib/components/ui/view/GamePage/components/GameCard"
import { AdSettings } from "@/lib/types"

// 创建动态组件
const DynamicHotGamesSection = createDynamicSection(
	() => import("./HotGamesSection"),
	{ ssr: true }, // SEO友好：游戏列表对搜索引擎重要
)

const DynamicNewGamesSection = createDynamicSection(
	() => import("./NewGamesSection"),
	{ ssr: true }, // SEO友好：游戏列表对搜索引擎重要
)

const DynamicCategoryGamesSection = createDynamicSection(
	() => import("./CategoryGamesSection"),
	{ ssr: true }, // SEO友好：分类游戏列表对搜索引擎重要
)
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

// 游戏卡片数据接口 - 只包含渲染必需的字段
interface GameCardData {
	slug: string
	name: string
	screenshotUrl?: string
	rating?: number
	categories?: Array<{ code: string; slug: string }>
	updateTime?: string
	recommendToHome?: boolean
}

// 分类数据接口 - 只包含必需字段
interface CategoryData {
	code: string
	name: string
	slug: string
}

// 分类区块数据接口
interface CategorySection {
	category: CategoryData
	games: GameCardData[]
}

// 组件 props 接口 - 精简版
interface GameboxHomePageProps {
	games: GameCardData[]
	categories: CategoryData[]
	ads: AdSettings[]
}

export function GameboxHomePage({
	games: allGames,
	categories,
	ads,
}: GameboxHomePageProps) {
	const t = useTranslations()
	const [recentGames, setRecentGames] = useState<GameCardData[]>([])

	// 获取推荐游戏 - 筛选 recommendToHome 为 true 的游戏
	const recommendedGames = allGames
		.filter((game) => game.recommendToHome === true)
		.sort((a, b) => {
			// 按更新时间倒序排列
			if (a.updateTime && b.updateTime) {
				return (
					new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
				)
			}
			return 0
		})
		.slice(0, 8)

	// 获取热门游戏 - 随机选择50%的游戏
	const popularCount = Math.floor(allGames.length * 0.5)
	const shuffled = [...allGames].sort(() => Math.random() - 0.5)
	const popularGames = shuffled.slice(0, popularCount).slice(0, 8)

	// 获取新游戏 - 按更新时间倒序排列，取30%
	const sortedByUpdate = [...allGames].sort((a, b) => {
		if (a.updateTime && b.updateTime) {
			return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
		}
		return 0
	})
	const newGameCount = Math.floor(allGames.length * 0.3)
	const newGames = sortedByUpdate.slice(0, newGameCount).slice(0, 8)

	// 按分类展示游戏
	const categorySections: CategorySection[] = categories.map((category) => {
		const categoryGames = allGames
			.filter((game) => {
				// 这里需要根据实际的分类关联逻辑来筛选
				// 检查游戏是否属于该分类
				const gameCategories = game.categories || []
				return gameCategories.some(
					(cat) => cat.code === category.code || cat.slug === category.slug,
				)
			})
			.sort((a, b) => {
				if (a.updateTime && b.updateTime) {
					return (
						new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
					)
				}
				return 0
			})
			.slice(0, 20)

		return {
			category,
			games: categoryGames,
		}
	})

	// 获取最近游戏 - 从localStorage获取用户的游戏历史
	useEffect(() => {
		let recentGamesList: GameCardData[] = []
		if (typeof window !== "undefined") {
			const recentlyPlayed = JSON.parse(
				localStorage.getItem("recentlyPlayed") || "[]",
			)
			recentGamesList = recentlyPlayed
				.map((slug: string) => allGames.find((g) => g.slug === slug))
				.filter(Boolean)
				.slice(0, 8)
		}
		// 如果没有最近游戏，显示前8个游戏作为默认
		if (recentGamesList.length === 0) {
			recentGamesList = allGames.slice(0, 8)
		}
		setRecentGames(recentGamesList)
	}, [allGames])
	// 推荐游戏专用组件
	const RecommendedGameList = ({
		title,
		games,
	}: { title: string; games: GameCardData[] }) => {
		const scrollRef = useRef<HTMLDivElement>(null)
		const [showLeftArrow, setShowLeftArrow] = useState(false)
		const [showRightArrow, setShowRightArrow] = useState(true)
		const [isHovered, setIsHovered] = useState(false)

		const checkScrollButtons = () => {
			if (scrollRef.current) {
				const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
				setShowLeftArrow(scrollLeft > 0)
				setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
			}
		}

		const scrollLeft = () => {
			if (scrollRef.current) {
				scrollRef.current.scrollBy({ left: -400, behavior: "smooth" })
			}
		}

		const scrollRight = () => {
			if (scrollRef.current) {
				scrollRef.current.scrollBy({ left: 400, behavior: "smooth" })
			}
		}

		useEffect(() => {
			const current = scrollRef.current
			if (current) {
				checkScrollButtons()
				current.addEventListener("scroll", checkScrollButtons)
				return () => current.removeEventListener("scroll", checkScrollButtons)
			}
		}, [games])

		// 将游戏分组，每5个一组
		const gameGroups = []
		for (let i = 0; i < games.length; i += 5) {
			gameGroups.push(games.slice(i, i + 5))
		}

		return (
			<section className="space-y-4">
				<div className="flex items-center justify-between md:px-4">
					<h2 className="text-xl font-bold text-foreground">{title}</h2>
				</div>

				{/* 桌面端显示 */}
				<div className="hidden md:block">
					<div
						className="relative"
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						{/* 左箭头 */}
						{showLeftArrow && isHovered && (
							<button
								onClick={scrollLeft}
								className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/95 text-white rounded-full p-3 transition-all duration-200 shadow-lg"
							>
								<ChevronLeft className="w-6 h-6" />
							</button>
						)}

						{/* 右箭头 */}
						{showRightArrow && isHovered && (
							<button
								onClick={scrollRight}
								className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/95 text-white rounded-full p-3 transition-all duration-200 shadow-lg"
							>
								<ChevronRight className="w-6 h-6" />
							</button>
						)}

						<div
							ref={scrollRef}
							className="flex gap-6 pb-4 overflow-x-scroll scrollbar-hide px-4"
							style={{
								scrollbarWidth: "none",
								msOverflowStyle: "none",
							}}
						>
							{gameGroups.map((group, groupIndex) => (
								<div
									key={`group-${groupIndex}`}
									className="flex gap-4 flex-shrink-0"
								>
									{/* 第一个游戏 - 大图 */}
									{group[0] && (
										<div
											className="flex-shrink-0"
											style={{ width: "428px", height: "240px" }}
										>
											<GameCard
												name={group[0].name}
												slug={group[0].slug}
												image={group[0].screenshotUrl}
												rating={group[0].rating}
											/>
										</div>
									)}
									{/* 后面4个游戏 - 2x2网格 */}
									{group.length > 1 && (
										<div className="grid grid-cols-2 gap-3 w-96">
											{group.slice(1, 5).map((game, index) => (
												<div
													key={`small-${groupIndex}-${index}`}
													className="w-48"
												>
													<GameCard
														name={game.name}
														slug={game.slug}
														image={game.screenshotUrl}
														rating={game.rating}
													/>
												</div>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>

				{/* 移动端显示 - 只显示第一组游戏 */}
				<div className="md:hidden">
					{gameGroups.length > 0 && gameGroups[0] && (
						<div className="w-full">
							{/* 大图在上 */}
							{gameGroups[0][0] && (
								<div className="mb-3">
									<GameCard
										name={gameGroups[0][0].name}
										slug={gameGroups[0][0].slug}
										image={gameGroups[0][0].screenshotUrl}
										rating={gameGroups[0][0].rating}
									/>
								</div>
							)}
							{/* 4个小图在下，2x2网格 */}
							{gameGroups[0] && gameGroups[0].length > 1 && (
								<div className="grid grid-cols-2 gap-3">
									{gameGroups[0].slice(1, 5).map((game, index) => (
										<div key={`mobile-small-${index}`} className="w-40">
											<GameCard
												name={game.name}
												slug={game.slug}
												image={game.screenshotUrl}
												rating={game.rating}
											/>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			</section>
		)
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="space-y-8 pb-8 px-4 md:px-0">
				{/* 最近游戏 */}
				{recentGames.length > 0 && (
					<div>
						{/* 桌面端显示 */}
						<div className="hidden md:flex items-center h-[85px] mx-4">
							<h2 className="text-sm font-bold text-foreground/80 mr-4 flex-shrink-0 flex items-center h-[50px] w-16 leading-tight">
								{t("Game.recentGamesTitle")}
							</h2>
							<ScrollArea className="flex-1">
								<div className="flex gap-3" style={{ width: "max-content" }}>
									{recentGames.map((game, index) => (
										<div key={`recent-${index}`} className="w-20 flex-shrink-0">
											<GameCard
												name={game.name}
												slug={game.slug}
												image={game.screenshotUrl}
												rating={game.rating}
												className="recent-game-card"
											/>
										</div>
									))}
								</div>
							</ScrollArea>
						</div>
						{/* 移动端显示 */}
						<div className="md:hidden">
							<h2 className="text-lg font-bold text-foreground mb-4">
								{t("Game.recentGamesTitle")}
							</h2>
							<div
								className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
								style={{
									scrollbarWidth: "none",
									msOverflowStyle: "none",
								}}
							>
								{recentGames.map((game, index) => (
									<div
										key={`recent-mobile-${index}`}
										className="w-20 flex-shrink-0"
									>
										<GameCard
											name={game.name}
											slug={game.slug}
											image={game.screenshotUrl}
											rating={game.rating}
											className="recent-game-card"
										/>
									</div>
								))}
							</div>
						</div>
						<div className="border-b border-border/30 mt-4 mb-8"></div>
					</div>
				)}

				{/* 推荐游戏 */}
				{recommendedGames.length > 0 && (
					<RecommendedGameList
						title={t("Game.recommendedGamesTitle")}
						games={recommendedGames}
					/>
				)}

				<HomeTopBannerSlot />

				{/* 热门游戏 - 动态加载 */}
				{popularGames.length > 0 && (
					<DynamicHotGamesSection games={popularGames} />
				)}
				<HomeMiddleBannerSlot />
				{/* 新游戏 - 动态加载 */}
				{newGames.length > 0 && <DynamicNewGamesSection games={newGames} />}

				{/* 按分类展示游戏 - 动态加载 */}
				{categorySections.length > 0 && (
					<DynamicCategoryGamesSection categorySections={categorySections} />
				)}
			</div>
		</div>
	)
}

export default GameboxHomePage
