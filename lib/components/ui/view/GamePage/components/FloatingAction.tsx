"use client"
import { Icon } from "@/lib/components/common"
import ClientButton from "@/lib/components/ui/view/ClientButton"
import { useTranslations } from "next-intl"
import { throttle } from "radash"
import { useCallback } from "react"

export default function FloatingAction() {
	const t = useTranslations()

	// 节流处理的回到顶部函数
	const handleBackToTop = useCallback(
		throttle({ interval: 500 }, () => {
			window.scrollTo({ top: 0, behavior: "smooth" })
		}),
		[],
	)

	// 节流处理的跳转到游戏函数
	const handleToGame = useCallback(
		throttle({ interval: 500 }, () => {
			// 优先查找iframe容器，然后查找游戏区域相关元素
			const gameElement =
				document.getElementById("iframe-container") ||
				document.querySelector("iframe") ||
				document.querySelector(".aspect-w-16") ||
				document.querySelector("#game-iframe") ||
				document.querySelector("[data-game-iframe]")
			if (gameElement)
				gameElement.scrollIntoView({ behavior: "smooth", block: "start" })
		}),
		[],
	)

	// 节流处理的跳转到信息函数
	const handleToInfo = useCallback(
		throttle({ interval: 500 }, () => {
			// 查找文案模块的第一个区域，优先级：导航标签容器 > 游戏信息 > 内容区域
			const infoElement =
				document.getElementById("content-tabs-container") ||
				document.getElementById("game-info") ||
				document.querySelector("[data-content-section]") ||
				document.querySelector(".game-content-section")
			if (infoElement)
				infoElement.scrollIntoView({ behavior: "smooth", block: "start" })
		}),
		[],
	)

	// 节流处理的跳转到评论函数
	const handleToComments = useCallback(
		throttle({ interval: 500 }, () => {
			const commentsElement =
				document.getElementById("game-comments") ||
				document.querySelector("[data-comments-section]") ||
				document.querySelector(".comments-section")
			if (commentsElement)
				commentsElement.scrollIntoView({
					behavior: "smooth",
					block: "start",
				})
		}),
		[],
	)

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
			{/* Back to Top Button */}
			<ClientButton
				id="back-to-top"
				title={t("Common.backToTop") || "Back to Top"}
				className="bg-primary dark:bg-slate-700 text-white p-3 rounded-full shadow-lg hover:bg-accent/80 hover:cursor-pointer dark:hover:bg-slate-600 transition-colors backdrop-blur-xl"
				onClick={handleBackToTop}
				icon={
					<Icon name="ChevronRight" className="h-6 w-6 -rotate-90" size={24} />
				}
			/>
			{/* Quick Nav: To Game */}
			<ClientButton
				id="to-game"
				title={t("Common.backToGame") || "Back to Game"}
				className="hidden md:block bg-primary dark:bg-slate-700 text-white p-3 rounded-full shadow-lg hover:bg-accent/80 hover:cursor-pointer dark:hover:bg-slate-600 transition-colors backdrop-blur-xl"
				onClick={handleToGame}
				icon={<Icon name="Gamepad2" className="h-6 w-6" size={24} />}
			/>
			{/* Quick Nav: To Info (Scroll to Tabs or specific section) */}
			<ClientButton
				id="to-info"
				title={t("Common.gameInfo") || "Game Info"}
				className="hidden md:block bg-primary dark:bg-slate-700 text-white p-3 rounded-full shadow-lg hover:bg-accent/80 hover:cursor-pointer dark:hover:bg-slate-600 transition-colors backdrop-blur-xl"
				onClick={handleToInfo}
				icon={<Icon name="Info" className="h-6 w-6" size={24} />}
			/>
			{/* Quick Nav: To Comments */}
			<ClientButton
				id="to-comments"
				title={t("Common.playerComments") || "Player Comments"}
				className="hidden md:block bg-primary dark:bg-slate-700 text-white p-3 rounded-full shadow-lg hover:bg-accent/80 hover:cursor-pointer dark:hover:bg-slate-600 transition-colors backdrop-blur-xl"
				onClick={handleToComments}
				icon={<Icon name="MessageCircle" className="h-6 w-6" size={24} />}
			/>
		</div>
	)
}
