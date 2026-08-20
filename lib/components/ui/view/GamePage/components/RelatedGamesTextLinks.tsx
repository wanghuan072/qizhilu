"use client"
import cachedSiteSettings from "@/lib/config/siteSettings"
import { getGameSlug } from "@/lib/utils/navigation"
import { Link } from "@i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import React from "react"

interface RelatedGamesTextLinksProps {
	items: { title: string; url: string }[]
}
const RelatedGamesTextLinks: React.FC<RelatedGamesTextLinksProps> = ({
	items,
}) => {
	const t = useTranslations("Game")
	const locale = useLocale()
	return (
		<div className="mt-6 p-4 bg-card rounded-xl shadow-md backdrop-blur-sm">
			<h3 className="text-sm font-medium text-muted-foreground mb-3">
				{t("relatedGamesTextLinks")}
			</h3>
			<div className="flex flex-wrap gap-4">
				{items.map(
					(game, index) =>
						game.url && (
							<React.Fragment key={game.title}>
								<Link
									href={getGameSlug(game.url)}
									className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
									title={`Play ${game.title}`}
									locale={
										locale === cachedSiteSettings.defaultLocale ? "." : locale
									}
								>
									{game.title}
								</Link>
							</React.Fragment>
						),
				)}
			</div>
		</div>
	)
}
export { RelatedGamesTextLinks }

export default RelatedGamesTextLinks
