import type { SVGProps } from "react"

export interface IconSvgProps extends SVGProps<SVGSVGElement> {
	size?: number
}

/**
 *
 */
export type PropsWithDisclosure<T> = T & {
	isOpen: boolean
	onClose: () => void
	onOpenChange: () => void
}

export interface Entity extends Record<string, any> {
	createdAt: Date | null
	updatedAt: Date | null
}

export interface ApiResponse<T> {
	status: number
	message: string
	data?: T
}

/**
 * 通用分页
 */
export interface Pageable {
	/**
	 * 当前页
	 */
	current?: number | string | null
	/**
	 * 页面大小
	 */
	size?: number | string | null
}

/**
 * 通用查询
 */
export interface Queryable<T> {
	/**
	 * 记录数据
	 */
	records?: T[]
	/**
	 * 记录总条数
	 */
	totalCount?: number
}

/**
 * 负责分页查询
 */
export type PageQueryable<T = any> = {
	[K in keyof Partial<T>]: any
} & Queryable<T> &
	Pageable &
	Record<string, any>

export interface PageableApiResponse<T = any> {
	/**
	 * 当前页
	 */
	current?: number | string | null
	/**
	 * 页面大小
	 */
	size?: number | string | null

	/**
	 * 记录数据
	 */
	records?: T[]
	/**
	 * 记录总条数
	 */
	totalCount?: number
}

/**
 * 币种枚举
 * 定义支持的货币类型
 */
export enum Currency {
	/** 美元 */
	USD = "USD",

	/** 人民币 */
	CNY = "CNY",

	/** 港币 */
	HKD = "HKD",

	/** 欧元 */
	EUR = "EUR",
}
