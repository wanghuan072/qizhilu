"use client"

import Head from "next/head"
import React from "react"

interface SEOHeadProps {
	preloadFonts?: string[]
	preloadImages?: string[]
	preconnectDomains?: string[]
	dnsPreconnectDomains?: string[]
}

/**
 * SEO 优化的 Head 组件
 * 用于预加载资源、预连接域名等
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
	preloadFonts = [],
	preloadImages = [],
	preconnectDomains = [],
	dnsPreconnectDomains = [],
}) => {
	return (
		<Head>
			{/* 预加载字体 */}
			{preloadFonts.map((font, index) => (
				<link
					key={`font-${index}`}
					rel="preload"
					href={font}
					as="font"
					type="font/woff2"
					crossOrigin="anonymous"
				/>
			))}

			{/* 预加载图片 */}
			{preloadImages.map((image, index) => (
				<link key={`image-${index}`} rel="preload" href={image} as="image" />
			))}

			{/* 预连接域名 */}
			{preconnectDomains.map((domain, index) => (
				<link
					key={`preconnect-${index}`}
					rel="preconnect"
					href={domain}
					crossOrigin="anonymous"
				/>
			))}

			{/* DNS 预连接 */}
			{dnsPreconnectDomains.map((domain, index) => (
				<link key={`dns-prefetch-${index}`} rel="dns-prefetch" href={domain} />
			))}
		</Head>
	)
}

export default SEOHead
