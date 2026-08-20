// 动态导入当前主题
import RawScriptInjector from "@/lib/components/layout/RawScriptInjector"
import { siteSettings } from "@/lib/config/siteSettings"
import { isSupportedLocale } from "@/lib/i18n/locales"
import { parseCustomHeaderContent } from "@/lib/metadataUtils"
import { cn } from "@/lib/utils/react"
import { generateLayoutMetadata } from "@/lib/utils/seo/metadata-generators"
import { Metadata, Viewport } from "next"
import Script from "next/script"
import { NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import type { PropsWithChildren } from "react"
import "../globals.css"
import "./current-theme.css"
import "./font-theme.css"
import { Providers } from "./providers"

type Props = PropsWithChildren<{ params: Promise<{ locale: string }> }>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	setRequestLocale(locale)
	if (!isSupportedLocale(locale)) {
		return {}
	}

	// 获取基础布局元数据
	const layoutMetadata = await generateLayoutMetadata(locale)

	// 解析自定义头部内容中的元数据
	const { metadata: customMetadata } = parseCustomHeaderContent(
		siteSettings.customHeaderContent,
	)

	// 合并元数据，自定义元数据优先
	return {
		...layoutMetadata,
		...customMetadata,
		// 添加字体链接
		other: {
			...layoutMetadata.other,
			...customMetadata.other,
		},
	}
}

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
}

export default async function LocaleLayout({ children, params }: Props) {
	const { locale } = await params
	if (!isSupportedLocale(locale)) {
		return notFound()
	}
	setRequestLocale(locale)

	// 解析用户输入的自定义头部内容
	const { rawScripts } = parseCustomHeaderContent(
		siteSettings.customHeaderContent,
	)
	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				{/* 注入那些不能通过 metadata API 处理的脚本和其他标签 */}
				<RawScriptInjector scripts={rawScripts} />
				
				{/* 全局 Google AdSense 自动广告 */}
				{siteSettings.analytics?.adsenseClientId && (
					<>
						<Script
							async
							src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteSettings.analytics.adsenseClientId}`}
							crossOrigin="anonymous"
							strategy="afterInteractive"
						/>
						<Script
							id="adsense-auto-ads"
							strategy="afterInteractive"
							dangerouslySetInnerHTML={{
								__html: `
									(adsbygoogle = window.adsbygoogle || []).push({
										google_ad_client: "${siteSettings.analytics.adsenseClientId}",
										enable_page_level_ads: true
									});
								`,
							}}
						/>
					</>
				)}
				
				{/* 全局弹窗广告初始化脚本（如果需要） */}
				{/* 注意：弹窗广告的具体代码应该在 ModalAdSlot 组件中，这里只是初始化 */}
			</head>
			<body suppressHydrationWarning>
				<div
					className={cn(
						"min-h-screen font-sans antialiased",
						"bg-background dark:bg-tech-dark dark:text-white",
					)}
				>
					<NextIntlClientProvider locale={locale}>
						<Providers locale={locale}>{children}</Providers>
					</NextIntlClientProvider>
				</div>
			</body>
		</html>
	)
}
