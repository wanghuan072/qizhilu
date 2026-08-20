"use client"

import { cn } from "@/lib/utils/react/styles"
import { Loader2 } from "lucide-react"
import { throttle } from "radash"
import React, { useCallback, useEffect, useRef, useState } from "react"

export interface LoadMoreProps {
	/**
	 * 加载更多触发的函数，必须返回Promise
	 */
	onLoadMore: () => Promise<void>

	/**
	 * 是否有更多内容可以加载
	 */
	hasMore: boolean

	/**
	 * 当内容距离底部多少像素时触发加载
	 */
	threshold?: number

	/**
	 * 加载指示器
	 */
	loadingIndicator?: React.ReactNode

	/**
	 * 没有更多内容时显示的内容
	 */
	endMessage?: React.ReactNode

	/**
	 * 容器的自定义类名
	 */
	className?: string

	/**
	 * 加载更多内容的节流时间间隔（毫秒）
	 */
	throttleInterval?: number

	/**
	 * 子元素
	 */
	children: React.ReactNode

	/**
	 * 加载中的文本
	 */
	loadingText?: string

	/**
	 * 没有更多内容时的文本
	 */
	noMoreText?: string
}

export function LoadMore({
	onLoadMore,
	hasMore,
	threshold = 300,
	loadingIndicator,
	endMessage,
	className,
	throttleInterval = 200,
	children,
	loadingText = "加载中...",
	noMoreText = "没有更多内容了",
}: LoadMoreProps) {
	const [loading, setLoading] = useState(false)
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const loaderRef = useRef<HTMLDivElement>(null)
	const hasInitializedObserver = useRef(false)
	const hadMore = useRef(hasMore)

	// 记录上一次hasMore值，以便我们可以知道何时从true变为false
	useEffect(() => {
		hadMore.current = hasMore
	}, [hasMore])

	// 检查是否需要加载更多内容
	const checkIntersection = useCallback(
		throttle(
			{ interval: throttleInterval },
			async (entries: IntersectionObserverEntry[]) => {
				const [entry] = entries
				// 当加载指示器进入视口并且有更多内容可加载时，触发加载更多
				if (entry?.isIntersecting && hasMore && !loading) {
					setLoading(true)
					try {
						await onLoadMore()
					} catch (error) {
						console.error("Failed to load more:", error)
					} finally {
						setLoading(false)
					}
				}
			},
		),
		[hasMore, loading, onLoadMore],
	)

	// 当组件挂载时或依赖项改变时，初始化Intersection Observer
	useEffect(() => {
		const currentLoaderRef = loaderRef.current

		if (!currentLoaderRef || hasInitializedObserver.current) return

		const options = {
			root: null, // 使用视口作为根元素
			rootMargin: `0px 0px ${threshold}px 0px`, // 底部阈值
			threshold: 0, // 当目标元素有任何部分可见时触发
		}

		const observer = new IntersectionObserver(checkIntersection, options)
		observer.observe(currentLoaderRef)
		hasInitializedObserver.current = true

		return () => {
			if (currentLoaderRef) {
				observer.unobserve(currentLoaderRef)
			}
			observer.disconnect()
		}
	}, [checkIntersection, threshold])

	// 渲染加载指示器或结束消息
	const renderFooter = () => {
		if (loading) {
			return (
				loadingIndicator || (
					<div className="flex justify-center items-center py-4">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
						<span className="ml-2 text-sm text-gray-600">{loadingText}</span>
					</div>
				)
			)
		}

		if (!hasMore && hadMore.current) {
			return (
				endMessage || (
					<div className="flex justify-center items-center py-4 text-sm text-gray-500">
						{noMoreText}
					</div>
				)
			)
		}

		return null
	}

	return (
		<div ref={scrollContainerRef} className={cn("relative", className)}>
			{children}
			<div ref={loaderRef} className="w-full">
				{renderFooter()}
			</div>
		</div>
	)
}
