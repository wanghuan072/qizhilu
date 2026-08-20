import { useCallback, useEffect, useState } from "react"

interface UseFavoriteGameReturn {
	isFavorited: boolean
	handleFavorite: () => void
}

const FAVORITE_STORAGE_KEY = "favorite_games"

/**
 * 自定义 Hook：管理游戏收藏状态
 * 使用 localStorage 持久化收藏状态
 */
export const useFavoriteGame = (gameId: string): UseFavoriteGameReturn => {
	const [isFavorited, setIsFavorited] = useState(false)

	// 获取收藏游戏列表
	const getFavoriteGames = useCallback((): string[] => {
		if (typeof window === "undefined") return []
		try {
			const stored = localStorage.getItem(FAVORITE_STORAGE_KEY)
			return stored ? JSON.parse(stored) : []
		} catch (e) {
			console.error("获取收藏游戏列表失败", e)
			return []
		}
	}, [])

	// 保存收藏游戏列表
	const saveFavoriteGames = useCallback((games: string[]): void => {
		if (typeof window === "undefined") return
		try {
			localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(games))
		} catch (e) {
			console.error("保存收藏游戏列表失败", e)
		}
	}, [])

	// 初始化时从 localStorage 中读取收藏状态
	useEffect(() => {
		if (!gameId) return
		const favoriteGames = getFavoriteGames()
		setIsFavorited(favoriteGames.includes(gameId))
	}, [gameId, getFavoriteGames])

	// 切换收藏状态
	const handleFavorite = useCallback(() => {
		if (typeof window === "undefined" || !gameId) return

		// 获取当前收藏的游戏列表
		let favoriteGames = getFavoriteGames()

		// 切换收藏状态
		if (isFavorited) {
			// 如果已收藏，则移除
			favoriteGames = favoriteGames.filter((id) => id !== gameId)
		} else {
			// 如果未收藏，则添加
			favoriteGames.push(gameId)
		}

		// 更新 localStorage
		saveFavoriteGames(favoriteGames)

		// 更新状态
		setIsFavorited(!isFavorited)

		// 触发自定义事件通知其他组件
		window.dispatchEvent(new CustomEvent("favoriteGamesUpdated"))
	}, [gameId, isFavorited, getFavoriteGames, saveFavoriteGames])

	return {
		isFavorited,
		handleFavorite,
	}
}
