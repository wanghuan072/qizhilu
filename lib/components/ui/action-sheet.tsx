"use client"

import { Button } from "@/lib/components/ui/button"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
} from "@/lib/components/ui/sheet"
import { cn } from "@/lib/utils/react/styles"
import * as React from "react"
import { createContext, useContext } from "react"
import { createRoot } from "react-dom/client"

/**
 * ActionSheet 组件
 *
 * 在 React 19 中使用 createRoot API 和 Context API
 *
 * 使用方式：
 * 1. 使用 ActionSheetProvider.show() 方法直接显示 ActionSheet
 * 2. 或者使用 ActionSheetContextProvider 包裹应用，然后通过 useActionSheet 钩子使用
 */

export interface ActionSheetAction {
	text: string
	key: string
	description?: string
	disabled?: boolean
	danger?: boolean
	bold?: boolean
	onClick?: () => void | Promise<void>
}

export interface ActionSheetProps {
	visible: boolean
	actions: ActionSheetAction[]
	extra?: React.ReactNode
	cancelText?: string
	onClose?: () => void
	onAction?: (action: ActionSheetAction) => void
	afterClose?: () => void
	className?: string
}

export function ActionSheet({
	visible,
	actions,
	extra,
	cancelText,
	onClose,
	onAction,
	afterClose,
	className,
}: ActionSheetProps) {
	const handleActionClick = (action: ActionSheetAction) => {
		if (action.disabled) return

		if (action.onClick) {
			action.onClick()
		}

		if (onAction) {
			onAction(action)
		}

		if (!action.onClick) {
			onClose?.()
		}
	}

	const handleClose = () => {
		onClose?.()
		setTimeout(() => {
			afterClose?.()
		}, 200)
	}

	return (
		<Sheet open={visible} onOpenChange={(open) => !open && handleClose()}>
			<SheetContent
				side="bottom"
				className={cn("p-0 rounded-t-xl max-h-[80vh]", className)}
			>
				{extra && (
					<SheetHeader className="p-4 pb-0">
						<SheetDescription className="text-center">{extra}</SheetDescription>
					</SheetHeader>
				)}
				<div className="flex flex-col mt-4">
					{actions.map((action) => (
						<Button
							key={action.key}
							variant="ghost"
							disabled={action.disabled}
							className={cn(
								"justify-start rounded-none h-auto py-4 px-4 text-left",
								action.danger && "text-destructive hover:text-destructive",
								action.bold && "font-bold",
								action.disabled && "opacity-40",
							)}
							onClick={() => handleActionClick(action)}
						>
							<div className="flex flex-col items-start">
								<span>{action.text}</span>
								{action.description && (
									<span className="text-xs text-muted-foreground mt-1">
										{action.description}
									</span>
								)}
							</div>
						</Button>
					))}
				</div>
				{cancelText && (
					<SheetFooter className="flex-col sm:flex-col mt-2 border-t">
						<Button
							variant="ghost"
							className="rounded-none h-14"
							onClick={handleClose}
						>
							{cancelText}
						</Button>
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	)
}

// 创建 ActionSheet Context
type ActionSheetContextType = {
	instances: ActionSheetInstance[]
	createActionSheet: (props: Omit<ActionSheetProps, "visible">) => {
		close: () => void
	}
	closeAll: () => void
}

const ActionSheetContext = createContext<ActionSheetContextType | null>(null)

// 创建一个容器来管理多个 ActionSheet 实例
type ActionSheetInstance = {
	id: string
	element: HTMLDivElement
	root: any
	props: Omit<ActionSheetProps, "visible">
	close: () => void
}

// 全局实例管理
const instances: ActionSheetInstance[] = []

// 创建一个新的 ActionSheet 实例
const createActionSheet = (props: Omit<ActionSheetProps, "visible">) => {
	const id = `action-sheet-${Date.now()}-${Math.floor(Math.random() * 1000)}`
	const element = document.createElement("div")
	document.body.appendChild(element)

	// 使用 createRoot API 创建 React 根节点
	// 在 React 19 中，createRoot 支持新的错误处理选项
	const root = createRoot(element, {
		// 可选：添加错误处理
		onUncaughtError: (error) => {
			console.error("ActionSheet 渲染错误:", error)
		},
	})

	const close = () => {
		// 触发关闭回调
		props.onClose?.()

		// 延迟卸载以允许动画完成
		setTimeout(() => {
			// 从 DOM 中移除元素
			if (element && document.body.contains(element)) {
				root.unmount()
				document.body.removeChild(element)
			}

			// 从实例列表中移除
			const index = instances.findIndex((instance) => instance.id === id)
			if (index !== -1) {
				instances.splice(index, 1)
			}

			// 执行 afterClose 回调
			props.afterClose?.()
		}, 200)
	}

	// 创建实例对象
	const instance: ActionSheetInstance = {
		id,
		element,
		root,
		props,
		close,
	}

	// 添加到实例列表
	instances.push(instance)

	// 渲染组件
	root.render(<ActionSheet {...props} visible={true} onClose={close} />)

	return {
		close,
	}
}

// 关闭所有 ActionSheet
const closeAll = () => {
	;[...instances].forEach((instance) => instance.close())
}

// 创建 Provider 组件
export function ActionSheetContextProvider({
	children,
}: { children: React.ReactNode }) {
	const contextValue = React.useMemo(() => {
		return {
			instances,
			createActionSheet,
			closeAll,
		}
	}, [])

	return (
		<ActionSheetContext.Provider value={contextValue}>
			{children}
		</ActionSheetContext.Provider>
	)
}

// 创建自定义 Hook 用于访问 Context
export function useActionSheet() {
	const context = useContext(ActionSheetContext)
	if (!context) {
		throw new Error("useActionSheet 必须在 ActionSheetContextProvider 内部使用")
	}
	return context
}

// 导出 ActionSheet 组件和相关方法
export const ActionSheetProvider = {
	show: createActionSheet,
	closeAll,
}

export default ActionSheet
