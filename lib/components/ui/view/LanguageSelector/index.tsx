"use client"

import { cn } from "@/lib/utils/react/styles"
import { Link } from "@i18n/navigation"
import { ChevronDown, Languages } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import React from "react"

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/lib/components/ui/dropdown-menu"
import { Language } from "@/lib/types"

interface LanguageSelectorProps {
	defaultLocale?: string
	languages: Record<string, Language>
	variant?: "dropdown" | "mobile-flat" | "mobile-button"
}

const flagMap: Record<string, string> = {
	en: "🇺🇸", // 英语 - 美国
	de: "🇩🇪", // 德语 - 德国
	fr: "🇫🇷", // 法语 - 法国
	ja: "🇯🇵", // 日语 - 日本
	ko: "🇰🇷", // 韩语 - 韩国
	"zh-TW": "🇭🇰", // 繁体中文 - 香港
	"zh-CN": "🇨🇳", // 简体中文 - 中国
	"es-ES": "🇪🇸", // 西班牙语 - 西班牙
	it: "🇮🇹", // 意大利语 - 意大利
	nl: "🇳🇱", // 荷兰语 - 荷兰
	"pt-PT": "🇵🇹", // 葡萄牙语 - 葡萄牙
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
	languages,
	defaultLocale = "en",
	variant = "dropdown",
}) => {
	const locale = useLocale()
	const currentLang = languages[locale]
	const pathname = usePathname()
	const t = useTranslations("Common")
	// 从pathname中移除当前locale前缀,并处理特殊情况
	const cleanPathname =
		pathname === `/${locale}`
			? "/"
			: pathname.replace(new RegExp(`^/${locale}`), "")

	// 移动端平铺展示
	if (variant === "mobile-flat") {
		return (
			<div className="w-full">
				<div className="flex items-center justify-center mb-3 text-foreground/70">
					<Languages className="mr-2 h-4 w-4" />
					<span className="text-sm font-medium">{t("selectLanguage")}</span>
				</div>
				<div className="grid grid-cols-2 gap-2">
					{Object.entries(languages).map(([key, lang]) => (
						<Link
							key={key}
							className={cn(
								"flex items-center gap-2 p-3 rounded-lg transition-all duration-200 touch-manipulation min-h-[48px]",
								locale === key
									? "bg-card text-card-foreground border-2 border-accent shadow-sm"
									: "bg-card/60 text-card-foreground/80 hover:bg-card/80 hover:text-card-foreground border border-border/40",
							)}
							href={cleanPathname}
							locale={key === defaultLocale ? "." : key}
							title={lang.localName}
						>
							<span className="text-base flex-shrink-0">
								{flagMap[key] ?? "🏳️"}
							</span>
							<span className="text-sm truncate font-medium">
								{lang.localName}
							</span>
						</Link>
					))}
				</div>
			</div>
		)
	}

	// 默认下拉菜单展示
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex cursor-pointer items-center bg-primary/80 text-primary-foreground dark:bg-transparent dark:text-primary-foreground rounded px-3 py-1 text-sm hover:bg-primary/90 dark:hover:bg-primary-foreground/10 transition-colors"
				>
					{/* 桌面端：显示Languages图标和语言名称 */}
					<div className="hidden md:flex items-center">
						<Languages className="mr-2 h-4 w-4" />
						{currentLang?.localName ?? locale}
						<ChevronDown className="ml-2 h-4 w-4" />
					</div>

					{/* 移动端：只显示国旗图标和下拉箭头 */}
					<div className="md:hidden flex items-center">
						<span className="text-base mr-1">{flagMap[locale] ?? "🏳️"}</span>
						<ChevronDown className="h-4 w-4" />
					</div>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="center"
				sideOffset={8}
				className="
          w-44
          bg-background/95
          text-foreground
          dark:bg-card/95
          dark:text-card-foreground
          backdrop-blur-md
          p-2
          rounded-md
          border border-border/40
          shadow-lg
          animate-in
          slide-in-from-top-2
          duration-200
          relative
          before:absolute
          before:inset-0
          before:rounded-md
          before:bg-gradient-to-r
          before:from-border/10
          before:via-transparent
          before:to-border/10
          before:animate-pulse
          before:pointer-events-none
        "
			>
				<div className="flex flex-col gap-1">
					{Object.entries(languages).map(([key, lang]) => (
						<DropdownMenuItem key={key} asChild>
							<Link
								className={cn(
									"flex items-center gap-2 w-full rounded-md px-2 py-2 transition-colors cursor-pointer",
									locale === key
										? "bg-accent text-accent-foreground font-semibold"
										: "hover:bg-accent/50 text-foreground/80 hover:text-foreground",
								)}
								href={cleanPathname}
								locale={key === defaultLocale ? "." : key}
							>
								<span className="mr-2 text-lg">{flagMap[key] ?? "🏳️"}</span>
								{lang.localName}
							</Link>
						</DropdownMenuItem>
					))}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default LanguageSelector
