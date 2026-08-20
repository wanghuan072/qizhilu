import { siteSettings } from "@/lib/config/siteSettings"
import { MetadataRoute } from "next"
// 添加静态生成配置
export const dynamic = "force-static"
// 可选：添加重验证时间（如果需要的话）
export const revalidate = false
/**
 * 生成动态的 robots.txt
 */
export default function robots(): MetadataRoute.Robots {
	// 只有当 baseUrl 存在时才添加 sitemap
	const robotsConfig: MetadataRoute.Robots = {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: [
				"/api/",
				"/_next/",
				"/auth/",
				"/cdn-cgi/",
				"/search",
				"/*/search",
				"/terms-of-service",
				"/*/terms-of-service",
				"/privacy-policy",
				"/*/privacy-policy",
				"/page-not-found",
				"/*/page-not-found",
				"/cookies",
				"/*/cookies",
				"/games/recently-played",
				"/*/games/recently-played",
				"/about-us",
				"/*/about-us",
				"/contact-us",
				"/*/contact-us",
				"/copyright-infringement-notice-procedure",
				"/*/copyright-infringement-notice-procedure",
			],
		},
	}

	// 如果有完整的域名，才添加 sitemap
	robotsConfig.sitemap = `${siteSettings.domain}/sitemap.xml`

	return robotsConfig
}
