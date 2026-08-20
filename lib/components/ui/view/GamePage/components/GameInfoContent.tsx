"use client"

import cachedSiteSettings from "@/lib/config/siteSettings"
import { GameCategory, GameInfo, GameTag } from "@/lib/types/api-types"
import { Link } from "@i18n/navigation"
import { Hash } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { isEmpty } from "radash"
import React from "react"

interface GameInfoContentProps {
	gameInfo: GameInfo
	categories: GameCategory[]
	tags: GameTag[]
}

/**
 * 游戏信息内容组件
 * 显示游戏详细信息和标签
 */
const GameInfoContent: React.FC<GameInfoContentProps> = ({
	categories,
	tags,
	gameInfo,
}) => {
	const t = useTranslations("Game")
	const locale = useLocale()

	// 渲染星级评分
	const renderStars = (rating: number) => {
		const fullStars = Math.floor(rating)
		const emptyStars = 5 - fullStars
		const stars = "★".repeat(fullStars) + "☆".repeat(emptyStars)
		return (
			<div className="flex items-center">
				<div className="stars text-amber-400 mr-2">{stars}</div>
				<span>
					{rating} ({t("rating")})
				</span>
			</div>
		)
	}

	// 渲染平台图标
	const renderPlatformIcons = (platformValue: string) => {
		if (!platformValue) return null

		const platforms = platformValue.split(/,\s*/) // 分割平台字符串
		return (
			<div className="flex items-center flex-wrap gap-1">
				{platforms.map((platform, idx) => {
					const icon = platform.trim().charAt(0).toUpperCase() // 获取平台首字母作为图标
					return (
						<React.Fragment key={idx}>
							<span className="platform-icon bg-gray-200 text-gray-700 rounded px-1">
								{icon}
							</span>
							<span className="mr-2">
								{platform.trim()}
								{idx < platforms.length - 1 ? "," : ""}
							</span>
						</React.Fragment>
					)
				})}
			</div>
		)
	}

	// 根据值类型判断渲染方式
	const renderValue = (key: string, value: any) => {
		if (key === "rating" && typeof value === "number") {
			return renderStars(value)
		}
		if (key === "platform" && typeof value === "string") {
			return renderPlatformIcons(value)
		}
		return <span>{value}</span>
	}

	// 渲染单个游戏信息项
	const renderGameInfoItem = (key: keyof GameInfo, value: any) => {
		if (isEmpty(value)) return null

		return (
			<div className="game-info-item flex">
				<div className="info-label w-1/3 text-muted-foreground font-medium">
					{t(key)}:
				</div>
				<div className="info-value w-2/3 text-foreground">
					{renderValue(key, value)}
				</div>
			</div>
		)
	}

	return (
		<div className="game-info-section">
			{/* 游戏详细信息 */}
			<div className="game-details-container space-y-4">
				{renderGameInfoItem("developer", gameInfo.developer)}
				{renderGameInfoItem("releaseDate", gameInfo.releaseDate)}
				{renderGameInfoItem("technology", gameInfo.technology)}
				{renderGameInfoItem("platform", gameInfo.platform)}
				{renderGameInfoItem("ageRating", gameInfo.ageRating)}
				{renderGameInfoItem("localization", gameInfo.localization)}
				{renderGameInfoItem("screenOrientation", gameInfo.screenOrientation)}
				{renderGameInfoItem("cloudSaves", gameInfo.cloudSaves)}
				{renderGameInfoItem(
					"authorizationSupport",
					gameInfo.authorizationSupport,
				)}
				{renderGameInfoItem("rating", gameInfo.rating)}
			</div>

			{/* 游戏分类 */}
			{categories && categories.length > 0 && (
				<div className="game-categories mt-6">
					<h3 className="text-lg font-semibold mb-3 text-foreground">
						{t("categories")}
					</h3>
					<div className="categories-path flex items-center text-sm flex-wrap gap-2">
						{categories.map((category, index) => (
							<React.Fragment key={category.code}>
								<Link
									title={category.name}
									aria-label={category.name}
									href={`/c/${category.slug}`}
									className="text-primary hover:underline"
									locale={
										locale === cachedSiteSettings.defaultLocale ? "." : locale
									}
								>
									{category.name}
								</Link>
								{index < categories.length - 1 && (
									<span className="text-muted-foreground">{","}</span>
								)}
							</React.Fragment>
						))}
					</div>
				</div>
			)}

			{/* 游戏标签 */}
			{tags && tags.length > 0 && (
				<div className="game-tags mt-6">
					<h3 className="text-lg font-semibold mb-3 text-foreground">
						{t("tags")}
					</h3>
					<div className="tags-container flex flex-wrap gap-2">
						{tags.slice(0, 5).map((tag) => (
							<Link
								title={tag.name}
								aria-label={tag.name}
								key={tag.id}
								href={`/tag/${tag.slug}`}
								locale={
									locale === cachedSiteSettings.defaultLocale ? "." : locale
								}
								className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-full bg-card hover:bg-accent cursor-pointer transition-all duration-200 group hover:shadow-md"
							>
								<Hash className="h-3 w-3 text-primary group-hover:text-accent-foreground" />
								<span className="text-sm font-medium text-foreground group-hover:text-accent-foreground">
									{tag.name}
								</span>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default GameInfoContent
export { GameInfoContent }
