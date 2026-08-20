import { getLanguages } from "@/lib/services/site"
import type { LocalePrefix } from "next-intl/routing"
import type { NextRequest } from "next/server"
import { Language } from "../types"

import cachedSiteSettings from "@/lib/config/siteSettings"

export const locales = cachedSiteSettings.supportedLocales
export const defaultLocale = cachedSiteSettings.defaultLocale

// as-needed means that the locale prefix is only added to the pathname if it is not already present.
export const localePrefix: LocalePrefix = "as-needed" as LocalePrefix

export type I18nLocales = { key: string; name: string }[]

export function isSupportedLocale(locale: string): boolean {
	return locales.includes(locale)
}

export const getCurrentLocaleName = async (locale: string) => {
	const languages = await getLanguages()
	return languages[locale]?.localName ?? ""
}

// 异步获取语言名称
export async function getLocaleName(locale: string): Promise<string> {
	const languages = await getLanguages()
	return languages[locale]?.localName ?? ""
}

/**
 * 获取不带语言前缀的路径名
 * @param path 路径，可以是字符串、URL对象或NextRequest对象
 * @returns 不带语言前缀的路径名
 */
export function getPathnameWithoutLocale(
	path: string | URL | NextRequest,
): string {
	let pathname: string
	if (typeof path === "string") {
		pathname = path
	} else if (path instanceof URL) {
		pathname = path.pathname
	} else {
		pathname = path.nextUrl.pathname
	}

	// 检查路径是否以语言代码开头
	for (const locale of locales) {
		if (pathname.startsWith(`/${locale}/`)) {
			return pathname.slice(locale.length + 1)
		}
		// 处理路径正好是 `/${locale}` 的情况
		if (pathname === `/${locale}`) {
			return "/"
		}
	}

	return pathname
}

export function getPathnameWithLocale(pathname: string, locale: string) {
	if (locale === defaultLocale) {
		return pathname
	}
	if (pathname.startsWith("/")) {
		return `/${locale}${pathname}`
	}

	return pathname
}

// 生成多语言的alternates
export function alternatesLanguage(subPath: string) {
	const path = process.env.NEXT_PUBLIC_DOMAIN || ""
	const languages: Record<string, string> = {}
	// 检查路径是否以语言代码开头
	locales.forEach((lang) => {
		const url =
			lang === defaultLocale ? `${path}${subPath}` : `${path}/${lang}${subPath}`
		// 替换连续的斜杠为单个斜杠,去掉最后一个/
		languages[lang] = url.replace(/\/$/, "")
	})
	languages["x-default"] = `${path}${subPath}`.replace(/\/$/, "")
	return languages
}

export function alternatesCanonical(
	locale: string,
	subPath: string,
	page?: string,
) {
	const path = process.env.NEXT_PUBLIC_DOMAIN || ""
	const withPages = page ? `/${page}` : ""
	const finalPath = `${path}${
		defaultLocale === locale ? "" : `/${locale}`
	}${subPath}${withPages}`
	// 替换连续的斜杠为单个斜杠,去掉最后一个/
	return finalPath.replace(/\/$/, "")
}
