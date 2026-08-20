import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import { alternatesCanonical, defaultLocale, locales } from "@/lib/i18n/locales"
import { getSiteSettings } from "@/lib/services/site"
import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import ContactUsContent from "./view"

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
	const canonical = alternatesCanonical(defaultLocale, "/contact-us")
	return {
		title: "Contact Us",
		description:
			"Get in touch with us. We'd love to hear from you and help with any questions or feedback.",
		alternates: {
			canonical: canonical,
		},
		robots: {
			index: false,
			follow: false,
		},
	}
}

export default async function ContactUsPage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	const siteConfig = await getSiteSettings()

	const breadcrumbItems = [
		{ label: "Home", href: "/" },
		{ label: "Contact Us", href: "/contact-us", isActive: true },
	]

	return (
		<>
			<Breadcrumb items={breadcrumbItems} />
			<main className="container mx-auto px-4 py-8">
				<ContactUsContent siteConfig={siteConfig} />
			</main>
		</>
	)
}
