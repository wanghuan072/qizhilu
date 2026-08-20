"use client"

import { AdSettings } from "@/lib/types"
import { GameData } from "@/lib/types/api-types"
import { cva } from "class-variance-authority"
import { forwardRef, useImperativeHandle, useRef } from "react"
import { useFullscreen } from "../hooks/useFullscreen"
import { DownloadVariant } from "./DownloadVariant"
import { IframeVariant } from "./IframeVariant"

const gameVariants = cva("w-full flex flex-col mb-4", {
	variants: {
		variant: {
			iframe: "border border-primary rounded-xl",
			popup: "items-center justify-center min-h-[200px]",
			download: "items-center justify-center min-h-[200px]",
			placeholder: "items-center justify-center min-h-[200px]",
			link: "border border-primary rounded-xl",
		},
	},
	defaultVariants: {
		variant: "iframe",
	},
})

interface GamePlayerProps {
	url: string
	title: string
	slogan?: string
	image?: string
	variant?: "iframe" | "popup" | "download" | "placeholder" | "link"
	rating?: number
	gameId?: string
	gameLocaleContent?: GameData
	onShare?: () => void
	onFavorite?: () => void
	fullWidth?: boolean
	adsSettings?: AdSettings[] // 新增广告设置
}

export interface GamePlayerRef {
	toggleFullscreen: () => void
}

export const GamePlayer = forwardRef<GamePlayerRef, GamePlayerProps>(
	(
		{
			url,
			title,
			slogan,
			image,
			variant = "iframe",
			rating,
			gameId,
			gameLocaleContent,
			onShare,
			onFavorite,
			fullWidth,
			adsSettings,
		},
		ref,
	) => {
		const iframeRef = useRef<HTMLIFrameElement>(null)
		const { toggleFullscreen } = useFullscreen(iframeRef)

		useImperativeHandle(ref, () => ({
			toggleFullscreen,
		}))

		const renderVariant = () => {
			switch (variant) {
				case "download":
					return <DownloadVariant url={url} />
				case "placeholder":
					// For placeholder variant, we render nothing or a placeholder message
					return (
						<div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-xl">
							<p className="text-gray-500">Game content not available</p>
						</div>
					)
				default:
					return (
						<IframeVariant
							url={url}
							gameType={variant}
							title={title}
							slogan={slogan}
							image={image}
							rating={rating}
							gameId={gameId}
							gameLocaleContent={gameLocaleContent}
							onShare={onShare}
							onFavorite={onFavorite}
							onFullscreen={toggleFullscreen}
							iframeRef={iframeRef}
							fullWidth={fullWidth}
							adsSettings={adsSettings}
						/>
					)
			}
		}

		return <div className={gameVariants({ variant })}>{renderVariant()}</div>
	},
)

GamePlayer.displayName = "GamePlayer"

export default GamePlayer
