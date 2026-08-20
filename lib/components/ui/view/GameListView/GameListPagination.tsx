"use client"

import { cn } from "@/lib/utils/react/styles"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { useTranslations } from "next-intl"
import React from "react"

interface GameListPaginationProps {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

export const GameListPagination: React.FC<GameListPaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
	const t = useTranslations()

	// 生成页码数组
	const getPageNumbers = () => {
		const delta = 2 // 当前页前后显示的页码数
		const range = []
		const rangeWithDots = []

		// 计算需要显示的页码
		for (let i = 1; i <= totalPages; i++) {
			if (
				i === 1 || // 第一页
				i === totalPages || // 最后一页
				(i >= currentPage - delta && i <= currentPage + delta) // 当前页前后的页码
			) {
				range.push(i)
			}
		}

		let l = undefined
		// 添加省略号
		for (const i of range) {
			if (l) {
				if (i - l === 2) {
					// 如果页码间隔为2，则显示中间的页码
					rangeWithDots.push(l + 1)
				} else if (i - l !== 1) {
					// 如果页码间隔大于2，则显示省略号
					rangeWithDots.push("...")
				}
			}
			rangeWithDots.push(i)
			l = i
		}

		return rangeWithDots
	}

	if (totalPages <= 1) return null

	return (
		<nav
			className="flex items-center justify-center space-x-2"
			aria-label="Pagination"
		>
			{/* 上一页按钮 */}
			<button
				type="button"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage <= 1}
				className={cn(
					"flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
					currentPage <= 1
						? "border-border bg-muted text-muted-foreground cursor-not-allowed"
						: "border-border bg-background text-foreground hover:bg-muted",
				)}
				aria-label={t("GameList.previousPage")}
			>
				<ChevronLeft className="h-4 w-4" />
				<span className="hidden sm:inline">{t("GameList.previous")}</span>
			</button>

			{/* 页码按钮 */}
			<div className="flex items-center space-x-1">
				{getPageNumbers().map((pageNum, index) =>
					pageNum === "..." ? (
						<span
							key={`dots-${index}`}
							className="px-3 py-2 text-muted-foreground"
						>
							<MoreHorizontal className="h-4 w-4" />
						</span>
					) : (
						<button
							type="button"
							key={pageNum}
							onClick={() => onPageChange(Number(pageNum))}
							className={cn(
								"px-3 py-2 rounded-lg border transition-colors min-w-[40px]",
								currentPage === pageNum
									? "border-primary bg-primary text-primary-foreground"
									: "border-border bg-background text-foreground hover:bg-muted",
							)}
							aria-label={t("GameList.goToPage", { page: pageNum })}
							aria-current={currentPage === pageNum ? "page" : undefined}
						>
							{pageNum}
						</button>
					),
				)}
			</div>

			{/* 下一页按钮 */}
			<button
				type="button"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage >= totalPages}
				className={cn(
					"flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
					currentPage >= totalPages
						? "border-border bg-muted text-muted-foreground cursor-not-allowed"
						: "border-border bg-background text-foreground hover:bg-muted",
				)}
				aria-label={t("GameList.nextPage")}
			>
				<span className="hidden sm:inline">{t("GameList.next")}</span>
				<ChevronRight className="h-4 w-4" />
			</button>
		</nav>
	)
}
