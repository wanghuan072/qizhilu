"use client"

import * as React from "react"

// 扩展原始 sidebar 钩子的类型
interface ExtendedSidebarHook {
	// 原始 sidebar 钩子的所有属性
	state: "expanded" | "collapsed"
	open: boolean
	setOpen: (open: boolean) => void
	openMobile: boolean
	setOpenMobile: (open: boolean) => void
	isMobile: boolean
	toggleSidebar: () => void

	// 扩展的属性
	isExpanded: boolean
	setIsExpanded: (expanded: boolean) => void
	isGameBox: boolean
	setIsGameBox: (isGameBox: boolean) => void
}

// 创建一个安全的Context来管理sidebar状态
const SafeSidebarContext = React.createContext<ExtendedSidebarHook | null>(null)

/**
 * 安全的 sidebar 钩子
 * 如果没有SidebarProvider，则返回默认值
 */
export function useSidebar(): ExtendedSidebarHook {
	const context = React.useContext(SafeSidebarContext)

	if (context) {
		return context
	}

	// 如果没有Provider，返回默认值
	const [isGameBox, setIsGameBox] = React.useState(false)

	return {
		state: "collapsed" as const,
		open: false,
		setOpen: () => {},
		openMobile: false,
		setOpenMobile: () => {},
		isMobile: false,
		toggleSidebar: () => {},
		isExpanded: false,
		setIsExpanded: () => {},
		isGameBox: false,
		setIsGameBox,
	}
}

/**
 * 安全的 SidebarProvider
 * 只在需要时提供sidebar功能
 */
export function SafeSidebarProvider({
	children,
}: { children: React.ReactNode }) {
	const [isGameBox, setIsGameBox] = React.useState(false)
	const [isExpanded, setIsExpanded] = React.useState(false)
	const [openMobile, setOpenMobile] = React.useState(false)
	const [isMobile, setIsMobile] = React.useState(false)

	// 检测移动设备
	React.useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768)
		}

		checkMobile()
		window.addEventListener("resize", checkMobile)
		return () => window.removeEventListener("resize", checkMobile)
	}, [])

	const contextValue: ExtendedSidebarHook = {
		state: isExpanded ? "expanded" : "collapsed",
		open: isExpanded,
		setOpen: setIsExpanded,
		openMobile,
		setOpenMobile,
		isMobile,
		toggleSidebar: () => setIsExpanded(!isExpanded),
		isExpanded,
		setIsExpanded,
		isGameBox,
		setIsGameBox,
	}

	return (
		<SafeSidebarContext.Provider value={contextValue}>
			{children}
		</SafeSidebarContext.Provider>
	)
}
