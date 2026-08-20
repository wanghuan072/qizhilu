"use client"
import { Icon } from "@/lib/components/common/Icon"
import { cn } from "@/lib/utils/react/styles"
import { debounce, throttle } from "radash"
import React, { useCallback, useEffect, useMemo, useState } from "react"

interface ContentNavigationTabsProps {
	tabs: { tabId: string; title: string; icon?: string }[]
	activeTabId?: string
	onTabClick?: (tabId: string) => void
}

// 默认图标映射
const getDefaultIcon = (tabId: string): string => {
	const iconMap: Record<string, string> = {
		gameOverview: "gamepad",
		gameplayOverview: "play-circle",
		developerInfo: "user",
		relatedGames: "grid-3x3",
		howToPlay: "book-open",
		coreFeatures: "star",
		tipsAndTricks: "lightbulb",
		screenshots: "image",
		whyPlayHere: "heart",
		platformInfo: "monitor",
		platformFeatures: "settings",
		recommendationReasons: "thumbs-up",
		strategy: "target",
		faq: "help-circle",
		comments: "message-circle",
	}
	return iconMap[tabId] || "circle"
}

export const ContentNavigationTabs: React.FC<ContentNavigationTabsProps> = ({
	tabs = [],
	activeTabId, // Use this if provided
	onTabClick,
}) => {
	// 内部状态管理：当前激活的标签页ID
	const [internalActiveTabId, setInternalActiveTabId] = useState<string>(
		() => activeTabId ?? tabs[0]?.tabId ?? "",
	)

	// 确定当前激活的标签页ID：优先使用外部传入的activeTabId，否则使用内部状态
	const currentActiveTabId = activeTabId ?? internalActiveTabId

	// 当外部activeTabId变化时，同步更新内部状态
	useEffect(() => {
		if (activeTabId && activeTabId !== internalActiveTabId) {
			setInternalActiveTabId(activeTabId)
		}
	}, [activeTabId, internalActiveTabId])

	// 当tabs变化时，确保有有效的激活标签页
	useEffect(() => {
		if (tabs.length > 0 && !currentActiveTabId) {
			const firstTab = tabs[0]
			if (firstTab?.tabId) {
				setInternalActiveTabId(firstTab.tabId)
			}
		}
	}, [tabs, currentActiveTabId])

	// 处理平滑滚动到对应内容区域，添加节流
	const scrollToContent = useCallback(
		throttle({ interval: 300 }, (tabId: string) => {
			const element = document.getElementById(tabId)
			if (element) {
				element.scrollIntoView({
					behavior: "smooth",
					block: "start",
				})
			}
		}),
		[],
	)

	// 防抖处理的tab激活状态更新
	const debouncedSetActiveTab = useMemo(
		() =>
			debounce({ delay: 150 }, (tabId: string) => {
				setInternalActiveTabId(tabId)
			}),
		[],
	)

	// 防抖处理的tab导航滚动
	const debouncedScrollTabIntoView = useMemo(
		() =>
			debounce({ delay: 200 }, (tabId: string) => {
				const activeTabElement = document.querySelector(
					`a[href="#${tabId}"]`,
				) as HTMLElement | null
				const tabsContainer = document.getElementById("content-tabs")
				if (!activeTabElement || !tabsContainer) return

				const navRect = tabsContainer.getBoundingClientRect()
				const viewportHeight =
					window.innerHeight || document.documentElement.clientHeight

				// 只有当导航区域当前可见时才调整内部滚动，避免在移动端把页面拉回到导航处
				if (navRect.bottom > 0 && navRect.top < viewportHeight) {
					const containerWidth = tabsContainer.clientWidth
					const targetScrollLeft =
						activeTabElement.offsetLeft -
						(containerWidth - activeTabElement.clientWidth) / 2
					const maxScrollLeft = Math.max(
						0,
						tabsContainer.scrollWidth - containerWidth,
					)

					tabsContainer.scrollTo({
						left: Math.min(Math.max(targetScrollLeft, 0), maxScrollLeft),
						behavior: "smooth",
					})
				}
			}),
		[],
	)

	// 优化的标签页点击处理函数
	const handleTabClick = useCallback(
		(tabId: string) => {
			// 更新内部状态（如果没有外部控制）
			if (!activeTabId) {
				setInternalActiveTabId(tabId)
			}

			// 如果提供了外部处理函数，则调用
			if (onTabClick) {
				onTabClick(tabId)
			}

			// 平滑滚动到目标位置
			scrollToContent(tabId)
		},
		[activeTabId, onTabClick, scrollToContent],
	)

	// 使用 Intersection Observer 实现高性能滚动监听 - 只做tab高亮，不做滚动，添加防抖
	useEffect(() => {
		if (tabs.length === 0) return

		const visibleSections = new Set<string>()

		// 防抖处理的IntersectionObserver回调
		const debouncedObserverCallback = debounce(
			{ delay: 100 },
			(entries: IntersectionObserverEntry[]) => {
				entries.forEach((entry) => {
					const sectionId = entry.target.id

					if (entry.isIntersecting) {
						visibleSections.add(sectionId)
					} else {
						visibleSections.delete(sectionId)
					}
				})

				// 如果有可见的sections，选择第一个作为活跃tab
				if (visibleSections.size > 0 && !activeTabId) {
					// 按照tabs的顺序找到第一个可见的section
					for (const tab of tabs) {
						if (visibleSections.has(tab.tabId)) {
							if (tab.tabId !== currentActiveTabId) {
								// 使用防抖更新激活tab
								debouncedSetActiveTab(tab.tabId)

								// 使用防抖滚动tab导航
								debouncedScrollTabIntoView(tab.tabId)
							}
							break
						}
					}
				}
			},
		)

		const observer = new IntersectionObserver(debouncedObserverCallback, {
			// 设置触发条件：当元素顶部进入视口上方120px时触发
			rootMargin: "-120px 0px -60% 0px",
			threshold: 0,
		})

		// 观察所有tab内容元素
		tabs.forEach((tab) => {
			const element = document.getElementById(tab.tabId)
			if (element) {
				observer.observe(element)
			}
		})

		// 清理函数
		return () => {
			observer.disconnect()
		}
	}, [
		tabs,
		currentActiveTabId,
		activeTabId,
		debouncedSetActiveTab,
		debouncedScrollTabIntoView,
	])

	// 如果URL中包含hash，初始化时滚动到对应位置，添加防抖
	useEffect(() => {
		if (window.location.hash) {
			const hash = window.location.hash.substring(1) // 去掉#号
			const element = document.getElementById(hash)
			if (element) {
				// 防抖处理hash滚动
				const debouncedHashScroll = debounce({ delay: 300 }, () => {
					element.scrollIntoView({
						behavior: "smooth",
						block: "start",
					})
				})
				debouncedHashScroll()
			}
		}
	}, [])

	return (
		<div
			id="content-tabs-container"
			className={cn(
				"mt-4 p-2 transition-colors duration-200 ",
				"bg-card rounded-xl shadow-md overflow-hidden dark:bg-gray-900",
				"md:top-20 md:self-start md:z-[500]",
			)}
		>
			<ul
				className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 -mb-px text-sm font-medium text-center"
				id="content-tabs"
			>
				{tabs?.map((tab, index) => {
					const isActive = tab.tabId === currentActiveTabId
					return (
						<li className="w-full" key={`${index}-${tab.tabId}`}>
							<a
								href={`#${tab.tabId}`} // Keep href for accessibility and non-JS fallback
								onClick={(e) => {
									// 总是阻止默认行为，使用自定义滚动
									e.preventDefault()
									// 使用优化的点击处理函数
									handleTabClick(tab.tabId)
								}}
								className={cn(
									"inline-flex items-center justify-start p-2 sm:p-3 md:p-4",
									"border-b-2 rounded-t-lg group whitespace-nowrap w-full",
									"transition-all duration-200 ease-in-out",
									"relative overflow-hidden",
									isActive
										? [
												"border-primary text-primary bg-primary/5",
												"dark:border-primary dark:text-secondary dark:bg-primary/10",
												"active shadow-sm",
											]
										: [
												"border-transparent text-muted-foreground",
												"hover:text-foreground hover:border-primary/30 hover:bg-primary/5",
												"dark:text-muted-foreground dark:hover:text-foreground",
												"dark:hover:border-primary/30 dark:hover:bg-primary/5",
												"before:absolute before:bottom-0 before:left-0 before:right-0",
												"before:h-0.5 before:bg-primary before:scale-x-0",
												"before:transition-transform before:duration-200 before:ease-in-out",
											],
								)}
								aria-current={isActive ? "page" : undefined}
								title={tab.title}
							>
								{/* Tab 图标 */}
								<Icon
									name={tab.icon || getDefaultIcon(tab.tabId)}
									className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0"
								/>

								{/* Tab 标题 */}
								<span className="text-xs sm:text-sm font-medium truncate flex-grow">
									{tab.title}
								</span>
							</a>
						</li>
					)
				})}
			</ul>
		</div>
	)
}

export default ContentNavigationTabs
