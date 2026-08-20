"use client"
import VideoPlayer from "@ui/VideoPlayer"
import { useTranslations } from "next-intl"
import React from "react"

interface RelatedVideosContentProps {
	items: { url: string; title?: string }[]
}

const RelatedVideosContent: React.FC<RelatedVideosContentProps> = ({
	items,
}) => {
	const t = useTranslations("Game")

	return (
		<div>
			<h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">
				{t("relatedVideosTitle")}
			</h2>
			{items.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 sm:mt-6">
					{items.map((video, index) => (
						<div key={`video-${index + 1}`} className="w-full">
							<div className="aspect-video mb-2 rounded-lg overflow-hidden bg-muted">
								<VideoPlayer
									url={video.url}
									title={video?.title}
									controls
									width="100%"
									height="100%"
									className="rounded-lg"
								/>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="text-center text-muted-foreground py-6 sm:py-8">
					{t("noGameVideos")}
				</div>
			)}
		</div>
	)
}

export default RelatedVideosContent
