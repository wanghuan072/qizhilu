"use client"
import { GameDataListType } from "@/lib/types/game"
import { cn } from "@/lib/utils/react/styles"
import { useTranslations } from "next-intl"
import React, { memo, useMemo, useState, useEffect, useRef } from "react"
import { GameCard } from "./GameCard"

interface RelatedGamesContentProps {
	items: GameDataListType
}

const RelatedGamesContent: React.FC<RelatedGamesContentProps> = ({ items }) => {
	const t = useTranslations("Game")

	// 轮播相关状态
	const [currentIndex, setCurrentIndex] = useState(0)
	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	// 轮播配置
	const ITEMS_PER_PAGE_MOBILE = 2 // 移动端每页显示2个游戏（1行2列）
	const CAROUSEL_INTERVAL = 5000 // 5秒轮播一次

	// 检测屏幕尺寸状态
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const checkScreenSize = () => {
			setIsMobile(window.innerWidth < 768) // md breakpoint
		}

		// 初始检测
		checkScreenSize()

		// 监听窗口尺寸变化
		window.addEventListener("resize", checkScreenSize)

		return () => window.removeEventListener("resize", checkScreenSize)
	}, [])

	// 自动轮播效果 - 只在移动端且游戏数量足够时启用
	useEffect(() => {
		const gameItems = items.filter(
			(item) => item && "name" in item && "slug" in item,
		)

		if (!isMobile || gameItems.length <= ITEMS_PER_PAGE_MOBILE) {
			// 清除现有轮播
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
			setCurrentIndex(0)
			return
		}

		const totalPages = Math.ceil(gameItems.length / ITEMS_PER_PAGE_MOBILE)

		intervalRef.current = setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages)
		}, CAROUSEL_INTERVAL)

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [items.length, isMobile])

	// 使用 useMemo 优化渲染项目的计算
	const renderedItems = useMemo(() => {
		return items
			.filter((item) => item !== null)
			.map((item, index) => {
				// 判断是否为广告数据（包含 codeText 属性）
				if ("codeText" in item) {
					// 暂时移除相关游戏中的广告功能
					return null
				}

				// 判断是否为游戏数据（包含 name 和 slug 属性）
				if ("name" in item && "slug" in item && item.name && item.slug) {
					return (
						<GameCard
							key={item.slug}
							name={item.name}
							slug={item.slug}
							image={item.screenshotUrl}
						/>
					)
				}

				return null
			})
			.filter((item) => item !== null)
	}, [items, t])

	// 移动端轮播渲染函数
	const renderMobileCarousel = () => {
		// 只筛选游戏项目，排除广告（游戏使用slug作为key，广告使用ad-前缀）
		const gameItems = renderedItems.filter(
			(item) =>
				item &&
				React.isValidElement(item) &&
				item.key &&
				!item.key.toString().startsWith("ad-"),
		)

		if (gameItems.length <= ITEMS_PER_PAGE_MOBILE) {
			// 如果游戏数量不足，直接显示网格
			return <div className="grid grid-cols-2 gap-2">{renderedItems}</div>
		}

		const totalPages = Math.ceil(gameItems.length / ITEMS_PER_PAGE_MOBILE)
		const currentPage = currentIndex % totalPages
		const startIndex = currentPage * ITEMS_PER_PAGE_MOBILE
		const currentPageItems = gameItems.slice(
			startIndex,
			startIndex + ITEMS_PER_PAGE_MOBILE,
		)

		return (
			<div className="relative">
				{/* 显示当前页的游戏 */}
				<div className="grid grid-cols-2 gap-2">
					{currentPageItems.map((item, index) => (
						<div key={`mobile-${startIndex + index}`}>{item}</div>
					))}
					{/* 如果当前页游戏数量不足，添加空白占位保持布局 */}
					{currentPageItems.length < ITEMS_PER_PAGE_MOBILE &&
						Array.from({
							length: ITEMS_PER_PAGE_MOBILE - currentPageItems.length,
						}).map((_, index) => (
							<div key={`empty-mobile-${index}`} className="invisible">
								<div className="h-[120px] sm:h-[140px]"></div>
							</div>
						))}
				</div>

				{/* 隐藏的SEO内容 - 所有其他游戏都在DOM中但不可见 */}
				<div className="sr-only">
					{gameItems.map((item, index) => {
						// 不重复渲染当前页的游戏
						if (
							index >= startIndex &&
							index < startIndex + ITEMS_PER_PAGE_MOBILE
						) {
							return null
						}
						return <div key={`seo-mobile-${index}`}>{item}</div>
					})}
				</div>

				{/* 轮播指示器 */}
				{totalPages > 1 && (
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
				)}
			</div>
		)
	}

	if (!renderedItems || renderedItems.length === 0) return <></>

	return (
		<div className="mt-4 space-y-2 bg-white dark:bg-gray-900 p-2 rounded-lg xl:shadow-md">
			<h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">
				{t("relatedGames")}
			</h2>
			{/* 移动端轮播 */}
			<div className="md:hidden">{renderMobileCarousel()}</div>
			{/* PC端网格 */}
			<div className="hidden md:block">
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
					{renderedItems}
				</div>
			</div>
		</div>
	)
}

// 使用 memo 包装主组件
const MemoizedRelatedGamesContent = memo(RelatedGamesContent)
MemoizedRelatedGamesContent.displayName = "RelatedGamesContent"

export { RelatedGamesContent as MemoizedRelatedGamesContent }
export default MemoizedRelatedGamesContent
