/**
 * 配置缺失检查工具
 * 提供统一格式的日志输出，用于提示用户配置不存在
 */

import { getLogger } from "@/lib/utils/console-logger"

// 创建专用的 logger 实例
const logger = getLogger("missing-config")

/**
 * 日志类型枚举
 */
export enum LogType {
	CONFIG_MISSING = "CONFIG_MISSING",
	WARNING = "WARNING",
	ERROR = "ERROR",
	INFO = "INFO",
}

/**
 * 日志级别枚举
 */
export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARNING = 2,
	ERROR = 3,
}

/**
 * 日志配置接口
 */
export interface LoggerConfig {
	level: LogLevel
	prefix?: string
	showTimestamp?: boolean
}

/**
 * 默认日志配置
 */
const defaultConfig: LoggerConfig = {
	level: LogLevel.INFO,
	prefix: "[QiZhiLu]",
	showTimestamp: true,
}

/**
 * 格式化日志打印工具
 * @param message 日志消息
 * @param type 日志类型
 * @param config 日志配置
 */
export const missingMessage = (
	message: string,
	type: LogType = LogType.INFO,
	config: Partial<LoggerConfig> = {},
): void => {
	const finalConfig = { ...defaultConfig, ...config }

	// 根据日志类型确定日志级别
	let logLevel = LogLevel.INFO
	switch (type) {
		case LogType.CONFIG_MISSING:
		case LogType.WARNING:
			logLevel = LogLevel.WARNING
			break
		case LogType.ERROR:
			logLevel = LogLevel.ERROR
			break
		case LogType.INFO:
			logLevel = LogLevel.INFO
			break
	}

	// 检查是否应该显示此日志
	if (logLevel < finalConfig.level) {
		return
	}

	// 构建日志前缀
	let prefix = finalConfig.prefix ? `${finalConfig.prefix} ` : ""

	// 添加时间戳
	if (finalConfig.showTimestamp) {
		const timestamp = new Date().toISOString()
		prefix += `[${timestamp}] `
	}

	// 添加日志类型
	prefix += `[${type}] `

	// 根据日志类型选择 logger 方法
	switch (logLevel) {
		case LogLevel.ERROR:
			logger.error(`${prefix}${message}`)
			break
		case LogLevel.WARNING:
			logger.warn(`${prefix}${message}`)
			break
		default:
			logger.info(`${prefix}${message}`)
	}
}

/**
 * 配置缺失日志
 * 专门用于提示用户配置不存在
 * @param configPath 配置路径
 * @param suggestion 建议操作
 * @param config 日志配置
 */
export const missingKey = (
	configPath: string,
	suggestion?: string,
	config: Partial<LoggerConfig> = {},
): void => {
	const message = `配置不存在: ${configPath}${suggestion ? `\n建议: ${suggestion}` : ""}`
	missingMessage(message, LogType.CONFIG_MISSING, config)
}

/**
 * 检查并提示字符串类型配置缺失
 * @param value 要检查的值
 * @param configPath 配置路径
 * @param suggestion 建议操作
 * @param config 日志配置
 * @returns 原始值
 */
export const missingStringKey = <T extends string | undefined | null>(
	value: T,
	configPath: string,
	suggestion?: string,
	config: Partial<LoggerConfig> = {},
): T => {
	if (value === undefined || value === null || value === "") {
		missingKey(configPath, suggestion || "请提供有效的字符串值", config)
	}
	return value
}

/**
 * 检查并提示数字类型配置缺失
 * @param value 要检查的值
 * @param configPath 配置路径
 * @param suggestion 建议操作
 * @param config 日志配置
 * @returns 原始值
 */
export const missingNumberKey = <T extends number | undefined | null>(
	value: T,
	configPath: string,
	suggestion?: string,
	config: Partial<LoggerConfig> = {},
): T => {
	if (value === undefined || value === null || isNaN(value as number)) {
		missingKey(configPath, suggestion || "请提供有效的数字值", config)
	}
	return value
}

/**
 * 检查并提示布尔类型配置缺失
 * @param value 要检查的值
 * @param configPath 配置路径
 * @param suggestion 建议操作
 * @param config 日志配置
 * @returns 原始值
 */
export const missingBooleanKey = <T extends boolean | undefined | null>(
	value: T,
	configPath: string,
	suggestion?: string,
	config: Partial<LoggerConfig> = {},
): T => {
	if (value === undefined || value === null) {
		missingKey(configPath, suggestion || "请提供有效的布尔值", config)
	}
	return value
}

/**
 * 检查并提示数组类型配置缺失
 * @param value 要检查的值
 * @param configPath 配置路径
 * @param suggestion 建议操作
 * @param config 日志配置
 * @returns 原始值
 */
export const missingArrayKey = <T extends Array<any> | undefined | null>(
	value: T,
	configPath: string,
	suggestion?: string,
	config: Partial<LoggerConfig> = {},
): T => {
	if (
		value === undefined ||
		value === null ||
		!Array.isArray(value) ||
		value.length === 0
	) {
		missingKey(configPath, suggestion || "请提供有效的数组值", config)
	}
	return value
}

/**
 * 检查并提示对象类型配置缺失
 * @param value 要检查的值
 * @param configPath 配置路径
 * @param suggestion 建议操作
 * @param config 日志配置
 * @returns 原始值
 */
export const missingObjectKey = <T extends object | undefined | null>(
	value: T,
	configPath: string,
	suggestion?: string,
	config: Partial<LoggerConfig> = {},
): T => {
	if (
		value === undefined ||
		value === null ||
		(typeof value === "object" && Object.keys(value).length === 0)
	) {
		missingKey(configPath, suggestion || "请提供有效的对象值", config)
	}
	return value
}

/**
 * 检查并提示嵌套属性缺失
 * @param obj 对象
 * @param path 属性路径（点分隔，如 'user.profile.name'）
 * @param suggestion 建议操作
 * @param config 日志配置
 * @returns 属性值或 undefined
 */
export const checkNestedProperty = <T extends object, R = any>(
	obj: T | undefined | null,
	path: string,
	suggestion?: string,
	config: Partial<LoggerConfig> = {},
): R | undefined => {
	if (!obj) {
		missingKey(path, suggestion, config)
		return undefined
	}

	const keys = path.split(".")
	let current: any = obj

	for (let i = 0; i < keys.length; i++) {
		if (current === undefined || current === null) {
			missingKey(path, suggestion, config)
			return undefined
		}
		const key = keys[i]
		if (key && typeof current === "object" && key in current) {
			current = current[key]
		} else {
			const parentPath = keys.slice(0, i).join(".") || "root"
			missingKey(
				`${path} (在 ${parentPath} 中找不到 ${key || "undefined"})`,
				suggestion,
				config,
			)
			return undefined
		}
	}

	if (current === undefined || current === null) {
		missingKey(path, suggestion, config)
	}

	return current
}

/**
 * 检查对象属性，如果不存在则提示
 * @param obj 要检查的对象
 * @param propertyPath 属性路径
 * @param suggestion 建议操作
 * @param config 日志配置
 * @returns 是否存在该属性
 */
export const checkProperty = <T extends object>(
	obj: T | undefined | null,
	propertyPath: string,
	suggestion?: string,
	config: Partial<LoggerConfig> = {},
): boolean => {
	if (!obj) {
		missingKey(propertyPath, suggestion, config)
		return false
	}

	const value = checkNestedProperty(obj, propertyPath, suggestion, config)
	return value !== undefined && value !== null
}
