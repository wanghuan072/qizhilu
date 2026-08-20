import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import { alternatesCanonical, defaultLocale, locales } from "@/lib/i18n/locales"
import { getSiteSettings } from "@/lib/services/site"
import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import CopyrightNoticeContent from "./view"

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
	const canonical = alternatesCanonical(
		defaultLocale,
		"/copyright-infringement-notice-procedure",
	)
	return {
		title: "Copyright Infringement Notice Procedure",
		description:
			"Learn how to report copyright infringement and our procedures for handling DMCA takedown requests.",
		alternates: {
			canonical: canonical,
		},
		robots: {
			index: false,
			follow: false,
		},
	}
}

export default async function CopyrightNoticePage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	const siteConfig = await getSiteSettings()

	const breadcrumbItems = [
		{ label: "Home", href: "/" },
		{
			label: "Copyright Notice",
			href: "/copyright-infringement-notice-procedure",
			isActive: true,
		},
	]

	return (
		<>
			<Breadcrumb items={breadcrumbItems} />
			<main className="container mx-auto px-4 py-8">
				<CopyrightNoticeContent siteConfig={siteConfig} />
			</main>
		</>
	)
}
