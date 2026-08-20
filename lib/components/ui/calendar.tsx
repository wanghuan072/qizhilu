"use client"

import { buttonVariants } from "@/lib/components/ui/button"
import { cn } from "@/lib/utils/react/styles"
import dayjs, { Dayjs } from "dayjs"
import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"

const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"]

interface CalendarProps {
	value?: Dayjs | null
	onChange?: (date: Dayjs) => void
	min?: Dayjs
	max?: Dayjs
	renderLabel?: (date: Dayjs) => React.ReactNode
	className?: string
	classNames?: Partial<Record<string, string>>
	variants?: "default" | "mobile"
	locale?: string // 新增：支持本地化
	autoFocus?: boolean // 新增：自动聚焦
}

function getMonthMatrix(year: number, month: number) {
	const firstDay = dayjs().year(year).month(month).date(1)
	const startDay = firstDay.day()
	const daysInMonth = firstDay.daysInMonth()
	const prevMonthDays = firstDay.subtract(1, "month").daysInMonth()
	const matrix: (Dayjs | null)[][] = []
	let day = 1 - startDay
	for (let i = 0; i < 6; i++) {
		const week: (Dayjs | null)[] = []
		for (let j = 0; j < 7; j++) {
			if (day < 1) {
				week.push(null)
			} else if (day > daysInMonth) {
				week.push(null)
			} else {
				week.push(dayjs().year(year).month(month).date(day))
			}
			day++
		}
		matrix.push(week)
		if (day > daysInMonth) break
	}
	return matrix
}

const Calendar: React.FC<CalendarProps> = ({
	value,
	onChange,
	min,
	max,
	renderLabel,
	className,
	classNames = {},
	variants = "default",
	locale = "zh-cn",
	autoFocus = false,
}) => {
	const today = dayjs()
	const [panel, setPanel] = React.useState(() => value || today)
	React.useEffect(() => {
		if (locale) dayjs.locale(locale)
	}, [locale])
	const matrix = React.useMemo(
		() => getMonthMatrix(panel.year(), panel.month()),
		[panel],
	)
	const isDisabled = (date: Dayjs) => {
		if (min && date.isBefore(min, "day")) return true
		if (max && date.isAfter(max, "day")) return true
		return false
	}
	// 新增：键盘导航支持
	const gridRef = React.useRef<HTMLDivElement>(null)
	React.useEffect(() => {
		if (autoFocus && gridRef.current) {
			const btn = gridRef.current.querySelector(
				'button[data-selected="true"]',
			) as HTMLButtonElement
			btn?.focus()
		}
	}, [autoFocus, panel, value])
	// 变体样式
	const rootClass =
		variants === "mobile"
			? cn(
					"p-0 bg-transparent rounded-lg w-full max-w-full mx-auto",
					className,
					classNames.root,
				)
			: cn(
					"p-3 bg-transparent rounded-lg  w-full max-w-xs mx-auto",
					className,
					classNames.root,
				)
	const headerClass =
		variants === "mobile"
			? cn(
					"flex items-center justify-between p-4 mb-0 border-b",
					classNames.header,
				)
			: cn("flex items-center justify-between mb-2", classNames.header)
	const weekdayClass =
		variants === "mobile"
			? cn("flex-1 text-center text-sm font-normal py-3", classNames.weekday)
			: cn(
					"flex-1 text-center text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
					classNames.weekday,
				)
	const captionClass =
		variants === "mobile"
			? cn("text-base font-medium", classNames.caption_label)
			: cn("text-sm font-medium", classNames.caption_label)
	const dayButtonClass = (
		selected: boolean,
		isToday: boolean,
		disabled: boolean,
	) =>
		cn(
			buttonVariants({ variant: selected ? "default" : "ghost" }),
			variants === "mobile"
				? "flex-1 h-10 p-0 font-normal text-center outline-none focus:ring-2 focus:ring-primary focus:z-10 transition-all text-base justify-center"
				: "size-8 p-0 font-normal flex-1 text-center outline-none focus:ring-2 focus:ring-primary focus:z-10 transition-all",
			selected &&
				(variants === "mobile"
					? "bg-primary text-primary-foreground rounded-lg"
					: "bg-primary text-primary-foreground"),
			isToday &&
				!selected &&
				(variants === "mobile"
					? "text-primary font-bold ring-1 ring-primary rounded-lg"
					: "bg-accent text-accent-foreground border border-primary"),
			disabled && "text-muted-foreground opacity-50 cursor-not-allowed",
			classNames.day_button,
		)
	const emptyDayCellClass =
		variants === "mobile" ? "flex-1 h-10" : "flex-1 w-8 h-10"
	return (
		<div className={rootClass} role="application" aria-label="日历选择器">
			<div className={headerClass}>
				<button
					type="button"
					className={cn(
						buttonVariants({ variant: "ghost" }),
						"size-9 bg-transparent p-0 opacity-70 hover:opacity-100",
						classNames.button_previous,
					)}
					onClick={() => setPanel(panel.subtract(1, "month"))}
					aria-label="上个月"
				>
					<ChevronLeft className="size-5" />
				</button>
				<span className={captionClass} aria-live="polite">
					{variants === "mobile"
						? panel.format("YYYY年M月")
						: panel.format("YYYY年MM月")}
				</span>
				<button
					type="button"
					className={cn(
						buttonVariants({ variant: "ghost" }),
						"size-9 bg-transparent p-0 opacity-70 hover:opacity-100",
						classNames.button_next,
					)}
					onClick={() => setPanel(panel.add(1, "month"))}
					aria-label="下个月"
				>
					<ChevronRight className="size-5" />
				</button>
			</div>
			<div
				className={cn(
					"flex border-b",
					variants === "mobile" ? "bg-slate-50" : "",
					classNames.weekdays,
				)}
			>
				{WEEK_DAYS.map((d, i) => (
					<div key={i} className={weekdayClass} aria-label={`周${d}`}>
						{d}
					</div>
				))}
			</div>
			<div
				ref={gridRef}
				className={cn(
					"flex flex-col",
					variants === "mobile" ? "gap-0 py-2" : "gap-1 mt-2",
					classNames.month,
				)}
			>
				{matrix.map((week, i) => (
					<div key={i} className={cn("flex w-full", classNames.week)}>
						{week.map((date, j) => {
							if (!date) {
								return <div key={j} className={emptyDayCellClass}></div>
							}
							const selected = value && date.isSame(value, "day")
							const disabled = isDisabled(date)
							const isToday = date.isSame(today, "day")
							return (
								<button
									key={j}
									type="button"
									className={dayButtonClass(!!selected, !!isToday, !!disabled)}
									disabled={disabled}
									onClick={() => !disabled && onChange?.(date)}
									onKeyDown={(e) => {
										if (disabled) return
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault()
											onChange?.(date)
										}
									}}
									data-selected={selected ? "true" : "false"}
								>
									<span>{date.date()}</span>
									{renderLabel && (
										<span className="block text-xs mt-0.5">
											{renderLabel(date)}
										</span>
									)}
								</button>
							)
						})}
					</div>
				))}
			</div>
		</div>
	)
}

export { Calendar }
