import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import { defaultLocale } from "@/lib/i18n/locales"
import { getSiteSettings } from "@/lib/services/site"
import { BreadcrumbItem } from "@/lib/types"
import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import React from "react"
import CookiePolicyContent from "./view"
export const dynamic = "force-static"
type Props = {
	params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
	try {
		return [{ locale: defaultLocale }]
	} catch (error) {
		console.error("Failed to fetch locales for generateStaticParams:", error)
		return []
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	setRequestLocale(locale)

	return {
		title: "Cookie Policy",
		description:
			"Our cookie policy explains how we use cookies and similar technologies on our website.",
		robots: {
			index: false,
			follow: false,
		},
	}
}

export default async function CookiePolicyPage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	const siteConfig = await getSiteSettings()

	// Breadcrumb navigation items
	const breadcrumbItems: BreadcrumbItem[] = [
		{ label: "Home", href: "/" },
		{ label: "Cookie Policy", href: "/cookies", isActive: true },
	]

	return (
		<>
			<Breadcrumb items={breadcrumbItems} />
			<main className="container mx-auto px-4 py-8">
				<CookiePolicyContent siteConfig={siteConfig} />
			</main>
		</>
	)
}
