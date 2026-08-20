"use client"

import { Button } from "@/lib/components/ui/button"
import { Input } from "@/lib/components/ui/input"
import { ScrollArea } from "@/lib/components/ui/scroll-area"
import { GameCard } from "@/lib/components/ui/view/GamePage/components/GameCard"
import { Link } from "@/lib/i18n/navigation"
import { GameCategory, GameTag } from "@/lib/types/api-types"
import { getStableRandomIcon } from "@/lib/utils/icons"
import { LayoutGrid, Search, Tag, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"

// 搜索数据接口 - 精简版
interface SearchGameData {
	id: string
	slug: string
	name: string
	gameLocaleName?: string
	gameLocaleDescription?: string
	screenshotUrl?: string
	rating?: number
}

interface SearchData {
	games: SearchGameData[]
	categories: GameCategory[]
	tags: GameTag[]
}
interface MobileSearchModalProps {
	isOpen: boolean
	onClose: () => void
	locale: string
	searchData: SearchData
}

export function MobileSearchModal({
	isOpen,
	onClose,
	locale,
	searchData,
}: MobileSearchModalProps) {
	const t = useTranslations()
	const [searchQuery, setSearchQuery] = useState("")
	const [filteredGames, setFilteredGames] = useState<SearchGameData[]>([])

	// 从 props 中获取数据
	const { games: allGames, categories, tags } = searchData

	// 使用 useMemo 缓存带有随机图标的分类数组
	const categoriesWithIcons = useMemo(() => {
		return categories.map((category) => {
			// 如果分类已有图标，优先使用原有图标
			if (category.icon) {
				return { ...category, displayIcon: null }
			}

			// 基于分类的 slug 或名称生成稳定的随机图标
			const seedString = category.slug || category.name || category.code
			const IconComponent = getStableRandomIcon(
				seedString,
				"w-5 h-5 text-primary",
			)

			return { ...category, displayIcon: IconComponent }
		})
	}, [categories])

	// 初始化游戏列表
	useEffect(() => {
		if (isOpen && allGames.length > 0) {
			setFilteredGames(allGames.slice(0, 20)) // 默认显示前20个游戏
		}
	}, [isOpen, allGames])

	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredGames(allGames.slice(0, 20))
		} else {
			const filtered = allGames.filter((game) => {
				const name = game.gameLocaleName || game.name || ""
				const description = game.gameLocaleDescription || ""
				return (
					name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					description.toLowerCase().includes(searchQuery.toLowerCase())
				)
			})
			setFilteredGames(filtered.slice(0, 20))
		}
	}, [searchQuery, allGames])

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
			<div className="absolute inset-0 bg-background">
				{/* Header */}
				<div className="flex items-center gap-4 p-4 border-b border-border bg-card">
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="shrink-0 hover:bg-muted"
					>
						<X className="w-6 h-6 text-foreground" />
					</Button>
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
						<Input
							placeholder={t("Common.searchPlaceholder")}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 bg-muted/50 border-muted-foreground/20 focus:border-primary"
							autoFocus
						/>
					</div>
				</div>

				<ScrollArea className="h-[calc(100vh-80px)] bg-background">
					<div className="p-4 space-y-6">
						{/* 分类部分 */}
						<section>
							<h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
								<LayoutGrid className="w-5 h-5 text-primary" />
								{t("Common.Categories")}
							</h3>
							<div className="grid grid-cols-2 gap-3">
								{categoriesWithIcons.map((category) => {
									return (
										<Link
											key={category.code}
											href={`/c/${category.slug}`}
											className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
											onClick={onClose}
										>
											<span className="shrink-0">{category.displayIcon}</span>
											<span className="text-sm font-medium truncate text-foreground">
												{category.name}
											</span>
										</Link>
									)
								})}
							</div>
						</section>

						{/* 标签部分 */}
						{tags.length > 0 && (
							<section>
								<h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
									<Tag className="w-5 h-5 text-primary" />
									{t("GameList.tags")}
								</h3>
								<div className="flex flex-wrap gap-2">
									{tags.slice(0, 10).map((tag) => (
										<Link
											key={tag.id}
											href={`/tags/${tag.slug}`}
											className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
											onClick={onClose}
										>
											{tag.iconName && <span>{tag.iconName}</span>}
											<span>{tag.name}</span>
										</Link>
									))}
								</div>
							</section>
						)}

						{/* 游戏搜索结果 */}
						<section>
							<h3 className="text-lg font-semibold mb-3 text-foreground">
								{searchQuery
									? t("Common.searchResults")
									: t("Common.recommendedGames")}
							</h3>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
								{filteredGames.map((game) => (
									<div key={game.id} className="w-full" onClick={onClose}>
										<GameCard
											name={game.gameLocaleName || game.name}
											slug={game.slug}
											image={game.screenshotUrl}
											rating={game.rating}
										/>
									</div>
								))}
							</div>
							{filteredGames.length === 0 && searchQuery && (
								<div className="text-center py-8 bg-muted/20 rounded-lg">
									<p className="text-muted-foreground">
										{t("Common.noResultsFound")}
									</p>
								</div>
							)}
						</section>
					</div>
				</ScrollArea>
			</div>
		</div>
	)
}
