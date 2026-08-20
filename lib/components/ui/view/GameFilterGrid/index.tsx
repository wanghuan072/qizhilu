"use client"
import { Icon } from "@/lib/components/common"
import { GameCard } from "@/lib/components/ui/view/GamePage/components/GameCard"
import { GameData, GameTag } from "@/lib/types"
import React, { useEffect, useState } from "react"

// 定义组件 Props
interface GameFilterGridProps {
	games: GameData[]
	title?: string
}

export const GameFilterGrid: React.FC<GameFilterGridProps> = ({
	games,
	title = "Games",
}) => {
	// 状态管理
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedTags, setSelectedTags] = useState<GameTag[]>([])
	const [filteredGames, setFilteredGames] = useState<GameData[]>(games)
	const [sortOrder, setSortOrder] = useState("newest")

	// 获取所有可用的标签
	const allTags = React.useMemo(() => {
		const tags = new Set<GameTag>()
		games.forEach((game) => {
			if (game.tags) {
				game.tags.forEach((tag) => tags.add(tag))
			}
		})
		return Array.from(tags)
	}, [games])

	// 处理搜索和筛选
	useEffect(() => {
		let result = [...games]

		// 应用搜索过滤
		if (searchTerm.trim() !== "") {
			result = result.filter((game) =>
				(game.gameLocaleName || game.name)
					.toLowerCase()
					.includes(searchTerm.toLowerCase()),
			)
		}

		// 应用标签过滤
		if (selectedTags.length > 0) {
			result = result.filter((game) => {
				if (!game.tags) return false
				return selectedTags.every((tag) => game.tags?.includes(tag))
			})
		}

		// 应用排序
		if (sortOrder === "newest") {
			// 按ID排序（假设ID越大越新）
			result.sort((a, b) => b.id.localeCompare(a.id))
		} else if (sortOrder === "popular") {
			// 简化的人气排序
			result.sort((a, b) => b.id.localeCompare(a.id))
		} else if (sortOrder === "a-z") {
			// 按标题字母顺序排序
			result.sort((a, b) =>
				(a.gameLocaleName || a.name).localeCompare(b.gameLocaleName || b.name),
			)
		}

		setFilteredGames(result)
	}, [searchTerm, selectedTags, sortOrder, games])

	// 处理搜索输入
	const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
	}

	// 处理标签选择
	const handleTagToggle = (tag: GameTag) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		)
	}

	// 处理排序选择
	const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSortOrder(e.target.value)
	}

	return (
		<>
			{/* Search and filter */}
			<div className="bg-white rounded-lg shadow-md p-4 mb-8">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="relative flex-grow">
						<input
							type="text"
							placeholder="Search games..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							value={searchTerm}
							onChange={handleSearchInput}
							aria-label="Search games"
						/>
						<Icon
							name="Search"
							className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
							size={20}
						/>
					</div>
					<div className="relative">
						<select
							className="appearance-none bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							value={sortOrder}
							onChange={handleSortChange}
							aria-label="Sort games"
						>
							<option value="newest">Newest</option>
							<option value="popular">Popular</option>
							<option value="a-z">A-Z</option>
						</select>
					</div>
				</div>

				{/* Tags filter */}
				{allTags.length > 0 && (
					<div className="mt-4">
						<div className="flex items-center mb-2">
							<Icon
								name="Tag"
								className="h-4 w-4 mr-2 text-gray-500"
								size={16}
							/>
							<span className="text-sm font-medium text-gray-700">
								Filter by tags:
							</span>
						</div>
						<div className="flex flex-wrap gap-2">
							{allTags.map((tag) => (
								<button
									key={tag.id}
									onClick={() => handleTagToggle(tag)}
									className={`px-3 py-1 text-xs rounded-full transition-colors ${
										selectedTags.includes(tag)
											? "bg-indigo-600 text-white"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									{tag.name}
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Games grid */}
			<div className="mb-8">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-gray-900">
						{title}{" "}
						<span className="text-gray-500 text-lg">
							({filteredGames.length})
						</span>
					</h2>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
					{filteredGames.length > 0 ? (
						filteredGames.map((game) => (
							<div key={game.id} className="w-full">
								<GameCard
									name={game.gameLocaleName || game.name}
									slug={game.slug}
									image={game.screenshotUrl}
									rating={game.gameInfo?.rating}
								/>
							</div>
						))
					) : (
						<div className="col-span-full text-center py-12 bg-muted/50 rounded-lg">
							<p className="text-muted-foreground">
								No games found matching your criteria.
							</p>
						</div>
					)}
				</div>
			</div>
		</>
	)
}
