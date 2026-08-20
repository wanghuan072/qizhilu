import { Currency } from "@/lib/types"
import bytes from "bytes"

/**
 * 货币单位转换工具函数
 */

type CurrencyInput = string | number

/**
 * 将元转换为分
 * @param yuan 金额(元),支持数字或字符串
 * @returns 金额(分)
 * @throws {Error} 当输入无效时抛出错误
 */
export function yuanToFen(yuan: CurrencyInput): number {
	if (yuan === null || yuan === undefined || yuan === "") {
		throw new Error("金额不能为空")
	}

	// 转换为字符串处理
	const yuanStr = String(yuan).trim()

	// 检查格式是否正确
	if (!/^\-?\d+(\.\d{1,2})?$/.test(yuanStr)) {
		throw new Error("金额格式不正确,最多支持2位小数")
	}

	// 转换为数字
	const yuanNum = Number.parseFloat(yuanStr)

	// 处理金额范围
	if (yuanNum > Number.MAX_SAFE_INTEGER / 100) {
		throw new Error("金额超出最大范围")
	}

	// 转换为分,处理精度问题
	return Math.round(yuanNum * 100)
}

/**
 * 将分转换为元
 * @param fen 金额(分),支持数字或字符串
 * @param asNumber 是否返回数字类型
 * @returns 金额(元),字符串类型保留2位小数或数字类型
 * @throws {Error} 当输入无效时抛出错误
 */
export function fenToYuan(fen: CurrencyInput, asNumber?: false): string
export function fenToYuan(fen: CurrencyInput, asNumber: true): number
export function fenToYuan(
	fen: CurrencyInput,
	asNumber = false,
): string | number {
	if (fen === null || fen === undefined || fen === "") {
		throw new Error("金额不能为空")
	}

	// 转换为字符串处理
	const fenStr = String(fen).trim()

	// 检查是否为整数
	if (!/^\-?\d+$/.test(fenStr)) {
		throw new Error("分必须是整数")
	}

	// 转换为数字
	const fenNum = Number.parseInt(fenStr, 10)

	// 处理金额范围
	if (Math.abs(fenNum) > Number.MAX_SAFE_INTEGER) {
		throw new Error("金额超出最大范围")
	}

	// 如果需要返回数字类型
	if (asNumber) {
		// 使用 Math.round 和除法组合来避免浮点数精度问题
		// 先除以 10 再除以 10，比直接除以 100 更精确
		return Math.round(fenNum / 10) / 10
	}

	// 返回字符串类型，保留2位小数
	return (fenNum / 100).toFixed(2)
}

/**
 * 获取货币符号
 */
function getCurrencySymbol(currency: Currency): string {
	const symbolMap: Record<Currency, string> = {
		[Currency.CNY]: "¥",
		[Currency.USD]: "",
		[Currency.HKD]: "",
		[Currency.EUR]: "",
	}
	return symbolMap[currency]
}

/**
 * 格式化显示金额
 * @param amount 金额,支持数字或字符串
 * @param options 格式化选项
 * @returns 格式化后的金额字符串
 */
export function formatCurrency(
	amount: CurrencyInput,
	options: {
		currency?: Currency // 货币类型,默认为 CNY
		prefix?: string // 自定义前缀,优先级高于货币符号
		digits?: number // 小数位数,默认为 2
		unit?: "yuan" | "fen" | "y" | "f" // 输入金额单位,默认为 yuan(元)
	} = {},
): string {
	if (amount === null || amount === undefined || amount === "") {
		throw new Error("金额不能为空")
	}

	const { currency = Currency.CNY, prefix, digits = 2, unit = "yuan" } = options

	// 根据单位转换金额
	let num: number
	if (unit === "fen" || unit === "f") {
		// 如果输入单位是分，先转换为元
		num = typeof amount === "string" ? Number.parseInt(amount, 10) : amount
		num = num / 100
	} else {
		// 输入单位是元，直接转换
		num = typeof amount === "string" ? Number.parseFloat(amount) : amount
	}

	if (isNaN(num)) {
		throw new Error("无效的金额")
	}

	// 使用 Intl.NumberFormat 格式化数字
	const formatter = new Intl.NumberFormat("zh-CN", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	})

	// 使用自定义前缀或货币符号
	const currencyPrefix = prefix ?? getCurrencySymbol(currency)
	return `${currencyPrefix}${formatter.format(num)}`
}

export const formatBytes = (bytesValue: number) => {
	const match = String(bytesValue).match(/^(\d+)([nmu]?)$/)
	if (match) {
		const [, num] = match
		return bytes(Number(num))
	}
	return bytes(
		typeof bytesValue === "string" ? Number(bytesValue) : bytesValue,
		{
			unit: "MB",
		},
	)
}
