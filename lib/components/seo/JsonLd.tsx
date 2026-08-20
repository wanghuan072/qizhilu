import React from "react"
import type { Thing, WithContext } from "schema-dts"

interface JsonLdProps {
	data: WithContext<Thing> | WithContext<Thing>[]
}

/**
 * JSON-LD 组件 - 用于渲染结构化数据
 * 使用 schema-dts 提供类型约束
 */
export function JsonLd({ data }: JsonLdProps) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(data, null, 0),
			}}
		/>
	)
}

// 导出常用的 JSON-LD 组件类型
export type JsonLdData = WithContext<Thing> | WithContext<Thing>[]
