"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { BackgroundEffects } from "./BackgroundEffects"

interface InitialContentProps {
	title: string
	slogan?: string
	image?: string
	onPlayClick: () => void
}

export const InitialContent = ({
	title,
	slogan,
	image,
	onPlayClick,
}: InitialContentProps) => {
	const t = useTranslations("Game")
	const [effectsReady, setEffectsReady] = useState(false)

	useEffect(() => {
		const timer = setTimeout(() => {
			setEffectsReady(true)
		}, 200)

		return () => clearTimeout(timer)
	}, [])

	return (
		<div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 dark:bg-background/70 backdrop-blur-md overflow-hidden">
			{effectsReady && <BackgroundEffects />}

			<div className="relative z-10 w-full mx-auto px-4 md:px-8">
				<div className="flex flex-col items-center gap-2 md:gap-8">
					<div
						className="relative group flex justify-center cursor-pointer min-w-[120px] min-h-[120px] max-w-[220px] max-h-[220px] md:min-w-[200px] md:min-h-[200px] md:max-w-[480px] md:max-h-[480px]"
						onClick={onPlayClick}
					>
						<div className="inline-block rounded-xl overflow-hidden border border-primary/70 backdrop-blur-sm shadow-xl">
							{image ? (
								<img
									src={image}
									alt={title}
									className="max-w-[220px] max-h-[220px] md:max-w-[480px] md:max-h-[480px] min-w-[120px] min-h-[120px] md:min-w-[200px] md:min-h-[200px] w-auto h-auto object-contain will-change-transform group-hover:scale-110 transition-transform duration-300 rounded-xl"
									loading="eager"
									fetchPriority="high"
								/>
							) : (
								<div className="w-[220px] h-[220px] md:w-[480px] md:h-[480px] bg-primary/20 backdrop-blur-sm flex items-center justify-center">
									<svg
										className="w-12 h-12 text-primary"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<title>{t("playGame")}</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
										/>
									</svg>
								</div>
							)}
						</div>
						<div className="absolute inset-0 rounded-xl bg-primary/80 dark:bg-primary/70 blur-xl -z-10 group-hover:bg-primary/90 dark:group-hover:bg-primary/80 transition-colors duration-300" />
						<div className="absolute inset-0 rounded-xl bg-secondary/60 dark:bg-secondary/50 blur-2xl -z-20 group-hover:bg-secondary/70 dark:group-hover:bg-secondary/60 transition-colors duration-300 translate-y-2 translate-x-2" />
					</div>

					<div className="text-center">
						<div className="text-base md:text-5xl font-bold text-foreground mb-2 md:mb-4 leading-tight drop-shadow-sm">
							{title}
						</div>
						{slogan && (
							<div className="text-sm md:text-lg text-muted-foreground mb-4 md:mb-8 leading-relaxed">
								{slogan}
							</div>
						)}
						<div className="flex justify-center">
							<button
								type="button"
								onClick={onPlayClick}
								className="group relative flex items-center gap-2 md:gap-3 text-primary-foreground px-4 py-2 md:py-2 rounded-full font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-105"
							>
								<div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary group-hover:from-primary/90 group-hover:to-secondary/90 transition-all duration-300 shadow-lg" />

								<span className="relative flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full bg-background/50 group-hover:bg-background/70 transition-colors backdrop-blur-sm">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-8 w-8 md:h-12 md:w-12"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<title>{t("playGame")}</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
										/>
									</svg>
								</span>
								<span className="relative">{t("playGame")}</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
