import { GameCard } from "@/lib/components/ui/view/GamePage/components/GameCard"
import { alternatesCanonical, defaultLocale } from "@/lib/i18n/locales"
import { getAllGames } from "@/lib/services/game"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { setRequestLocale } from "next-intl/server"
import Link from "next/link"

export const dynamic = "force-static"

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
	try {
		return [defaultLocale].map((locale) => ({ locale }))
	} catch (error) {
		console.error("Failed to fetch locales for generateStaticParams:", error)
		return []
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	setRequestLocale(locale)

	return {
		title: "Not Found",
		description:
			"The page you are looking for does not exist or has been moved.",
		robots: {
			index: false,
			follow: false,
		},
	}
}
export default async function LocalizedNotFoundPage({ params }: Props) {
	const t = await getTranslations("NotFound")
	const locale = (await params).locale as string
	const url = alternatesCanonical(locale, "")

	// 获取所有游戏并随机选择8个
	const allGames = await getAllGames(locale)
	const shuffledGames = allGames.sort(() => Math.random() - 0.5).slice(0, 8)

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 via-indigo-50 to-gray-100 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 relative overflow-hidden">
			{/* 背景效果 */}
			<div className="absolute top-20 right-10 w-64 h-64 rounded-full dark:bg-indigo-600/20 bg-indigo-600/10 filter blur-3xl animate-pulse z-0"></div>
			<div className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full dark:bg-violet-600/20 bg-violet-600/10 filter blur-3xl animate-pulse z-0"></div>
			<div className="absolute inset-0 bg-radial-gradient dark:opacity-40 opacity-20 pointer-events-none z-0"></div>

			<div className="container mx-auto px-4 py-8 md:px-8">
				{/* 404错误信息区域 */}
				<div className="flex items-center justify-center min-h-[30vh] mb-16">
					<div className="max-w-lg mx-auto flex-1 flex-row-reverse gap-12 items-center justify-between md:max-w-none md:flex relative z-10">
						<div className="flex-1 max-w-lg">
							<img
								alt={t("title")}
								src="/404.svg"
								loading="lazy"
								width={500}
								height={200}
							/>
						</div>
						<div className="mt-12 flex-1 max-w-lg space-y-3 md:mt-0 ">
							<h3 className="text-primary font-semibold text-center text-4xl sm:text-5xl sm:text-left">
								404 Error
							</h3>
							<p className="text-gray-800 text-xl font-semibold text-center sm:text-2xl sm:text-left">
								{t("title")}
							</p>
							<p className="text-gray-600 text-center sm:text-left">
								{t("description")}
							</p>
							<div className="text-center sm:text-left">
								<Link
									href={`${url}`}
									className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-8 py-3 rounded-full duration-150 hover:from-indigo-600 hover:to-violet-600 font-medium inline-flex items-center gap-x-1 shadow-lg transition-all"
								>
									<div className="flex items-center gap-x-1">
										{t("backToHome")}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											className="w-5 h-5 ml-1"
										>
											<title>{t("backToHome")}</title>
											<path
												d="M15.75 19.5L8.25 12l7.5-7.5"
												stroke="currentColor"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>
								</Link>
							</div>
						</div>
					</div>
				</div>

				{/* 推荐游戏区域 */}
				{shuffledGames.length > 0 && (
					<div className="relative z-10 mb-8">
						<div className="text-center mb-8">
							<h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
								{t("recommendedGamesTitle")}
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								{t("recommendedGamesDescription")}
							</p>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
							{shuffledGames.map((game) => (
								<GameCard
									key={game.id}
									name={game.name}
									slug={game.slug}
									image={game.screenshotUrl}
									rating={game.gameInfo?.rating}
									className="w-full"
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
