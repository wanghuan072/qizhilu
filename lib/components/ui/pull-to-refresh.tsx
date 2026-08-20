"use client"

import { cn } from "@/lib/utils/react/styles"
import { Loader2 } from "lucide-react"
import { debounce, throttle } from "radash"
import React, {
	ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react"
import { useUnmount } from "react-use"

export interface PullToRefreshProps {
	/**
	 * 下拉刷新触发的函数，必须返回Promise
	 */
	onRefresh: () => Promise<void>

	/**
	 * 是否正在刷新
	 */
	refreshing?: boolean

	/**
	 * 触发刷新的距离
	 */
	threshold?: number

	/**
	 * 下拉的最大距离
	 */
	maxDistance?: number

	/**
	 * 指示器自定义配置
	 */
	indicator?: {
		activate?: ReactNode
		deactivate?: ReactNode
		release?: ReactNode
		finish?: ReactNode
	}

	/**
	 * 子元素
	 */
	children: ReactNode

	/**
	 * 自定义类名
	 */
	className?: string

	/**
	 * 刷新完成后的回调
	 */
	onRefreshCompleted?: () => void

	/**
	 * 下拉刷新时的文本
	 */
	pullingText?: string

	/**
	 * 可以释放刷新时的文本
	 */
	canReleaseText?: string

	/**
	 * 刷新中的文本
	 */
	refreshingText?: string

	/**
	 * 刷新完成的文本
	 */
	completeText?: string
}

enum PullStatus {
	Idle = "idle",
	Pulling = "pulling",
	CanRelease = "canRelease",
	Refreshing = "refreshing",
	Complete = "complete",
}

export function PullToRefresh({
	onRefresh,
	refreshing = false,
	threshold = 60,
	maxDistance = 100,
	indicator,
	children,
	className,
	onRefreshCompleted,
	pullingText = "下拉刷新",
	canReleaseText = "释放立即刷新",
	refreshingText = "刷新中...",
	completeText = "刷新成功",
}: PullToRefreshProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const [status, setStatus] = useState<PullStatus>(PullStatus.Idle)
	const [distance, setDistance] = useState(0)
	const [startY, setStartY] = useState(0)
	const [isTouching, setIsTouching] = useState(false)

	// 追踪内部刷新状态
	const [internalRefreshing, setInternalRefreshing] = useState(refreshing)

	// 监听外部传入的refreshing状态
	useEffect(() => {
		setInternalRefreshing(refreshing)
		if (refreshing) {
			setStatus(PullStatus.Refreshing)
		} else if (status === PullStatus.Refreshing) {
			setStatus(PullStatus.Complete)
			resetAfterDelay()
		}
	}, [refreshing])

	// 重置状态的延迟函数
	const resetAfterDelay = debounce({ delay: 500 }, () => {
		if (status === PullStatus.Complete) {
			setStatus(PullStatus.Idle)
			setDistance(0)
			if (onRefreshCompleted) {
				onRefreshCompleted()
			}
		}
	})

	// 清理
	useUnmount(() => {
		resetAfterDelay.cancel()
	})

	// 获取触摸事件的Y坐标
	const getTouchY = (e: React.TouchEvent): number => {
		return e.touches[0]?.clientY || 0
	}

	// 触摸开始
	const handleTouchStart = (e: React.TouchEvent) => {
		if (internalRefreshing) return

		// 只有滚动位置在顶部时才处理下拉
		if (getTouchY(e) <= 0) return
		if (containerRef.current && containerRef.current.scrollTop > 0) return

		setIsTouching(true)
		setStartY(getTouchY(e))
	}

	// 触摸移动处理函数（使用useCallback和throttle）
	const handleTouchMove = useCallback(
		throttle({ interval: 16 }, (e: React.TouchEvent) => {
			if (!isTouching || internalRefreshing) return

			const currentY = getTouchY(e)
			const diff = currentY - startY

			// 只处理下拉操作，忽略上滑
			if (diff <= 0) {
				setDistance(0)
				return
			}

			// 应用阻尼效果，使得滑动不会太快
			const calculatedDistance = Math.min(diff ** 0.8, maxDistance)

			setDistance(calculatedDistance)

			if (calculatedDistance >= threshold) {
				setStatus(PullStatus.CanRelease)
			} else {
				setStatus(PullStatus.Pulling)
			}

			// 防止页面滚动
			e.preventDefault()
		}),
		[isTouching, internalRefreshing, startY, maxDistance, threshold],
	)

	// 触摸结束
	const handleTouchEnd = async () => {
		if (!isTouching || internalRefreshing) return

		setIsTouching(false)

		if (status === PullStatus.CanRelease) {
			setStatus(PullStatus.Refreshing)
			setInternalRefreshing(true)

			try {
				await onRefresh()
				setStatus(PullStatus.Complete)
			} catch (error) {
				console.error("Refresh failed:", error)
			} finally {
				if (!refreshing) {
					// 只有在非受控模式下才自动重置
					setInternalRefreshing(false)
					resetAfterDelay()
				}
			}
		} else {
			setDistance(0)
			setStatus(PullStatus.Idle)
		}
	}

	// 根据状态渲染指示器
	const renderIndicator = () => {
		if (distance === 0 && status !== PullStatus.Refreshing) return null

		const defaultIndicators: Record<PullStatus, ReactNode> = {
			[PullStatus.Idle]: null,
			[PullStatus.Pulling]: (
				<div className="text-sm text-gray-500">{pullingText}</div>
			),
			[PullStatus.CanRelease]: (
				<div className="text-sm text-gray-700">{canReleaseText}</div>
			),
			[PullStatus.Refreshing]: (
				<div className="flex items-center space-x-1">
					<Loader2 className="h-4 w-4 animate-spin text-primary" />
					<span className="text-sm text-gray-700">{refreshingText}</span>
				</div>
			),
			[PullStatus.Complete]: (
				<div className="text-sm text-gray-700">{completeText}</div>
			),
		}

		if (indicator) {
			switch (status) {
				case PullStatus.Pulling:
					return indicator.deactivate || defaultIndicators[status]
				case PullStatus.CanRelease:
					return indicator.activate || defaultIndicators[status]
				case PullStatus.Refreshing:
					return indicator.release || defaultIndicators[status]
				case PullStatus.Complete:
					return indicator.finish || defaultIndicators[status]
				default:
					return null
			}
		}

		return defaultIndicators[status]
	}

	const indicatorStyles = {
		height: `${Math.max(
			distance,
			status === PullStatus.Refreshing ? threshold : 0,
		)}px`,
	}

	const contentStyles = {
		transform:
			status !== PullStatus.Refreshing && distance > 0
				? `translateY(${distance}px)`
				: status === PullStatus.Refreshing
					? `translateY(${threshold}px)`
					: undefined,
		transition: !isTouching ? "transform 0.3s" : undefined,
	}

	return (
		<div
			ref={containerRef}
			className={cn("overflow-auto overscroll-none touch-pan-y", className)}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onTouchCancel={handleTouchEnd}
		>
			<div className="min-h-full">
				<div
					className="flex items-center justify-center overflow-hidden transition-height"
					style={indicatorStyles}
				>
					{renderIndicator()}
				</div>
				<div
					ref={contentRef}
					className="will-change-transform"
					style={contentStyles}
				>
					{children}
				</div>
			</div>
		</div>
	)
}
