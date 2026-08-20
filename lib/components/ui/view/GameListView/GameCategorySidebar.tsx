"use client"

import { Icon } from "@/lib/components/common/Icon"
import { GameCategory, GameTag } from "@/lib/types"
import { getStableRandomIcon } from "@/lib/utils/icons"
import { cn } from "@/lib/utils/react/styles"
import { Tag, X } from "lucide-react"
import { useTranslations } from "next-intl"
import React, { useMemo } from "react"

interface GameCategorySidebarProps {
	categories: (GameCategory & { count: number })[]
	tags: (GameTag & { count: number })[]
	selectedCategory: string
	selectedTag: string
	onCategoryChange: (categoryCode: string) => void
	onTagChange: (tagSlug: string) => void
	className?: string
}

export const GameCategorySidebar: React.FC<GameCategorySidebarProps> = ({
	categories,
	tags,
	selectedCategory,
	selectedTag,
	onCategoryChange,
	onTagChange,
	className,
}) => {
	const t = useTranslations()

	// 为每个分类生成稳定的随机图标
	const categoriesWithIcons = useMemo(() => {
		return categories.map((category) => ({
			...category,
			displayIcon:
				category.icon || getStableRandomIcon(category.code, "w-16 h-16"),
		}))
	}, [categories])

	return (
		<div className={cn("bg-card rounded-lg p-4 space-y-6", className)}>
			{/* Popular Games 筛选项 */}
			<button
				type="button"
				onClick={() => onCategoryChange("popular")}
				className={cn(
					"w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2",
					selectedCategory === "popular"
						? "bg-primary text-primary-foreground"
						: "text-foreground hover:bg-muted",
				)}
			>
				<span className="text-sm font-medium">
					{t("GameList.hotGamesTitle") || "Popular Games"}
				</span>
			</button>

			{/* 分类列表（无标题、无 All Category） */}
			<div className="space-y-2 mt-2">
				{categoriesWithIcons.map((category) => (
					<button
						type="button"
						key={category.code}
						onClick={() => onCategoryChange(category.code)}
						className={cn(
							"w-full text-left px-3 py-2 rounded-lg transition-colors",
							selectedCategory === category.code
								? "bg-primary text-primary-foreground"
								: "text-foreground hover:bg-muted",
						)}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								{category.displayIcon}
								<span className="text-sm">{category.name}</span>
							</div>
							<span
								className={cn(
									"text-xs px-2 py-1 rounded",
									selectedCategory === category.code
										? "bg-primary-foreground/20"
										: "bg-muted text-muted-foreground",
								)}
							>
								{category.count}
							</span>
						</div>
					</button>
				))}
			</div>

			{/* 标签部分 */}
			{tags.length > 0 && (
				<div>
					<div className="flex items-center gap-2 mb-4">
						<Tag className="h-5 w-5 text-primary" />
						<h3 className="font-semibold text-foreground">
							{t("GameList.tags")}
						</h3>
					</div>

					<div className="space-y-2">
						{/* 全部标签选项 */}
						<button
							type="button"
							onClick={() => onTagChange("")}
							className={cn(
								"w-full text-left px-3 py-2 rounded-lg transition-colors",
								!selectedTag
									? "bg-primary text-primary-foreground"
									: "text-foreground hover:bg-muted",
							)}
						>
							<div className="flex items-center justify-between">
								<span>{t("GameList.allTags")}</span>
								<span
									className={cn(
										"text-xs px-2 py-1 rounded",
										!selectedTag
											? "bg-primary-foreground/20"
											: "bg-muted text-muted-foreground",
									)}
								>
									{tags.reduce((sum, tag) => sum + tag.count, 0)}
								</span>
							</div>
						</button>

						{/* 标签列表 */}
						{tags.map((tag) => (
							<button
								type="button"
								key={tag.slug}
								onClick={() => onTagChange(tag.id)}
								className={cn(
									"w-full text-left px-3 py-2 rounded-lg transition-colors",
									selectedTag === tag.id
										? "bg-primary text-primary-foreground"
										: "text-foreground hover:bg-muted",
								)}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{tag.iconName && (
											<span className="text-sm">{tag.iconName}</span>
										)}
										<span className="text-sm">{tag.name}</span>
									</div>
									<span
										className={cn(
											"text-xs px-2 py-1 rounded",
											selectedTag === tag.id
												? "bg-primary-foreground/20"
												: "bg-muted text-muted-foreground",
										)}
									>
										{tag.count}
									</span>
								</div>
							</button>
						))}
					</div>
				</div>
			)}

			{/* 当前筛选条件 */}
			{(selectedCategory || selectedTag) && (
				<div>
					<h4 className="font-medium text-foreground mb-3">
						{t("GameList.activeFilters")}
					</h4>
					<div className="space-y-2">
						{selectedCategory && (
							<div className="flex items-center justify-between bg-muted px-3 py-2 rounded-lg">
								<span className="text-sm text-foreground">
									{selectedCategory === "popular"
										? t("GameList.hotGamesTitle")
										: categoriesWithIcons.find(
												(cat) => cat.code === selectedCategory,
											)?.name}
								</span>
								<button
									type="button"
									onClick={() => onCategoryChange("")}
									className="text-muted-foreground hover:text-foreground"
									title={t("GameList.clearCategory")}
								>
									<X className="h-4 w-4" />
								</button>
							</div>
						)}
						{selectedTag && (
							<div className="flex items-center justify-between bg-muted px-3 py-2 rounded-lg">
								<span className="text-sm text-foreground">
									{tags.find((tag) => tag.id === selectedTag)?.name}
								</span>
								<button
									type="button"
									onClick={() => onTagChange("")}
									className="text-muted-foreground hover:text-foreground"
									title={t("GameList.clearTag")}
								>
									<X className="h-4 w-4" />
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
