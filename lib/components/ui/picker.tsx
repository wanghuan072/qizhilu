"use client"

import { Button } from "@/lib/components/ui/button"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/lib/components/ui/sheet"
import { cn } from "@/lib/utils/react/styles"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

// 选项类型定义
export interface PickerOption {
	label: React.ReactNode
	value: string | number
	disabled?: boolean
}

// 列定义
export interface PickerColumn {
	options: PickerOption[]
	defaultIndex?: number
}

// Picker 组件 Props
export interface PickerProps {
	// 列配置
	columns: PickerColumn[]
	// 选中的值
	value?: (string | number)[]
	// 值变化回调
	onChange?: (values: (string | number)[], indexes: number[]) => void
	// 标题
	title?: string
	// 确认按钮文本
	confirmText?: string
	// 取消按钮文本
	cancelText?: string
	// 占位符
	placeholder?: string
	// 禁用状态
	disabled?: boolean
	// 自定义类名
	className?: string
	// 触发器类名
	triggerClassName?: string
	// 表单属性
	name?: string
	id?: string
	required?: boolean
	// 回调事件
	onBlur?: React.FocusEventHandler<HTMLButtonElement>
	onFocus?: React.FocusEventHandler<HTMLButtonElement>
	// 自定义渲染展示的值
	renderValue?: (values: (string | number)[]) => React.ReactNode
	// 自定义子元素
	children?: (displayValue: React.ReactNode) => React.ReactNode
}

export function Picker({
	columns,
	value,
	onChange,
	title = "请选择",
	confirmText = "确认",
	cancelText = "取消",
	placeholder = "请选择",
	disabled = false,
	className,
	triggerClassName,
	name,
	id,
	required,
	onBlur,
	onFocus,
	renderValue,
	children,
}: PickerProps) {
	const [open, setOpen] = React.useState(false)
	const [selectedIndexes, setSelectedIndexes] = React.useState<number[]>([])
	const [selectedValues, setSelectedValues] = React.useState<
		(string | number)[]
	>([])
	const [tempIndexes, setTempIndexes] = React.useState<number[]>([])
	const [tempValues, setTempValues] = React.useState<(string | number)[]>([])
	const uniqueId = React.useId()
	const inputId = id || uniqueId

	// 初始化选中值和索引
	React.useEffect(() => {
		const initialIndexes: number[] = []
		const initialValues: (string | number)[] = []

		columns.forEach((column, colIndex) => {
			const options = column.options || []

			if (value && value[colIndex] !== undefined) {
				// 如果有外部传入的值，找到对应的索引
				const optionIndex = options.findIndex(
					(option) => option.value === value[colIndex],
				)
				if (optionIndex !== -1) {
					initialIndexes[colIndex] = optionIndex
					initialValues[colIndex] = options[optionIndex]!.value
				} else {
					initialIndexes[colIndex] = column.defaultIndex || 0
					// 确保索引有效后再获取值
					const defaultOption = options[initialIndexes[colIndex] || 0]
					initialValues[colIndex] = defaultOption ? defaultOption.value : ""
				}
			} else {
				// 否则使用默认索引
				initialIndexes[colIndex] = column.defaultIndex || 0
				// 确保索引有效后再获取值
				const defaultOption = options[initialIndexes[colIndex] || 0]
				initialValues[colIndex] = defaultOption ? defaultOption.value : ""
			}
		})

		setSelectedIndexes(initialIndexes)
		setSelectedValues(initialValues)
		setTempIndexes(initialIndexes)
		setTempValues(initialValues)
	}, [columns, value])

	// 处理列选择变化
	const handleColumnChange = (colIndex: number, optionIndex: number) => {
		const newTempIndexes = [...tempIndexes]
		const newTempValues = [...tempValues]

		newTempIndexes[colIndex] = optionIndex

		const column = columns[colIndex]
		if (column?.options?.[optionIndex]) {
			newTempValues[colIndex] = column.options[optionIndex].value
		}

		setTempIndexes(newTempIndexes)
		setTempValues(newTempValues)
	}

	// 处理确认
	const handleConfirm = () => {
		setSelectedIndexes([...tempIndexes])
		setSelectedValues([...tempValues])
		onChange?.(tempValues, tempIndexes)
		setOpen(false)
	}

	// 处理取消
	const handleCancel = () => {
		// 重置临时值为当前选中值
		setTempIndexes([...selectedIndexes])
		setTempValues([...selectedValues])
		setOpen(false)
	}

	// 格式化显示值
	const getDisplayValue = (): React.ReactNode => {
		if (renderValue) {
			return renderValue(selectedValues)
		}

		// 默认展示方式：用逗号连接所有选中项的标签
		const labels = columns
			.map((column, colIndex) => {
				const selectedIndex = selectedIndexes[colIndex] || 0
				const option = column.options[selectedIndex]
				return option ? option.label : ""
			})
			.filter(Boolean)

		return labels.length > 0 ? labels.join(", ") : placeholder
	}

	// 表单隐藏输入
	const hiddenInputs = name ? (
		<input
			type="hidden"
			name={name}
			value={JSON.stringify(selectedValues)}
			required={required}
			disabled={disabled}
		/>
	) : null

	// 渲染触发器
	const renderTrigger = () => {
		const displayValue = getDisplayValue()

		if (children) {
			return (
				<div className={cn("relative", triggerClassName)}>
					{children(displayValue)}
					{hiddenInputs}
				</div>
			)
		}

		return (
			<>
				<Button
					id={inputId}
					variant="outline"
					className={cn(
						"w-full justify-between text-left font-normal",
						!selectedValues.some(Boolean) && "text-muted-foreground",
						triggerClassName,
					)}
					disabled={disabled}
					onBlur={onBlur}
					onFocus={onFocus}
					aria-required={required}
				>
					<span className="truncate">{displayValue}</span>
					<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
				{hiddenInputs}
			</>
		)
	}

	return (
		<div className={className}>
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild disabled={disabled}>
					{renderTrigger()}
				</SheetTrigger>
				<SheetContent
					side="bottom"
					className="p-0 pb-safe h-auto max-h-[80vh] flex flex-col gap-0 rounded-t-xl"
				>
					<SheetHeader className="px-4 py-3 border-b">
						<SheetTitle className="text-center text-base font-medium">
							{title}
						</SheetTitle>
					</SheetHeader>

					<div className="flex-1 overflow-hidden">
						<div className="flex w-full h-64 relative">
							{/* 选中项高亮区域 */}
							<div className="absolute left-0 right-0 top-1/2 h-12 -translate-y-1/2 pointer-events-none bg-muted/50 border-y"></div>

							{/* 列表容器 */}
							<div className="flex w-full h-full">
								{columns.map((column, colIndex) => (
									<div key={colIndex} className="flex-1 overflow-auto snap-y">
										<div className="h-[calc(50%-24px)]"></div>
										{column.options.map((option, optionIndex) => (
											<div
												key={optionIndex}
												className={cn(
													"h-12 flex items-center justify-center snap-center px-4 cursor-pointer",
													tempIndexes[colIndex] === optionIndex &&
														"font-medium",
													option.disabled &&
														"opacity-40 cursor-not-allowed text-muted-foreground",
												)}
												onClick={() => {
													if (!option.disabled) {
														handleColumnChange(colIndex, optionIndex)
													}
												}}
											>
												{option.label}
											</div>
										))}
										<div className="h-[calc(50%-24px)]"></div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* 底部按钮 */}
					<div className="flex border-t">
						<Button
							variant="ghost"
							className="flex-1 h-12 rounded-none border-r"
							onClick={handleCancel}
						>
							{cancelText}
						</Button>
						<Button
							variant="ghost"
							className="flex-1 h-12 rounded-none"
							onClick={handleConfirm}
						>
							{confirmText}
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	)
}
