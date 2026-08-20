"use client"

import { MdxArticleData } from "@/lib/services/custom-pages"
import { MDXRemote } from "next-mdx-remote/rsc"
import React, { useMemo } from "react"

interface MdxArticleProps {
	mdxData: MdxArticleData
	showNavigation?: boolean
	showFooter?: boolean
}

/**
 * MDX Article Component
 * Renders MDX content with front matter
 */
export function MdxArticle({
	mdxData,
	showNavigation,
	showFooter,
}: MdxArticleProps) {
	const {
		frontMatter: {
			title,
			description,
			showNavigation: fmShowNav,
			showFooter: fmShowFooter,
		},
		content,
	} = mdxData

	// 使用front matter中的设置，或者使用传入的props值
	const shouldShowNav = showNavigation ?? fmShowNav !== false
	const shouldShowFooter = showFooter ?? fmShowFooter !== false

	// 为了确保这些值被React Context使用，可以在这里设置
	// 例如可以使用useLayoutContext之类的方式

	return (
		<article className="prose dark:prose-invert max-w-none">
			{title && <h1 className="text-3xl font-bold mb-4">{title}</h1>}
			{description && (
				<p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
					{description}
				</p>
			)}

			<div className="mdx-content">
				<MDXRemote source={content} />
			</div>

			{/* 这是一个占位符，实际的导航和页脚应该在layout中处理 */}
			<div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
				{/* 导航和页脚相关的内容可以根据showNavigation和showFooter来控制 */}
			</div>
		</article>
	)
}
