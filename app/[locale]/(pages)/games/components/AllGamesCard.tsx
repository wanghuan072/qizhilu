"use client"

import ClientImage from "@/lib/components/ui/view/ClientImage"
import { defaultLocale } from "@/lib/i18n/locales"
import { Link } from "@/lib/i18n/navigation"
import { getGameSlug } from "@/lib/utils/navigation"
import { useLocale, useTranslations } from "next-intl"
import React, { memo } from "react"

interface AllGamesCardProps {
	slug: string
	name: string
	image: string
	categories?: string[]
}

const AllGamesCard: React.FC<AllGamesCardProps> = ({
	slug,
	name,
	image,
	categories,
}) => {
	const locale = useLocale()
	const t = useTranslations("GameList")
	// 获取游戏类型/分类
	const getGameCategory = () => {
		if (categories && categories.length > 0) {
			return categories[0]
		}
		return "Game"
	}

	return (
		<Link
			href={getGameSlug(slug)}
			className="group block rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-2xl bg-white dark:bg-gray-800"
			title={t("playGame", { gameName: name })}
			locale={locale === defaultLocale ? "." : locale}
		>
			{/* 游戏图片区域 */}
			<div className="relative aspect-video overflow-hidden">
				{image ? (
					<ClientImage
						src={image}
						alt={name}
						width={300}
						height={169}
						className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
					/>
				) : (
					<div className="w-full h-full bg-black/20 dark:bg-muted flex items-center justify-center">
						<div className="text-white/60 dark:text-muted-foreground text-sm">
							{t("noImage")}
						</div>
					</div>
				)}
			</div>

			{/* 底部信息区 */}
			<div className="bg-gray-800 dark:bg-card rounded-b-xl px-4 py-3 h-16 flex flex-col justify-center dark:border dark:border-t-0 dark:border-border transition-all duration-300 group-hover:translate-y-[-2px]">
				<h3 className="text-sm font-bold text-white dark:text-card-foreground mb-1 line-clamp-1">
					{name}
				</h3>
				<p className="text-xs text-white/60 dark:text-muted-foreground line-clamp-1">
					{getGameCategory()}
				</p>
			</div>
		</Link>
	)
}

// 使用 memo 包装组件
const MemoizedAllGamesCard = memo(AllGamesCard)
MemoizedAllGamesCard.displayName = "AllGamesCard"

export { MemoizedAllGamesCard as AllGamesCard }
export default MemoizedAllGamesCard
