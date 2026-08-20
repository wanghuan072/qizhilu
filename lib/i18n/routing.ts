import { siteSettings } from "@/lib/config/siteSettings"
import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
	locales: siteSettings.supportedLocales,
	defaultLocale: siteSettings.defaultLocale,
	localeDetection: false,
	localePrefix: "as-needed",
})
