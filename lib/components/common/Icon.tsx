import { cn } from "@lib/utils/react/styles"
import { HelpCircle } from "lucide-react"
/**
 * 统一图标组件
 * 支持多种图标类型：Lucide、SVG、图片
 * 优化版本：使用静态导入减少bundle大小
 */
import React from "react"
import { getIcon } from "./icon-map"
import { IconProps } from "./types"

/**
 * 统一图标组件
 * 根据提供的属性自动判断图标类型：
 * - 提供 name 属性时，使用 Lucide 图标
 * - 提供 src 属性时，使用图片图标
 * - 提供 component 属性时，使用 SVG 组件图标
 *
 * @param props 图标属性
 * @returns 图标组件
 */
export const Icon: React.FC<IconProps> = ({
	name,
	component,
	src,
	size = 24,
	color,
	className,
	alt,
	spin = false,
	rotate,
	...rest
}) => {
	// 计算样式
	const iconClassName = cn(
		className,
		spin && "animate-spin",
		rotate && `rotate-${rotate}`,
	)

	// 如果提供了 component 属性，渲染 SVG 组件
	if (component) {
		const SvgComponent = component
		return (
			<SvgComponent
				className={iconClassName}
				width={size}
				height={size}
				color={color}
				aria-hidden="true"
				{...rest}
			/>
		)
	}

	// 如果提供了 src 属性，渲染图片图标
	if (src) {
		// 移除 SVG 特有的属性，避免类型错误
		const { ref, ...imgProps } = rest as any

		return (
			<img
				src={src}
				alt={alt || "icon"}
				width={size}
				height={size}
				className={iconClassName}
				{...imgProps}
			/>
		)
	}

	// 如果提供了 name 属性，判断是否为 HTTP 链接或 Lucide 图标名
	if (name) {
		// 如果 name 是以 http 开头的链接，作为图片来渲染
		if (name.startsWith("http")) {
			// 移除 SVG 特有的属性，避免类型错误
			const { ref, ...imgProps } = rest as any

			return (
				<img
					src={name}
					alt={alt || "icon"}
					width={size}
					height={size}
					className={iconClassName}
					{...imgProps}
				/>
			)
		}

		// 使用静态导入渲染 Lucide 图标
		const IconComponent = getIcon(name)
		if (IconComponent) {
			return (
				<IconComponent
					size={size}
					color={color}
					className={iconClassName}
					aria-hidden="true"
					{...rest}
				/>
			)
		} else {
			// 如果找不到图标，显示默认图标
			console.warn(`Icon "${name}" not found in icon mapping`)
			return (
				<HelpCircle
					size={size}
					color={color}
					className={iconClassName}
					aria-hidden="true"
					{...rest}
				/>
			)
		}
	}

	// 默认返回帮助图标
	console.warn("No icon source provided (name, src, or component)")
	return (
		<HelpCircle
			size={size}
			color={color}
			className={iconClassName}
			aria-hidden="true"
			{...rest}
		/>
	)
}
