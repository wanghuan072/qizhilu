import { ModalAdSlot } from "@/lib/components/ads"
import { BackgroundEffects } from "@/lib/components/ui/view/GamePage/components/BackgroundEffects"
import { alternatesCanonical } from "@/lib/i18n"
import { setRequestLocale } from "next-intl/server"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AdModalClient } from "./AdModalClient"
type Props = {
	params: Promise<{ locale: string }>
}

export function generateStaticParams() {
	return [
		{ locale: "en" },
		{ locale: "de" },
		{ locale: "es-ES" },
		{ locale: "it" },
		{ locale: "fr" },
		{ locale: "ja" },
		{ locale: "ko" },
		{ locale: "nl" },
		{ locale: "pt-PT" },
		{ locale: "zh-CN" },
		{ locale: "zh-TW" },
	]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	setRequestLocale(locale)
	const canonical = alternatesCanonical(locale, "/ad-modal")
	return {
		title: "Ad Modal",
		description:
			"Ad Modal",
		alternates: {
			canonical: canonical,
		},
		robots: {
			index: false,
			follow: false,
		},
	}
}

export default async function AdModalPage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations("Game")

	return (
		<div className="relative flex h-full min-h-[100dvh] w-full flex-1 flex-col items-center justify-center gap-6 overflow-hidden">
			<div className="absolute inset-0">
				<BackgroundEffects />
				<div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
			</div>
			<div className="relative flex w-full flex-1 flex-col items-center justify-center px-4">
				<div className="relative flex h-full w-full max-w-2xl">
					<div className="flex h-full w-full flex-col">
						<div className="flex h-full min-h-[60dvh] min-w-[320px] flex-1 items-center justify-center p-6">
							<ModalAdSlot />
						</div>
					</div>
					<AdModalClient />
				</div>
			</div>

			<p className="relative px-6 text-center text-sm text-muted-foreground">
				{t("advertisementDescription")} - {t("canCloseNow")}
			</p>
		</div>
	)
}
