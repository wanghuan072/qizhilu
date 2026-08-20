"use client"

import { cn } from "@/lib/utils/react/styles"
import { useRouter } from "@i18n/navigation"
import { Search, X } from "lucide-react"
import { useTranslations } from "next-intl"
import React, { useState, useRef, useEffect } from "react"

interface HeaderSearchProps {
	className?: string
}

export const HeaderSearch: React.FC<HeaderSearchProps> = ({ className }) => {
	const t = useTranslations()
	const router = useRouter()
	const [isOpen, setIsOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)

	// 处理搜索
	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		if (searchQuery.trim()) {
			router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
			setIsOpen(false)
			setSearchQuery("")
		}
	}

	// 处理搜索图标点击
	const handleSearchClick = () => {
		setIsOpen(true)
	}

	// 处理关闭
	const handleClose = () => {
		setIsOpen(false)
		setSearchQuery("")
	}

	// 处理ESC键关闭
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			handleClose()
		}
		if (e.key === "Enter") {
			handleSearch(e)
		}
	}

	// 当打开时自动聚焦输入框
	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isOpen])

	// 点击外部关闭
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				inputRef.current &&
				!inputRef.current
					.closest(".search-container")
					?.contains(event.target as Node)
			) {
				handleClose()
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside)
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isOpen])

	return (
		<div className={cn("relative flex items-center", className)}>
			{!isOpen ? (
				// 搜索图标按钮
				<button
					type="button"
					onClick={handleSearchClick}
					className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors duration-200"
					aria-label={t("Search.searchButton")}
				>
					<Search className="h-5 w-5 text-primary-foreground" />
				</button>
			) : (
				// 搜索输入框
				<div className="search-container fixed inset-x-0 top-0 z-[60] bg-primary dark:bg-slate-800 shadow-lg animate-in slide-in-from-top duration-200 md:absolute md:inset-x-auto md:top-auto md:right-0 md:w-80 md:rounded-lg md:mt-2 md:animate-in md:slide-in-from-right md:duration-200">
					<form
						onSubmit={handleSearch}
						className="flex items-center p-3 md:p-2"
					>
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-foreground/60" />
							<input
								ref={inputRef}
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder={t("Search.searchPlaceholder")}
								className="w-full pl-10 pr-10 py-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-lg text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 focus:border-transparent transition-all duration-200"
							/>
							<button
								type="button"
								onClick={handleClose}
								className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-primary-foreground/10 transition-colors duration-200"
								aria-label={t("Common.close")}
							>
								<X className="h-4 w-4 text-primary-foreground/60" />
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	)
}
