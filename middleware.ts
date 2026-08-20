import { routing } from "@/lib/i18n/routing"
import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"

export const config = {
	// Match only internationalized pathnames
	matcher: [
		// Skip all paths that should not be internationalized. This example skips the
		// folders "api", "_next" and all files with an extension (e.g. favicon.ico)
		"/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap.xsl|ads.txt).*)",
	],
}

const handleRouting = createMiddleware(routing)
export default function middleware(request: NextRequest) {
	return handleRouting(request)
}
