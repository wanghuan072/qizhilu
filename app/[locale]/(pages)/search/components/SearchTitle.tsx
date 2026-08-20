"use client"

import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function SearchTitle() {
	const t = useTranslations()
	const searchParams = useSearchParams()
	const [query, setQuery] = useState<string>("")

	useEffect(() => {
		const q = searchParams.get("q") || ""
		setQuery(q)
	}, [searchParams])

	return (
		<header className="mb-8 text-center">
			<h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mt-4">
				{query ? t("Search.searchResults", { query }) : t("Search.title")}
			</h1>
		</header>
	)
}
