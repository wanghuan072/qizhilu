"use client"

import cachedSiteSettings from "@/lib/config/siteSettings"
import { redirect } from "next/navigation"

export const dynamic = "force-static"

// 本地定义 alternatesCanonical 函数，避免导入服务端代码
function alternatesCanonical(locale: string, subPath: string, page?: string) {
	const path = process.env.NEXT_PUBLIC_DOMAIN || ""
	const withPages = page ? `/${page}` : ""
	const defaultLocale = cachedSiteSettings.defaultLocale
	const finalPath = `${path}${
		defaultLocale === locale ? "" : `/${locale}`
	}${subPath}${withPages}`
	// 替换连续的斜杠为单个斜杠,去掉最后一个/
	return finalPath.replace(/\/\//g, "/").replace(/\/$/, "")
}

export default function NotFoundPage(e: any) {
	// 全部重定向到自定义404页面，避免无法国际化方式显示内容
	const path = process.env.NEXT_PUBLIC_DOMAIN || ""
	redirect(`${path}/page-not-found`)
	// console.log("###### NotFoundPage ###### ", e)
	// return <div>404</div>
}
