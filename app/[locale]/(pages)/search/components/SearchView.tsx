"use client"

import { GameListPagination } from "@/lib/components/ui/view/GameListView/GameListPagination"
import { GameCard } from "@/lib/components/ui/view/GamePage/components/GameCard"
import {
	OptimizedSearchGameData,
	OptimizedSearchGamePageData,
} from "@/lib/types"
import { useRouter } from "@i18n/navigation"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { CategoryCard } from "./CategoryCard"
import { SearchForm } from "./SearchForm"
import { TagCard } from "./TagCard"

interface SearchViewProps {
	searchPageData: OptimizedSearchGamePageData
	resultsPerPage: number
}

export function SearchView({
	searchPageData,
	resultsPerPage,
}: SearchViewProps) {
	const t = useTranslations()
	const router = useRouter()
	const searchParams = useSearchParams()
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
	const [query, setQuery] = useState<string>("")
	const [currentPage, setCurrentPage] = useState<number>(1)

	// 从 URL 获取搜索参数
	useEffect(() => {
		const q = searchParams.get("q") || ""
		const page = searchParams.get("page") || "1"
		setQuery(q)
		setCurrentPage(Number.parseInt(page))
	}, [searchParams])

	const { games, categories, tags } = searchPageData

	// Search filtering
	const searchTerm = query?.toLowerCase() || ""
	const searchKeywords = searchTerm
		.split(/\s+/)
		.filter((keyword) => keyword.length > 0)

	// 辅助函数：检查文本是否包含所有关键词
	const matchesAllKeywords = (text: string) => {
		if (!text) return false
		const lowerText = text.toLowerCase()
		return searchKeywords.every((keyword) => lowerText.includes(keyword))
	}

	const filteredCategories = searchTerm
		? categories.data.filter((cat) => {
				return matchesAllKeywords(cat.name)
			})
		: []

	const filteredTags = searchTerm
		? tags.data.filter((tag) => {
				return matchesAllKeywords(tag.name)
			})
		: []

	const filteredGames = searchTerm
		? games.data.filter((game: OptimizedSearchGameData) => {
				return matchesAllKeywords(game.gameLocaleName || "")
			})
		: []

	// Pagination for games
	const totalGames = filteredGames.length
	const totalPages = Math.ceil(totalGames / resultsPerPage)
	const startIndex = (currentPage - 1) * resultsPerPage
	const paginatedGames = filteredGames.slice(
		startIndex,
		startIndex + resultsPerPage,
	)

	const handlePageChange = (page: number) => {
		const params = new URLSearchParams()
		if (query) {
			params.set("q", query)
		}
		if (page > 1) {
			params.set("page", page.toString())
		}

		const queryString = params.toString()
		const newURL = queryString ? `/search?${queryString}` : "/search"
		router.push(newURL)
	}

	const hasResults =
		filteredCategories.length > 0 ||
		filteredTags.length > 0 ||
		filteredGames.length > 0

	return (
		<div className="space-y-6">
			<SearchForm initialQuery={query} />

			{!query ? (
				<div className="text-center py-12 bg-muted/50 rounded-lg">
					<p className="text-muted-foreground text-lg">
						{t("Search.enterQuery")}
					</p>
				</div>
			) : !hasResults ? (
				<div className="text-center py-12 bg-muted/50 rounded-lg">
					<p className="text-muted-foreground text-lg">
						{t("Search.noResults", { query })}
					</p>
				</div>
			) : (
				<div className="space-y-8">
					{/* Categories */}
					{filteredCategories.length > 0 && (
						<div>
							<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
								<span>{t("Search.categories")}</span>
								<span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
									{filteredCategories.length}
								</span>
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
								{filteredCategories.map((category) => (
									<CategoryCard key={category.slug} category={category} />
								))}
							</div>
						</div>
					)}

					{/* Tags */}
					{filteredTags.length > 0 && (
						<div>
							<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
								<span>{t("Search.tags")}</span>
								<span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
									{filteredTags.length}
								</span>
							</h2>
							<div className="flex flex-wrap gap-2">
								{filteredTags.map((tag) => (
									<TagCard key={tag.id} tag={tag} />
								))}
							</div>
						</div>
					)}

					{/* Games */}
					{filteredGames.length > 0 && (
						<div>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold flex items-center gap-2">
									<span>{t("Search.games")}</span>
									<span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
										{totalGames}
									</span>
								</h2>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => setViewMode("grid")}
										className={`p-2 rounded-lg ${
											viewMode === "grid"
												? "bg-primary text-primary-foreground"
												: "bg-background text-foreground hover:bg-muted"
										}`}
									>
										Grid
									</button>
									<button
										type="button"
										onClick={() => setViewMode("list")}
										className={`p-2 rounded-lg ${
											viewMode === "list"
												? "bg-primary text-primary-foreground"
												: "bg-background text-foreground hover:bg-muted"
										}`}
									>
										List
									</button>
								</div>
							</div>

							<div
								className={
									viewMode === "grid"
										? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
										: "space-y-4"
								}
							>
								{paginatedGames.map((game: OptimizedSearchGameData) => (
									<div key={game.id} className="w-full">
										<GameCard
											name={game.gameLocaleName || game.name}
											slug={game.slug}
											image={game.screenshotUrl}
											rating={game.rating || 0}
										/>
									</div>
								))}
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="mt-6">
									<GameListPagination
										currentPage={currentPage}
										totalPages={totalPages}
										onPageChange={handlePageChange}
									/>
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	)
}
