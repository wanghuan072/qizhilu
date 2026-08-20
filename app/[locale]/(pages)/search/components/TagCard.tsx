"use client"

import { GameTag } from "@/lib/types"
import { useRouter } from "@i18n/navigation"
import { Hash } from "lucide-react"

interface TagCardProps {
	tag: GameTag
}

export function TagCard({ tag }: TagCardProps) {
	const router = useRouter()

	const handleClick = () => {
		router.push(`/tag/${tag.slug}`)
	}

	return (
		<div
			onClick={handleClick}
			className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-full bg-card hover:bg-accent cursor-pointer transition-all duration-200 group hover:shadow-md"
		>
			<Hash className="h-3 w-3 text-primary group-hover:text-accent-foreground" />
			<span className="text-sm font-medium text-foreground group-hover:text-accent-foreground">
				{tag.name}
			</span>
			{tag.count && (
				<span className="text-xs text-muted-foreground group-hover:text-accent-foreground/80 bg-muted px-1.5 py-0.5 rounded-full">
					{tag.count}
				</span>
			)}
		</div>
	)
}
