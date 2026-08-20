"use client"

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

interface CategoryData {
	code: string
	name: string
	slug: string
}

interface CategorySection {
	category: CategoryData
	games: GameCardData[]
}

interface CategoryGamesSectionProps {
	categorySections: CategorySection[]
}

export default function CategoryGamesSection({
	categorySections,
}: CategoryGamesSectionProps) {
	if (!categorySections.length) return null

	return (
		<>
			{categorySections.map(({ category, games }) => (
				<ScrollableGameList
					key={category.code}
					title={category.name}
					games={games}
					categoryCode={category.code}
				/>
			))}
		</>
	)
}
