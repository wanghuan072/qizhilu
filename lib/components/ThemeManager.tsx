"use client"

import { useEffect, useState } from "react"

// 定义主题类型
export type ThemeColor = "default" | "green"

// 主题管理器组件
export const ThemeManager = () => {
	const [colorTheme, setColorTheme] = useState<ThemeColor>("default")

	// 在组件挂载时从 localStorage 读取主题设置
	useEffect(() => {
		// 检查 localStorage 中是否有保存的主题设置
		const savedColorTheme = localStorage.getItem(
			"color-theme",
		) as ThemeColor | null

		if (savedColorTheme) {
			setColorTheme(savedColorTheme)
			applyTheme(savedColorTheme)
		}
	}, [])

	// 应用主题
	const applyTheme = (theme: ThemeColor) => {
		const root = document.documentElement

		// 移除所有主题类
		root.classList.remove("green-theme")

		// 添加选定的主题类
		if (theme === "green") {
			root.classList.add("green-theme")
		}

		// 保存到 localStorage
		localStorage.setItem("color-theme", theme)
	}

	// 这个组件不渲染任何内容，只负责主题管理
	return null
}

// 切换主题的钩子函数
export const useColorTheme = () => {
	const [colorTheme, setColorTheme] = useState<ThemeColor>("default")

	// 在组件挂载时从 localStorage 读取主题设置
	useEffect(() => {
		// 检查 localStorage 中是否有保存的主题设置
		const savedColorTheme = localStorage.getItem(
			"color-theme",
		) as ThemeColor | null

		if (savedColorTheme) {
			setColorTheme(savedColorTheme)
		}
	}, [])

	// 切换主题
	const toggleColorTheme = () => {
		const newTheme = colorTheme === "default" ? "green" : "default"
		setColorTheme(newTheme)

		const root = document.documentElement

		// 移除所有主题类
		root.classList.remove("green-theme")

		// 添加选定的主题类
		if (newTheme === "green") {
			root.classList.add("green-theme")
		}

		// 保存到 localStorage
		localStorage.setItem("color-theme", newTheme)
	}

	return { colorTheme, toggleColorTheme }
}

export default ThemeManager
