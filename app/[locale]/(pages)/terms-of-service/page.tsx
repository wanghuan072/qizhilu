import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import { alternatesCanonical, defaultLocale, locales } from "@/lib/i18n/locales"
import { getSiteSettings } from "@/lib/services/site"
import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import React from "react"
import TermsContent from "./view"
export const dynamic = "force-static"
type Props = {
	params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
	return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	setRequestLocale(locale)
	// 获取 canonical 数据
	const canonical = alternatesCanonical(defaultLocale, "/terms-of-service")
	return {
		title: "Terms of Service",
		description:
			"Our terms of service outline the rules and guidelines for using our website and services.",
		alternates: {
			canonical: canonical,
		},
		robots: {
			index: false,
			follow: false,
		},
	}
}

export default async function TermsPage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	// Get site configuration from API
	const siteConfig = await getSiteSettings()

	// Breadcrumb navigation items
	const breadcrumbItems = [
		{ label: "Home", href: "/" },
		{ label: "Terms of Service", href: "/terms-of-service", isActive: true },
	]

	return (
		<>
			<Breadcrumb items={breadcrumbItems} />
			<main className="container mx-auto px-4 py-8">
				<TermsContent siteConfig={siteConfig} />
			</main>
		</>
	)
}
