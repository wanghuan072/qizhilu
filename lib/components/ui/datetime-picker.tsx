"use client"

import { dayjs } from "@/lib/utils/datetimes"
import { Dayjs } from "dayjs"
import * as React from "react"
import { Picker, PickerColumn } from "./picker"

// 生成小时选项
const generateHours = () => {
	return Array.from({ length: 24 }, (_, i) => ({
		label: i.toString().padStart(2, "0"),
		value: i,
	}))
}

// 生成分钟选项
const generateMinutes = () => {
	return Array.from({ length: 60 }, (_, i) => ({
		label: i.toString().padStart(2, "0"),
		value: i,
	}))
}

// 生成日期选项（当前日期前后15天）
const generateDates = (current?: Dayjs) => {
	const now = current || dayjs()
	const dates = []
	for (let i = -15; i <= 15; i++) {
		const date = now.add(i, "day")
		dates.push({
			label: date.format("MM-DD"),
			value: date.format("YYYY-MM-DD"),
		})
	}
	return dates
}

export interface DateTimePickerProps {
	value?: Dayjs | null
	onChange?: (date: Dayjs) => void
	minDate?: Dayjs
	maxDate?: Dayjs
	title?: string
	placeholder?: string
	format?: string
	className?: string
	triggerClassName?: string
	disabled?: boolean
	name?: string
	id?: string
	required?: boolean
	onBlur?: React.FocusEventHandler<HTMLButtonElement>
	onFocus?: React.FocusEventHandler<HTMLButtonElement>
	children?: (displayValue: React.ReactNode) => React.ReactNode
}

export function DateTimePicker({
	value,
	onChange,
	minDate,
	maxDate,
	title = "选择日期和时间",
	placeholder = "请选择日期和时间",
	format = "YYYY-MM-DD HH:mm",
	className,
	triggerClassName,
	disabled = false,
	name,
	id,
	required,
	onBlur,
	onFocus,
	children,
}: DateTimePickerProps) {
	// 当前选中的日期时间
	const selectedDate = React.useMemo(() => value || dayjs(), [value])

	// 生成选项
	const [columns, setColumns] = React.useState<PickerColumn[]>([
		{ options: generateDates(selectedDate) },
		{ options: generateHours() },
		{ options: generateMinutes() },
	])

	// 当前选中的值
	const pickerValue = React.useMemo(() => {
		if (!value) return undefined

		return [value.format("YYYY-MM-DD"), value.hour(), value.minute()]
	}, [value])

	// 初始化选项和默认索引
	React.useEffect(() => {
		setColumns([
			{
				options: generateDates(selectedDate),
				defaultIndex: 15, // 默认选中当天
			},
			{
				options: generateHours(),
				defaultIndex: selectedDate.hour(),
			},
			{
				options: generateMinutes(),
				defaultIndex: selectedDate.minute(),
			},
		])
	}, [selectedDate])

	// 当选择变化时
	const handleChange = (values: (string | number)[], indexes: number[]) => {
		if (values.length < 3) return

		// 解析选择的值
		const dateStr = values[0] as string
		const hour = values[1] as number
		const minute = values[2] as number

		// 创建新的日期对象
		const newDate = dayjs(dateStr).hour(hour).minute(minute)

		// 触发回调
		onChange?.(newDate)
	}

	// 自定义渲染值的展示
	const renderValue = (values: (string | number)[]) => {
		if (!values || values.length < 3) return placeholder

		try {
			const dateStr = values[0] as string
			const hour = values[1] as number
			const minute = values[2] as number

			return dayjs(dateStr).hour(hour).minute(minute).format(format)
		} catch (error) {
			return placeholder
		}
	}

	return (
		<Picker
			columns={columns}
			value={pickerValue}
			onChange={handleChange}
			title={title}
			placeholder={placeholder}
			className={className}
			triggerClassName={triggerClassName}
			disabled={disabled}
			name={name}
			id={id}
			required={required}
			onBlur={onBlur}
			onFocus={onFocus}
			renderValue={renderValue}
		>
			{children}
		</Picker>
	)
}
