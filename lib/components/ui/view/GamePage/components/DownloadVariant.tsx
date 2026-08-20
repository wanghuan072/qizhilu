"use client"

import { cva } from "class-variance-authority"
import { useTranslations } from "next-intl"

const buttonVariants = cva(
	"font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2",
	{
		variants: {
			variant: {
				download: "bg-primary hover:bg-primary-hover text-primary-foreground",
			},
		},
	},
)

interface DownloadVariantProps {
	url: string
}

export const DownloadVariant = ({ url }: DownloadVariantProps) => {
	const t = useTranslations("Game")

	return (
		<a
			href={url}
			rel="noopener noreferrer"
			className={buttonVariants({ variant: "download" })}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<title>download</title>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
				/>
			</svg>
			{t("downloadGame")}
		</a>
	)
}
