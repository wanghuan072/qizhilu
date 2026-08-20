/**
 * 缓存工具
 * 提供统一的缓存功能，包括键生成、数据存取、过期检查等
 */

import { getLogger } from "@/lib/utils/console-logger"

const logger = getLogger("cache-utils")

// 缓存配置
const isProd = process.env.NODE_ENV === "production"
const CACHE_ENABLED = isProd // 开发环境不启用缓存
const CACHE_TTL = 5 * 60 * 1000 // 缓存有效期，默认5分钟

// 缓存项接口
interface CacheItem<T> {
	data: T
	timestamp: number
}

// 全局缓存存储
const globalCache: Map<string, CacheItem<any>> = (global as any)
	.__API_CACHE__ ?? new Map<string, CacheItem<any>>()
;(global as any).__API_CACHE__ = globalCache

/**
 * 生成缓存键
 * @param prefix 前缀
 * @param params 参数对象
 * @returns 缓存键
 */
export async function generateCacheKey(
	prefix: string,
	params: Record<string, any> = {},
): Promise<string> {
	return `${prefix}:${JSON.stringify(params)}`
}

/**
 * 检查缓存是否已过期
 * @param timestamp 时间戳
 * @param ttl 过期时间，默认使用全局配置
 * @returns 是否过期
 */
export async function isCacheExpired(
	timestamp: number,
	ttl: number = CACHE_TTL,
): Promise<boolean> {
	return Date.now() - timestamp > ttl
}

/**
 * 从缓存中获取数据
 * @param key 缓存键
 * @param ttl 过期时间，默认使用全局配置
 * @returns 缓存的数据，如果不存在或已过期则返回null
 */
export async function getFromCache<T>(
	key: string,
	ttl: number = CACHE_TTL,
): Promise<T | null> {
	if (!CACHE_ENABLED) return null

	const cached = globalCache.get(key)
	if (!cached) return null

	if (await isCacheExpired(cached.timestamp, ttl)) {
		globalCache.delete(key)
		return null
	}

	logger.info(`[Cache Hit] ${key}`)
	return cached.data as T
}

/**
 * 将数据存入缓存
 * @param key 缓存键
 * @param data 要缓存的数据
 */
export async function saveToCache<T>(key: string, data: T): Promise<void> {
	if (!CACHE_ENABLED) return

	globalCache.set(key, {
		data,
		timestamp: Date.now(),
	})
}

/**
 * 删除缓存项
 * @param key 缓存键
 */
export async function deleteFromCache(key: string): Promise<void> {
	globalCache.delete(key)
}

/**
 * 清空所有缓存
 */
export async function clearCache(): Promise<void> {
	globalCache.clear()
	logger.info("[Cache] 已清空所有缓存")
}

/**
 * 缓存高阶函数
 * 为任意异步函数添加缓存功能
 * @param fn 原始函数
 * @param options 缓存选项
 * @returns 带缓存的函数
 */
export async function withCache<TArgs extends any[], TReturn>(
	fn: (...args: TArgs) => Promise<TReturn>,
	options: {
		keyPrefix: string
		ttl?: number
		skipCache?: boolean
	},
): Promise<(...args: TArgs) => Promise<TReturn>> {
	return async (...args: TArgs): Promise<TReturn> => {
		const { keyPrefix, ttl = CACHE_TTL, skipCache = false } = options

		// 生成缓存键
		const cacheKey = await generateCacheKey(keyPrefix, { args })

		// 如果不跳过缓存，尝试从缓存获取
		if (!skipCache) {
			const cached = await getFromCache<TReturn>(cacheKey, ttl)
			if (cached !== null) {
				return cached
			}
		}

		// 执行原始函数
		const result = await fn(...args)

		// 存入缓存
		await saveToCache(cacheKey, result)

		return result
	}
}
