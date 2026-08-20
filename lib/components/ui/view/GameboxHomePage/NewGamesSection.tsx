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

interface NewGamesSectionProps {
	games: GameCardData[]
}

export default function NewGamesSection({ games }: NewGamesSectionProps) {
	const t = useTranslations()

	if (!games.length) return null

	return (
		<ScrollableGameList
			title={t("Game.latestGamesTitle")}
			games={games}
			useTileLayout={true}
		/>
	)
}
