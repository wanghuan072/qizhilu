"use client"

import { GameCard } from "@/lib/components/ui/view/GamePage/components/GameCard"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

interface GameCardData {
	slug: string
	name: string
	screenshotUrl?: string
	rating?: number
	categories?: Array<{ code: string; slug: string }>
	updateTime?: string
	recommendToHome?: boolean
}

interface ScrollableGameListProps {
	title: string
	games: GameCardData[]
	categoryCode?: string
	useTileLayout?: boolean
}

export function ScrollableGameList({
	title,
	games,
	categoryCode,
	useTileLayout = false,
}: ScrollableGameListProps) {
	const t = useTranslations()
	const scrollRef = useRef<HTMLDivElement>(null)
	const [showLeftArrow, setShowLeftArrow] = useState(false)
	const [showRightArrow, setShowRightArrow] = useState(false)
	const [isHovered, setIsHovered] = useState(false)
	const isRecentGames = title === t("Game.recentGamesTitle")
	const shouldUseTileLayout = useTileLayout

	const checkScrollButtons = () => {
		if (scrollRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
			const hasOverflow = scrollWidth > clientWidth
			const canScrollRight = scrollLeft < scrollWidth - clientWidth

			setShowLeftArrow(hasOverflow && scrollLeft > 0)
			setShowRightArrow(hasOverflow && canScrollRight)
		}
	}

	const scrollLeft = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: -300, behavior: "smooth" })
		}
	}

	const scrollRight = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: 300, behavior: "smooth" })
		}
	}

	useEffect(() => {
		const current = scrollRef.current
		if (!current) return

		// 初始检查
		checkScrollButtons()

		// 监听滚动事件
		const handleScroll = () => checkScrollButtons()
		current.addEventListener("scroll", handleScroll)

		// 监听容器大小变化
		let resizeObserver: ResizeObserver | null = null
		if (typeof ResizeObserver !== "undefined") {
			resizeObserver = new ResizeObserver(() => {
				// 延迟执行以确保DOM更新完成
				setTimeout(checkScrollButtons, 0)
			})
			resizeObserver.observe(current)
		}

		// 监听窗口大小变化
		const handleResize = () => {
			setTimeout(checkScrollButtons, 100)
		}
		window.addEventListener("resize", handleResize)

		return () => {
			current.removeEventListener("scroll", handleScroll)
			window.removeEventListener("resize", handleResize)
			if (resizeObserver) {
				resizeObserver.disconnect()
			}
		}
	}, [games])

	return (
		<section className="space-y-4">
			<div
				className={`flex items-center justify-between ${isRecentGames ? "" : "md:px-4"}`}
			>
				<h2 className="text-xl font-bold text-foreground">{title}</h2>
				{categoryCode && categoryCode.trim() !== "" && (
					<a
						href={`/games/category/${categoryCode}`}
						className="md:hidden text-sm text-primary hover:text-primary/80 transition-colors"
					>
						{t("Game.viewMore")}
					</a>
				)}
			</div>
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
						className={`flex gap-4 pb-4 overflow-x-scroll scrollbar-hide ${isRecentGames ? "" : "px-4"}`}
						style={{
							scrollbarWidth: "none",
							msOverflowStyle: "none",
						}}
					>
						{games.map((game, index) => (
							<div
								key={`${title}-${index}`}
								className={
									isRecentGames ? "w-20 flex-shrink-0" : "w-48 flex-shrink-0"
								}
							>
								<GameCard
									name={game.name}
									slug={game.slug}
									image={game.screenshotUrl}
									rating={game.rating}
									className={isRecentGames ? "recent-game-card" : ""}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
			{/* 移动端显示 */}
			<div className="md:hidden md:px-4">
				{shouldUseTileLayout ? (
					/* 推荐游戏、热门游戏、新游戏使用网格布局 */
					<div className="grid grid-cols-2 gap-3">
						{games.slice(0, 6).map((game, index) => (
							<GameCard
								key={`${title}-mobile-${index}`}
								name={game.name}
								slug={game.slug}
								image={game.screenshotUrl}
								rating={game.rating}
							/>
						))}
					</div>
				) : (
					/* 其他分类使用水平滚动，移动端卡片大小与New Games一致 */
					<div
						ref={scrollRef}
						className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
						style={{
							scrollbarWidth: "none",
							msOverflowStyle: "none",
						}}
					>
						{games.map((game, index) => (
							<div
								key={`${title}-mobile-${index}`}
								className="w-40 flex-shrink-0"
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
		</section>
	)
}
