"use client"

import styles from "@/lib/components/common/MarkdownRenderer.module.css"
import { useTranslations } from "next-intl"
import React, { useEffect, useRef, useState } from "react"

interface ProcessedFAQItem {
	question: string
	htmlAnswer?: string
	answer?: string
}

interface FAQContentProps {
	items: ProcessedFAQItem[]
	className?: string
}

/**
 * FAQ 内容组件
 * 桌面端：正常显示所有问答
 * 移动端：默认只显示问题，点击展开答案
 */
const FAQContent: React.FC<FAQContentProps> = ({ items, className = "" }) => {
	const t = useTranslations("Game")
	const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
	const [contentHeights, setContentHeights] = useState<Record<number, number>>(
		{},
	)
	const answerRefs = useRef<(HTMLDivElement | null)[]>([])

	// 验证数据结构
	if (!items || !Array.isArray(items) || items.length === 0) {
		return <></>
	}

	const toggleExpanded = (index: number) => {
		const newExpanded = new Set(expandedItems)
		if (newExpanded.has(index)) {
			newExpanded.delete(index)
		} else {
			newExpanded.add(index)
		}
		setExpandedItems(newExpanded)
	}

	// 测量每个答案的实际高度，避免使用固定 max-height 导致内容被裁切
	useEffect(() => {
		if (!items?.length) return

		const resizeObservers: ResizeObserver[] = []

		const updateHeightForIndex = (index: number) => {
			const el = answerRefs.current[index]
			if (!el) return
			const nextHeight = el.scrollHeight
			setContentHeights((prev) => {
				if (prev[index] === nextHeight) return prev
				return { ...prev, [index]: nextHeight }
			})
		}

		items.forEach((_, index) => {
			updateHeightForIndex(index)

			const el = answerRefs.current[index]
			if (!el || typeof ResizeObserver === "undefined") return
			const observer = new ResizeObserver(() => updateHeightForIndex(index))
			observer.observe(el)
			resizeObservers.push(observer)
		})

		const handleResize = () => {
			items.forEach((_, index) => updateHeightForIndex(index))
		}
		window.addEventListener("resize", handleResize)

		return () => {
			resizeObservers.forEach((observer) => observer.disconnect())
			window.removeEventListener("resize", handleResize)
		}
	}, [items])

	return (
		<div className={`space-y-6 ${className}`}>
			<h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">
				{t("faqTitle")}
			</h2>
			{items.map((faq: ProcessedFAQItem, index: number) => {
				const isExpanded = expandedItems.has(index)
				const answerContent = faq.htmlAnswer || faq.answer || ""

				return (
					<div key={index} className="space-y-2">
						{/* 桌面端：正常显示 */}
						<div className="hidden md:block space-y-2">
							{/* 问题标题 */}
							<h3 className="text-lg font-semibold text-foreground flex items-start">
								<span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
								{faq.question}
							</h3>

							{/* 答案内容 */}
							<div className="ml-5 text-muted-foreground">
								<div
									className={`${styles["markdown-container"]} faq prose dark:prose-invert prose-sm prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary prose-img:my-2 max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`}
									dangerouslySetInnerHTML={{ __html: answerContent }}
								/>
							</div>
						</div>

						{/* 移动端：可折叠显示 - 使用CSS隐藏内容，保持SEO友好 */}
						<div className="md:hidden">
							{/* 问题标题 - 可点击 */}
							<button
								onClick={() => toggleExpanded(index)}
								className="w-full text-left"
							>
								<h3 className="text-lg font-semibold text-foreground flex items-start hover:text-primary transition-colors">
									<span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
									<span className="flex-1">{faq.question}</span>
									<svg
										className={`w-5 h-5 ml-2 mt-1 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
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
								</h3>
							</button>

							{/* 答案内容 - 始终在DOM中，使用CSS控制显示 */}
							<div
								className={`ml-5 text-muted-foreground mt-2 transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
									isExpanded ? "opacity-100" : "opacity-0"
								}`}
								style={{
									maxHeight: isExpanded
										? contentHeights[index]
											? `${contentHeights[index]}px`
											: "none"
										: 0,
								}}
							>
								<div
									ref={(el) => {
										answerRefs.current[index] = el
									}}
									className={`${styles["markdown-container"]} faq prose dark:prose-invert prose-sm prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary prose-img:my-2 max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`}
									dangerouslySetInnerHTML={{ __html: answerContent }}
								/>
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default FAQContent
