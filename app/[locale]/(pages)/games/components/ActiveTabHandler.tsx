"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

interface ActiveTabHandlerProps {
	onActiveTabChange: (tab: string | undefined) => void
}

export function ActiveTabHandler({ onActiveTabChange }: ActiveTabHandlerProps) {
	const searchParams = useSearchParams()
	const q = searchParams.get("q")

	useEffect(() => {
		// 映射q参数到对应的标签ID
		const getActiveTabFromQuery = (
			query: string | null,
		): string | undefined => {
			if (!query) return undefined
			const mapping: Record<string, string> = {
				"all-games": "all-games",
				popular: "popular",
				new: "new",
				recent: "recently-played",
				"recently-played": "recently-played",
			}
			return mapping[query]
		}

		const activeTab = getActiveTabFromQuery(q)
		onActiveTabChange(activeTab)
	}, [q, onActiveTabChange])

	return null // 这个组件不渲染任何内容
}
