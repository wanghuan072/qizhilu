"use client"

import { ModalAdSlot } from "@/lib/components/ads"
import { Button } from "@/lib/components/ui/button"
import { AdSettings } from "@/lib/types"
import { getModalAd } from "@/lib/utils/ad-utils"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

interface AdOverlayProps {
	adsSettings?: AdSettings[]
	onClose: () => void
	visible: boolean
}

export const AdOverlay: React.FC<AdOverlayProps> = ({
	adsSettings,
	onClose,
	visible,
}) => {
	console.log("🎭 AdOverlay render:", { visible, adsSettings })

	const t = useTranslations("Game")
	const [countdown, setCountdown] = useState(10) // 10秒倒计时
	const [showCloseButton, setShowCloseButton] = useState(false) // 5秒后显示关闭按钮
	const [isClient, setIsClient] = useState(false) // 防止SSR hydration问题
	const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const showCloseButtonTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	// 获取弹窗广告配置
	const modalAd = getModalAd(adsSettings)
	console.log("🎯 Modal ad config:", { modalAd })

	// 检查是否有广告配置
	const hasAd = modalAd?.enabled && modalAd?.codeText
	console.log("✅ Has ad:", {
		hasAd,
		enabled: modalAd?.enabled,
		hasCodeText: !!modalAd?.codeText,
		modalAdExists: !!modalAd,
		adsSettingsCount: adsSettings?.length || 0
	})

	// 确保只在客户端渲染
	useEffect(() => {
		setIsClient(true)
	}, [])

	// 重置倒计时和定时器
	const resetTimers = () => {
		// 清除之前的定时器
		if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current)
		if (showCloseButtonTimeoutRef.current)
			clearTimeout(showCloseButtonTimeoutRef.current)

		if (visible && hasAd && isClient) {
			// 重置状态
			setCountdown(10)
			setShowCloseButton(false)

			// 5秒后显示关闭按钮
			const closeBtnTimer = setTimeout(() => {
				setShowCloseButton(true)
			}, 5000)
			showCloseButtonTimeoutRef.current = closeBtnTimer

			// 10秒后自动关闭
			const autoTimer = setTimeout(() => {
				onClose()
			}, 10000)
			autoCloseTimeoutRef.current = autoTimer
		}
	}

	useEffect(() => {
		if (!isClient) return

		resetTimers()

		// 清理函数
		return () => {
			if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current)
			if (showCloseButtonTimeoutRef.current)
				clearTimeout(showCloseButtonTimeoutRef.current)
		}
	}, [visible, hasAd, isClient])

	// 倒计时效果
	useEffect(() => {
		if (!isClient || !visible || !hasAd || countdown <= 0) return

		const timer = setTimeout(() => {
			setCountdown((prev) => prev - 1)
		}, 1000)

		return () => clearTimeout(timer)
	}, [visible, hasAd, countdown, isClient])

	// 防止SSR hydration问题，不在服务端渲染
	console.log("🎭 AdOverlay render check:", { isClient, visible, hasAd })
	if (!isClient || !visible || !hasAd) {
		console.log("❌ AdOverlay not rendering:", {
			reason: !isClient ? 'not client' : !visible ? 'not visible' : 'no ad',
			isClient,
			visible,
			hasAd
		})
		return null
	}

	console.log("✅ AdOverlay will render!")

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
				{/* 倒计时显示 */}
				<div className="absolute top-4 right-4 z-10">
					<div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
						{countdown}
					</div>
				</div>

				{/* 关闭按钮（5秒后显示） */}
				{showCloseButton && (
					<div className="absolute top-4 left-4 z-10">
						<Button
							variant="outline"
							size="sm"
							onClick={onClose}
							className="bg-white/90 hover:bg-white"
						>
							<X className="w-4 h-4 mr-1" />
							{t("close")}
						</Button>
					</div>
				)}

				{/* 广告头部 */}
				<div className="bg-gray-50 px-6 py-4 border-b rounded-t-lg">
					<h3 className="text-lg font-semibold text-center">
						{t("advertisement")}
					</h3>
					<p className="text-sm text-gray-600 text-center mt-1">
						{t("advertisementDescription")}
					</p>
				</div>

				{/* 广告内容区域 */}
				<div className="p-6 flex items-center justify-center min-h-[300px]">
					<ModalAdSlot />
				</div>

				{/* 底部提示 */}
				<div className="bg-gray-50 px-6 py-3 border-t rounded-b-lg">
					<p className="text-xs text-gray-500 text-center">
						{showCloseButton
							? t("canCloseNow")
							: t("waitToClose", {
									seconds: Math.max(0, 5 - (10 - countdown)),
								})}
					</p>
				</div>
			</div>
		</div>
	)
}
