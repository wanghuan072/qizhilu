"use client"
import styles from "@/lib/components/common/MarkdownRenderer.module.css"
import { useTranslations } from "next-intl"
import React, { useEffect, useMemo, useRef, useState } from "react"

interface MarkdownContentProps {
	htmlContent: string
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ htmlContent }) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [contentHeight, setContentHeight] = useState<number | null>(null)
	const remainingContentRef = useRef<HTMLDivElement | null>(null)
	const t = useTranslations("Common")

	// 检查内容是否足够长，需要折叠
	const shouldCollapse = htmlContent.length > 500

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded)
	}

	// 分割HTML内容为预览部分和剩余部分
	const { previewContent, remainingContent } = useMemo(() => {
		if (!shouldCollapse) {
			return { previewContent: htmlContent, remainingContent: "" }
		}

		// 简单的HTML分割策略：找到大约200个字符处的合适分割点
		// 检查是否在客户端环境
		if (typeof document === "undefined") {
			// 在服务端，使用简单的文本长度作为备用方案
			if (htmlContent.length <= 500) {
				return { previewContent: htmlContent, remainingContent: "" }
			}
			// 服务端简单分割
			const previewContent = htmlContent.substring(0, 500) + "..."
			const remainingContent = htmlContent.substring(500)
			return { previewContent, remainingContent }
		}

		const tempDiv = document.createElement("div")
		tempDiv.innerHTML = htmlContent
		const textContent = tempDiv.textContent || tempDiv.innerText || ""

		if (textContent.length <= 200) {
			return { previewContent: htmlContent, remainingContent: "" }
		}

		// 找到合适的分割点（避免在HTML标签中间分割）
		let preview = ""
		let remaining = ""

		// 简单策略：按段落分割
		const paragraphs = htmlContent.split("</p>")
		let currentLength = 0
		const previewParts = []
		const remainingParts = []
		let foundSplitPoint = false

		for (let i = 0; i < paragraphs.length; i++) {
			const paragraph =
				paragraphs[i] + (i < paragraphs.length - 1 ? "</p>" : "")
			const paragraphText = paragraph.replace(/<[^>]*>/g, "")

			if (!foundSplitPoint && currentLength + paragraphText.length > 200) {
				foundSplitPoint = true
				// 如果这是第一段且太长，就包含它；否则在此处分割
				if (i === 0) {
					previewParts.push(paragraph)
					currentLength += paragraphText.length
				}
				// 剩余的段落都放到remaining中
				for (let j = i === 0 ? 1 : i; j < paragraphs.length; j++) {
					remainingParts.push(
						paragraphs[j] + (j < paragraphs.length - 1 ? "</p>" : ""),
					)
				}
				break
			} else {
				previewParts.push(paragraph)
				currentLength += paragraphText.length
			}
		}

		preview = previewParts.join("")
		remaining = remainingParts.join("")

		return { previewContent: preview, remainingContent: remaining }
	}, [htmlContent, shouldCollapse])

	// 动态测量剩余内容高度，展开时不再受固定 max-height 限制
	useEffect(() => {
		const contentEl = remainingContentRef.current
		if (!contentEl || !remainingContent) return

		const updateHeight = () => {
			setContentHeight(contentEl.scrollHeight+20)
		}

		updateHeight()

		if (typeof ResizeObserver !== "undefined") {
			const resizeObserver = new ResizeObserver(updateHeight)
			resizeObserver.observe(contentEl)
			return () => resizeObserver.disconnect()
		}

		window.addEventListener("resize", updateHeight)
		return () => window.removeEventListener("resize", updateHeight)
	}, [remainingContent])

	if (!shouldCollapse) {
		// 内容较短，直接显示
		return (
			<div
				className={`${styles["markdown-container"]} prose dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground prose-a:text-primary prose-img:my-4 max-w-none`}
				dangerouslySetInnerHTML={{ __html: htmlContent }}
			/>
		)
	}

	// 内容较长，在移动端使用折叠功能
	return (
		<div className="space-y-0">
			{/* 桌面端：正常显示所有内容 */}
			<div
				className={`hidden md:block ${styles["markdown-container"]} prose dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground prose-a:text-primary prose-img:my-4 max-w-none`}
				dangerouslySetInnerHTML={{ __html: htmlContent }}
			/>

			{/* 移动端：分段显示内容 - SEO友好版本 */}
			<div className="md:hidden">
				{/* 预览部分 - 始终显示 */}
				<div
					className={`${styles["markdown-container"]} prose dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground prose-a:text-primary prose-img:my-4 max-w-none`}
					dangerouslySetInnerHTML={{ __html: previewContent }}
				/>

				{/* 剩余内容 - 始终在DOM中，使用CSS控制显示 */}
				{remainingContent && (
					<div
						className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
							isExpanded ? "opacity-100" : "opacity-0"
						}`}
						style={{
							maxHeight: isExpanded
								? contentHeight
									? `${contentHeight}px`
									: "none"
								: 0,
						}}
					>
						<div
							ref={remainingContentRef}
							className={`${styles["markdown-container"]} prose dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground prose-a:text-primary prose-img:my-4 max-w-none`}
							dangerouslySetInnerHTML={{ __html: remainingContent }}
						/>
					</div>
				)}

				{/* 展开/收起按钮 */}
				{remainingContent && (
					<div className="pt-4">
						<button
							onClick={toggleExpanded}
							className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
						>
							<span>
								{isExpanded
									? t("showLess") || "收起内容"
									: t("readMore") || "展开阅读"}
							</span>
							<svg
								className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default MarkdownContent
