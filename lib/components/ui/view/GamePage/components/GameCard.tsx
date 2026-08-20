"use client"
import cachedSiteSettings from "@/lib/config/siteSettings"
import { OptimizedGameCardProps } from "@/lib/types/game"
import { getGameSlug } from "@/lib/utils/navigation"
import { Link } from "@i18n/navigation"
import { useLocale } from "next-intl"
import React, { useState } from "react"
import ClientImage from "../../ClientImage"
import { StarRating } from "./StarRating"

const GameCard: React.FC<OptimizedGameCardProps> = ({
	name,
	slug,
	image,
	rating,
	className,
}) => {
	const locale = useLocale()
	const [isHovered, setIsHovered] = useState(false)
	const isRecentGameCard = className?.includes("recent-game-card")

	return (
		<Link
			href={getGameSlug(slug)}
			className={`game-card group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 touch-manipulation ${className || ""}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			title={`Play ${name}`}
			locale={locale === cachedSiteSettings.defaultLocale ? "." : locale}
		>
			<div className="relative rounded-md overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800">
				<ClientImage
					src={image ?? ""}
					alt={name}
					width={isRecentGameCard ? 80 : 300}
					height={isRecentGameCard ? 50 : 250}
					className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
						isRecentGameCard ? "h-[50px]" : "aspect-[16/9] h-auto"
					}`}
				/>
				{/* 底部半透明蒙版 - 默认隐藏，鼠标悬停时显示 */}
				{!isRecentGameCard && (
					<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 transform translate-y-2 group-hover:translate-y-0">
						<h3 className="text-white dark:text-white text-sm font-bold text-left truncate">
							{name}
						</h3>
						{typeof rating === "number" && rating > 1 && (
							<div className="mt-1">
								<StarRating
									rating={rating}
									className="text-yellow-400"
									showRatingText={false}
								/>
							</div>
						)}
					</div>
				)}
				{/* 最近游戏卡片的底部蒙版 */}
				{isRecentGameCard && (
					<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1">
						<h3 className="text-white dark:text-white text-xs font-medium text-left leading-tight">
							{name}
						</h3>
					</div>
				)}
			</div>
		</Link>
	)
}

export { GameCard }
export default GameCard
