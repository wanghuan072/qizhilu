import type { NextRequest } from "next/server"

// 定义 API 响应的通用类型
export type ApiResponse<T = any> = {
	data?: T
	status: number
	error?: string
}

export function toQueryString(data: Record<string, any>): string {
	if (data) {
		return new URLSearchParams(data).toString()
	}
	return ""
}

export function toQueryParams(request: NextRequest): Record<string, any> {
	const params = request.nextUrl.searchParams
	return Array.from(params.entries()).reduce(
		(it, [key, val]) => {
			it[key] = val
			return it
		},
		{} as Record<string, any>,
	)
}

// 基础请求函数，支持泛型
export async function request<T = any>(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<T> {
	return fetch(input, {
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
		...init,
	}).then(async (res) => {
		const data = await res.json()
		if (data?.status === 200) {
			return data?.data as unknown as T
		}
		throw new Error(data.error || data.status)
	})
}

// GET 请求，适配 SWR
export async function fetchGet<T = any>(
	url: string | URL,
	params?: Record<string, any>,
	init?: RequestInit,
): Promise<T> {
	let finalUrl = url.toString()
	if (params) {
		const queryString = new URLSearchParams(params).toString()
		finalUrl += finalUrl.includes("?") ? `&${queryString}` : `?${queryString}`
	}
	return request<T>(finalUrl, {
		method: "GET",
		...init,
	})
}

// POST 请求，适配 SWR
export async function fetchPost<T = any>(
	url: string | URL,
	body?: any,
	init?: RequestInit,
): Promise<T> {
	return request<T>(url, {
		method: "POST",
		body: body ? JSON.stringify(body) : undefined,
		...init,
	})
}

// PUT 请求，适配 SWR
export async function fetchPut<T = any>(
	url: string | URL,
	body?: any,
	params?: Record<string, any>,
	init?: RequestInit,
): Promise<T> {
	let finalUrl = url.toString()
	if (params) {
		const queryString = new URLSearchParams(params).toString()
		finalUrl += finalUrl.includes("?") ? `&${queryString}` : `?${queryString}`
	}
	return request<T>(finalUrl, {
		method: "PUT",
		body: body ? JSON.stringify(body) : undefined,
		...init,
	})
}

// DELETE 请求，适配 SWR
export async function fetchDelete<T = any>(
	url: string | URL,
	params?: Record<string, any>,
	init?: RequestInit,
): Promise<T> {
	let finalUrl = url.toString()
	if (params) {
		const queryString = new URLSearchParams(params).toString()
		finalUrl += finalUrl.includes("?") ? `&${queryString}` : `?${queryString}`
	}
	return request<T>(finalUrl, {
		method: "DELETE",
		...init,
	})
}

export function downloadFile(url: string, filename?: string) {
	const a = document.createElement("a")
	a.href = url
	a.target = "_blank"
	if (filename) {
		a.download = filename
	}
	a.style.display = "none"
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
}
