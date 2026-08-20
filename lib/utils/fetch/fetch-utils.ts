/**
 * 统一 fetch 工具
 * 提供标准化的 API 请求功能，支持缓存集成、错误处理等
 */

import { ApiRequestParams } from "@/lib/types"
import {
	generateCacheKey,
	getFromCache,
	saveToCache,
} from "@/lib/utils/cache/cache-utils"
import { getLogger } from "@/lib/utils/console-logger"
import { fetchGet } from "@/lib/utils/react/requests"

const logger = getLogger("fetch-utils")

// API 基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_WEB_API_URL || ""
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || ""

// Fetch 选项接口
export interface FetchOptions {
	skipCache?: boolean
	ttl?: number
	retries?: number
	retryDelay?: number
}

/**
 * 统一的 API 请求函数
 * @param endpoint API 端点
 * @param params 请求参数
 * @param options 请求选项
 * @returns API 响应数据
 */
export async function fetchFromApi<T>(
	endpoint: string,
	params: ApiRequestParams = {},
	options: FetchOptions = {},
): Promise<T> {
	const { skipCache = false, ttl, retries = 0, retryDelay = 1000 } = options
	const locale = params.locale || ""
	const projectId = params.projectId || PROJECT_ID

	// 处理请求参数
	const requestParams: ApiRequestParams = {
		...params,
		locale,
		projectId,
	}

	// 生成缓存键
	const cacheKey = await generateCacheKey(endpoint, requestParams)

	// 尝试从缓存获取数据
	if (!skipCache) {
		const cachedData = await getFromCache<T>(cacheKey, ttl)
		if (cachedData !== null) {
			return cachedData
		}
	}

	// 构建请求 URL
	const url = new URL(`${API_BASE_URL}${endpoint}`)
	Object.entries(requestParams).forEach(([key, value]) => {
		if (value !== undefined) {
			url.searchParams.append(key, String(value))
		}
	})

	// 执行请求（带重试机制）
	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			logger.info(
				`[Request] 访问接口: ${url.toString()}, locale: ${locale}, project_id: ${projectId}${
					attempt > 0 ? `, 重试: ${attempt}/${retries}` : ""
				}`,
			)

			const response = await fetchGet<T>(url.toString(), {})

			if (!response) {
				throw new Error(`API request failed for ${endpoint}`)
			}

			// 缓存响应数据
			saveToCache(cacheKey, response)

			return response
		} catch (error) {
			// 如果是最后一次尝试或者是构建时，处理错误
			if (attempt === retries) {
				// 构建详细的错误信息
				const errorDetails = {
					endpoint,
					url: url.toString(),
					locale,
					projectId,
					requestParams: JSON.stringify(requestParams),
					error: error instanceof Error ? error.message : String(error),
					timestamp: new Date().toISOString(),
					attempts: attempt + 1,
				}

				logger.error(
					`[API Error] 请求失败 - Endpoint: ${endpoint}, URL: ${url.toString()}, Locale: ${locale}, ProjectId: ${projectId}, 尝试次数: ${
						attempt + 1
					}`,
					errorDetails,
				)

				// 在构建时返回空数据
				if (
					process.env.NODE_ENV === "production" ||
					process.env.NEXT_PHASE === "phase-production-build"
				) {
					logger.warn(`[Fallback] API在构建时不可用，为 ${endpoint} 返回空数据`)
					return (endpoint.includes("settings") ? {} : []) as T
				}

				throw error
			}

			// 如果还有重试机会，记录警告并等待
			logger.warn(
				`[Retry] 请求失败，正在重试 (${attempt + 1}/${retries + 1}): ${endpoint}`,
			)
			await new Promise((resolve) =>
				setTimeout(resolve, retryDelay * (attempt + 1)),
			)
		}
	}

	throw new Error("不应该到达这里")
}
