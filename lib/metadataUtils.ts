import * as cheerio from "cheerio"
import type { Metadata } from "next"

interface ParsedMetadata {
	metadata: Metadata
	rawScripts: { content: string; [key: string]: any }[]
}

/**
 * 解析用户提供的自定义HTML内容字符串，将其分离为
 * Next.js Metadata API可以处理的部分和必须作为原始脚本注入的部分。
 *
 * @param htmlContent 用户提供的自定义HTML字符串
 * @returns 包含结构化元数据和原始脚本内容的对象
 */
export function parseCustomHeaderContent(
	htmlContent: string | undefined | null,
): ParsedMetadata {
	if (!htmlContent) {
		return { metadata: {}, rawScripts: [] }
	}

	const $ = cheerio.load(htmlContent, null, false)
	const otherMetadata: {
		[key: string]: string | number | (string | number)[]
	} = {}
	const rawScripts: ParsedMetadata["rawScripts"] = []

	// 遍历提供字符串中的所有顶层元素
	$("*").each((_, el) => {
		// 确保el是Element类型
		if (el.type !== "tag") return

		const element = $(el)
		const tagName = el.name.toLowerCase()

		if (tagName === "meta") {
			const name = element.attr("name")
			const property = element.attr("property")
			const httpEquiv = element.attr("http-equiv")
			const content = element.attr("content")
			const key = name || property || httpEquiv

			if (key && content) {
				// 这是标准的meta标签，添加到other字段
				otherMetadata[key] = content
			}
		} else if (tagName === "script") {
			const scriptContent = element.html() || ""
			const scriptAttrs = el.attribs || {}
			rawScripts.push({
				content: scriptContent,
				...scriptAttrs,
			})
		} else {
			// 对于其他标签如<link>、<style>或注释，我们将它们作为原始HTML处理
			const rawHtml = $.html(element)
			if (rawHtml) {
				rawScripts.push({
					content: rawHtml,
					type: "raw-html",
				})
			}
		}
	})

	return {
		metadata: {
			other: otherMetadata,
		},
		rawScripts,
	}
}
