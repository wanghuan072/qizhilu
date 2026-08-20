import { useCallback, useEffect, useState } from "react"

const RECENTLY_PLAYED_STORAGE_KEY = "recently_played_games"
const MAX_RECENTLY_PLAYED = 50 // 最多保存50个最近访问的游戏

export interface RecentlyPlayedGame {
	gameId: string
	timestamp: number
}

/**
 * 自定义 Hook：管理最近访问的游戏
 * 使用 localStorage 持久化访问历史
 */
export const useRecentlyPlayedGames = () => {
	const [recentlyPlayedGames, setRecentlyPlayedGames] = useState<
		RecentlyPlayedGame[]
	>([])

	// 获取最近访问的游戏列表
	const getRecentlyPlayedGames = useCallback((): RecentlyPlayedGame[] => {
		if (typeof window === "undefined") return []
		try {
			const stored = localStorage.getItem(RECENTLY_PLAYED_STORAGE_KEY)
			const games = stored ? JSON.parse(stored) : []
			// 按时间戳降序排序
			return games.sort(
				(a: RecentlyPlayedGame, b: RecentlyPlayedGame) =>
					b.timestamp - a.timestamp,
			)
		} catch (e) {
			console.error("获取最近访问游戏列表失败", e)
			return []
		}
	}, [])

	// 添加游戏到访问历史
	const addRecentlyPlayedGame = useCallback(
		(gameId: string) => {
			if (typeof window === "undefined") return

			try {
				const currentGames = getRecentlyPlayedGames()
				const now = Date.now()

				// 移除已存在的相同游戏记录
				const filteredGames = currentGames.filter(
					(game) => game.gameId !== gameId,
				)

				// 添加新记录到开头
				const updatedGames = [{ gameId, timestamp: now }, ...filteredGames]

				// 限制最大数量
				const trimmedGames = updatedGames.slice(0, MAX_RECENTLY_PLAYED)

				localStorage.setItem(
					RECENTLY_PLAYED_STORAGE_KEY,
					JSON.stringify(trimmedGames),
				)
				setRecentlyPlayedGames(trimmedGames)

				// 触发自定义事件通知其他组件
				window.dispatchEvent(new CustomEvent("recentlyPlayedGamesUpdated"))
			} catch (e) {
				console.error("添加最近访问游戏失败", e)
			}
		},
		[getRecentlyPlayedGames],
	)

	// 清除访问历史
	const clearRecentlyPlayedGames = useCallback(() => {
		if (typeof window === "undefined") return

		try {
			localStorage.removeItem(RECENTLY_PLAYED_STORAGE_KEY)
			setRecentlyPlayedGames([])
			window.dispatchEvent(new CustomEvent("recentlyPlayedGamesUpdated"))
		} catch (e) {
			console.error("清除最近访问游戏列表失败", e)
		}
	}, [])

	// 初始化和监听存储变化
	useEffect(() => {
		// 初始加载
		setRecentlyPlayedGames(getRecentlyPlayedGames())

		// 监听存储变化
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === RECENTLY_PLAYED_STORAGE_KEY) {
				setRecentlyPlayedGames(getRecentlyPlayedGames())
			}
		}

		// 自定义事件监听（用于同一页面内的更新）
		const handleRecentlyPlayedUpdate = () => {
			setRecentlyPlayedGames(getRecentlyPlayedGames())
		}

		window.addEventListener("storage", handleStorageChange)
		window.addEventListener(
			"recentlyPlayedGamesUpdated",
			handleRecentlyPlayedUpdate,
		)

		return () => {
			window.removeEventListener("storage", handleStorageChange)
			window.removeEventListener(
				"recentlyPlayedGamesUpdated",
				handleRecentlyPlayedUpdate,
			)
		}
	}, [getRecentlyPlayedGames])

	// 返回游戏ID列表（按访问时间排序）
	const recentlyPlayedGameIds = recentlyPlayedGames.map((game) => game.gameId)

	return {
		recentlyPlayedGames,
		recentlyPlayedGameIds,
		addRecentlyPlayedGame,
		clearRecentlyPlayedGames,
	}
}
