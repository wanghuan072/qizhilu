import { GameContentType } from "@/lib/types/api-types"
import rehypeRaw from "rehype-raw"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { visit } from "unist-util-visit"

interface MarkdownOptions {
	variant?: "default" | "faq"
	className?: string
}

/**
 * 在构建时将 Markdown 字符串转换为 HTML 字符串
 * 这个函数复制了原 MarkdownRenderer 组件的所有功能
 */
export async function processMarkdown(
	markdownContent: string,
	options: MarkdownOptions = {},
): Promise<string> {
	const { variant = "default", className = "" } = options

	// 默认类名，与原组件保持一致
	const defaultClassName =
		variant === "faq"
			? "prose dark:prose-invert prose-sm prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary prose-img:my-2 max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
			: "prose dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary prose-img:my-4 prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-th:text-foreground prose-td:text-foreground prose-li:text-foreground max-w-none"

	const finalClassName = className || defaultClassName

	// 自定义处理器，用于添加类名和处理特殊逻辑
	function customElementProcessor() {
		return (tree: any) => {
			visit(tree, "element", (node: any) => {
				// 为图片添加自定义类名和属性
				if (node.tagName === "img") {
					node.properties.className =
						"rounded-lg shadow-md my-4 max-w-full h-auto border border-border"
					node.properties.loading = "lazy"
				}

				// 为标题添加自定义类名
				if (node.tagName === "h1") {
					node.properties.className =
						"text-2xl font-bold mt-4 mb-2 text-foreground"
				}
				if (node.tagName === "h2") {
					node.properties.className =
						"text-xl font-bold mt-4 mb-2 text-foreground"
				}
				if (node.tagName === "h3") {
					node.properties.className =
						variant === "faq"
							? "text-lg font-bold text-primary mt-6"
							: "text-lg font-bold mt-3 mb-2 text-foreground"
				}
				if (node.tagName === "h4") {
					node.properties.className =
						"text-base font-bold mt-3 mb-2 text-foreground"
				}
				if (node.tagName === "h5") {
					node.properties.className =
						"text-sm font-bold mt-2 mb-1 text-foreground"
				}
				if (node.tagName === "h6") {
					node.properties.className =
						"text-xs font-bold mt-2 mb-1 text-foreground"
				}

				// 为段落添加自定义类名和 FAQ 特殊逻辑
				if (node.tagName === "p") {
					if (variant === "faq") {
						// 检查是否是FAQ答案（以"A:"开头）
						const textContent = getTextContent(node)
						if (textContent.startsWith("A:") || textContent.startsWith("A：")) {
							node.properties.className = "mt-2 text-foreground"
						} else {
							node.properties.className = "mb-4 text-foreground"
						}
					} else {
						node.properties.className = "mb-4 text-foreground"
					}
				}

				// 为列表添加自定义类名
				if (node.tagName === "ul") {
					node.properties.className =
						"list-disc pl-6 mb-4 space-y-1 text-foreground"
				}
				if (node.tagName === "ol") {
					node.properties.className =
						"list-decimal pl-6 mb-4 space-y-1 text-foreground"
				}
				if (node.tagName === "li") {
					node.properties.className = "mb-1 text-foreground"
				}

				// 为链接添加自定义类名
				if (node.tagName === "a") {
					node.properties.className =
						"text-primary hover:text-primary/80 hover:underline transition-colors"
				}

				// 为代码添加自定义类名
				if (node.tagName === "code") {
					// 检查是否在 pre 标签内
					const parent = node.parent
					if (parent && parent.tagName !== "pre") {
						node.properties.className =
							"bg-muted text-foreground px-1 py-0.5 rounded text-sm font-mono"
					}
				}
				if (node.tagName === "pre") {
					node.properties.className =
						"bg-muted text-foreground p-4 rounded-lg overflow-x-auto my-4 border border-border"
				}

				// 为引用块添加自定义类名
				if (node.tagName === "blockquote") {
					node.properties.className =
						"border-l-4 border-primary bg-muted/50 pl-4 py-2 my-4 text-muted-foreground italic"
				}

				// 为表格添加自定义类名
				if (node.tagName === "table") {
					// 包装表格在响应式容器中
					const wrapper = {
						type: "element",
						tagName: "div",
						properties: { className: "overflow-x-auto my-4" },
						children: [node],
					}
					node.properties.className =
						"w-full border-collapse border border-border"
					// 返回包装后的节点需要在上层处理
				}
				if (node.tagName === "th") {
					node.properties.className =
						"border border-border bg-muted px-4 py-2 text-left font-semibold text-foreground"
				}
				if (node.tagName === "td") {
					node.properties.className =
						"border border-border px-4 py-2 text-foreground"
				}

				// 为强调元素添加自定义类名
				if (node.tagName === "strong") {
					node.properties.className = "font-bold text-foreground"
				}
				if (node.tagName === "em") {
					node.properties.className = "italic text-foreground"
				}

				// 为分隔线添加自定义类名
				if (node.tagName === "hr") {
					node.properties.className = "border-border my-6"
				}
			})
		}
	}

	// 处理表格包装器
	function tableWrapperProcessor() {
		return (tree: any) => {
			visit(
				tree,
				"element",
				(node: any, index: number | undefined, parent: any) => {
					if (node.tagName === "table" && parent && typeof index === "number") {
						// 创建包装器
						const wrapper = {
							type: "element",
							tagName: "div",
							properties: { className: "overflow-x-auto my-4" },
							children: [node],
						}
						// 替换原节点
						parent.children[index] = wrapper
					}
				},
			)
		}
	}

	try {
		const result = await unified()
			.use(remarkParse) // 解析 Markdown
			.use(remarkGfm) // 支持 GFM (表格等)
			.use(remarkRehype, { allowDangerousHtml: true }) // 转换为 rehype AST
			.use(rehypeRaw) // 处理原始 HTML
			.use(customElementProcessor) // 添加自定义类名
			.use(tableWrapperProcessor) // 处理表格包装
			.use(rehypeStringify) // 转换为 HTML 字符串
			.process(markdownContent)

		const htmlContent = result.toString()

		// 包装在容器 div 中，添加样式类
		const containerClass = `${finalClassName} markdown-container ${variant === "faq" ? "faq" : ""}`
		return `<div class="${containerClass}">${htmlContent}</div>`
	} catch (error) {
		console.error("Markdown processing error:", error)
		return `<div class="${finalClassName} markdown-container">Error processing markdown content</div>`
	}
}

// 辅助函数：获取节点的文本内容
function getTextContent(node: any): string {
	if (node.type === "text") {
		return node.value
	}
	if (node.children) {
		return node.children.map(getTextContent).join("")
	}
	return ""
}

// 处理后的游戏内容类型
export interface ProcessedGameMarkdownContent {
	type: "markdown"
	tabId: string
	title: string
	icon?: string
	htmlContent: string
}

export interface ProcessedGameFAQContent {
	type: "faq"
	tabId: string
	title: string
	icon?: string
	items: Array<{
		question: string
		htmlAnswer: string
	}>
}

export type ProcessedGameContentType =
	| ProcessedGameMarkdownContent
	| ProcessedGameFAQContent

/**
 * 预处理游戏内容数组中的 markdown 内容
 */
export async function processGameContents(
	contents: GameContentType[],
): Promise<any[]> {
	const processedContents = await Promise.all(
		contents.map(async (content) => {
			if (content.type === "markdown" && "content" in content) {
				return {
					...content,
					htmlContent: await processMarkdown(content.content),
				}
			} else if (content.type === "faq" && "items" in content) {
				const processedItems = await Promise.all(
					content.items.map(async (item) => ({
						question: item.question,
						htmlAnswer: await processMarkdown(item.answer, { variant: "faq" }),
						answer: item.answer, // 保留原始内容以备兼容
					})),
				)
				return {
					...content,
					items: processedItems,
				}
			}
			return content
		}),
	)
	return processedContents
}
