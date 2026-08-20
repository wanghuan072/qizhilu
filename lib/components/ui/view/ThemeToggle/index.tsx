"use client"

import { Icon } from "@/lib/components/common"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import React from "react"

interface ThemeToggleProps {
	variant?: "icon" | "button" | "menu-item" | "mobile-menu"
	className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
	variant = "icon",
	className = "",
}) => {
	const { theme, setTheme } = useTheme()
	const t = useTranslations("ThemeToggle")

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark")
	}

	if (variant === "menu-item") {
		return (
			<button
				type="button"
				onClick={toggleTheme}
				className={`w-full text-left font-medium hover:text-indigo-200 transition-colors flex items-center py-2 ${className}`}
				aria-label={t("toggleTheme")}
			>
				<span className="flex items-center">
					{theme === "dark" ? (
						<Icon name="Sun" className="h-5 w-5 mr-1" size={20} />
					) : (
						<Icon name="Moon" className="h-5 w-5 mr-1" size={20} />
					)}
					{theme === "dark" ? t("lightMode") : t("darkMode")}
				</span>
			</button>
		)
	}

	if (variant === "button") {
		return (
			<button
				type="button"
				onClick={toggleTheme}
				className={`flex items-center px-3 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors ${className}`}
				aria-label={t("toggleTheme")}
			>
				{theme === "dark" ? (
					<>
						<Icon name="Sun" className="h-4 w-4 mr-2" size={16} />
						{t("lightMode")}
					</>
				) : (
					<>
						<Icon name="Moon" className="h-4 w-4 mr-2" size={16} />
						{t("darkMode")}
					</>
				)}
			</button>
		)
	}

	if (variant === "mobile-menu") {
		return (
			<button
				type="button"
				onClick={toggleTheme}
				className={`p-2 rounded-full text-foreground hover:bg-accent/80 transition-colors duration-200 ${className}`}
				aria-label={t("toggleTheme")}
			>
				{theme === "dark" ? (
					<Icon name="Sun" className="h-5 w-5" size={20} />
				) : (
					<Icon name="Moon" className="h-5 w-5" size={20} />
				)}
			</button>
		)
	}

	// Default icon variant
	return (
		<button
			type="button"
			onClick={toggleTheme}
			className={`p-2 rounded-full text-primary-foreground hover:bg-primary-foreground/10 transition-colors duration-200 ${className}`}
			aria-label={t("toggleTheme")}
		>
			{theme === "dark" ? (
				<Icon name="Sun" className="h-5 w-5" size={20} />
			) : (
				<Icon name="Moon" className="h-5 w-5" size={20} />
			)}
		</button>
	)
}

export default ThemeToggle
