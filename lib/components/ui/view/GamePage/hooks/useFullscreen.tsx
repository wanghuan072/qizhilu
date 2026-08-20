"use client"

import { useCallback, useEffect } from "react"

export const useFullscreen = (
	iframeRef: React.RefObject<HTMLIFrameElement | null>,
) => {
	const isIOS = useCallback(() => {
		return /iPad|iPhone|iPod/.test(navigator.userAgent)
	}, [])

	const isSafari = useCallback(() => {
		return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
	}, [])

	useEffect(() => {
		const handleFullscreenChange = () => {
			if (!document.fullscreenElement && iframeRef.current) {
				iframeRef.current.style.backgroundColor = ""
			}
		}

		document.addEventListener("fullscreenchange", handleFullscreenChange)
		document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
		document.addEventListener("mozfullscreenchange", handleFullscreenChange)
		document.addEventListener("MSFullscreenChange", handleFullscreenChange)

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange)
			document.removeEventListener(
				"webkitfullscreenchange",
				handleFullscreenChange,
			)
			document.removeEventListener(
				"mozfullscreenchange",
				handleFullscreenChange,
			)
			document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
		}
	}, [iframeRef])

	const toggleFullscreen = useCallback(() => {
		if (!iframeRef.current) return

		const iframe = iframeRef.current

		const isCurrentlyFullscreen =
			document.fullscreenElement ||
			(document as any).webkitFullscreenElement ||
			(document as any).mozFullScreenElement ||
			(document as any).msFullscreenElement

		if (isCurrentlyFullscreen) {
			if (document.exitFullscreen) {
				document.exitFullscreen().catch((err) => {
					console.error(`退出全屏时出错: ${err.message}`)
				})
			} else if ((document as any).webkitExitFullscreen) {
				;(document as any).webkitExitFullscreen()
			} else if ((document as any).mozCancelFullScreen) {
				;(document as any).mozCancelFullScreen()
			} else if ((document as any).msExitFullscreen) {
				;(document as any).msExitFullscreen()
			}
		} else {
			const enterFullscreen = () => {
				iframe.style.backgroundColor = "rgb(var(--background))"
				iframe.style.transition = "background-color 0.2s ease-in-out"

				if (iframe.requestFullscreen) {
					iframe.requestFullscreen().catch((err) => {
						console.error(`标准全屏API失败: ${err.message}`)
						tryParentFullscreen()
					})
				} else if ((iframe as any).webkitRequestFullscreen) {
					;(iframe as any).webkitRequestFullscreen()
				} else if ((iframe as any).mozRequestFullScreen) {
					;(iframe as any).mozRequestFullScreen()
				} else if ((iframe as any).msRequestFullscreen) {
					;(iframe as any).msRequestFullscreen()
				} else {
					tryParentFullscreen()
				}
			}

			const tryParentFullscreen = () => {
				const container = iframe.closest(".w-full") as HTMLElement
				if (container) {
					if (container.requestFullscreen) {
						container.requestFullscreen().catch((err) => {
							console.error(`容器全屏失败: ${err.message}`)
							showIOSFullscreenFallback()
						})
					} else if ((container as any).webkitRequestFullscreen) {
						;(container as any).webkitRequestFullscreen()
					} else {
						showIOSFullscreenFallback()
					}
				} else {
					showIOSFullscreenFallback()
				}
			}

			const showIOSFullscreenFallback = () => {
				if (isIOS() && isSafari()) {
					iframe.style.position = "fixed"
					iframe.style.top = "0"
					iframe.style.left = "0"
					iframe.style.width = "100vw"
					iframe.style.height = "100vh"
					iframe.style.zIndex = "9999"
					iframe.style.backgroundColor = "rgb(var(--background))"

					document.body.style.overflow = "hidden"

					const exitButton = document.createElement("button")
					exitButton.innerHTML = "✕"
					exitButton.style.cssText = `
						position: fixed;
						top: 20px;
						right: 20px;
						z-index: 10000;
						background: rgba(0,0,0,0.7);
						color: white;
						border: none;
						border-radius: 50%;
						width: 40px;
						height: 40px;
						font-size: 20px;
						cursor: pointer;
					`
					exitButton.onclick = () => {
						iframe.style.position = ""
						iframe.style.top = ""
						iframe.style.left = ""
						iframe.style.width = ""
						iframe.style.height = ""
						iframe.style.zIndex = ""
						document.body.style.overflow = ""
						exitButton.remove()
					}
					document.body.appendChild(exitButton)

					console.log("iOS Safari: 使用备用全屏方案")
					return
				}

				console.error("全屏功能在此设备/浏览器上不支持")
			}

			enterFullscreen()
		}
	}, [iframeRef, isIOS, isSafari])

	return { toggleFullscreen }
}
