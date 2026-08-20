import { customAlphabet } from "nanoid"

const plain_chars =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
const digits = "0123456789"

const plain = customAlphabet(plain_chars, 10)
const digitsOnly = customAlphabet(digits, 10)

export function withRandomString(
	length: number,
	options?: {
		format?: (str: string) => string
		isUnique?: (id: string) => Promise<boolean>
	},
): () => string | Promise<string> {
	const { format, isUnique } = options || {}
	if (isUnique) {
		return async () => {
			for (let i = 0; i < 50; i++) {
				const v = plain(length)
				if (await isUnique(v)) {
					return format ? format(v) : v
				}
			}
			throw new Error("Failed to generate unique id after 50 attempts")
		}
	}

	return () => {
		const value = plain(length)
		if (format) {
			return format(value)
		}
		return value
	}
}

export function randomString(length?: number): string {
	return plain(length || 10)
}

/**
 * 生成指定长度的随机数字码
 * @param length 随机码长度
 * @returns 随机数字码
 */
export function generateRandomCode(length: number): string {
	return digitsOnly(length)
}
