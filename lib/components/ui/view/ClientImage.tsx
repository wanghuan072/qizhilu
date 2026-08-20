"use client"

import { cn } from "@/lib/utils/react"
import { isEmpty } from "radash"
import React from "react"

interface ClientImageProps {
	src: string
	alt: string
	width?: number
	height?: number
	className?: string
	fallbackSrc?: string
}

/**
 * 客户端图片组件，处理图片加载错误
 */
const ClientImage: React.FC<ClientImageProps> = ({
	src,
	alt,
	width,
	height,
	className,
	fallbackSrc = "/image-error.svg",
}) => {
	if (isEmpty(src)) {
		return (
			<div className={cn("p-4 bg-muted/30 rounded-md", className)}>
				<img
					src={fallbackSrc}
					alt={alt}
					className={cn("w-full h-full object-contain")}
				/>
			</div>
		)
	}
	const imageSrc = isEmpty(src) ? fallbackSrc : src
	const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		const target = e.target as HTMLImageElement
		target.onerror = null
		if (fallbackSrc) {
			target.src = fallbackSrc
		}
	}

	return (
		<img
			src={imageSrc}
			alt={alt}
			width={width}
			height={height}
			className={className}
			onError={handleError}
		/>
	)
}

// 使用 React.memo 包装组件，避免不必要的重新渲染
export const MemoizedClientImage = React.memo(ClientImage)

export default MemoizedClientImage
