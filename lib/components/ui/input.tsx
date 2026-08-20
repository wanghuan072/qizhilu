"use client"

import { debounce } from "radash"
import * as React from "react"
import { useCallback, useMemo, useState } from "react"

import { cn } from "@/lib/utils/react/styles"

export interface InputProps extends React.ComponentProps<"input"> {
	onValueChange?: (value: string | number) => void
	debounceMs?: number
}

function Input({
	className,
	type,
	onChange,
	onValueChange,
	debounceMs = 500,
	value: externalValue,
	...props
}: InputProps) {
	// 内部状态，用于处理组件内的值
	const [internalValue, setInternalValue] = useState<string>(
		externalValue !== undefined ? String(externalValue) : "",
	)

	// 当外部值变化时更新内部状态
	React.useEffect(() => {
		if (externalValue !== undefined) {
			setInternalValue(String(externalValue))
		}
	}, [externalValue])

	// 防抖处理函数
	const debouncedCallback = useMemo(
		() =>
			debounce({ delay: debounceMs }, (newValue: string) => {
				if (onValueChange) {
					// 如果是数字类型，处理空值转换为0
					if (type === "number") {
						const numValue = newValue === "" ? 0 : Number(newValue)
						onValueChange(numValue)
					} else {
						onValueChange(newValue)
					}
				}
			}),
		[onValueChange, type, debounceMs],
	)

	// 处理输入变化
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value
			setInternalValue(newValue)

			// 调用原始的 onChange 事件处理器
			if (onChange) {
				onChange(e)
			}

			// 调用防抖处理的 onValueChange
			debouncedCallback(newValue)
		},
		[onChange, debouncedCallback],
	)

	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
				"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
				className,
			)}
			value={internalValue}
			onChange={handleChange}
			{...props}
		/>
	)
}

export { Input }
