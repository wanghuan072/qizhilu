"use client"
import { Link } from "@/lib/i18n/navigation"
import { GameCategory } from "@/lib/types/api-types"
import { getStableRandomIcon } from "@/lib/utils/icons"
import { cn } from "@/lib/utils/react/styles"
import {
	ChevronDown,
	ChevronLeft,
	Clock,
	Heart,
	Home,
	Star,
	TrendingUp,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
interface CategorySidebarProps {
	categories: GameCategory[]
	isExpanded: boolean
	onToggle: () => void
	isMobileExpanded: boolean
}

export function CategorySidebar({
	categories,
	isExpanded,
	onToggle,
	isMobileExpanded,
}: CategorySidebarProps) {
	const pathname = usePathname()
	const t = useTranslations()
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const [showScrollIndicator, setShowScrollIndicator] = useState(false)

	// 为分类添加随机图标
	const categoriesWithIcons = useMemo(() => {
		return categories.map((category) => ({
			...category,
			displayIcon:
				category.icon || getStableRandomIcon(category.slug || category.name),
		}))
	}, [categories])

	// 检查是否需要显示滚动指示器
	const checkScrollIndicator = useCallback(() => {
		const container = scrollContainerRef.current
		if (!container) return

		const { scrollTop, scrollHeight, clientHeight } = container
		const hasMoreContent = scrollHeight > clientHeight
		const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5 // 5px的容差

		setShowScrollIndicator(hasMoreContent && !isAtBottom)
	}, [])

	// 监听滚动和尺寸变化
	useEffect(() => {
		const container = scrollContainerRef.current
		if (!container) return

		checkScrollIndicator()

		const handleScroll = () => checkScrollIndicator()
		const handleResize = () => checkScrollIndicator()

		container.addEventListener("scroll", handleScroll)
		window.addEventListener("resize", handleResize)

		// 使用 MutationObserver 监听内容变化
		const observer = new MutationObserver(() => {
			setTimeout(checkScrollIndicator, 0)
		})
		observer.observe(container, { childList: true, subtree: true })

		return () => {
			container.removeEventListener("scroll", handleScroll)
			window.removeEventListener("resize", handleResize)
			observer.disconnect()
		}
	}, [checkScrollIndicator, isExpanded, isMobileExpanded])

	const fixedMenuItems = [
		{
			name: t("Sidebar.home"),
			href: "/",
			icon: <Home className="w-4 h-4" />,
		},
		{
			name: t("Sidebar.recentlyPlayed"),
			href: "/games/recently-played",
			icon: <Clock className="w-4 h-4" />,
		},
		{
			name: t("Sidebar.newGames"),
			href: "/games/new-game",
			icon: <Star className="w-4 h-4" />,
		},
		{
			name: t("Sidebar.popularGames"),
			href: "/games/popular",
			icon: <TrendingUp className="w-4 h-4" />,
		},
		{
			name: t("Sidebar.myFavorites"),
			href: "/games/favorites",
			icon: <Heart className="w-4 h-4" />,
		},
	]

	return (
		<>
			{/* 侧边栏 */}
			<div
				className={cn(
					"fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar text-sidebar-foreground z-50 transition-[width] duration-300 border-r border-t border-sidebar-border overflow-hidden",
					isExpanded || isMobileExpanded ? "w-[200px]" : "w-[50px]",
					// 移动端隐藏收起状态
					!isMobileExpanded && "max-md:-translate-x-full",
				)}
				onMouseEnter={() => {
					// 桌面端鼠标悬停时展开
					if (window.innerWidth >= 768 && !isExpanded) {
						onToggle()
					}
				}}
				onMouseLeave={() => {
					// 桌面端鼠标离开时收起
					if (window.innerWidth >= 768 && isExpanded) {
						onToggle()
					}
				}}
				onClick={() => {
					// 移动端下点击侧边栏收起
					if (window.innerWidth < 768 && isMobileExpanded) {
						onToggle()
					}
				}}
			>
				<div
					ref={scrollContainerRef}
					className="h-full overflow-y-auto scrollbar-hide relative"
				>
					<div
						className={cn(
							"flex flex-col space-y-2 transition-all duration-300",
							isExpanded || isMobileExpanded ? "p-4" : "p-2",
						)}
					>
						{/* Fixed Menu Items */}
						{fixedMenuItems.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									"flex items-center gap-2 rounded-lg text-sidebar-foreground transition-all hover:bg-accent hover:text-accent-foreground whitespace-nowrap",
									"px-2 py-1.5",
									pathname === item.href
										? "bg-accent text-accent-foreground"
										: "",
								)}
								title={item.name}
							>
								<span className="shrink-0">{item.icon}</span>
								<span
									className={cn(
										"transition-all duration-300 font-normal text-sm noto-sans-hk-bold overflow-hidden whitespace-nowrap",
										isExpanded || isMobileExpanded
											? "opacity-100 ml-2"
											: "opacity-0 w-0 ml-0",
									)}
								>
									{item.name}
								</span>
							</Link>
						))}

						{/* 分割线 */}
						<div className="border-t border-sidebar-border my-2" />

						{/* Categories */}
						{categoriesWithIcons.map((category) => (
							<Link
								key={category.name}
								href={`/c/${category.slug}`}
								className={cn(
									"flex items-center gap-2 rounded-lg text-sidebar-foreground transition-all hover:bg-accent hover:text-accent-foreground whitespace-nowrap",
									"px-2 py-1.5",
									pathname === `/c/${category.slug}`
										? "bg-accent text-accent-foreground"
										: "",
								)}
								title={category.name}
							>
								<span className="shrink-0 w-4 h-4">{category.displayIcon}</span>
								<span
									className={cn(
										"transition-all duration-300 font-normal text-sm noto-sans-hk-bold overflow-hidden whitespace-nowrap",
										isExpanded || isMobileExpanded
											? "opacity-100 ml-2"
											: "opacity-0 w-0 ml-0",
									)}
								>
									{category.name}
								</span>
							</Link>
						))}

						{/* 分割线 */}
						<div className="border-t border-sidebar-border my-2" />

						{/* Tags Section - 暂时留空，将来可以添加标签数据 */}
						{/* TODO: 添加标签数据 */}
					</div>

					{/* 滚动指示器 */}
					{showScrollIndicator && (isExpanded || isMobileExpanded) && (
						<div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
							<div className="bg-sidebar-accent/80 backdrop-blur-sm rounded-full p-1 animate-bounce">
								<ChevronDown className="w-4 h-4 text-sidebar-foreground/70" />
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	)
}
