"use client"

import { GameCard } from "@/lib/components/ui/view/GamePage/components/GameCard"
import { useSidebar } from "@/lib/hooks/use-sidebar"
import { GameCategory, GameData, GameTag } from "@/lib/types"
import { Filter, Grid, List, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { debounce } from "radash"
import React, { useCallback, useMemo, useState } from "react"
import { GameCategorySidebar } from "./GameCategorySidebar"
import { GameListPagination } from "./GameListPagination"

interface GameListViewProps {
	games?: GameData[]
	categories?: GameCategory[]
	tags?: GameTag[]
	locale: string
	currentPage?: number
	totalPages?: number
	initialCategory?: string
	initialTag?: string
	gamesPerPage?: number
	useServerPagination?: boolean
}

const DEFAULT_GAMES_PER_PAGE = 20

export const GameListView: React.FC<GameListViewProps> = ({
	games = [],
	categories = [],
	tags = [],
	locale,
	currentPage = 1,
	totalPages = 1,
	initialCategory,
	initialTag,
	gamesPerPage = DEFAULT_GAMES_PER_PAGE,
	useServerPagination = false,
}) => {
	const t = useTranslations()
	const router = useRouter()
	const searchParams = useSearchParams()
	const { isGameBox } = useSidebar()

	// 状态管理
	const [selectedCategory, setSelectedCategory] = useState(
		initialCategory || "",
	)
	const [selectedTag, setSelectedTag] = useState(initialTag || "")
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
	const [showMobileFilters, setShowMobileFilters] = useState(false)
	const [filterQuery, setFilterQuery] = useState("")
	const [debouncedFilterQuery, setDebouncedFilterQuery] = useState("")

	// 创建防抖函数
	const debouncedSetFilterQuery = useMemo(
		() =>
			debounce({ delay: 300 }, (query: string) => {
				setDebouncedFilterQuery(query)
			}),
		[],
	)

	// 处理筛选输入变化
	const handleFilterChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const query = e.target.value
			setFilterQuery(query)
			debouncedSetFilterQuery(query)
		},
		[debouncedSetFilterQuery],
	)

	// 转换游戏数据为本地化内容
	const gameLocaleContents = useMemo(() => {
		if (!games || !Array.isArray(games)) return []
		return games.map((game) => {
			// GameData 已经包含本地化信息，直接返回
			return {
				...game,
				gameName: game.gameLocaleName || game.name,
				gameSlogan: game.gameLocaleSlogan || "",
				gameDescription: game.gameLocaleDescription || "",
				gameImages: game.screenshotUrl ? [game.screenshotUrl] : [],
				updateTime: new Date().toISOString(),
				metadata: game.metadataInfo || {
					title: game.gameLocaleName || game.name,
					description: game.gameLocaleDescription || "",
				},
				contents: [],
			} as unknown as GameData & { isPrimary?: boolean }
		})
	}, [games, locale])

	// 筛选游戏内容
	const filteredGameContents = useMemo(() => {
		let filtered = gameLocaleContents

		// 根据分类筛选
		if (selectedCategory && selectedCategory !== "popular") {
			filtered = filtered.filter((game) => {
				if (!game.categories) return false
				return game.categories.some(
					(cat) =>
						cat.slug === selectedCategory || cat.code === selectedCategory,
				)
			})
		}

		// 根据标签筛选
		if (selectedTag) {
			filtered = filtered.filter((game) =>
				game.tags?.some(
					(tag) => tag.slug === selectedTag || tag.id === selectedTag,
				),
			)
		}

		// 根据搜索文本筛选
		if (debouncedFilterQuery.trim()) {
			const query = debouncedFilterQuery.toLowerCase().trim()
			filtered = filtered.filter((game) => {
				const searchFields = [
					game.gameLocaleName || game.name,
					game.gameLocaleSlogan,
					game.gameLocaleDescription,
					game.metadataInfo?.title,
					game.metadataInfo?.description,
				]
				return searchFields.some((field) =>
					field?.toLowerCase().includes(query),
				)
			})
		}

		return filtered
	}, [
		gameLocaleContents,
		selectedCategory,
		selectedTag,
		debouncedFilterQuery,
		locale,
	])

	// 计算分类和标签的游戏数量，并过滤掉没有游戏的分类和标签
	const categoriesWithCount = useMemo(() => {
		if (!categories || !Array.isArray(categories)) return []
		return categories
			.map((category) => {
				const count =
					gameLocaleContents?.filter((game) => {
						if (!game.categories) return false
						return game.categories.some(
							(cat) => cat.code === category.code || cat.slug === category.slug,
						)
					}).length || 0
				return {
					...category,
					count,
				}
			})
			.filter((category) => category.count > 0) // 只显示有游戏的分类
	}, [categories, gameLocaleContents, locale])

	const tagsWithCount = useMemo(() => {
		if (!tags || !Array.isArray(tags)) return []
		return tags
			.map((tag) => {
				const count =
					gameLocaleContents?.filter((game) =>
						game.tags?.some(
							(gameTag) => gameTag.id === tag.id || gameTag.slug === tag.slug,
						),
					).length || 0
				return {
					...tag,
					count,
				}
			})
			.filter((tag) => tag.count > 0) // 只显示有游戏的标签
	}, [tags, gameLocaleContents])

	// 更新URL参数
	const updateURL = (params: Record<string, string | undefined>) => {
		if (useServerPagination) {
			// 服务端分页模式
			const page = params.page ? Number.parseInt(params.page) : 1
			let baseURL = "/games"

			if (page > 1) {
				baseURL = `/games/page/${page}`
			}

			const newSearchParams = new URLSearchParams()
			Object.entries(params).forEach(([key, value]) => {
				if (key !== "page" && value) {
					newSearchParams.set(key, value)
				}
			})

			const queryString = newSearchParams.toString()
			const newURL = queryString ? `${baseURL}?${queryString}` : baseURL
			router.push(newURL, { scroll: false })
		} else {
			// 客户端分页模式
			const newSearchParams = new URLSearchParams(searchParams.toString())

			Object.entries(params).forEach(([key, value]) => {
				if (value) {
					newSearchParams.set(key, value)
				} else {
					newSearchParams.delete(key)
				}
			})

			const newURL = `/games?${newSearchParams.toString()}`
			router.push(newURL, { scroll: false })
		}
	}

	// 处理分类选择
	const handleCategoryChange = (categoryCode: string) => {
		setSelectedCategory(categoryCode)
		updateURL({
			category: categoryCode || undefined,
			tag: selectedTag || undefined,
		})
	}

	// 处理标签选择
	const handleTagChange = (tagSlug: string) => {
		setSelectedTag(tagSlug)
		updateURL({
			tag: tagSlug || undefined,
			category: selectedCategory || undefined,
		})
	}

	// 处理分页
	const handlePageChange = (page: number) => {
		if (useServerPagination) {
			// 服务端分页直接跳转
			updateURL({
				page: page.toString(),
				category: selectedCategory || undefined,
				tag: selectedTag || undefined,
			})
		}
	}

	// 清除所有筛选条件
	const handleClearFilters = () => {
		setSelectedCategory("")
		setSelectedTag("")
		setFilterQuery("")
		setDebouncedFilterQuery("")
		updateURL({})
	}

	return (
		<div className={isGameBox ? "w-full" : "flex flex-col lg:flex-row gap-6"}>
			{/* 左侧分类导航 - 在GameBox模板中隐藏 */}
			{!isGameBox && (
				<aside className="lg:w-64 flex-shrink-0">
					<GameCategorySidebar
						categories={categoriesWithCount}
						tags={tagsWithCount}
						selectedCategory={selectedCategory}
						selectedTag={selectedTag}
						onCategoryChange={handleCategoryChange}
						onTagChange={handleTagChange}
						className={`lg:block ${showMobileFilters ? "block" : "hidden"}`}
					/>
				</aside>
			)}

			{/* 游戏列表 */}
			<main className="flex-1">
				{/* 筛选框 */}
				<div className="mb-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
						<input
							type="text"
							value={filterQuery}
							onChange={handleFilterChange}
							placeholder={t("GameList.searchPlaceholder")}
							className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							aria-label={t("GameList.searchPlaceholder")}
						/>
					</div>
				</div>

				{/* 工具栏 */}
				<div className="mb-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							{/* 移动端筛选按钮 - 在GameBox模板中隐藏 */}
							{!isGameBox && (
								<button
									type="button"
									onClick={() => setShowMobileFilters(!showMobileFilters)}
									className="lg:hidden flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted"
									aria-label={showMobileFilters ? "隐藏筛选器" : "显示筛选器"}
								>
									<Filter className="h-4 w-4" />
									{t("GameList.filters")}
								</button>
							)}

							{/* 结果统计 */}
							<span className="text-sm text-muted-foreground">
								{t("GameList.resultsCount", {
									count: filteredGameContents?.length || 0,
									total: games?.length || 0,
								})}
							</span>
						</div>

						{/* 视图模式切换 */}
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setViewMode("grid")}
								className={`p-2 rounded-lg ${
									viewMode === "grid"
										? "bg-primary text-primary-foreground"
										: "bg-background text-foreground hover:bg-muted"
								}`}
								aria-label="网格视图"
								title="网格视图"
							>
								<Grid className="h-4 w-4" />
							</button>
							<button
								type="button"
								onClick={() => setViewMode("list")}
								className={`p-2 rounded-lg ${
									viewMode === "list"
										? "bg-primary text-primary-foreground"
										: "bg-background text-foreground hover:bg-muted"
								}`}
								aria-label="列表视图"
								title="列表视图"
							>
								<List className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>

				{/* 游戏网格/列表 */}
				<div className="min-h-[65vh]">
					{filteredGameContents.length > 0 ? (
						<div
							className={
								viewMode === "grid"
									? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-8"
									: "space-y-4 mb-8"
							}
						>
							{filteredGameContents.map((game) => (
								<div key={game.id} className="w-full">
									<GameCard
										name={game.gameLocaleName || game.name}
										slug={game.slug}
										image={game.screenshotUrl}
										rating={game.gameInfo?.rating}
									/>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-12 bg-muted/50 rounded-lg mb-8">
							<p className="text-muted-foreground text-lg">
								{t("GameList.noGamesFound")}
							</p>
							{(selectedCategory || selectedTag || debouncedFilterQuery) && (
								<button
									type="button"
									onClick={handleClearFilters}
									className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
								>
									{t("GameList.clearFilters")}
								</button>
							)}
						</div>
					)}
				</div>

				{/* 分页 */}
				{totalPages > 1 && (
					<GameListPagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={handlePageChange}
					/>
				)}
			</main>
		</div>
	)
}
