/**
 * 图标系统类型定义
 */
import { SVGProps } from "react"

/**
 * 图标分组接口
 */
export interface IconGroup {
	/**
	 * 分组名称
	 */
	name: string

	/**
	 * 分组图标列表
	 */
	icons: string[]
}

/**
 * 图标属性接口
 * 根据提供的属性自动判断图标类型
 */
export interface IconProps
	extends Omit<
		SVGProps<SVGSVGElement>,
		"size" | "name" | "src" | "component" | "rotate"
	> {
	/**
	 * Lucide 图标名称 (不应与 component 同时使用)
	 */
	name?: string

	/**
	 * 图片URL (不应与 component 同时使用)
	 */
	src?: string

	/**
	 * SVG组件
	 */
	component?: React.ComponentType<any>

	/**
	 * 图标尺寸
	 * @default 24
	 */
	size?: number

	/**
	 * 图标颜色
	 */
	color?: string

	/**
	 * 图标类名
	 */
	className?: string

	/**
	 * 图标替代文本 (用于可访问性)
	 */
	alt?: string

	/**
	 * 是否旋转
	 */
	spin?: boolean

	/**
	 * 旋转角度
	 */
	rotate?: number | string
}
