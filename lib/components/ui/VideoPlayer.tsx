"use client"

import { Pause, Play, Volume2, VolumeX } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"

interface VideoPlayerProps {
	url: string
	title?: string
	width?: string
	height?: string
	className?: string
	controls?: boolean
}

// YouTube URL 检测和 embed URL 转换
const getYouTubeEmbedUrl = (url: string): string | null => {
	const youtubeRegex =
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
	const match = url.match(youtubeRegex)
	if (match) {
		return `https://www.youtube.com/embed/${match[1]}`
	}
	return null
}

// 检测是否为支持的视频格式
const isVideoFile = (url: string): boolean => {
	const videoExtensions = [
		".mp4",
		".webm",
		".ogg",
		".mov",
		".avi",
		".mkv",
		".m4v",
	]
	return videoExtensions.some((ext) => url.toLowerCase().includes(ext))
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
	url,
	title,
	width = "100%",
	height = "100%",
	className = "",
	controls = true,
}) => {
	const [isPlaying, setIsPlaying] = useState(false)
	const [isMuted, setIsMuted] = useState(false)
	const [showControls, setShowControls] = useState(controls)
	const videoRef = useRef<HTMLVideoElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	// YouTube 视频处理
	const youtubeEmbedUrl = getYouTubeEmbedUrl(url)

	// 普通视频文件处理
	const isVideo = isVideoFile(url)

	useEffect(() => {
		if (!isVideo || !videoRef.current) return

		const video = videoRef.current

		const handlePlay = () => setIsPlaying(true)
		const handlePause = () => setIsPlaying(false)

		video.addEventListener("play", handlePlay)
		video.addEventListener("pause", handlePause)

		return () => {
			video.removeEventListener("play", handlePlay)
			video.removeEventListener("pause", handlePause)
		}
	}, [isVideo])

	const togglePlay = () => {
		if (!videoRef.current) return

		if (isPlaying) {
			videoRef.current.pause()
		} else {
			videoRef.current.play()
		}
	}

	const toggleMute = () => {
		if (!videoRef.current) return

		videoRef.current.muted = !isMuted
		setIsMuted(!isMuted)
	}

	// YouTube 视频渲染
	if (youtubeEmbedUrl) {
		return (
			<div
				ref={containerRef}
				className={`relative w-full h-full ${className}`}
				style={{ width, height }}
			>
				<iframe
					src={youtubeEmbedUrl}
					title={title || "YouTube video"}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					className="w-full h-full border-0 rounded-lg"
					loading="lazy"
				/>
			</div>
		)
	}

	// 普通视频文件渲染
	if (isVideo) {
		return (
			<div
				ref={containerRef}
				className={`relative w-full h-full group ${className}`}
				style={{ width, height }}
				onMouseEnter={() => setShowControls(true)}
				onMouseLeave={() => setShowControls(controls)}
			>
				<video
					ref={videoRef}
					src={url}
					className="w-full h-full object-cover rounded-lg"
					muted={isMuted}
					preload="metadata"
					playsInline
				>
					您的浏览器不支持视频播放。
				</video>

				{showControls && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg">
						<div className="flex items-center gap-4 bg-black/60 rounded-full p-3">
							<button
								onClick={togglePlay}
								className="text-white hover:text-gray-300 transition-colors"
								type="button"
								aria-label={isPlaying ? "暂停" : "播放"}
							>
								{isPlaying ? <Pause size={24} /> : <Play size={24} />}
							</button>

							<button
								onClick={toggleMute}
								className="text-white hover:text-gray-300 transition-colors"
								type="button"
								aria-label={isMuted ? "取消静音" : "静音"}
							>
								{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
							</button>
						</div>
					</div>
				)}
			</div>
		)
	}

	// 不支持的格式，显示链接
	return (
		<div
			className={`relative w-full h-full flex items-center justify-center bg-muted rounded-lg ${className}`}
			style={{ width, height }}
		>
			<div className="text-center p-4">
				<p className="text-sm text-muted-foreground mb-2">不支持的视频格式</p>
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary hover:underline text-sm"
				>
					{title || "打开链接"}
				</a>
			</div>
		</div>
	)
}

export default VideoPlayer
