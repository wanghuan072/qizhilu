"use client"

import { cn } from "@/lib/utils/react/styles"
import { useTranslations } from "next-intl"

interface LoadMoreProps {
	isLoading: boolean
	onLoadMore: () => Promise<void> | void
	remainingCount: number
	className?: string
}

export function LoadMore({
	isLoading,
	onLoadMore,
	remainingCount,
	className,
}: LoadMoreProps) {
	const t = useTranslations("Common")

	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center py-8",
				className,
			)}
		>
			{/* 剩余数量提示 */}
			<p className="text-sm text-muted-foreground mb-4">
				{t("remainingGames", { count: remainingCount })}
			</p>

			{/* 加载更多按钮 */}
			<button
				type="button"
				onClick={onLoadMore}
				disabled={isLoading}
				className={cn(
					"px-8 py-3 rounded-lg font-medium transition-all duration-200",
					"bg-primary text-white hover:bg-primary/90",
					"disabled:opacity-50 disabled:cursor-not-allowed",
					"flex items-center gap-2",
				)}
			>
				{isLoading ? (
					<>
						<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
						<span>{t("loading")}</span>
					</>
				) : (
					<span>{t("loadMore")}</span>
				)}
			</button>

			{/* 加载进度指示器 */}
			{isLoading && (
				<div className="mt-4 w-32 h-1 bg-muted rounded-full overflow-hidden">
					<div className="h-full bg-primary rounded-full animate-pulse" />
				</div>
			)}
		</div>
	)
}
