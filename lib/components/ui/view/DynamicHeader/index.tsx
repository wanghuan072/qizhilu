"use client"
import { Icon } from "@/lib/components/common/Icon"
import { useSidebar } from "@/lib/hooks/use-sidebar"
import { LocaleConfig, NavigationItem } from "@/lib/types"
import { cn } from "@/lib/utils/react"
import { Link, usePathname } from "@i18n/navigation"
import { useLocale } from "next-intl"
import React, { useState } from "react"
import { HeaderSearch } from "../HeaderSearch"
import { LanguageSelector } from "../LanguageSelector"
import { MobileSearchModal } from "../MobileSearchModal"
import { ThemeToggle } from "../ThemeToggle"

// 搜索数据接口 - 与 MobileSearchModal 保持一致
interface SearchGameData {
	id: string
	slug: string
	name: string
	gameLocaleName?: string
	gameLocaleDescription?: string
	screenshotUrl?: string
	rating?: number
}

interface SearchData {
	games: SearchGameData[]
	categories: import("@/lib/types/api-types").GameCategory[]
	tags: import("@/lib/types/api-types").GameTag[]
}

interface DynamicHeaderProps {
	name: string
	logo: {
		light: string
		dark: string
	}
	locales: LocaleConfig
	navigations: NavigationItem[]
	searchData: SearchData
}

export const DynamicHeader: React.FC<DynamicHeaderProps> = ({
	navigations,
	locales,
	name,
	logo,
	searchData,
}) => {
	const pathname = usePathname()
	const locale = useLocale()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
	// 移动端菜单项展开状态管理
	const [mobileMenuStates, setMobileMenuStates] = useState<
		Record<string, boolean>
	>({})

	// 检查是否为 GameBox 模式
	let isGameBox = false
	try {
		const sidebarContext = useSidebar()
		isGameBox = sidebarContext?.isGameBox ?? false
	} catch {
		// 如果不在 SafeSidebarProvider 中，则为普通模式
		isGameBox = false
	}

	// 切换移动菜单
	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen)
	}

	// 切换搜索弹窗
	const toggleSearchModal = () => {
		setIsSearchModalOpen(!isSearchModalOpen)
	}

	// 切换移动端菜单项展开状态
	const toggleMobileMenuItem = (itemId: string) => {
		setMobileMenuStates((prev) => ({
			...prev,
			[itemId]: !prev[itemId],
		}))
	}

	// 检查链接是否激活
	const isActive = (href: string) => {
		if (href === "/") {
			return pathname === href
		}
		return pathname === href || pathname.startsWith(`${href}/`)
	}

	// 渲染桌面菜单项 - 优化响应式和子菜单定位
	const renderMenuItem = (item: NavigationItem, level = 0) => {
		const active = isActive(item.href)
		const hasChildren = item.children && item.children.length > 0

		// 根据级别和屏幕尺寸应用不同的样式
		const linkClasses = cn(
			level === 0
				? {
						"inline-flex items-center px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 text-sm lg:text-base whitespace-nowrap": true,
						"bg-accent/30 text-primary-foreground font-medium": active,
						"hover:scale-105 hover:bg-primary-foreground/10 hover:text-primary-foreground":
							!active,
					}
				: {
						"flex items-center px-3 lg:px-4 py-2 lg:py-2.5 hover:bg-accent hover:text-accent-foreground rounded-lg mx-2 transition-all duration-150 text-sm lg:text-base": true,
						"bg-accent/20 text-accent-foreground font-medium": active,
					},
		)

		// 子菜单定位类 - 优化边缘检测和响应式
		const submenuClasses = cn(
			"absolute w-48 lg:w-56 bg-card/95 backdrop-blur-sm rounded-xl shadow-xl border border-border/50 opacity-0 invisible transition-all duration-200 transform z-[70]",
			level === 0
				? "left-0 mt-1 origin-top scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100"
				: "left-full top-0 origin-left scale-95 -translate-x-2 group-hover/sub:opacity-100 group-hover/sub:visible group-hover/sub:scale-100 group-hover/sub:translate-x-1 ml-1",
		)

		return (
			<div
				key={item.id}
				className={cn(level === 0 ? "relative group" : "relative group/sub")}
			>
				<Link href={item.href} className={linkClasses} title={item.label}>
					{item.iconName && (
						<Icon
							name={item.iconName}
							className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2 flex-shrink-0"
							size={20}
						/>
					)}
					<span className="truncate">{item.label}</span>
					{hasChildren &&
						(level === 0 ? (
							<Icon
								name="ChevronDown"
								className="h-3 w-3 lg:h-4 lg:w-4 ml-1 lg:ml-2 flex-shrink-0 transition-transform group-hover:rotate-180"
								size={16}
							/>
						) : (
							<Icon
								name="ChevronRight"
								className="h-3 w-3 lg:h-4 lg:w-4 ml-auto flex-shrink-0 transform group-hover/sub:translate-x-1 transition-transform"
								size={16}
							/>
						))}
				</Link>

				{/* 子菜单 - 优化定位和响应式 */}
				{hasChildren && (
					<div className={submenuClasses}>
						<div className="py-2 lg:py-3 text-card-foreground">
							{item.children?.map((child) => renderMenuItem(child, level + 1))}
						</div>
					</div>
				)}
			</div>
		)
	}

	// 渲染移动菜单项 - 增强视觉效果和交互体验
	const renderMobileMenuItem = (item: NavigationItem, level = 0) => {
		const active = isActive(item.href)
		const hasChildren = item.children && item.children.length > 0
		const isOpen = mobileMenuStates[item.id] || false

		// 根据层级计算缩进和视觉样式
		const getIndentClass = (level: number) => {
			switch (level) {
				case 0:
					return "pl-4 sm:pl-5"
				case 1:
					return "pl-8 sm:pl-10"
				case 2:
					return "pl-12 sm:pl-15"
				case 3:
					return "pl-16 sm:pl-20"
				default:
					return "pl-20 sm:pl-24"
			}
		}

		// 根据层级获取视觉装饰
		const getLevelDecoration = (level: number) => {
			if (level === 0) return null
			return (
				<div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-border/20 via-border/40 to-border/20"></div>
			)
		}

		const linkClasses = cn(
			"relative flex items-center py-3.5 sm:py-3 rounded-xl transition-all duration-300 touch-manipulation min-h-[48px] w-full   sm:min-h-[44px] group overflow-hidden",
			getIndentClass(level),
			{
				// 激活状态 - 增强视觉效果
				"text-primary bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 font-semibold shadow-sm border border-primary/20":
					active,
				// 普通状态 - 优雅的悬停效果
				"text-foreground/80 hover:text-foreground hover:bg-gradient-to-r hover:from-accent/10 hover:via-accent/5 hover:to-transparent active:scale-[0.98]":
					!active,
			},
		)

		const buttonClasses = cn(
			"relative p-2.5 sm:p-3 rounded-xl transition-all duration-300 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center group overflow-hidden",
			{
				"text-foreground/60 hover:text-foreground hover:bg-accent/80 active:bg-accent active:scale-95":
					!isOpen,
				"text-primary bg-primary/10 hover:bg-primary/15": isOpen,
			},
		)

		return (
			<div key={item.id} className="relative w-full">
				{/* 层级装饰线 */}
				{getLevelDecoration(level)}

				<div className="flex items-center justify-between w-full gap-2">
					<Link
						href={item.href}
						className={linkClasses}
						onClick={() => !hasChildren && setIsMenuOpen(false)}
						role="menuitem"
						title={item.label}
					>
						{/* 背景装饰效果 */}
						{active && (
							<div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-50"></div>
						)}

						{/* 悬停背景效果 */}
						<div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

						{/* 内容区域 */}
						<div className="relative flex items-center w-full min-w-0">
							{item.iconName && (
								<div className="relative flex-shrink-0 mr-3 sm:mr-4">
									{/* 图标背景装饰 */}
									<div
										className={cn(
											"absolute inset-0 rounded-lg transition-all duration-300",
											active
												? "bg-primary/20 scale-110"
												: "bg-transparent group-hover:bg-accent/20 group-hover:scale-105",
										)}
									></div>
									<Icon
										name={item.iconName}
										className={cn(
											"relative h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300",
											active
												? "text-primary scale-110"
												: "text-foreground/70 group-hover:text-foreground group-hover:scale-105",
										)}
										size={20}
									/>
								</div>
							)}
							<span
								className={cn(
									"text-sm sm:text-base truncate transition-all duration-300",
									active
										? "font-semibold"
										: "font-medium group-hover:translate-x-1",
								)}
							>
								{item.label}
							</span>
						</div>
					</Link>

					{hasChildren && (
						<button
							type="button"
							onClick={() => toggleMobileMenuItem(item.id)}
							className={buttonClasses}
							title={`${isOpen ? "收起" : "展开"} ${item.label}`}
						>
							{/* 按钮背景装饰 */}
							<div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

							<Icon
								name="ChevronDown"
								className={cn(
									"relative h-3 w-3 sm:h-4 sm:w-4 transition-all duration-300",
									isOpen
										? "rotate-180 text-primary"
										: "text-foreground/60 group-hover:text-foreground",
								)}
								size={16}
							/>
						</button>
					)}
				</div>

				{/* 子菜单 - 增强动画和视觉效果 */}
				{hasChildren && isOpen && (
					<div
						id={`submenu-${item.id}`}
						className="relative mt-2 ml-3 sm:ml-4 border-l-2 border-gradient-to-b from-border/40 via-border/20 to-transparent pl-2 sm:pl-3 animate-in slide-in-from-top-2 duration-300 ease-out"
						aria-label={`${item.label} 子菜单`}
					>
						{/* 子菜单背景装饰 */}
						<div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent rounded-r-xl opacity-50"></div>

						<div className="relative space-y-1">
							{item.children?.map((child, index) => (
								<div
									key={child.id}
									className={`animate-in slide-in-from-left duration-200 ease-out [animation-delay:${
										index * 30
									}ms]`}
								>
									{renderMobileMenuItem(child, level + 1)}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		)
	}

	return (
		<header className="bg-primary dark:bg-slate-800 text-primary-foreground shadow-lg sticky top-0 z-50 w-full">
			<div className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex items-center">
				{/* Logo 和站点名称 - 左端对齐 */}
				<div className="flex-shrink-0">
					<Link
						href="/"
						className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center min-w-0"
						title={name}
					>
						<Icon
							name={logo.light}
							alt={name}
							className={cn(
								"min-w-[2rem] min-h-[2rem] max-w-[4rem] max-h-[3rem]",
								"sm:min-w-[1.75rem] sm:min-h-[1.75rem] sm:max-w-[5rem] sm:max-h-[2.25rem]",
								"lg:min-w-[2rem] lg:min-h-[2rem] lg:max-w-[7rem] lg:max-h-[2.5rem]",
								"w-auto h-auto mr-1 sm:mr-2 flex-shrink-0 object-contain",
							)}
						/>
						<span className="hidden sm:inline truncate">{name}</span>
					</Link>
				</div>

				{/* 桌面导航 - 居中对齐 */}
				<div className="flex-1 flex justify-center">
					<nav className="hidden lg:flex xl:space-x-6 lg:space-x-4 text-base lg:text-lg">
						{navigations.map((item) => renderMenuItem(item))}
					</nav>
				</div>

				{/* 右侧工具栏 - 右端对齐 */}
				<div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
					{/* 搜索功能 */}
					{isGameBox ? (
						// GameBox 模式：所有屏幕尺寸都使用搜索按钮弹窗
						<button
							type="button"
							className="text-primary-foreground p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors touch-manipulation flex items-center justify-center"
							onClick={toggleSearchModal}
							aria-label="搜索"
							title="搜索"
						>
							<Icon name="Search" className="h-5 w-5 sm:h-6 sm:w-6" size={24} />
						</button>
					) : (
						// 普通模式：大屏幕显示搜索框，移动端显示搜索按钮
						<>
							<div className="hidden sm:block">
								<HeaderSearch />
							</div>
							<button
								type="button"
								className="sm:hidden text-primary-foreground p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors touch-manipulation flex items-center justify-center"
								onClick={toggleSearchModal}
								aria-label="搜索"
								title="搜索"
							>
								<Icon name="Search" className="h-5 w-5" size={20} />
							</button>
						</>
					)}

					<ThemeToggle />
					<LanguageSelector
						languages={locales.supportedLanguages}
						defaultLocale={locales.defaultLocale}
					/>

					{/* 移动菜单按钮 - 增大触摸区域 */}
					<button
						type="button"
						className="lg:hidden text-primary-foreground p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors touch-manipulation"
						onClick={toggleMenu}
						aria-label="Toggle menu"
					>
						<Icon name="Menu" className="h-5 w-5 sm:h-6 sm:w-6" size={24} />
					</button>
				</div>
			</div>

			{/* 移动菜单 - 增强视觉效果和用户体验 */}
			{isMenuOpen && (
				<div
					className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] lg:hidden animate-in fade-in duration-300"
					onClick={toggleMenu}
					aria-labelledby="mobile-menu-title"
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							toggleMenu()
						}
					}}
				>
					<div
						className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-gradient-to-br from-background via-background to-background/95 shadow-2xl border-l border-border/20 transform transition-all duration-500 ease-out animate-in slide-in-from-right"
						onClick={(e) => e.stopPropagation()}
					>
						{/* 菜单头部 - 增强视觉层次 */}
						<div className="relative flex items-center justify-between p-4 sm:p-5 border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm">
							{/* 装饰性背景元素 */}
							<div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-50"></div>

							<div className="relative flex items-center min-w-0 flex-1">
								<Icon
									name={logo.light}
									className="h-6 w-6 sm:h-7 sm:w-7 mr-2 sm:mr-3 flex-shrink-0 text-primary"
									size={28}
								/>
								<h2
									id="mobile-menu-title"
									className="text-base sm:text-lg font-bold truncate text-foreground/90"
								>
									{name}
								</h2>
							</div>

							<button
								type="button"
								className="relative p-2.5 rounded-xl hover:bg-accent/80 active:bg-accent active:scale-95 transition-all duration-200 touch-manipulation flex-shrink-0 group"
								onClick={toggleMenu}
								aria-label="关闭菜单"
							>
								{/* 按钮背景效果 */}
								<div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
								<Icon
									name="X"
									className="relative h-4 w-4 sm:h-5 sm:w-5 text-foreground/70 group-hover:text-foreground transition-colors duration-200"
									size={20}
								/>
							</button>
						</div>

						{/* 菜单内容 - 增强滚动体验和视觉层次 */}
						<div className="relative overflow-y-auto h-[calc(100vh-5rem)] sm:h-[calc(100vh-5.5rem)] py-3 sm:py-4 scrollbar-thin scrollbar-thumb-border/30 scrollbar-track-transparent">
							{/* 顶部渐变遮罩 */}
							<div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent pointer-events-none z-10"></div>

							{/* 移动端搜索 - 增强视觉效果 */}
							{/* <div className="px-4 sm:px-5 mb-4 sm:mb-5 sm:hidden">
								<div className="relative">
									<div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl"></div>
									<div className="relative bg-background/80 backdrop-blur-sm rounded-xl p-3 border border-border/30">
										<HeaderSearch />
									</div>
								</div>
							</div> */}

							{/* 导航菜单项 - 增强动画效果 */}
							<nav className="px-3 sm:px-4 space-y-1" aria-label="主导航">
								{navigations.map((item, index) => (
									<div
										key={item.id}
										className={`animate-in slide-in-from-right duration-300 ease-out [animation-delay:${
											index * 50
										}ms]`}
									>
										{renderMobileMenuItem(item)}
									</div>
								))}
							</nav>

							{/* 底部工具栏 - 增强视觉效果 */}
							<div className="relative mt-6 sm:mt-8 px-4 sm:px-5 pt-6 sm:pt-8">
								{/* 分隔线装饰 */}
								<div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent"></div>

								<div className="relative bg-muted/60 rounded-xl p-4 border border-border/30 backdrop-blur-sm space-y-4">
									<div className="flex justify-center">
										<ThemeToggle variant="mobile-menu" />
									</div>
									<LanguageSelector
										languages={locales.supportedLanguages}
										defaultLocale={locales.defaultLocale}
										variant="mobile-flat"
									/>
								</div>
							</div>

							{/* 底部渐变遮罩 */}
							<div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent pointer-events-none z-10"></div>
						</div>
					</div>
				</div>
			)}

			{/* 搜索弹窗 - 在 GameBox 模式或普通模式的移动端显示 */}
			{(isGameBox ||
				(!isGameBox &&
					typeof window !== "undefined" &&
					window.innerWidth < 640)) && (
				<MobileSearchModal
					isOpen={isSearchModalOpen}
					onClose={() => setIsSearchModalOpen(false)}
					locale={locale}
					searchData={searchData}
				/>
			)}
		</header>
	)
}
