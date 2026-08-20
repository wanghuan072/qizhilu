"use client"

import { ShareButton } from "@/lib/components/ui/ShareButton"
import { siteSettings } from "@/lib/config/siteSettings"
import { GameData } from "@/lib/types/api-types"
import { cn } from "@/lib/utils/react"
import { Heart, Maximize, MessageSquare, Share2 } from "lucide-react"
import { useCallback } from "react"
import { useFavoriteGame } from "../hooks/useFavoriteGame"
import { StarRating } from "./StarRating"

interface PlayerInfoProps {
	title: string
	rating?: number
	gameId?: string
	gameLocaleContent?: GameData
	onShare?: () => void
	onFavorite?: () => void
	onFullscreen: () => void
}

export const PlayerInfo = ({
	title,
	rating,
	gameId,
	gameLocaleContent,
	onShare,
	onFavorite,
	onFullscreen,
}: PlayerInfoProps) => {
	const { isFavorited, handleFavorite } = useFavoriteGame(gameId || "")

	const handleComment = useCallback(() => {
		console.log("暂不实现")
	}, [])

	return (
		<div className="p-4">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
				<div className="flex-grow w-full">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<h1 className="text-xl font-bold text-foreground">{title}</h1>
							{typeof rating === "number" && rating > 1 && (
								<div className="flex-shrink-0">
									<StarRating rating={rating} />
								</div>
							)}
						</div>
						<div className="flex space-x-2">
							<button
								className="text-primary p-2 rounded-full flex items-center justify-center hover:bg-muted/80 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
								aria-label="Fullscreen"
								type="button"
								onClick={onFullscreen}
							>
								<Maximize className="h-5 w-5" />
							</button>
							<ShareButton
								gameTitle={title}
								gameLocaleContent={gameLocaleContent}
								siteSettings={siteSettings}
							>
								<button
									className="text-primary p-2 rounded-full flex items-center justify-center hover:bg-muted/80 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
									aria-label="Share"
									type="button"
								>
									<Share2 className="h-5 w-5" />
								</button>
							</ShareButton>
							<button
								className={cn(
									"p-2 rounded-full flex items-center justify-center hover:bg-muted/80 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md",
									isFavorited ? "text-red-500" : "text-primary",
								)}
								aria-label="Favorite"
								type="button"
								onClick={onFavorite || handleFavorite}
							>
								<Heart
									className={cn("h-5 w-5", isFavorited ? "fill-red-500" : "")}
								/>
							</button>
							<button
								className="text-muted-foreground p-2 rounded-full flex items-center justify-center transition-all duration-200 opacity-50 cursor-not-allowed shadow-sm"
								aria-label="Comments"
								type="button"
								onClick={handleComment}
								disabled
							>
								<MessageSquare className="h-5 w-5" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
