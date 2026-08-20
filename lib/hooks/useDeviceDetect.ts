"use client"

import { useEffect, useState } from "react"

/**
 * 设备检测 Hook
 * 用于检测当前设备是否为移动设备
 *
 * @returns 包含设备信息的对象
 */
export function useDeviceDetect() {
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const checkMobile = () => {
			const userAgent =
				typeof window.navigator === "undefined" ? "" : navigator.userAgent

			const mobile = Boolean(
				userAgent.match(
					/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i,
				),
			)

			setIsMobile(mobile)
		}

		checkMobile()

		// 监听窗口大小变化，重新检测设备类型
		window.addEventListener("resize", checkMobile)

		return () => {
			window.removeEventListener("resize", checkMobile)
		}
	}, [])

	return { isMobile }
}
