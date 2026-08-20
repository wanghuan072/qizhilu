"use client"

import { Button } from "@/lib/components/ui/button"
import { cn } from "@/lib/utils/react/styles"
import { Dayjs } from "dayjs"
import * as React from "react"
import { TimePicker } from "./time-picker"

export interface TimeRangePickerProps {
	value?: [Dayjs | null, Dayjs | null]
	onChange?: (times: [Dayjs, Dayjs]) => void
	minuteStep?: number
	minHour?: number
	maxHour?: number
	format?: string
	startTitle?: string
	endTitle?: string
	placeholder?: string
	className?: string
	triggerClassName?: string
	disabled?: boolean
	use12Hours?: boolean
	hourLabel?: string
	minuteLabel?: string
	separator?: string
	name?: string
	id?: string
	required?: boolean
}

export function TimeRangePicker({
	value,
	onChange,
	minuteStep = 1,
	minHour = 0,
	maxHour = 23,
	format = "HH:mm",
	startTitle = "选择开始时间",
	endTitle = "选择结束时间",
	placeholder = "请选择时间范围",
	className,
	triggerClassName,
	disabled = false,
	use12Hours = false,
	hourLabel = "时",
	minuteLabel = "分",
	separator = " ~ ",
	name,
	id,
	required,
}: TimeRangePickerProps) {
	const uniqueId = React.useId()
	const startId = `${id || uniqueId}-start`
	const endId = `${id || uniqueId}-end`

	// 解构时间范围
	const [startTime, endTime] = value || [null, null]

	// 处理开始时间变更
	const handleStartTimeChange = (time: Dayjs) => {
		if (!onChange) return

		// 如果结束时间为空或者开始时间晚于结束时间，设置结束时间为开始时间后一小时
		if (!endTime || time.isAfter(endTime)) {
			onChange([time, time.add(1, "hour")])
		} else {
			onChange([time, endTime])
		}
	}

	// 处理结束时间变更
	const handleEndTimeChange = (time: Dayjs) => {
		if (!onChange) return

		// 如果开始时间为空或者结束时间早于开始时间，设置开始时间为结束时间前一小时
		if (!startTime || time.isBefore(startTime)) {
			onChange([time.subtract(1, "hour"), time])
		} else {
			onChange([startTime, time])
		}
	}

	// 格式化显示值
	const getDisplayValue = (): React.ReactNode => {
		if (!startTime && !endTime) return placeholder

		if (startTime && endTime) {
			return `${startTime.format(format)}${separator}${endTime.format(format)}`
		}

		if (startTime) {
			return `${startTime.format(format)}${separator}--:--`
		}

		if (endTime) {
			return `--:--${separator}${endTime.format(format)}`
		}

		return placeholder
	}

	// 自定义时间选择器渲染

	return (
		<div className={className}>
			<div className="relative">
				{/* 自定义触发器显示范围 */}
				<Button
					variant="outline"
					className={cn(
						"w-full justify-between text-left font-normal",
						!startTime && !endTime && "text-muted-foreground",
						triggerClassName,
					)}
					disabled={disabled}
				>
					<span className="truncate">{getDisplayValue()}</span>
				</Button>

				{/* 隐藏的时间选择器 */}
				<div className="absolute inset-0 opacity-0 pointer-events-none">
					<div className="flex w-full">
						<div className="w-1/2">
							<TimePicker
								id={startId}
								value={startTime}
								onChange={handleStartTimeChange}
								minuteStep={minuteStep}
								minHour={minHour}
								maxHour={maxHour}
								format={format}
								title={startTitle}
								disabled={disabled}
								use12Hours={use12Hours}
								hourLabel={hourLabel}
								minuteLabel={minuteLabel}
								name={name ? `${name}-start` : undefined}
								required={required}
							/>
						</div>
						<div className="w-1/2">
							<TimePicker
								id={endId}
								value={endTime}
								onChange={handleEndTimeChange}
								minuteStep={minuteStep}
								minHour={minHour}
								maxHour={maxHour}
								format={format}
								title={endTitle}
								disabled={disabled}
								use12Hours={use12Hours}
								hourLabel={hourLabel}
								minuteLabel={minuteLabel}
								name={name ? `${name}-end` : undefined}
								required={required}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
