"use client"
import { Icon } from "@/lib/components/common"
import { getPathnameWithLocale, getPathnameWithoutLocale } from "@/lib/i18n"
import {
	FriendLink,
	GameData,
	LocaleConfig,
	MetadataInfo,
	SocialLinksConfig,
} from "@/lib/types"
import { cn } from "@/lib/utils/react"
import { Link, usePathname } from "@i18n/navigation"
import { Languages } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import React, { useEffect, useState } from "react"

// 使用类型别名优化代码可读性
type FooterLink = FriendLink

interface DynamicFooterProps {
	name: string
	logo: {
		light: string
		dark: string
	}
	contactEmail: string
	socials: SocialLinksConfig
	locales: LocaleConfig
	metadata?: MetadataInfo
	friendLinks: FriendLink[]
	popularGames?: GameData[]
}

export const DynamicFooter: React.FC<DynamicFooterProps> = ({
	name,
	logo,
	contactEmail,
	locales,
	metadata,
	socials,
	friendLinks,
	popularGames,
}) => {
	const t = useTranslations("Footer")
	const locale = useLocale()
	const pathname = usePathname()
	const [showConsent, setShowConsent] = useState(false)
	const defaultLocale = locales.defaultLocale
	// Cookie同意处理
	useEffect(() => {
		// 检查是否已经同意Cookie
		const hasConsent = localStorage.getItem("cookieConsent")
		if (!hasConsent) {
			setShowConsent(true)
		}
	}, [])

	const handleConsent = (type: "all" | "necessary") => {
		localStorage.setItem("cookieConsent", type)
		setShowConsent(false)
	}

	// 渲染快速链接
	const renderQuickLink = (link: FooterLink) => {
		return (
			<li key={link.name}>
				<Link
					href={link.url}
					className="hover:text-primary-foreground/80 transition-colors"
					title={link.name}
					rel="noopener noreferrer"
					target="_blank"
				>
					{link.name}
				</Link>
			</li>
		)
	}

	// 渲染热门游戏链接
	const renderPopularGame = (game: GameData) => {
		return (
			<li key={game.id}>
				<Link
					href={`/games/${game.slug}`}
					className="hover:text-primary-foreground/80 transition-colors"
					title={`${game.gameLocaleName}`}
				>
					{game.gameLocaleName}
				</Link>
			</li>
		)
	}

	// 渲染社交媒体图标
	const renderSocialIcon = (platform: string, url?: string) => {
		if (!url) return null
		return (
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={platform}
				title={t("socialMediaTitle", { platform })}
				className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
			>
				<Icon name={platform.toLowerCase()} size={20} />
			</a>
		)
	}

	// 语言国旗映射
	const flagMap: Record<string, string> = {
		en: "🇺🇸", // 英语 - 美国
		de: "🇩🇪", // 德语 - 德国
		fr: "🇫🇷", // 法语 - 法国
		ja: "🇯🇵", // 日语 - 日本
		ko: "🇰🇷", // 韩语 - 韩国
		"zh-CN": "🇨🇳", // 简体中文 - 中国
		"zh-TW": "🇭🇰", // 繁体中文 - 香港
		"es-ES": "🇪🇸", // 西班牙语 - 西班牙
		it: "🇮🇹", // 意大利语 - 意大利
		nl: "🇳🇱", // 荷兰语 - 荷兰
		"pt-PT": "🇵🇹", // 葡萄牙语 - 葡萄牙
	}
	// 从pathname中移除当前locale前缀,并处理特殊情况
	const cleanPathname =
		pathname === `/${locale}`
			? "/"
			: pathname.replace(new RegExp(`^/${locale}`), "")

	return (
		<footer className="bg-primary dark:bg-slate-800 text-primary-foreground pt-6 md:pt-8 pb-6 mt-auto">
			<div className="container mx-auto px-4 sm:px-6">
				{/* 上部分 - 四列布局 */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-6">
					{/* 网站信息 */}
					<div>
						<div className="flex items-center mb-4">
							<Icon
								name={logo.light}
								alt={name}
								className={cn(
									"min-w-[1.5rem] min-h-[1.5rem] max-w-[3rem] max-h-[2rem]",
									"sm:min-w-[1.75rem] sm:min-h-[1.75rem] sm:max-w-[5rem] sm:max-h-[2.25rem]",
									"lg:min-w-[2rem] lg:min-h-[2rem] lg:max-w-[7rem] lg:max-h-[2.5rem]",
									"w-auto h-auto mr-1 sm:mr-2 flex-shrink-0 object-contain",
								)}
							/>
							<span className="text-xl font-bold text-primary-foreground">
								{name}
							</span>
						</div>
						<p className="mb-4 text-sm leading-relaxed text-primary-foreground/80">
							{metadata?.description}
						</p>
					</div>

					{/* 热门游戏 - 按需渲染 */}
					{popularGames && popularGames.length > 0 ? (
						<div>
							<h3 className="text-lg font-semibold text-primary-foreground mb-4">
								{t("popularGames")}
							</h3>
							<ul className="space-y-2 text-primary-foreground/80">
								{popularGames.slice(0, 5).map(renderPopularGame)}
							</ul>
						</div>
					) : (
						<div></div>
					)}

					{/* 友情链接 - 按需渲染 */}
					{friendLinks && friendLinks.length > 0 ? (
						<div>
							<h3 className="text-lg font-semibold text-primary-foreground mb-4">
								{t("friendLinks")}
							</h3>
							<ul className="space-y-2 text-primary-foreground/80">
								{friendLinks.map(renderQuickLink)}
							</ul>
						</div>
					) : (
						<div></div>
					)}

					{/* 联系我们 */}
					{contactEmail && (
						<div>
							<h3 className="text-lg font-semibold text-primary-foreground mb-4">
								{t("contactUs")}
							</h3>
							<div className="flex items-center mb-3 text-primary-foreground/80">
								<Icon name="mail" className="mr-2" size={16} />
								<a
									href={`mailto:${contactEmail}`}
									className="hover:text-primary-foreground transition-colors"
								>
									{contactEmail}
								</a>
							</div>
							{/* 社交媒体链接 */}
							{socials && (
								<div className="flex space-x-4 mt-3">
									{renderSocialIcon("Twitter", socials.twitter)}
									{renderSocialIcon("Facebook", socials.facebook)}
									{renderSocialIcon("Instagram", socials.instagram)}
									{renderSocialIcon("Youtube", socials.youtube)}
									{renderSocialIcon("Linkedin", socials.linkedin)}
								</div>
							)}
						</div>
					)}
				</div>
				<div className="flex justify-center text-sm mb-2">
					{/* 多语言链接 */}
					{locales.supportedLocales && locales.supportedLocales.length > 1 && (
						<div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:justify-end">
							<Languages className="h-4 w-4 text-primary-foreground/70" />
							{locales.supportedLocales.map((lang) => (
								<Link
									key={lang}
									href={cleanPathname}
									locale={lang === defaultLocale ? "." : lang}
									className={`flex items-center text-primary-foreground/70 hover:text-primary-foreground transition-colors ${
										locale === lang ? "font-bold" : ""
									}`}
								>
									<span className="mr-1">{flagMap[lang] ?? "🏳️"}</span>
									{locales.supportedLanguages[lang]?.localName || lang}
								</Link>
							))}
						</div>
					)}
				</div>
				{/* 下部分 - 版权信息和多语言链接 */}
				<div className="border-t border-border/50 pt-2 text-sm flex flex-col sm:flex-row justify-center items-center">
					{/* 左侧 - 版权声明和法律链接 */}
					<div className="text-primary-foreground/70 sm:mb-0 flex flex-col sm:flex-row justify-center items-center gap-2">
						<div className="mb-2 sm:mb-0">
							&copy; {new Date().getFullYear()} {name}. {t("allRightsReserved")}
						</div>
						<div className="flex flex-wrap justify-center gap-2">
							<Link
								href="/privacy-policy"
								className="hover:text-primary-foreground transition-colors underline"
								title={t("privacyPolicy")}
							>
								{t("privacyPolicy")}
							</Link>
							<Link
								href="/terms-of-service"
								className="hover:text-primary-foreground transition-colors underline"
								title={t("termsOfService")}
							>
								{t("termsOfService")}
							</Link>
							<Link
								href="/about-us"
								className="hover:text-primary-foreground transition-colors underline"
								title="About Us"
							>
								About Us
							</Link>
							<Link
								href="/contact-us"
								className="hover:text-primary-foreground transition-colors underline"
								title="Contact Us"
							>
								Contact Us
							</Link>
							<Link
								href="/copyright-infringement-notice-procedure"
								className="hover:text-primary-foreground transition-colors underline"
								title="Copyright Notice"
							>
								Copyright Notice
							</Link>

							{/* Powered by 信息 */}
							{/*<Link*/}
							{/*	href="https://qizhilu.com"*/}
							{/*	target="_blank"*/}
							{/*	className="hover:text-primary-foreground transition-colors"*/}
							{/*	title={t("termsOfService")}*/}
							{/*>*/}
							{/*	Powered by qizhilu.com*/}
							{/*</Link>*/}
						</div>
					</div>
				</div>
			</div>

			{/* Cookie同意提示 */}
			{showConsent && (
				<div className="fixed bottom-0 left-0 right-0 bg-card p-4 z-50 shadow-lg transition-opacity duration-300 opacity-100 text-card-foreground">
					<div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="text-sm text-center sm:text-left">
							{t("cookieConsentText")}{" "}
							<Link
								href="/cookies"
								className="text-primary hover:text-primary/80 underline ml-1"
								aria-label={t("learnMoreAboutCookies")}
							>
								{t("learnMore")}
							</Link>
						</div>
						<div className="flex space-x-3 flex-shrink-0">
							<button
								type="button"
								onClick={() => handleConsent("all")}
								className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
							>
								{t("acceptAll")}
							</button>
							<button
								type="button"
								onClick={() => handleConsent("necessary")}
								className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
							>
								{t("acceptNecessary")}
							</button>
						</div>
					</div>
				</div>
			)}
		</footer>
	)
}
