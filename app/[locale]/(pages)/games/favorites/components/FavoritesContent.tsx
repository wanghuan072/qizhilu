"use client"

import { AllGamesContent } from "../../components/AllGamesContent"
import { useFavoriteGames } from "@/lib/hooks/useFavoriteGames"
import {
	AdSettings,
	AllGameDataListType,
	GameCategory,
	GameTag,
	OptimizedGameData,
} from "@/lib/types"
import { useTranslations } from "next-intl"
import { useMemo } from "react"

// 转换为优化的游戏数据
function transformToOptimizedGames(games: any[]): OptimizedGameData[] {
	return games
		.filter((game) => !("codeText" in game && "type" in game)) // 过滤掉广告
		.map((game) => ({
			id: game.id,
			name: game.name,
			slug: game.slug,
			screenshotUrl: game.screenshotUrl,
			rating: game.gameInfo?.rating,
			description: game.gameLocaleDescription,
			isPrimary: game.isPrimary || false,
			categories:
				game.categories?.map((cat: any) => ({
					slug: cat.slug,
					name: cat.name,
				})) || [],
			tags:
				game.tags?.map((tag: any) => ({
					slug: tag.slug,
					name: tag.name,
				})) || [],
		}))
}

interface FavoritesContentProps {
	title: string
	description: string
	allGames: AllGameDataListType
	categories: GameCategory[]
	tags: GameTag[]
	ads: AdSettings[]
}

export function FavoritesContent({
	title,
	description,
	allGames,
	categories,
	tags,
	ads,
}: FavoritesContentProps) {
	const t = useTranslations()
	const favoriteGameIds = useFavoriteGames()

	// 根据收藏的游戏ID筛选游戏数据
	const favoriteGames = useMemo(() => {
		if (favoriteGameIds.length === 0) return []

		// 过滤出收藏的游戏
		const games = favoriteGameIds
			.map((gameId) =>
				allGames.find(
					(game) =>
						!("codeText" in game && "type" in game) &&
						game.id.toString() === gameId,
				),
			)
			.filter((game) => game !== undefined)

		// 转换为优化的游戏数据
		return transformToOptimizedGames(games)
	}, [allGames, favoriteGameIds])

	// 如果没有收藏的游戏，显示空状态
	if (favoriteGameIds.length === 0) {
		return (
			<>
				{/* 左侧边栏 - 使用现有的 AllGamesContent 结构 */}
				<AllGamesContent
					title={title}
					description={description}
					games={[]}
					categories={categories}
					tags={tags}
					ads={ads}
				/>
			</>
		)
	}

	return (
		<>
			{/* 使用现有的 AllGamesContent 组件，但传入筛选后的游戏 */}
			<AllGamesContent
				title={title}
				description={description}
				games={favoriteGames as any}
				categories={categories}
				tags={tags}
				ads={ads}
			/>
		</>
	)
}
