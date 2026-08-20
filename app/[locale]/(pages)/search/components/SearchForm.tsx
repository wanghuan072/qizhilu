"use client"

import { useRouter } from "@i18n/navigation"
import { Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

interface SearchFormProps {
	initialQuery?: string
}

export function SearchForm({ initialQuery = "" }: SearchFormProps) {
	const t = useTranslations()
	const router = useRouter()
	const [searchQuery, setSearchQuery] = useState(initialQuery)

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		if (searchQuery.trim()) {
			router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
		}
	}

	return (
		<form onSubmit={handleSearch} className="relative">
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
			<input
				type="text"
				placeholder={t("Search.searchPlaceholder")}
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className="w-full pl-10 pr-20 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
			/>
			<button
				type="submit"
				className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
			>
				{t("Search.searchButton")}
			</button>
		</form>
	)
}
