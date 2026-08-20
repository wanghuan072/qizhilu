"use client"

import { useTranslations } from "next-intl"
import { ScrollableGameList } from "./ScrollableGameList"

interface GameCardData {
	slug: string
	name: string
	screenshotUrl?: string
	rating?: number
	categories?: Array<{ code: string; slug: string }>
	updateTime?: string
	recommendToHome?: boolean
}

interface HotGamesSectionProps {
	games: GameCardData[]
}

export default function HotGamesSection({ games }: HotGamesSectionProps) {
	const t = useTranslations()

	if (!games.length) return null

	return (
		<ScrollableGameList
			title={t("Game.hotGamesTitle")}
			games={games}
			useTileLayout={true}
		/>
	)
}
