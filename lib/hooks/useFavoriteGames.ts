import { useCallback, useEffect, useState } from "react"

const FAVORITE_STORAGE_KEY = "favorite_games"

/**
 * 自定义 Hook：获取收藏游戏列表
 * 使用 localStorage 持久化收藏状态
 */
export const useFavoriteGames = () => {
	const [favoriteGameIds, setFavoriteGameIds] = useState<string[]>([])

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

	// 初始化和监听存储变化
	useEffect(() => {
		// 初始加载
		setFavoriteGameIds(getFavoriteGames())

		// 监听存储变化
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === FAVORITE_STORAGE_KEY) {
				setFavoriteGameIds(getFavoriteGames())
			}
		}

		// 自定义事件监听（用于同一页面内的更新）
		const handleFavoriteUpdate = () => {
			setFavoriteGameIds(getFavoriteGames())
		}

		window.addEventListener("storage", handleStorageChange)
		window.addEventListener("favoriteGamesUpdated", handleFavoriteUpdate)

		return () => {
			window.removeEventListener("storage", handleStorageChange)
			window.removeEventListener("favoriteGamesUpdated", handleFavoriteUpdate)
		}
	}, [getFavoriteGames])

	return favoriteGameIds
}
