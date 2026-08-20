"use client"

import {
	AllGamesBottomBannerSlot,
	AllGamesContentRightBottomSlot,
	AllGamesContentRightTopSlot,
	AllGamesMobileVerticalSlot,
	AllGamesTopBannerSlot,
} from "@/lib/components/ads"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/lib/components/ui/select"
import { GameCard } from "@/lib/components/ui/view/GamePage/components/GameCard"
import { siteSettings } from "@/lib/config/siteSettings"
import { useFavoriteGames } from "@/lib/hooks/useFavoriteGames"
import { AdSettings, AllGameDataBase, GameCategory, GameTag } from "@/lib/types"
import { useRouter } from "@i18n/navigation"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import React, { useCallback, useEffect, useState } from "react"
import { ActiveTabHandler } from "./ActiveTabHandler"
import { LoadMore } from "./LoadMore"
import { Sidebar } from "./Sidebar"

interface AllGamesContentProps {
	title?: string
	description?: string
	games: AllGameDataBase[] // 直接使用优化的数据类型
	categories: GameCategory[]
	tags: GameTag[]
	ads: AdSettings[]
}

export function AllGamesContent({
	games,
	categories,
	tags,
	title,
	description,
	ads,
}: AllGamesContentProps) {
	const t = useTranslations()
	const router = useRouter()
	const pathname = usePathname()
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
		undefined,
	)
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [activeTab, setActiveTab] = useState<string | undefined>(undefined)
	const [showFavorites, setShowFavorites] = useState(false)
	const favoriteGameIds = useFavoriteGames()

	// games 已经是优化的数据结构

	// 处理客户端URL参数变化
	const handleActiveTabChange = useCallback((tab: string | undefined) => {
		setActiveTab(tab)
	}, [])

	const [displayCount, setDisplayCount] = useState(60) // 初始显示60个游戏
	const [isLoading, setIsLoading] = useState(false)
	const [showAllTags, setShowAllTags] = useState(false)

	const handleCategoryChange = (
		category: string | undefined,
		tabId?: string,
	) => {
		setSelectedCategory(category === "all" ? undefined : category)
		setSelectedTags([])
		setShowFavorites(false)
		setActiveTab(tabId)
		setDisplayCount(60) // 重置显示数量
	}

	// 获取当前选择器的值
	const getCurrentSelectValue = () => {
		if (pathname.includes("/games/popular")) return "popular"
		if (pathname.includes("/games/new-game")) return "new"
		if (pathname.includes("/games/recently-played")) return "recent"
		if (pathname.includes("/games/favorites")) return "favorites"

		// 检查是否是分类页面
		const categoryMatch = pathname.match(/\/c\/([^\/]+)/)
		if (categoryMatch) {
			const categorySlug = categoryMatch[1]
			const category = categories.find((cat) => cat.slug === categorySlug)
			if (category) return category.code
		}

		return "all"
	}

	// 处理移动端选择器变化
	const handleMobileCategoryChange = (value: string) => {
		if (value === "all") {
			router.push("/games")
		} else if (value === "popular") {
			router.push("/games/popular")
		} else if (value === "new") {
			router.push("/games/new-game")
		} else if (value === "recent") {
			router.push("/games/recently-played")
		} else if (value === "favorites") {
			router.push("/games/favorites")
		} else {
			// 普通分类，跳转到分类页面
			const category = categories.find((cat) => cat.code === value)
			if (category) {
				router.push(`/c/${category.slug}`)
			}
		}
	}

	const handleTagChange = (tag: string | undefined) => {
		if (!tag) return
		setSelectedTags((prev) => {
			// 如果标签已选中，则移除
			if (prev.includes(tag)) {
				return prev.filter((t) => t !== tag)
			}
			// 否则添加到已选中列表
			return [...prev, tag]
		})
		setSelectedCategory(undefined)
		setShowFavorites(false)
		setDisplayCount(60) // 重置显示数量
	}

	// 当搜索查询改变时重置显示数量
	useEffect(() => {
		setDisplayCount(60)
	}, [searchQuery])

	// 筛选游戏逻辑
	const filteredGames = games.filter((game) => {
		// 收藏游戏筛选
		if (showFavorites) {
			return favoriteGameIds.includes(game.id)
		}

		// 搜索查询筛选
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			const matchesName = game.name.toLowerCase().includes(query)
			const matchesCategory = game.categories?.some((cat) =>
				cat.name.toLowerCase().includes(query),
			)
			if (!matchesName && !matchesCategory) {
				return false
			}
		}

		// 分类筛选
		if (selectedCategory) {
			// 特殊分类处理
			if (
				selectedCategory === "popular" ||
				selectedCategory === "new" ||
				selectedCategory === "recent"
			) {
				// 这些是特殊分类，可能需要根据实际API返回的数据进行处理
				// 目前先通过游戏的其他属性判断，如果有相关字段可以在这里添加
			} else {
				// 普通分类筛选
				const hasCategory = game.categories?.some(
					(cat) => cat.slug === selectedCategory,
				)
				if (!hasCategory) {
					return false
				}
			}
		}

		// 标签筛选（多选）
		if (selectedTags.length > 0) {
			const gameTagSlugs = game.tags?.map((tag) => tag.slug) || []
			const hasAnyTag = selectedTags.some((selectedTag) =>
				gameTagSlugs.includes(selectedTag),
			)
			if (!hasAnyTag) {
				return false
			}
		}

		return true
	})

	// 计算显示的标签数量（2行，每行约6个标签）
	const getVisibleTags = () => {
		if (showAllTags) return tags
		return tags.slice(0, 12) // 显示前12个标签（约2行）
	}

	// 转换广告数据格式，从数组转换为按类型分组的对象
	const adsData = {
		banner: ads.find((ad) => ad.type === "banner"),
		block: ads.find((ad) => ad.type === "block"),
	}

	// 检查是否为盒子模板
	const isBoxTemplate = siteSettings.templateType === "game-box"

	return (
		<div className="bg-background flex flex-col lg:flex-row">
			{/* URL参数处理组件 */}
			<ActiveTabHandler onActiveTabChange={handleActiveTabChange} />

			{/* 左侧边栏 - 盒子模板下完全隐藏，其他模板移动端隐藏桌面端显示 */}
			{!isBoxTemplate && (
				<div className="hidden lg:block">
					<Sidebar ads={adsData} categories={categories} tags={tags} />
				</div>
			)}

			{/* 主内容区 */}
			<main className="flex-1 bg-background relative min-h-screen">
				{/* 移动端顶部筛选区域 - 盒子模板下隐藏 */}
				{!isBoxTemplate && (
					<div className="lg:hidden bg-background border-b border-border p-4 sticky top-0 z-10">
						{/* 移动端搜索框 */}
						<input
							type="text"
							placeholder={t("Common.searchPlaceholder")}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full px-4 py-2 mb-3 border border-input rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
						/>

						{/* 移动端分类快速选择 - 独占一行 */}
						<div className="mb-3">
							<Select
								value={getCurrentSelectValue()}
								onValueChange={handleMobileCategoryChange}
							>
								<SelectTrigger className="w-full" size="sm">
									<SelectValue placeholder={t("Game.allGames")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t("Game.allGames")}</SelectItem>
									<SelectItem value="popular">
										{t("Game.hotGamesTitle")}
									</SelectItem>
									<SelectItem value="new">
										{t("Game.latestGamesTitle")}
									</SelectItem>
									<SelectItem value="recent">
										{t("Game.recentlyPlayed")}
									</SelectItem>
									<SelectItem value="favorites">
										{t("Common.myFavorites")}
									</SelectItem>
									{categories.map((category) => (
										<SelectItem key={category.code} value={category.code}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* 移动端标签平铺显示 - 采用PC端样式但缩小尺寸 */}
						<div className="mb-3">
							<div className="flex flex-wrap gap-1">
								{getVisibleTags().map((tag) => (
									<button
										key={tag.slug}
										type="button"
										onClick={() => handleTagChange(tag.slug)}
										className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border transition-colors ${
											selectedTags.includes(tag.slug)
												? "bg-primary text-primary-foreground border-primary"
												: "bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
										}`}
									>
										<span>{tag.name}</span>
										{tag.count && (
											<span
												className={`px-1 py-0.5 rounded text-[10px] font-bold leading-none ${
													selectedTags.includes(tag.slug)
														? "bg-primary-foreground/20 text-primary-foreground"
														: "bg-background/80 text-muted-foreground"
												}`}
											>
												{tag.count}
											</span>
										)}
									</button>
								))}
								{tags.length > 12 && (
									<button
										type="button"
										onClick={() => setShowAllTags(!showAllTags)}
										className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border border-dashed border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
									>
										{showAllTags ? t("Game.less") : t("Game.more")}
									</button>
								)}
							</div>
						</div>
					</div>
				)}

				{/* 页面内容 */}
				<div
					className={`p-4 sm:p-6 lg:p-8 ${isBoxTemplate ? "lg:pt-8" : "lg:pt-16"}`}
				>
					{/* 页面标题区 */}
					<div className="mb-6 lg:mb-8">
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
							{showFavorites ? t("GameList.myFavorites") : title}
						</h1>
						<p className="text-sm sm:text-base text-muted-foreground">
							{showFavorites
								? t("GameList.myFavoritesDescription")
								: description}
						</p>
					</div>

					{/* 顶部横幅广告位 */}
					<AllGamesTopBannerSlot />

					{/* 游戏网格 */}
					<div className="mb-6 lg:mb-8 mt-4">
						{filteredGames.length > 0 ? (
							<>
								<div className="flex gap-6">
									{/* 游戏卡片网格区域 */}
									<div className="flex-1">
										<div className="grid grid-cols-2 sm:grid-cols-3 md:[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] gap-4">
											{filteredGames.slice(0, displayCount).map((game) => (
												<div key={game.slug}>
													<GameCard
														name={game.name}
														slug={game.slug}
														image={game.screenshotUrl || ""}
														rating={game.gameInfo?.rating || 5}
													/>
												</div>
											))}
										</div>
									</div>

									{/* 右侧垂直广告区域 - 桌面端显示 */}
									<div className="hidden lg:flex flex-col min-w-[300px] max-w-[350px] flex-1 space-y-4 sticky top-4 self-start">
										<AllGamesContentRightTopSlot />
										<AllGamesContentRightBottomSlot />
									</div>
								</div>

								{/* LoadMore 组件 */}
								{displayCount < filteredGames.length && (
									<LoadMore
										isLoading={isLoading}
										onLoadMore={async () => {
											setIsLoading(true)
											// 模拟加载延迟
											await new Promise((resolve) => setTimeout(resolve, 800))
											setDisplayCount((prev) =>
												Math.min(prev + 20, filteredGames.length),
											)
											setIsLoading(false)
										}}
										remainingCount={filteredGames.length - displayCount}
									/>
								)}

								{/* 移动端垂直广告区域 */}
								<div className="lg:hidden flex flex-col space-y-4 mb-6 mt-4">
									<AllGamesMobileVerticalSlot />
								</div>

								{/* 底部横向广告位 */}
								<div className="mt-8">
									<AllGamesBottomBannerSlot />
								</div>
							</>
						) : (
							<div className="text-center py-12 lg:py-16">
								<p className="text-lg text-muted-foreground mb-4">
									{t("GameList.noGamesFound")}
								</p>
								{(searchQuery ||
									selectedCategory ||
									selectedTags.length > 0) && (
									<button
										type="button"
										onClick={() => {
											setSearchQuery("")
											setSelectedCategory(undefined)
											setSelectedTags([])
											setDisplayCount(60)
										}}
										className="mt-3 sm:mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
									>
										{t("GameList.clearSearch")}
									</button>
								)}
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	)
}
