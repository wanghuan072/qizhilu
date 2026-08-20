import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import { alternatesCanonical, defaultLocale, locales } from "@/lib/i18n/locales"
import { getSiteSettings } from "@/lib/services/site"
import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import AboutUsContent from "./view"

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
	const canonical = alternatesCanonical(defaultLocale, "/about-us")
	return {
		title: "About Us",
		description:
			"Learn more about our mission, values, and the team behind our gaming platform.",
		alternates: {
			canonical: canonical,
		},
		robots: {
			index: false,
			follow: false,
		},
	}
}

export default async function AboutUsPage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	const siteConfig = await getSiteSettings()

	const breadcrumbItems = [
		{ label: "Home", href: "/" },
		{ label: "About Us", href: "/about-us", isActive: true },
	]

	return (
		<>
			<Breadcrumb items={breadcrumbItems} />
			<main className="container mx-auto px-4 py-8">
				<AboutUsContent siteConfig={siteConfig} />
			</main>
		</>
	)
}
