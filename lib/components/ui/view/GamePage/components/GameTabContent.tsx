import { GameContentType } from "@/lib/types/api-types"
import { cn } from "@/lib/utils/react/styles"
import React, { Suspense, lazy } from "react"
import RelatedVideosContent from "./RelatedVideosContent"
import ScreenshotsContent from "./ScreenshotsContent"

// 动态导入 markdown 相关组件
const FAQContent = lazy(() => import("./FAQContent"))
const MarkdownContent = lazy(() => import("./MarkdownContent"))

interface GameTabContentProps {
	content: GameContentType
	className?: string
}

/**
 * Tab 内容渲染器组件
 * 根据 tab.type 类型渲染不同的内容组件
 */
const GameTabContent: React.FC<GameTabContentProps> = ({
	content,
	className = "",
}) => {
	return (
		<section
			key={content.tabId}
			id={content.tabId}
			className={cn("scroll-mt-24", className)}
			data-section={content.tabId}
		>
			<div className="bg-card rounded-xl shadow-md overflow-hidden p-4 sm:p-6">
				<a href={`#${content.tabId}`} className="hidden">
					{content.title || content.tabId}
				</a>

				{/* 根据tab.type类型渲染不同内容 */}
				{content.type === "video" ? (
					<RelatedVideosContent items={content.items} />
				) : content.type === "faq" ? (
					<Suspense
						fallback={
							<div className="h-32 bg-muted/30 rounded animate-pulse" />
						}
					>
						<FAQContent items={content.items} />
					</Suspense>
				) : content.type === "image" && content.items ? (
					<ScreenshotsContent items={content.items} />
				) : content.type === "markdown" ? (
					<Suspense
						fallback={
							<div className="h-32 bg-muted/30 rounded animate-pulse" />
						}
					>
						<MarkdownContent
							htmlContent={
								(content as any).htmlContent || (content as any).content || ""
							}
						/>
					</Suspense>
				) : (
					<></>
				)}
			</div>
		</section>
	)
}
export { GameTabContent }

export default GameTabContent
