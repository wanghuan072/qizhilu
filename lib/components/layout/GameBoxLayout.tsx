"use client"

import { SafeSidebarProvider, useSidebar } from "@/lib/hooks/use-sidebar"
import { GameCategory } from "@/lib/types"
import { ReactNode, useEffect, useState } from "react"
import { CategorySidebar } from "../sidebar/CategorySidebar"

interface GameBoxLayoutProps {
	children: ReactNode
	categories: GameCategory[]
}

function GameBoxLayoutInner({ children, categories }: GameBoxLayoutProps) {
	const { isExpanded, setIsExpanded, setIsGameBox } = useSidebar()
	const [isMobileExpanded, setIsMobileExpanded] = useState(false)

	useEffect(() => {
		// 有此Layout時，就設定isGameBox為true
		setIsGameBox(true)
		// 检查是否为移动设备（小于 768px）
		const isMobile = window.innerWidth < 768
		setIsExpanded(false) // 默认收起状态

		// 添加窗口大小变化监听器
		const handleResize = () => {
			const isMobile = window.innerWidth < 768
			if (!isMobile) {
				setIsMobileExpanded(false)
			}
		}

		window.addEventListener("resize", handleResize)

		// 清理监听器
		return () => {
			window.removeEventListener("resize", handleResize)
		}
	}, [])

	return (
		<div className="relative min-h-screen">
			{/* Sidebar */}
			<CategorySidebar
				categories={categories}
				isExpanded={isExpanded}
				isMobileExpanded={isMobileExpanded}
				onToggle={() => {
					const isMobile = window.innerWidth < 768
					if (isMobile) {
						setIsMobileExpanded(!isMobileExpanded)
					} else {
						setIsExpanded(!isExpanded)
					}
				}}
			/>

			{/* Main Content - 包含整个页面内容 */}
			<div className="md:ml-[40px] ml-0 transition-all duration-300 bg-background">
				{children}
			</div>
		</div>
	)
}

export function GameBoxLayout({ children, categories }: GameBoxLayoutProps) {
	return (
		<SafeSidebarProvider>
			<GameBoxLayoutInner categories={categories}>
				{children}
			</GameBoxLayoutInner>
		</SafeSidebarProvider>
	)
}
