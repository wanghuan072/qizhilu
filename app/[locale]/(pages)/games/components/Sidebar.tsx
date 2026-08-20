"use client"

import {
	AllGamesSidebarBottomSlot,
	AllGamesSidebarTopSlot,
} from "@/lib/components/ads"
import { useFavoriteGames } from "@/lib/hooks/useFavoriteGames"
import { useRecentlyPlayedGames } from "@/lib/hooks/useRecentlyPlayedGames"
import { AdSettings, GameCategory, GameTag } from "@/lib/types"
import { Link, useRouter } from "@i18n/navigation"
import {
	Clock,
	Heart,
	LayoutGrid,
	Search,
	Star,
	TrendingUp,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { KeyboardEvent, useState } from "react"

interface SidebarProps {
	categories?: GameCategory[]
	tags?: GameTag[]
	ads: { banner?: AdSettings; block?: AdSettings }
}

export function Sidebar({ categories = [], tags = [], ads }: SidebarProps) {
	const t = useTranslations()
	const pathname = usePathname()
	const router = useRouter()
	const [showAllTags, setShowAllTags] = useState(false)
	const [searchQuery, setSearchQuery] = useState("")
	const favoriteGameIds = useFavoriteGames()
	const { recentlyPlayedGameIds } = useRecentlyPlayedGames()

	// 处理搜索
	const handleSearch = () => {
		if (searchQuery.trim()) {
			router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
		}
	}

	const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSearch()
		}
	}

	// 主导航菜单项
	const navItems = [
		{
			id: "all-games",
			label: t("Game.allGames"),
			icon: LayoutGrid,
			href: "/games",
			isActive:
				pathname === "/games" ||
				(pathname.includes("/games") &&
					!pathname.includes("/games/popular") &&
					!pathname.includes("/games/new-game") &&
					!pathname.includes("/games/recently-played") &&
					!pathname.includes("/games/favorites")),
		},
		{
			id: "popular",
			label: t("Game.hotGamesTitle"),
			icon: TrendingUp,
			href: "/games/popular",
			isActive: pathname.includes("/games/popular"),
		},
		{
			id: "new",
			label: t("Game.latestGamesTitle"),
			icon: Star,
			href: "/games/new-game",
			isActive: pathname.includes("/games/new-game"),
		},
		{
			id: "recently-played",
			label: t("Game.recentlyPlayed"),
			icon: Clock,
			href: "/games/recently-played",
			isActive: pathname.includes("/games/recently-played"),
			count: recentlyPlayedGameIds.length,
		},
		{
			id: "favorites",
			label: t("Common.myFavorites"),
			icon: Heart,
			href: "/games/favorites",
			isActive: pathname.includes("/games/favorites"),
			count: favoriteGameIds.length,
		},
	]

	// 计算显示的标签数量（2行，每行约6个标签）
	const getVisibleTags = () => {
		if (showAllTags) return tags
		return tags.slice(0, 12) // 显示前12个标签（约2行）
	}

	return (
		<aside className="w-64 h-[90vh] bg-card border-r border-border flex flex-col relative overflow-hidden">
			{/* 搜索框 */}
			<div className="p-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={handleSearchKeyDown}
						placeholder={t("Common.searchPlaceholder")}
						className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground border-none focus:ring-2 focus:ring-ring focus:outline-none"
					/>
				</div>
			</div>

			{/* 可滚动内容区域 */}
			<div className="flex-1 overflow-y-auto px-4 pb-[240px] scrollbar-thin scrollbar-thumb-muted scrollbar-track-muted/30">
				{/* 侧边栏顶部广告位 */}
				<div className="mb-4">
					<AllGamesSidebarTopSlot />
				</div>
				{/* 主导航菜单 */}
				<nav>
					<ul className="space-y-2">
						{navItems.map((item) => {
							const Icon = item.icon
							const commonClassName = `
                      flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 group relative w-full
                      ${
												item.isActive
													? "text-accent-foreground bg-accent"
													: "text-foreground hover:text-foreground hover:bg-accent"
											}
                    `
							const content = (
								<>
									<Icon className="h-5 w-5 flex-shrink-0" />
									<span className="font-medium">{item.label}</span>
									{"count" in item &&
										item.count !== undefined &&
										item.count > 0 && (
											<span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
												{item.count}
											</span>
										)}
								</>
							)

							return (
								<li key={item.id}>
									<Link href={item.href!} className={commonClassName}>
										{content}
									</Link>
								</li>
							)
						})}
					</ul>
				</nav>

				{/* 分类列表 */}
				{categories.length > 0 && (
					<div className="mt-8">
						<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
							{t("Game.categories")}
						</h3>
						<ul className="space-y-1">
							{categories
								.slice(0, 8)
								.sort((a, b) => (b?.sortOrder || 0) - (a?.sortOrder || 0))
								.map((category) => (
									<li key={category.code}>
										<Link
											href={`/c/${category.slug}`}
											className={`
                        block px-3 py-2 rounded-md text-sm transition-colors w-full
                        ${
													pathname.endsWith(`/c/${category.slug}`)
														? "text-accent-foreground bg-accent"
														: "text-foreground hover:text-foreground hover:bg-accent"
												}
                      `}
										>
											{category.name}
										</Link>
									</li>
								))}
						</ul>
					</div>
				)}

				{/* Tags 筛选条件 */}
				{tags.length > 0 && (
					<div className="mt-8">
						<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
							{t("Game.tags")}
						</h3>
						<div className="px-3">
							<div className="flex flex-wrap gap-1.5">
								{getVisibleTags().map((tag) => (
									<Link
										key={tag.slug}
										href={`/tag/${tag.slug}`}
										className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border
                        ${
													pathname.includes(`/tag/${tag.slug}`)
														? "bg-primary text-primary-foreground border-primary"
														: "bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
												}
                      `}
									>
										<span className="truncate">{tag.name}</span>
										{tag.count && (
											<span
												className={`px-1 py-0.5 rounded text-[10px] font-bold leading-none ${
													pathname.includes(`/tag/${tag.slug}`)
														? "bg-primary-foreground/20 text-primary-foreground"
														: "bg-background/80 text-muted-foreground"
												}`}
											>
												{tag.count}
											</span>
										)}
									</Link>
								))}
								{tags.length > 12 && (
									<button
										type="button"
										onClick={() => setShowAllTags(!showAllTags)}
										className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-colors border border-dashed border-border text-muted-foreground hover:bg-muted hover:text-foreground"
									>
										{showAllTags ? "Less" : "More"}
									</button>
								)}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* 底部广告位 */}
			<div className="p-4 bg-card border-t border-border w-64 sticky bottom-0 left-0 inset-x-0 z-10">
				<AllGamesSidebarBottomSlot />
			</div>
		</aside>
	)
}
