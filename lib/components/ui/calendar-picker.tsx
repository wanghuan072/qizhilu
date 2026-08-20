"use client"

import { Button } from "@/lib/components/ui/button"
import { Calendar } from "@/lib/components/ui/calendar"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/lib/components/ui/sheet"
import { dayjs, formatDate } from "@/lib/utils/datetimes"
import { cn } from "@/lib/utils/react/styles"
import { Dayjs } from "dayjs"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import { useId } from "react"

interface CalendarPickerProps {
	value?: Dayjs | null
	onChange?: (date: Dayjs) => void
	min?: Dayjs
	max?: Dayjs
	minDate?: string | Date
	maxDate?: string | Date
	format?: string
	title?: string
	placeholder?: string
	triggerClassName?: string
	className?: string
	disabled?: boolean
	renderLabel?: (date: Dayjs) => React.ReactNode
	closeAfterSelect?: boolean
	name?: string
	id?: string
	required?: boolean
	onBlur?: React.FocusEventHandler<HTMLButtonElement>
	onFocus?: React.FocusEventHandler<HTMLButtonElement>
	children?: (value: string) => React.ReactNode
}

export function CalendarPicker({
	value,
	onChange,
	min,
	max,
	minDate,
	maxDate,
	format = "YYYY-MM-DD",
	title = "选择日期",
	placeholder = "请选择日期",
	triggerClassName,
	className,
	disabled = false,
	renderLabel,
	closeAfterSelect = true,
	name,
	id,
	required,
	onBlur,
	onFocus,
	children,
}: CalendarPickerProps) {
	const [open, setOpen] = React.useState(false)
	const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(
		value || null,
	)
	const uniqueId = useId()
	const inputId = id || uniqueId

	// 处理最小最大日期
	const minDayjs = React.useMemo(() => {
		if (min) return min
		if (minDate) return dayjs(minDate)
		return undefined
	}, [min, minDate])

	const maxDayjs = React.useMemo(() => {
		if (max) return max
		if (maxDate) return dayjs(maxDate)
		return undefined
	}, [max, maxDate])

	// 当外部value变化时更新内部状态
	React.useEffect(() => {
		setSelectedDate(value || null)
	}, [value])

	const handleDateSelect = (date: Dayjs) => {
		setSelectedDate(date)
		// 若设置了选择后自动关闭则执行
		if (closeAfterSelect) {
			setOpen(false)
			onChange?.(date)
		}
	}

	const handleConfirm = () => {
		if (selectedDate) {
			onChange?.(selectedDate)
		}
		setOpen(false)
	}

	// 格式化显示值
	const displayValue = selectedDate
		? format
			? selectedDate.format(format)
			: formatDate(selectedDate)
		: placeholder

	// 渲染触发器
	const renderTrigger = () => {
		if (children) {
			return (
				<div className={cn("relative", triggerClassName)}>
					{children(displayValue)}
				</div>
			)
		}

		return (
			<Button
				id={inputId}
				variant="outline"
				className={cn(
					"w-full justify-start text-left font-normal",
					!selectedDate && "text-muted-foreground",
					triggerClassName,
				)}
				disabled={disabled}
				onBlur={onBlur}
				onFocus={onFocus}
				aria-required={required}
			>
				<CalendarIcon className="mr-2 h-4 w-4" />
				{displayValue}
			</Button>
		)
	}

	const handleOpenChange = (isOpen: boolean) => {
		if (disabled) return
		setOpen(isOpen)
	}

	return (
		<div className={className}>
			<Sheet open={open} onOpenChange={handleOpenChange}>
				<SheetTrigger asChild disabled={disabled}>
					{renderTrigger()}
				</SheetTrigger>
				<SheetContent
					side="bottom"
					className={cn(
						"p-0 pb-safe h-auto max-h-[95vh] flex flex-col gap-0 rounded-t-xl",
					)}
				>
					<SheetHeader className="px-4 py-3 border-b">
						<SheetTitle className="text-center text-base font-medium">
							{title}
						</SheetTitle>
					</SheetHeader>
					<div className="overflow-y-auto">
						<Calendar
							value={selectedDate}
							onChange={handleDateSelect}
							min={minDayjs}
							max={maxDayjs}
							variants="mobile"
							renderLabel={renderLabel}
							className="w-full"
							classNames={{
								root: "bg-transparent border-none",
								day_button: "text-center",
								month: "gap-0",
							}}
						/>
					</div>
					<div className="p-4 pb-6">
						<Button
							onClick={handleConfirm}
							className="w-full h-12 text-base rounded-full font-normal"
						>
							确认
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	)
}
