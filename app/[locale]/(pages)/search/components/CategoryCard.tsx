"use client"

import { GameCategory } from "@/lib/types"
import { useRouter } from "@i18n/navigation"
import { Folder, Hash } from "lucide-react"

interface CategoryCardProps {
	category: GameCategory
}

export function CategoryCard({ category }: CategoryCardProps) {
	const router = useRouter()

	const handleClick = () => {
		router.push(`/c/${category.slug}`)
	}

	return (
		<div
			onClick={handleClick}
			className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card hover:bg-accent cursor-pointer transition-all duration-200 group hover:shadow-md"
		>
			<div className="flex-shrink-0 p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
				<Folder className="h-4 w-4 text-primary" />
			</div>
			<div className="flex-1 min-w-0">
				<h3 className="font-medium text-foreground group-hover:text-accent-foreground truncate">
					{category.name}
				</h3>
				{category.metadata?.description && (
					<p className="text-xs text-muted-foreground group-hover:text-accent-foreground/80 truncate">
						{category.metadata.description}
					</p>
				)}
			</div>
		</div>
	)
}
