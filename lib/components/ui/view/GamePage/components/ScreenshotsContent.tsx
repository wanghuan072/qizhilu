"use client"

import { Button } from "@/lib/components/ui/button"
import { Dialog, DialogContent } from "@/lib/components/ui/dialog"
import ClientImage from "@/lib/components/ui/view/ClientImage"
import { cn } from "@/lib/utils/react/styles"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { useTranslations } from "next-intl"
import React, { useCallback, useState } from "react"

interface ScreenshotsContentProps {
	items: { url: string; alt?: string }[]
	className?: string
}

/**
 * 游戏截图展示组件
 * 提供响应式网格布局和图片放大查看功能
 */
const ScreenshotsContent: React.FC<ScreenshotsContentProps> = ({
	items,
	className = "",
}) => {
	const t = useTranslations("Game")
	const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	// 处理图片点击事件
	const handleImageClick = useCallback((index: number) => {
		setSelectedImageIndex(index)
		setIsDialogOpen(true)
	}, [])

	// 处理上一张图片
	const handlePrevious = useCallback(() => {
		setSelectedImageIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1))
	}, [items.length])

	// 处理下一张图片
	const handleNext = useCallback(() => {
		setSelectedImageIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1))
	}, [items.length])

	// 处理键盘导航
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (!isDialogOpen) return

			switch (event.key) {
				case "ArrowLeft":
					event.preventDefault()
					handlePrevious()
					break
				case "ArrowRight":
					event.preventDefault()
					handleNext()
					break
				case "Escape":
					event.preventDefault()
					setIsDialogOpen(false)
					break
			}
		},
		[isDialogOpen, handlePrevious, handleNext],
	)

	if (!items || items.length === 0) {
		return (
			<div className={cn("text-center py-8", className)}>
				<p className="text-muted-foreground">暂无游戏截图</p>
			</div>
		)
	}

	const selectedScreenshot = items[selectedImageIndex]

	return (
		<div className={cn("space-y-6", className)}>
			{/* 截图网格 */}
			<h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">
				{t("screenshotsTitle")}
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
				{items.map((item, index) => (
					<button
						key={item.url}
						type="button"
						className="group relative bg-muted rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-none p-0 aspect-video"
						onClick={() => handleImageClick(index)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault()
								handleImageClick(index)
							}
						}}
						aria-label={`查看截图: ${item?.alt || `截图 ${index + 1}`}`}
						title={item.alt || `游戏截图 ${index + 1}`}
					>
						<ClientImage
							src={item.url}
							alt={item.alt || `游戏截图 ${index + 1}`}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
						/>

						{/* 悬停遮罩 */}
						<div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
							<div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
								<div className="bg-white/95 dark:bg-black/95 rounded-full p-3 shadow-lg">
									<ZoomIn className="h-5 w-5" />
								</div>
							</div>
						</div>
					</button>
				))}
			</div>

			{/* 图片放大查看对话框 */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent
					className="max-w-[95vw] max-h-[95vh] min-w-[80vw] min-h-[60vh] p-0 bg-black/95 border-none z-[600]"
					onKeyDown={handleKeyDown}
				>
					<div className="relative w-full h-full flex items-center justify-center min-h-[60vh] z-[601]">
						{/* 关闭按钮 */}
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border border-white/20"
							onClick={() => setIsDialogOpen(false)}
							aria-label="关闭"
						>
							<X className="h-5 w-5" />
						</Button>

						{/* 上一张按钮 */}
						{items.length > 1 && (
							<Button
								variant="ghost"
								size="icon"
								className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white border border-white/20 w-12 h-12"
								onClick={handlePrevious}
								aria-label="上一张"
							>
								<ChevronLeft className="h-7 w-7" />
							</Button>
						)}

						{/* 下一张按钮 */}
						{items.length > 1 && (
							<Button
								variant="ghost"
								size="icon"
								className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white border border-white/20 w-12 h-12"
								onClick={handleNext}
								aria-label="下一张"
							>
								<ChevronRight className="h-7 w-7" />
							</Button>
						)}

						{/* 图片容器 */}
						<div className="w-full h-full flex items-center justify-center p-8">
							<img
								src={selectedScreenshot?.url}
								alt={
									selectedScreenshot?.alt ||
									`游戏截图 ${selectedImageIndex + 1}`
								}
								className="max-w-full max-h-full object-contain min-w-[300px] min-h-[200px] rounded-lg shadow-2xl"
								loading="lazy"
							/>
						</div>

						{/* 图片信息 */}
						{selectedScreenshot?.alt && (
							<div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm max-w-[80%] text-center backdrop-blur-sm">
								{selectedScreenshot.alt}
							</div>
						)}

						{/* 图片计数器 */}
						{items.length > 1 && (
							<div className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
								{selectedImageIndex + 1} / {items.length}
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default ScreenshotsContent
