"use client"

import cachedSiteSettings from "@/lib/config/siteSettings"
import { AdSettings } from "@/lib/types"
import { GameData } from "@/lib/types/api-types"
import { hasModalAd } from "@/lib/utils/ad-utils"
import { trackGameClick, trackGameStart } from "@/lib/utils/tiktok-pixel"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { InitialContent } from "./InitialContent"
import { PlayerInfo } from "./PlayerInfo"

interface IframeVariantProps {
	url: string
	title: string
	slogan?: string
	image?: string
	rating?: number
	gameId?: string
	gameLocaleContent?: GameData
	onShare?: () => void
	onFavorite?: () => void
	onFullscreen: () => void
	iframeRef: React.RefObject<HTMLIFrameElement | null>
	fullWidth?: boolean
	gameType?: "iframe" | "popup" | "link"
	adsSettings?: AdSettings[] // 新增广告设置
}

export const IframeVariant = ({
	url,
	title,
	slogan,
	image,
	rating,
	gameId,
	gameLocaleContent,
	onShare,
	onFavorite,
	onFullscreen,
	iframeRef,
	fullWidth,
	gameType = "iframe",
	adsSettings,
}: IframeVariantProps) => {
	const [showIframeOnly, setShowIframeOnly] = useState(false)
	const [iframeUrl, setIframeUrl] = useState<string>("")
	const [iframeReady, setIframeReady] = useState(false)
	const t = useTranslations("Game")
	const locale = useLocale()

	const handleIframeLoad = () => {
		setIframeReady(true)
	}

	// 监听来自广告页面的消息
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			// 安全检查：验证消息来源
			if (event.data?.type === 'AD_CLOSED') {
				// 广告关闭，切换到游戏地址
				setIframeReady(false) // 重置加载状态
				setIframeUrl(url)
				
				// 追踪游戏开始事件
				if (gameId) {
					trackGameStart({
						id: gameId,
						name: title,
					})
				}
			}
		}

		window.addEventListener('message', handleMessage)
		return () => {
			window.removeEventListener('message', handleMessage)
		}
	}, [url, gameId, title])

	const handlePlayClick = () => {
		// 追踪游戏点击事件
		if (gameId) {
			trackGameClick({
				id: gameId,
				name: title,
			})
		}

		if (gameType === "link") {
			window.open(url, "_blank")
			return
		}
		if (gameType === "popup") {
			// 桌面端按80%比例调整窗口大小
			const width = Math.round(screen.width * 0.8)
			const height = Math.round(screen.height * 0.8)
			const left = (screen.width - width) / 2
			const top = (screen.height - height) / 2

			const popupWindow = window.open(
				url,
				"_blank",
				`width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
			)
			if (popupWindow) {
				popupWindow.focus()
			}
			return
		}

		// 检查是否有弹窗广告
		const hasAd = hasModalAd(adsSettings)

		// 显示 iframe 区域
		setShowIframeOnly(true)

		if (hasAd) {
			// 有广告配置，加载广告页面
			const adModalPath =
				locale === cachedSiteSettings.defaultLocale
					? "/ad-modal"
					: `/${locale}/ad-modal`
			setIframeUrl(adModalPath)
		} else {
			// 没有广告，直接加载游戏
			setIframeUrl(url)
			
			// 追踪游戏开始事件
			if (gameId) {
				trackGameStart({
					id: gameId,
					name: title,
				})
			}
		}
	}

	const heightClasses = fullWidth
		? "w-full h-[500px] md:h-[650px] xl:h-[700px] md:min-h-[650px] xl:min-h-[700px] rounded-t-xl relative overflow-hidden"
		: "w-full h-[500px] md:h-[600px] md:min-h-[600px] rounded-t-xl relative overflow-hidden"

	
	return (
		<>
			<div className={heightClasses}>
				{!showIframeOnly && (
					<InitialContent
						title={title}
						slogan={slogan}
						image={image}
						onPlayClick={handlePlayClick}
					/>
				)}

				{showIframeOnly && gameType === "iframe" && (
					<div className="w-full h-full">
						<div className="w-full h-full bg-card rounded-t-xl overflow-hidden shadow-lg border border-border border-b-no relative">
							{/* 统一的 iframe - 先加载广告页面，关闭后切换到游戏 */}
							{iframeUrl && (
								<iframe
									ref={iframeRef}
									title={title}
									src={iframeUrl}
									id="iframe-container"
									allow="accelerometer; gyroscope; autoplay; payment; fullscreen; microphone; clipboard-read; clipboard-write"
									sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-scripts allow-same-origin allow-downloads allow-popups-to-escape-sandbox"
									className="w-full h-full bg-background border-0 rounded-t-xl"
									allowFullScreen
									loading="lazy"
									onLoad={handleIframeLoad}
								/>
							)}

							{/* 加载中状态 */}
							{iframeUrl && !iframeReady && (
								<div className="absolute inset-0 w-full h-full flex items-center justify-center bg-background/90 backdrop-blur-md pointer-events-none">
									<div className="text-center">
										<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
										<p className="text-primary text-lg">{t("loading")}</p>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

			</div>

			<div className="w-full bg-card rounded-b-xl shadow-lg backdrop-blur-sm">
				<PlayerInfo
					title={title}
					rating={rating}
					gameId={gameId}
					gameLocaleContent={gameLocaleContent}
					onShare={onShare}
					onFavorite={onFavorite}
					onFullscreen={onFullscreen}
				/>
			</div>
		</>
	)
}
