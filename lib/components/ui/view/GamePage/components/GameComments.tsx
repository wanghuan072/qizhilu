"use client"

import { Icon } from "@/lib/components/common"
import { StarRating } from "@/lib/components/ui/view/GamePage/components/StarRating"
import { GameComment } from "@lib/types"
import { useTranslations } from "next-intl"
import React, { useEffect, useRef, useState } from "react"

// 倒计时时间显示组件
const TimeAgo: React.FC<{
	timestamp: string
	isUserComment?: boolean
}> = ({ timestamp, isUserComment }) => {
	const [timeAgo, setTimeAgo] = useState<string>("")
	const t = useTranslations("Common")

	useEffect(() => {
		const calculateTimeAgo = () => {
			// 如果是用户评论，显示国际化的"刚刚"
			if (isUserComment) {
				setTimeAgo(t("justNow"))
				return
			}

			// 尝试解析时间戳
			let date: Date | null = null

			// 处理不同格式的时间戳
			if (timestamp === "刚刚" || timestamp === "just now") {
				setTimeAgo(t("justNow"))
				return
			}

			// 如果是ISO格式或其他可解析的格式
			try {
				date = new Date(timestamp)
				if (isNaN(date.getTime())) {
					// 如果解析失败，显示原始时间戳
					setTimeAgo(timestamp)
					return
				}
			} catch (error) {
				setTimeAgo(timestamp)
				return
			}

			const now = new Date()
			const diffInMs = now.getTime() - date.getTime()

			// 确保时间差为正数，避免未来时间导致的问题
			if (diffInMs < 0) {
				setTimeAgo(t("justNow"))
				return
			}

			const diffInSeconds = Math.floor(diffInMs / 1000)
			const diffInMinutes = Math.floor(diffInSeconds / 60)
			const diffInHours = Math.floor(diffInMinutes / 60)
			const diffInDays = Math.floor(diffInHours / 24)
			const diffInMonths = Math.floor(diffInDays / 30)
			const diffInYears = Math.floor(diffInDays / 365)

			// 确保count参数都是正整数
			try {
				if (diffInSeconds < 60) {
					setTimeAgo(t("justNow"))
				} else if (diffInMinutes < 60) {
					const count = Math.max(1, Math.floor(diffInMinutes))
					setTimeAgo(t("minutesAgo", { count }))
				} else if (diffInHours < 24) {
					const count = Math.max(1, Math.floor(diffInHours))
					setTimeAgo(t("hoursAgo", { count }))
				} else if (diffInDays < 30) {
					const count = Math.max(1, Math.floor(diffInDays))
					setTimeAgo(t("daysAgo", { count }))
				} else if (diffInMonths < 12) {
					const count = Math.max(1, Math.floor(diffInMonths))
					setTimeAgo(t("monthsAgo", { count }))
				} else {
					const count = Math.max(1, Math.floor(diffInYears))
					setTimeAgo(t("yearsAgo", { count }))
				}
			} catch (error) {
				// 如果国际化处理失败，回退到显示原始时间戳
				console.warn("Time formatting error:", error)
				setTimeAgo(timestamp)
			}
		}

		calculateTimeAgo()

		// 设置定时器，每分钟更新一次
		const interval = setInterval(calculateTimeAgo, 60000)

		return () => clearInterval(interval)
	}, [timestamp, isUserComment, t])

	return (
		<time dateTime={timestamp} title={timestamp}>
			{timeAgo}
		</time>
	)
}

// 可展开的评论内容组件（移动端优化）
const ExpandableCommentText: React.FC<{
	text: string
	commentId: string
}> = ({ text, commentId }) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const t = useTranslations("Common")

	// 检查文本是否需要折叠（移动端下超过150个字符或包含换行符）
	const shouldCollapse = text.length > 150 || text.includes("\n")

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded)
	}

	if (!shouldCollapse) {
		// 内容较短，直接显示
		return <p className="text-foreground">{text}</p>
	}

	return (
		<div className="space-y-2">
			{/* 桌面端：正常显示所有内容 */}
			<div className="hidden md:block">
				<p className="text-foreground">{text}</p>
			</div>

			{/* 移动端：折叠显示 - SEO友好版本 */}
			<div className="md:hidden">
				{/* 完整内容 - 始终在DOM中，使用CSS控制显示 */}
				<div
					className={`transition-all duration-300 ease-in-out overflow-hidden ${
						isExpanded ? "max-h-screen opacity-100" : "max-h-16 opacity-100"
					}`}
				>
					<p
						className={`text-foreground ${!isExpanded ? "line-clamp-3" : ""}`}
						style={{
							display: "-webkit-box",
							WebkitLineClamp: !isExpanded ? 3 : "unset",
							WebkitBoxOrient: "vertical" as any,
							overflow: !isExpanded ? "hidden" : "visible",
						}}
					>
						{text}
					</p>
				</div>

				{/* 展开/收起按钮 */}
				<button
					onClick={toggleExpanded}
					className="mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
				>
					<span>
						{isExpanded ? t("showLess") || "收起" : t("readMore") || "展开"}
					</span>
					<svg
						className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<title>
							{isExpanded ? t("showLess") || "收起" : t("readMore") || "展开"}
						</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>
			</div>
		</div>
	)
}

// 生成随机颜色头像组件
const AvatarWithInitials: React.FC<{ name: string; className?: string }> = ({
	name,
	className = "w-6 h-6",
}) => {
	// 生成基于名字的随机颜色
	const getColorFromName = (name: string) => {
		if (!name) return "bg-gray-500"
		const colors = [
			"bg-red-500",
			"bg-blue-500",
			"bg-green-500",
			"bg-yellow-500",
			"bg-purple-500",
			"bg-pink-500",
			"bg-indigo-500",
			"bg-teal-500",
			"bg-orange-500",
			"bg-cyan-500",
			"bg-lime-500",
			"bg-emerald-500",
		]
		let hash = 0
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash)
		}
		return colors[Math.abs(hash) % colors.length]
	}

	// 获取名字的首字符
	const getInitials = (name: string) => {
		return name.charAt(0).toUpperCase()
	}

	return (
		<div
			className={`${className} ${getColorFromName(
				name,
			)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}
		>
			{getInitials(name)}
		</div>
	)
}

export const GameComments: React.FC<{
	comments: GameComment[]
	gameId: string
}> = ({ comments: initialComments, gameId }) => {
	const [comments, setComments] = useState<GameComment[]>(initialComments)
	const [newComment, setNewComment] = useState("")
	const [newRating, setNewRating] = useState<number>(5)
	const [newAuthor, setNewAuthor] = useState("")
	const [replyingTo, setReplyingTo] = useState<string | null>(null) // ID of comment being replied to
	const [replyText, setReplyText] = useState("")
	const [replyAuthor, setReplyAuthor] = useState("")
	const [userLikesDislikes, setUserLikesDislikes] = useState<
		Record<string, "like" | "dislike" | null>
	>({})
	const t = useTranslations()

	// localStorage 相关工具函数
	const getStorageKey = (gameId: string) => `game-comments-${gameId}`
	const getLikesDislikesStorageKey = (gameId: string) =>
		`game-likes-dislikes-${gameId}`

	const getUserCommentsFromStorage = (): GameComment[] => {
		if (typeof window === "undefined") return []
		try {
			const stored = localStorage.getItem(getStorageKey(gameId))
			return stored ? JSON.parse(stored) : []
		} catch (error) {
			console.error("读取本地评论失败:", error)
			return []
		}
	}

	const saveUserCommentsToStorage = (userComments: GameComment[]) => {
		if (typeof window === "undefined") return
		try {
			localStorage.setItem(getStorageKey(gameId), JSON.stringify(userComments))
		} catch (error) {
			console.error("保存本地评论失败:", error)
		}
	}

	const getUserLikesDislikesFromStorage = (): Record<
		string,
		"like" | "dislike" | null
	> => {
		if (typeof window === "undefined") return {}
		try {
			const stored = localStorage.getItem(getLikesDislikesStorageKey(gameId))
			return stored ? JSON.parse(stored) : {}
		} catch (error) {
			console.error("读取用户点赞记录失败:", error)
			return {}
		}
	}

	const saveUserLikesDislikesToStorage = (
		likesDislikesData: Record<string, "like" | "dislike" | null>,
	) => {
		if (typeof window === "undefined") return
		try {
			localStorage.setItem(
				getLikesDislikesStorageKey(gameId),
				JSON.stringify(likesDislikesData),
			)
		} catch (error) {
			console.error("保存用户点赞记录失败:", error)
		}
	}

	// 从localStorage读取用户评论并合并到评论列表中
	useEffect(() => {
		const userComments = getUserCommentsFromStorage()
		if (userComments.length > 0) {
			// 将用户评论添加到初始评论列表的开头
			setComments([...userComments, ...initialComments])
		}

		// 读取用户的点赞/踩记录
		const likesDislikesData = getUserLikesDislikesFromStorage()
		setUserLikesDislikes(likesDislikesData)
	}, [gameId, initialComments])

	const handlePostComment = () => {
		if (!newComment.trim() || !newAuthor.trim()) return
		const commentToAdd: GameComment = {
			id: `user-c${Date.now()}`,
			author: newAuthor,
			timestamp: new Date().toISOString(),
			text: newComment,
			rating: newRating,
			likes: 0,
			dislikes: 0,
			isUserComment: true, // 标记为用户评论
		}

		// 更新评论列表
		setComments([commentToAdd, ...comments])

		// 保存到localStorage
		const userComments = getUserCommentsFromStorage()
		userComments.unshift(commentToAdd)
		saveUserCommentsToStorage(userComments)

		setNewComment("")
		setNewAuthor("")
		setNewRating(5)
		setReplyingTo(null)
	}

	const handlePostReply = (parentCommentId: string) => {
		if (!replyText.trim() || !replyAuthor.trim()) return

		const replyToAdd: GameComment = {
			id: `user-r${Date.now()}`,
			author: replyAuthor,
			timestamp: new Date().toISOString(),
			text: replyText,
			likes: 0,
			dislikes: 0,
			isUserComment: true, // 标记为用户评论
		}

		setComments((prevComments) => {
			const updatedComments = prevComments.map((comment) => {
				if (comment.id === parentCommentId) {
					return {
						...comment,
						replies: [...(comment.replies || []), replyToAdd],
					} as GameComment
				}
				return comment
			})

			// 如果是回复用户评论，需要更新localStorage
			if (parentCommentId.startsWith("user-")) {
				const userComments = getUserCommentsFromStorage()
				const updatedUserComments = userComments.map((comment) => {
					if (comment.id === parentCommentId) {
						return {
							...comment,
							replies: [...(comment.replies || []), replyToAdd],
						}
					}
					return comment
				})
				saveUserCommentsToStorage(updatedUserComments)
			}

			return updatedComments
		})

		setReplyText("")
		setReplyAuthor("")
		setReplyingTo(null)
	}

	const handleCancelReply = () => {
		setReplyingTo(null)
		setReplyText("")
		setReplyAuthor("")
	}

	// 处理点赞功能
	const handleLike = (
		commentId: string,
		isReply = false,
		parentId?: string,
	) => {
		// 检查用户是否已经点过赞
		const currentAction = userLikesDislikes[commentId]
		if (currentAction === "like") {
			// 如果已经点过赞，不执行任何操作
			return
		}

		// 如果之前点过踩，需要先减少踩的数量
		const wasDisliked = currentAction === "dislike"

		setComments((prevComments) => {
			const updatedComments = prevComments.map((comment) => {
				if (isReply && comment.id === parentId) {
					// 处理回复的点赞
					return {
						...comment,
						replies:
							comment.replies?.map((reply) =>
								reply.id === commentId
									? {
											...reply,
											likes: (reply.likes || 0) + 1,
											dislikes: wasDisliked
												? Math.max(0, (reply.dislikes || 0) - 1)
												: reply.dislikes,
										}
									: reply,
							) || [],
					}
				} else if (comment.id === commentId) {
					// 处理主评论的点赞
					return {
						...comment,
						likes: (comment.likes || 0) + 1,
						dislikes: wasDisliked
							? Math.max(0, (comment.dislikes || 0) - 1)
							: comment.dislikes,
					}
				}
				return comment
			})

			// 如果是用户评论，更新localStorage
			if (commentId.startsWith("user-") || parentId?.startsWith("user-")) {
				const userComments = getUserCommentsFromStorage()
				const updatedUserComments = userComments.map((comment) => {
					if (isReply && comment.id === parentId) {
						return {
							...comment,
							replies:
								comment.replies?.map((reply) =>
									reply.id === commentId
										? {
												...reply,
												likes: (reply.likes || 0) + 1,
												dislikes: wasDisliked
													? Math.max(0, (reply.dislikes || 0) - 1)
													: reply.dislikes,
											}
										: reply,
								) || [],
						}
					} else if (comment.id === commentId) {
						return {
							...comment,
							likes: (comment.likes || 0) + 1,
							dislikes: wasDisliked
								? Math.max(0, (comment.dislikes || 0) - 1)
								: comment.dislikes,
						}
					}
					return comment
				})
				saveUserCommentsToStorage(updatedUserComments)
			}

			return updatedComments
		})

		// 更新用户点赞状态
		const newLikesDislikesData = {
			...userLikesDislikes,
			[commentId]: "like" as const,
		}
		setUserLikesDislikes(newLikesDislikesData)
		saveUserLikesDislikesToStorage(newLikesDislikesData)
	}

	// 处理踩功能
	const handleDislike = (
		commentId: string,
		isReply = false,
		parentId?: string,
	) => {
		// 检查用户是否已经点过踩
		const currentAction = userLikesDislikes[commentId]
		if (currentAction === "dislike") {
			// 如果已经点过踩，不执行任何操作
			return
		}

		// 如果之前点过赞，需要先减少赞的数量
		const wasLiked = currentAction === "like"

		setComments((prevComments) => {
			const updatedComments = prevComments.map((comment) => {
				if (isReply && comment.id === parentId) {
					// 处理回复的踩
					return {
						...comment,
						replies:
							comment.replies?.map((reply) =>
								reply.id === commentId
									? {
											...reply,
											dislikes: (reply.dislikes || 0) + 1,
											likes: wasLiked
												? Math.max(0, (reply.likes || 0) - 1)
												: reply.likes,
										}
									: reply,
							) || [],
					}
				} else if (comment.id === commentId) {
					// 处理主评论的踩
					return {
						...comment,
						dislikes: (comment.dislikes || 0) + 1,
						likes: wasLiked
							? Math.max(0, (comment.likes || 0) - 1)
							: comment.likes,
					}
				}
				return comment
			})

			// 如果是用户评论，更新localStorage
			if (commentId.startsWith("user-") || parentId?.startsWith("user-")) {
				const userComments = getUserCommentsFromStorage()
				const updatedUserComments = userComments.map((comment) => {
					if (isReply && comment.id === parentId) {
						return {
							...comment,
							replies:
								comment.replies?.map((reply) =>
									reply.id === commentId
										? {
												...reply,
												dislikes: (reply.dislikes || 0) + 1,
												likes: wasLiked
													? Math.max(0, (reply.likes || 0) - 1)
													: reply.likes,
											}
										: reply,
								) || [],
						}
					} else if (comment.id === commentId) {
						return {
							...comment,
							dislikes: (comment.dislikes || 0) + 1,
							likes: wasLiked
								? Math.max(0, (comment.likes || 0) - 1)
								: comment.likes,
						}
					}
					return comment
				})
				saveUserCommentsToStorage(updatedUserComments)
			}

			return updatedComments
		})

		// 更新用户踩状态
		const newLikesDislikesData = {
			...userLikesDislikes,
			[commentId]: "dislike" as const,
		}
		setUserLikesDislikes(newLikesDislikesData)
		saveUserLikesDislikesToStorage(newLikesDislikesData)
	}

	const renderRatingSelector = () => (
		<div className="flex items-center gap-3 mb-4">
			<span className="text-sm font-medium text-foreground">
				{t("Common.yourRating") || "你的评分"}:
			</span>
			<div className="flex items-center gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<label
						key={star}
						className="p-1 hover:scale-110 transition-transform cursor-pointer"
					>
						{/** @ts-ignore */}
						<input
							type="radio"
							name="rating"
							value={star}
							checked={star === newRating}
							onChange={() => setNewRating(star)}
							className="sr-only"
						/>
						<Icon
							name="Star"
							className={`h-5 w-5 ${
								star <= newRating
									? "text-primary fill-current"
									: "text-muted-foreground"
							}`}
							size={20}
						/>
					</label>
				))}
				<span className="ml-2 text-sm text-muted-foreground">
					{newRating}.0
				</span>
			</div>
		</div>
	)

	const renderComment = (
		comment: GameComment,
		isReply = false,
		parentId?: string,
	) => (
		<article
			key={comment.id}
			className={`p-4 text-base bg-card rounded-lg ${isReply ? "ml-6 lg:ml-12 mt-4" : "mb-6"}`}
		>
			<footer className="flex justify-between items-center mb-2">
				<div className="flex items-center">
					<div className="inline-flex items-center mr-3 text-sm text-foreground font-semibold">
						<AvatarWithInitials
							name={comment.author}
							className="mr-2 w-6 h-6"
						/>
						{comment.author}
					</div>
					<p className="text-sm text-muted-foreground">
						<TimeAgo
							timestamp={comment.timestamp}
							isUserComment={comment.isUserComment}
						/>
					</p>
				</div>
			</footer>

			{/* 显示评分 - 只在一级评论中显示 */}
			{comment.rating && !isReply && (
				<div className="mb-3">
					<StarRating
						rating={comment.rating}
						className="text-sm"
						showRatingText={true}
					/>
				</div>
			)}

			<ExpandableCommentText text={comment.text} commentId={comment.id} />
			<div className="flex items-center mt-4 space-x-4">
				<button
					type="button"
					className={`flex items-center text-sm transition-colors ${
						userLikesDislikes[comment.id] === "like"
							? "text-primary bg-primary/10 px-2 py-1 rounded-md"
							: userLikesDislikes[comment.id] === "dislike"
								? "text-muted-foreground cursor-not-allowed opacity-50"
								: "text-muted-foreground hover:text-foreground hover:underline"
					}`}
					onClick={() => handleLike(comment.id, isReply, parentId)}
					disabled={userLikesDislikes[comment.id] !== null}
				>
					<Icon
						name="ThumbsUp"
						className={`mr-1.5 w-3.5 h-3.5 ${
							userLikesDislikes[comment.id] === "like" ? "fill-current" : ""
						}`}
						size={14}
					/>{" "}
					{comment.likes} {t("Common.like") || "赞"}
				</button>
				<button
					type="button"
					className={`flex items-center text-sm transition-colors ${
						userLikesDislikes[comment.id] === "dislike"
							? "text-destructive bg-destructive/10 px-2 py-1 rounded-md"
							: userLikesDislikes[comment.id] === "like"
								? "text-muted-foreground cursor-not-allowed opacity-50"
								: "text-muted-foreground hover:text-foreground hover:underline"
					}`}
					onClick={() => handleDislike(comment.id, isReply, parentId)}
					disabled={userLikesDislikes[comment.id] !== null}
				>
					<Icon
						name="ThumbsDown"
						className={`mr-1.5 w-3.5 h-3.5 ${
							userLikesDislikes[comment.id] === "dislike" ? "fill-current" : ""
						}`}
						size={14}
					/>{" "}
					{comment.dislikes} {t("Common.dislike") || "踩"}
				</button>
				{/* 只允许回复一级评论 */}
				{!isReply && (
					<button
						type="button"
						className="flex items-center text-sm text-muted-foreground hover:text-foreground hover:underline"
						onClick={() => setReplyingTo(comment.id)}
					>
						<Icon
							name="CornerDownRight"
							className="mr-1.5 w-3.5 h-3.5"
							size={14}
						/>
						{t("Common.reply") || "回复"}
					</button>
				)}
			</div>
			{comment.replies?.map((reply) => renderComment(reply, true, comment.id))}
			{/* 回复表单只在一级评论下显示 */}
			{!isReply && replyingTo === comment.id && (
				<div className="mt-4 ml-6 lg:ml-12">
					<div className="bg-card rounded-lg border border-border p-3">
						<div className="mb-3">
							<span className="text-xs text-muted-foreground">
								{t("Common.replyingTo") || "回复"}{" "}
								<span className="font-semibold text-foreground">
									{comment.author}
								</span>
							</span>
						</div>

						{/* 回复者名称输入 */}
						<div className="mb-3">
							<input
								type="text"
								value={replyAuthor}
								onChange={(e) => setReplyAuthor(e.target.value)}
								className="w-full px-3 py-2 text-sm text-foreground bg-background rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary"
								placeholder={t("Common.yourName") || "你的名称"}
								required
							/>
						</div>

						<textarea
							rows={3}
							className="w-full px-3 py-2 text-sm text-foreground bg-background rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary resize-none"
							placeholder={
								t("Common.writeReplyPlaceholder") || "写下你的回复..."
							}
							value={replyText}
							onChange={(e) => setReplyText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
									e.preventDefault()
									if (replyAuthor.trim()) {
										handlePostReply(comment.id)
									}
								}
								if (e.key === "Escape") {
									handleCancelReply()
								}
							}}
						/>
						<div className="flex items-center justify-between mt-3">
							<span></span>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={handleCancelReply}
									className="text-xs text-muted-foreground hover:text-foreground hover:underline"
								>
									{t("Common.cancel") || "取消"}
								</button>
								<button
									type="button"
									className="inline-flex items-center text-xs bg-primary text-primary-foreground py-1.5 px-3 rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
									onClick={() => handlePostReply(comment.id)}
									disabled={!replyText.trim() || !replyAuthor.trim()}
								>
									<Icon name="Send" className="h-3 w-3 mr-1" size={12} />
									{t("Common.postReply") || "发布回复"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</article>
	)

	return (
		<section
			id="game-comments"
			className="bg-muted rounded-lg shadow-inner p-4"
		>
			<div className="mx-auto">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-lg lg:text-2xl font-bold text-foreground">
						{t("Common.commentsTitle") || "评论"} ({comments.length})
					</h2>
				</div>
				<form className="mb-6">
					{/* 评分选择器 */}
					{renderRatingSelector()}

					{/* 名称输入栏 */}
					<div className="mb-4">
						<input
							type="text"
							value={newAuthor}
							onChange={(e) => setNewAuthor(e.target.value)}
							className="w-full px-3 py-2 text-sm text-foreground bg-card rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary"
							placeholder={t("Common.yourName")}
							required
						/>
					</div>

					<div className="py-2 px-4 mb-4 bg-card rounded-lg rounded-t-lg border border-border">
						<label htmlFor="comment" className="sr-only">
							{t("Common.yourComment")}
						</label>
						<textarea
							id="comment"
							rows={4}
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							className="resize-none px-0 w-full text-sm text-foreground bg-transparent border-0 focus:ring-0 focus:outline-none"
							placeholder={t("Common.writeCommentPlaceholder")}
							required
						></textarea>
					</div>
					<button
						type="button" // Change to type="submit" when backend is ready
						onClick={handlePostComment}
						className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-primary-foreground bg-primary rounded-lg focus:ring-4 focus:ring-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={!newComment.trim() || !newAuthor.trim()}
					>
						<Icon name="Send" className="h-4 w-4 mr-1" size={16} />{" "}
						{t("Common.postCommentButton") || "发布评论"}
					</button>
				</form>

				{comments.filter((v) => v.id!).map((comment) => renderComment(comment))}
			</div>
		</section>
	)
}

export default GameComments
