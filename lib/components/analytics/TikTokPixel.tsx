"use client"

import { tikTokPixel, startPageEngagementTracking, stopPageEngagementTracking } from "@/lib/utils/tiktok-pixel"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

interface TikTokPixelProps {
	autoTrack?: boolean
	trackEngagement?: boolean // 新增：是否追踪页面停留时长
	pageInfo?: {
		pageType?: string
		pageName?: string
		contentId?: string
	}
}

/**
 * TikTok Pixel 组件
 * 负责初始化 TikTok Pixel 并自动追踪页面浏览和页面停留时长
 */
export function TikTokPixel({
	autoTrack = true,
	trackEngagement = true,
	pageInfo
}: TikTokPixelProps) {
	const pathname = usePathname()

	useEffect(() => {
		// 初始化 TikTok Pixel
		tikTokPixel.initialize()
	}, [])

	useEffect(() => {
		if (!autoTrack) return

		// 延迟一点时间确保页面完全加载
		const timer = setTimeout(() => {
			tikTokPixel.trackPageView()

			// 如果启用参与度追踪，开始追踪页面停留时长
			if (trackEngagement) {
				// 根据路径自动推断页面信息
				let autoPageInfo = pageInfo

				if (!autoPageInfo) {
					const pathSegments = pathname.split('/').filter(Boolean)
					const locale = pathSegments[0] || 'en'
					const pagePath = pathSegments.slice(1).join('/')

					// 根据路径推断页面类型
					let pageType = 'page'
					let pageName = 'Unknown Page'

					if (pagePath === '') {
						pageType = 'homepage'
						pageName = 'Home'
					} else if (pagePath.includes('games')) {
						pageType = 'games_list'
						pageName = 'Games List'
					} else if (pagePath.includes('game')) {
						// 假设游戏详情页路径格式为 /[locale]/game/[gameId]
						const gameId = pathSegments[pathSegments.length - 1]
						pageType = 'game_detail'
						pageName = `Game Detail - ${gameId}`
						autoPageInfo = { pageType, pageName, contentId: gameId }
					} else if (pagePath.includes('categories')) {
						pageType = 'categories'
						pageName = 'Categories'
					} else if (pagePath.includes('search')) {
						pageType = 'search'
						pageName = 'Search Results'
					}

					if (!autoPageInfo) {
						autoPageInfo = { pageType, pageName }
					}
				}

				startPageEngagementTracking(autoPageInfo)
			}
		}, 100)

		return () => {
			clearTimeout(timer)
			// 页面卸载时停止参与度追踪
			if (trackEngagement) {
				stopPageEngagementTracking()
			}
		}
	}, [pathname, autoTrack, trackEngagement, pageInfo])

	return null
}

export default TikTokPixel
