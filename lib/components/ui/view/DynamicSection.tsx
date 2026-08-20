"use client"

import dynamic from "next/dynamic"
import { ComponentType, Suspense } from "react"

interface DynamicSectionProps {
	component: ComponentType<any>
	props?: any
	loading?: React.ReactNode
	ssr?: boolean
}

export function createDynamicSection<T extends Record<string, any>>(
	componentImport: () => Promise<{ default: ComponentType<T> }>,
	options?: {
		ssr?: boolean
		loading?: React.ReactNode
	},
): ComponentType<T> {
	return dynamic(componentImport, {
		ssr: options?.ssr ?? false, // 默认关闭SSR以实现代码拆分
		loading: () => (
			<div className="flex items-center justify-center bg-muted/20 rounded-lg min-h-[200px]">
				{options?.loading || (
					<div className="text-muted-foreground/50">
						<svg
							className="animate-spin h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							aria-label="Loading"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					</div>
				)}
			</div>
		),
	})
}

// 创建一个简单的加载占位符
export function LoadingPlaceholder({ height = "200px" }: { height?: string }) {
	return (
		<div
			className="flex items-center justify-center bg-muted/20 rounded-lg animate-pulse"
			style={{ height }}
		>
			<div className="text-muted-foreground/50">
				<div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
			</div>
		</div>
	)
}
