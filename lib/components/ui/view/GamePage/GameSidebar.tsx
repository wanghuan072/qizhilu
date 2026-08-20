"use client"

import { AdSettings } from "@/lib/types/api-types"
import { GameDataListType } from "@/lib/types/game"
import { cn } from "@/lib/utils/react/styles"
import { GameRightSidebar } from "./components/GameRightSidebar"

interface GameSidebarProps {
	ads: AdSettings[]
	popularGames: GameDataListType
	latestGames: GameDataListType
	variant?: "sidebar" | "inline" | "compact"
	className?: string
}

export default function GameSidebar({
	ads,
	popularGames,
	latestGames,
	variant = "sidebar",
	className,
}: GameSidebarProps) {
	// 根据variant选择不同的容器样式
	const getContainerStyles = () => {
		switch (variant) {
			case "inline":
				return "w-full my-6"
			case "compact":
				return "w-full my-4"
			default: // sidebar
				return "w-full" // 宽度控制移到外层容器
		}
	}

	return (
		<div className={cn(getContainerStyles(), className)}>
			<GameRightSidebar
				ads={ads}
				popularGames={popularGames}
				latestGames={latestGames}
				variant={variant}
			/>
		</div>
	)
}
