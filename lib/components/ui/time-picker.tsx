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
const generateMinutes = (minuteStep = 1) => {
	return Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) => {
		const value = i * minuteStep
		return {
			label: value.toString().padStart(2, "0"),
			value,
		}
	})
}

export interface TimePickerProps {
	value?: Dayjs | null
	onChange?: (time: Dayjs) => void
	minuteStep?: number
	minHour?: number
	maxHour?: number
	format?: string
	title?: string
	placeholder?: string
	className?: string
	triggerClassName?: string
	disabled?: boolean
	use12Hours?: boolean
	hourLabel?: string
	minuteLabel?: string
	name?: string
	id?: string
	required?: boolean
	onBlur?: React.FocusEventHandler<HTMLButtonElement>
	onFocus?: React.FocusEventHandler<HTMLButtonElement>
	children?: (displayValue: React.ReactNode) => React.ReactNode
}

export function TimePicker({
	value,
	onChange,
	minuteStep = 1,
	minHour = 0,
	maxHour = 23,
	format = "HH:mm",
	title = "选择时间",
	placeholder = "请选择时间",
	className,
	triggerClassName,
	disabled = false,
	use12Hours = false,
	hourLabel = "时",
	minuteLabel = "分",
	name,
	id,
	required,
	onBlur,
	onFocus,
	children,
}: TimePickerProps) {
	// 当前选中的时间
	const selectedTime = React.useMemo(() => value || dayjs(), [value])

	// 生成小时选项（考虑12小时制）
	const generateHoursWithFormat = React.useCallback(() => {
		if (use12Hours) {
			// 12小时制
			return Array.from({ length: 12 }, (_, i) => {
				const hour = i === 0 ? 12 : i
				return {
					label: hour.toString(),
					value: hour === 12 ? 0 : hour,
				}
			})
		} else {
			// 24小时制
			return Array.from({ length: maxHour - minHour + 1 }, (_, i) => {
				const hour = i + minHour
				return {
					label: hour.toString().padStart(2, "0"),
					value: hour,
				}
			})
		}
	}, [minHour, maxHour, use12Hours])

	// 生成时段选项（上午/下午）
	const generatePeriods = React.useCallback(() => {
		return [
			{ label: "上午", value: "am" },
			{ label: "下午", value: "pm" },
		]
	}, [])

	// 列配置
	const [columns, setColumns] = React.useState<PickerColumn[]>([])

	// 当前选中的值
	const pickerValue = React.useMemo(() => {
		if (!value) return undefined

		if (use12Hours) {
			const hour = value.hour()
			const isPM = hour >= 12
			const hour12 = hour % 12 || 12

			return [hour12 === 12 ? 0 : hour12, value.minute(), isPM ? "pm" : "am"]
		}

		return [value.hour(), value.minute()]
	}, [value, use12Hours])

	// 初始化选项和默认索引
	React.useEffect(() => {
		if (use12Hours) {
			const hour = selectedTime.hour()
			const isPM = hour >= 12
			const hour12 = hour % 12 || 12

			setColumns([
				{
					options: generateHoursWithFormat(),
					defaultIndex: hour12 === 12 ? 0 : hour12 - 1,
				},
				{
					options: generateMinutes(minuteStep),
					defaultIndex: Math.floor(selectedTime.minute() / minuteStep),
				},
				{
					options: generatePeriods(),
					defaultIndex: isPM ? 1 : 0,
				},
			])
		} else {
			setColumns([
				{
					options: generateHoursWithFormat(),
					defaultIndex: selectedTime.hour() - minHour,
				},
				{
					options: generateMinutes(minuteStep),
					defaultIndex: Math.floor(selectedTime.minute() / minuteStep),
				},
			])
		}
	}, [
		selectedTime,
		minuteStep,
		minHour,
		use12Hours,
		generateHoursWithFormat,
		generatePeriods,
	])

	// 处理选择变更
	const handleChange = (values: (string | number)[], indexes: number[]) => {
		// 创建当前日期的副本
		const now = dayjs()
		let hour = 0
		let minute = 0

		if (use12Hours) {
			if (values.length < 3) return

			hour = values[0] as number
			minute = values[1] as number
			const period = values[2] as string

			// 调整小时值（12小时制转24小时制）
			if (period === "pm" && hour < 12) {
				hour += 12
			} else if (period === "am" && hour === 12) {
				hour = 0
			}
		} else {
			if (values.length < 2) return

			hour = values[0] as number
			minute = values[1] as number
		}

		// 创建新的时间
		const newTime = now.hour(hour).minute(minute).second(0)

		// 触发回调
		onChange?.(newTime)
	}

	// 自定义渲染值的展示
	const renderValue = (values: (string | number)[]) => {
		if (!values || values.length < (use12Hours ? 3 : 2)) return placeholder

		try {
			let hour = 0
			let minute = 0

			if (use12Hours) {
				hour = values[0] as number
				minute = values[1] as number
				const period = values[2] as string

				// 调整小时值（12小时制转24小时制）
				if (period === "pm" && hour < 12) {
					hour += 12
				} else if (period === "am" && hour === 12) {
					hour = 0
				}
			} else {
				hour = values[0] as number
				minute = values[1] as number
			}

			return dayjs().hour(hour).minute(minute).format(format)
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
