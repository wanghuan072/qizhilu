import { ArgumentsError } from "@/lib/errors"
import bytes from "bytes"

/**
 * Normalize file name
 * @param name file name
 * @returns normalized file name
 */
export function normalizeFileName(name: string) {
	return name
		.replace(/[^a-zA-Z0-9.-]/g, "_")
		.replace(/(^\.)+|(\.+$)/g, "")
		.replace(/\.{2,}/g, ".")
		.toLowerCase()
		.trim()
}

export const formatFileSize = (bytesValue: number) => {
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

/**
 * 截断文本
 * @param text - 原始文本
 * @param maxLength - 最大长度
 * @param suffix - 后缀，默认为...
 */
export const truncateText = (
	text: string,
	maxLength: number,
	suffix = "...",
): string => {
	if (text.length <= maxLength) return text
	return text.substring(0, maxLength) + suffix
}

export const assertIsNotNil = (value: any, message?: string) => {
	if (!value) {
		throw new ArgumentsError(message ?? "参数不能为空")
	}
}

/**
 * 生成指定长度的随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export function generateRandomString(length: number): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	let result = ""
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return result
}
