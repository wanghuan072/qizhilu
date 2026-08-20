"use client"

import {
	SidebarBottomSlot,
	SidebarMiddleSlot,
	SidebarTopSlot,
} from "@/lib/components/ads"
import cachedSiteSettings from "@/lib/config/siteSettings"
import { AdSettings, GameData } from "@/lib/types/api-types"
import { AdDataBase, GameDataBase, GameDataListType } from "@/lib/types/game"
import { getGameSlug } from "@/lib/utils/navigation"
import { cn } from "@/lib/utils/react/styles"
import { Link } from "@i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import React, { useEffect, useState, useRef } from "react"
import ClientImage from "../../ClientImage"

interface RightSidebarProps {
	ads: AdSettings[]
	popularGames: GameDataListType
	latestGames: GameDataListType
	className?: string
	variant?: "sidebar" | "inline" | "compact"
}

export const GameRightSidebar: React.FC<RightSidebarProps> = ({
	popularGames,
	latestGames,
	ads,
	className,
	variant = "sidebar",
}) => {
	const t = useTranslations("Game")
	const locale = useLocale()

	// 轮播相关状态
	const [popularIndex, setPopularIndex] = useState(0)
	const [latestIndex, setLatestIndex] = useState(0)
	const popularIntervalRef = useRef<NodeJS.Timeout | null>(null)
	const latestIntervalRef = useRef<NodeJS.Timeout | null>(null)
	const isCarouselMode = variant === "inline" // 只在inline模式下启用轮播

	// 轮播配置
	const ITEMS_PER_PAGE = 2 // 每页显示2个游戏
	const CAROUSEL_INTERVAL = 4000 // 4秒轮播一次

	// 自动轮播效果 - 热门游戏
	useEffect(() => {
		if (!isCarouselMode || popularGames.length <= ITEMS_PER_PAGE) return

		const totalPages = Math.ceil(popularGames.length / ITEMS_PER_PAGE)

		popularIntervalRef.current = setInterval(() => {
			setPopularIndex((prevIndex) => (prevIndex + 1) % totalPages)
		}, CAROUSEL_INTERVAL)

		return () => {
			if (popularIntervalRef.current) {
				clearInterval(popularIntervalRef.current)
			}
		}
	}, [isCarouselMode, popularGames.length])

	// 自动轮播效果 - 最新游戏
	useEffect(() => {
		if (!isCarouselMode || latestGames.length <= ITEMS_PER_PAGE) return

		const totalPages = Math.ceil(latestGames.length / ITEMS_PER_PAGE)

		// 延迟2秒启动最新游戏轮播，避免与热门游戏同时切换
		const startDelay = setTimeout(() => {
			latestIntervalRef.current = setInterval(() => {
				setLatestIndex((prevIndex) => (prevIndex + 1) % totalPages)
			}, CAROUSEL_INTERVAL)
		}, CAROUSEL_INTERVAL / 2) // 延迟一半时间

		return () => {
			clearTimeout(startDelay)
			if (latestIntervalRef.current) {
				clearInterval(latestIntervalRef.current)
			}
		}
	}, [isCarouselMode, latestGames.length])

	// 渲染游戏卡片的函数 - 支持不同变体
	const renderGameCard = (game: GameDataBase) => {
		const isCompact = variant === "compact"
		const isInline = variant === "inline"

		return (
			<Link
				href={getGameSlug(game.slug)}
				className={cn(
					"group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-md flex flex-col touch-manipulation",
					isCompact
						? "h-[90px]"
						: isInline
							? "h-[120px] sm:h-[140px]"
							: "h-[104px]",
				)}
				locale={locale === cachedSiteSettings.defaultLocale ? "." : locale}
			>
				<div
					className={cn(
						"overflow-hidden rounded-lg",
						isCompact
							? "h-[90px]"
							: isInline
								? "h-[120px] sm:h-[140px]"
								: "h-[104px]",
					)}
				>
					<ClientImage
						src={game.screenshotUrl || ""}
						alt={game.name}
						className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
					/>
				</div>
				{/* 悬停效果覆盖层 */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
					<span
						className={cn(
							"font-medium text-white truncate",
							isCompact ? "text-xs" : isInline ? "text-base" : "text-sm",
						)}
					>
						{game.name}
					</span>
				</div>
			</Link>
		)
	}

	// 渲染游戏列表的函数 - 支持不同变体
	const renderGameList = (games: GameDataListType) => {
		if (!games || games.length === 0) return null

		// 直接渲染游戏卡片，不插入广告
		const gameCards = games.map((game) => (
			<div key={game.id}>{renderGameCard(game)}</div>
		))

		return gameCards
	}

	// 渲染轮播列表的函数 - SEO友好，所有内容都在DOM中
	const renderCarouselList = (games: GameDataListType, sectionId: string) => {
		if (!games || games.length === 0) return null

		if (games.length <= ITEMS_PER_PAGE) {
			// 如果游戏数量不超过每页显示数量，直接显示网格
			return (
				<div className="grid grid-cols-2 gap-2">
					{games.map((game) => (
						<div key={game.id}>{renderGameCard(game)}</div>
					))}
				</div>
			)
		}

		const totalPages = Math.ceil(games.length / ITEMS_PER_PAGE)
		const currentSectionIndex =
			sectionId === "popular" ? popularIndex : latestIndex
		const currentPage = currentSectionIndex % totalPages

		// 计算当前页应该显示的游戏
		const startIndex = currentPage * ITEMS_PER_PAGE
		const currentPageGames = games.slice(
			startIndex,
			startIndex + ITEMS_PER_PAGE,
		)

		return (
			<div className="relative">
				{/* 显示当前页的游戏 */}
				<div className="grid grid-cols-2 gap-2">
					{currentPageGames.map((game) => (
						<div key={`${sectionId}-${game.id}`}>{renderGameCard(game)}</div>
					))}
					{/* 如果当前页游戏数量不足2个，添加空白占位保持布局 */}
					{currentPageGames.length < ITEMS_PER_PAGE && (
						<div className="invisible">
							<div className="h-[120px] sm:h-[140px]"></div>
						</div>
					)}
				</div>

				{/* 隐藏的SEO内容 - 所有其他游戏都在DOM中但不可见 */}
				<div className="sr-only">
					{games.map((game, index) => {
						// 不重复渲染当前页的游戏
						if (index >= startIndex && index < startIndex + ITEMS_PER_PAGE) {
							return null
						}
						return (
							<div key={`seo-${sectionId}-${game.id}`}>
								{renderGameCard(game)}
							</div>
						)
					})}
				</div>

				{/* 轮播指示器 */}
				<div className="flex justify-center mt-3 space-x-1">
					{Array.from({ length: totalPages }, (_, pageIndex) => (
						<div
							key={pageIndex}
							className={cn(
								"w-2 h-2 rounded-full transition-colors duration-300",
								pageIndex === currentPage
									? "bg-primary"
									: "bg-gray-300 dark:bg-gray-600",
							)}
						/>
					))}
				</div>
			</div>
		)
	}

	// 获取网格配置
	const getGridConfig = () => {
		switch (variant) {
			case "compact":
				return {
					gridCols: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-2",
					titleSize: "text-base sm:text-lg",
					linkSize: "text-sm",
					iconSize: "h-4 w-4",
				}
			case "inline":
				return {
					gridCols: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
					titleSize: "text-lg sm:text-xl",
					linkSize: "text-sm sm:text-base",
					iconSize: "h-4 w-4 sm:h-5 sm:w-5",
				}
			default: // sidebar
				return {
					gridCols: "grid-cols-1 xl:grid-cols-2", // 在超大屏幕才使用2列
					titleSize: "text-lg",
					linkSize: "text-sm",
					iconSize: "h-4 w-4",
				}
		}
	}

	const gridConfig = getGridConfig()

	return (
		<div
			className={cn(
				"space-y-4 w-full",
				variant === "sidebar" ? "lg:space-y-6" : "",
				className,
			)}
		>
			{/* 顶部广告位 - 根据变体调整 */}
			<SidebarTopSlot />

			{/* 热门游戏 */}
			{popularGames.length > 0 && (
				<div
					className={cn(
						"rounded-lg bg-card shadow-sm overflow-hidden",
						variant === "inline" ? "p-3 sm:p-4" : "p-2",
					)}
				>
					<Link
						href="/games/popular"
						locale={locale === cachedSiteSettings.defaultLocale ? "." : locale}
						className="block mb-4"
					>
						<h3
							className={cn(
								"font-semibold text-card-foreground border-b pb-2 border-border hover:text-primary transition-colors duration-200 cursor-pointer",
								gridConfig.titleSize,
							)}
						>
							{t("hotGamesTitle") || "Popular Games"}
						</h3>
					</Link>
					{isCarouselMode ? (
						renderCarouselList(popularGames, "popular")
					) : (
						<div className={cn("grid gap-2", gridConfig.gridCols)}>
							{renderGameList(popularGames)}
						</div>
					)}
				</div>
			)}
			<SidebarMiddleSlot />
			{/* 最新游戏 */}
			{latestGames.length > 0 && (
				<div
					className={cn(
						"rounded-lg bg-card shadow-sm overflow-hidden",
						variant === "inline" ? "p-3 sm:p-4" : "p-2",
					)}
				>
					<Link
						href="/games/new-game"
						locale={locale === cachedSiteSettings.defaultLocale ? "." : locale}
						className="block mb-4"
					>
						<h3
							className={cn(
								"font-semibold text-card-foreground border-b pb-2 border-border hover:text-primary transition-colors duration-200 cursor-pointer",
								gridConfig.titleSize,
							)}
						>
							{t("latestGamesTitle") || "最新游戏"}
						</h3>
					</Link>
					{isCarouselMode ? (
						renderCarouselList(latestGames, "latest")
					) : (
						<div className={cn("grid gap-2", gridConfig.gridCols)}>
							{renderGameList(latestGames)}
						</div>
					)}
				</div>
			)}

			{/* 底部广告位 */}
			<SidebarBottomSlot />
		</div>
	)
}

export default GameRightSidebar
