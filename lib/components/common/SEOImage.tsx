"use client"

import Image, { ImageProps } from "next/image"
import React from "react"

interface SEOImageProps extends Omit<ImageProps, "alt"> {
	alt: string // 强制要求 alt 属性
	title?: string // 添加 title 属性
	caption?: string // 图片说明
	priority?: boolean // 是否优先加载
	lazyBoundary?: string // 懒加载边界
	fetchPriority?: "high" | "low" | "auto" // 获取优先级
}

/**
 * SEO 优化的图片组件
 * 强制要求 alt 属性，并提供其他 SEO 相关属性
 */
export const SEOImage: React.FC<SEOImageProps> = ({
	alt,
	title,
	caption,
	priority = false,
	lazyBoundary = "200px",
	fetchPriority = "auto",
	...props
}) => {
	return (
		<figure className="relative">
			<Image
				alt={alt}
				title={title || alt}
				priority={priority}
				lazyBoundary={lazyBoundary}
				fetchPriority={fetchPriority}
				{...props}
			/>
			{caption && (
				<figcaption className="text-sm text-gray-600 mt-2 text-center">
					{caption}
				</figcaption>
			)}
		</figure>
	)
}

export default SEOImage
