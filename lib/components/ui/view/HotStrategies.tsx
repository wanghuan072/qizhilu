import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import React from "react"
interface Strategy {
	id: string
	title: string
	description: string
	imageUrl: string
	href: string
}

interface HotStrategiesProps {
	strategies: Strategy[]
}

export const HotStrategies: React.FC<HotStrategiesProps> = ({ strategies }) => {
	if (!strategies || strategies.length === 0) {
		return null // Don't render if no strategies
	}
	const t = useTranslations()
	return (
		<div id="hot-strategies" className="mb-10 scroll-mt-24">
			{/* Header */}
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
					{t("Common.hotStrategiesTitle") || "热门攻略"}
				</h2>
				<Link
					href="/strategies"
					className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
				>
					{t("Common.viewAll") || "查看全部"}
					<ArrowRight className="ml-1 h-4 w-4" />
				</Link>
			</div>

			{/* Strategies Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{strategies.map((strategy) => (
					<div
						key={strategy.id}
						className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col"
					>
						<div className="relative w-full h-48">
							{" "}
							{/* Fixed height for image container */}
							<Image
								src={strategy.imageUrl}
								alt={strategy.title}
								layout="fill"
								objectFit="cover" // Cover the container
								className="transition-transform duration-300 group-hover:scale-105"
							/>
						</div>
						<div className="p-4 flex flex-col flex-grow">
							<h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
								{strategy.title}
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
								{strategy.description}
							</p>
							<Link
								href={strategy.href}
								className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 self-start flex items-center mt-auto"
							>
								{t("Common.readStrategy")}
								<ArrowRight className="ml-1 h-4 w-4" />
							</Link>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default HotStrategies
