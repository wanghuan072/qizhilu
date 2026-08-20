"use client"

import { Copy, Facebook, Linkedin, Twitter } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useMemo } from "react"
import { toast } from "sonner"

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/lib/components/ui/popover"
import { GameData, SiteSettings } from "@/lib/types/api-types"
import { cn } from "@/lib/utils/react"
import {
	ShareConfig,
	ShareOption,
	SharePlatform,
	buildFacebookShareUrl,
	buildLinkedInShareUrl,
	buildTwitterShareUrl,
	copyLinkToClipboard,
	openShareWindow,
} from "@/lib/utils/share-utils"

/**
 * ShareButton 组件属性接口
 */
export interface ShareButtonProps {
	/** 游戏标题 */
	gameTitle: string
	/** 游戏本地化内容 */
	gameLocaleContent?: GameData
	/** 站点设置 */
	siteSettings?: SiteSettings
	/** 自定义分享 URL */
	customUrl?: string
	/** 自定义分享文本 */
	customText?: string
	/** 触发器子组件 */
	children: React.ReactNode
	/** 弹窗对齐方式 */
	align?: "start" | "center" | "end"
	/** 弹窗侧边偏移 */
	sideOffset?: number
	/** 自定义类名 */
	className?: string
	/** 是否禁用 */
	disabled?: boolean
}

/**
 * ShareButton 组件
 *
 * 提供多平台分享功能的弹窗组件，支持：
 * - Twitter/X 分享
 * - Facebook 分享
 * - LinkedIn 分享
 * - 复制链接功能
 */
export function ShareButton({
	gameTitle,
	gameLocaleContent,
	siteSettings,
	customUrl,
	customText,
	children,
	align = "center",
	sideOffset = 8,
	className,
	disabled = false,
}: ShareButtonProps) {
	const t = useTranslations("Share")

	// 构建分享配置
	const shareConfig: ShareConfig = useMemo(
		() => ({
			gameTitle,
			gameLocaleContent,
			siteSettings,
			customUrl,
			customText,
		}),
		[gameTitle, gameLocaleContent, siteSettings, customUrl, customText],
	)

	// 处理 Twitter 分享
	const handleTwitterShare = useCallback(() => {
		try {
			const url = buildTwitterShareUrl(shareConfig)
			openShareWindow(url, SharePlatform.TWITTER)
		} catch (error) {
			console.error("Twitter 分享失败:", error)
			toast.error(t("shareError"))
		}
	}, [shareConfig, t])

	// 处理 Facebook 分享
	const handleFacebookShare = useCallback(() => {
		try {
			const url = buildFacebookShareUrl(shareConfig)
			openShareWindow(url, SharePlatform.FACEBOOK)
		} catch (error) {
			console.error("Facebook 分享失败:", error)
			toast.error(t("shareError"))
		}
	}, [shareConfig, t])

	// 处理 LinkedIn 分享
	const handleLinkedInShare = useCallback(() => {
		try {
			const url = buildLinkedInShareUrl(shareConfig)
			openShareWindow(url, SharePlatform.LINKEDIN)
		} catch (error) {
			console.error("LinkedIn 分享失败:", error)
			toast.error(t("shareError"))
		}
	}, [shareConfig, t])

	// 处理复制链接
	const handleCopyLink = useCallback(async () => {
		try {
			const success = await copyLinkToClipboard(shareConfig)
			if (success) {
				toast.success(t("linkCopied"))
			} else {
				toast.error(t("copyError"))
			}
		} catch (error) {
			console.error("复制链接失败:", error)
			toast.error(t("copyError"))
		}
	}, [shareConfig, t])

	// 分享选项配置
	const shareOptions: ShareOption[] = useMemo(
		() => [
			{
				platform: SharePlatform.TWITTER,
				name: "Twitter",
				description: t("shareToTwitter"),
				icon: "twitter",
				color: "text-blue-500 hover:text-blue-600",
				action: handleTwitterShare,
			},
			{
				platform: SharePlatform.FACEBOOK,
				name: "Facebook",
				description: t("shareToFacebook"),
				icon: "facebook",
				color: "text-blue-600 hover:text-blue-700",
				action: handleFacebookShare,
			},
			{
				platform: SharePlatform.LINKEDIN,
				name: "LinkedIn",
				description: t("shareToLinkedIn"),
				icon: "linkedin",
				color: "text-blue-700 hover:text-blue-800",
				action: handleLinkedInShare,
			},
			{
				platform: SharePlatform.COPY_LINK,
				name: t("copyLink"),
				description: t("copyLinkDescription"),
				icon: "copy",
				color: "text-gray-600 hover:text-gray-700",
				action: handleCopyLink,
			},
		],
		[
			t,
			handleTwitterShare,
			handleFacebookShare,
			handleLinkedInShare,
			handleCopyLink,
		],
	)

	// 渲染分享选项图标
	const renderShareIcon = (iconName: string, className?: string) => {
		const iconProps = {
			className: cn("h-5 w-5", className),
			"aria-hidden": true,
		}

		switch (iconName) {
			case "twitter":
				return <Twitter {...iconProps} />
			case "facebook":
				return <Facebook {...iconProps} />
			case "linkedin":
				return <Linkedin {...iconProps} />
			case "copy":
				return <Copy {...iconProps} />
			default:
				return null
		}
	}

	return (
		<Popover>
			<PopoverTrigger asChild disabled={disabled}>
				{children}
			</PopoverTrigger>
			<PopoverContent
				align={align}
				sideOffset={sideOffset}
				className={cn("w-full p-4", className)}
			>
				<div className="space-y-4">
					<div className="text-center">
						<h3 className="text-lg font-semibold text-foreground">
							{t("shareGame")}
						</h3>
						<p className="text-sm text-muted-foreground mt-1">
							{t("shareGameDescription")}
						</p>
					</div>

					<div className="flex items-center justify-evenly gap-2">
						{shareOptions.map((option) => (
							<button
								key={option.platform}
								type="button"
								onClick={option.action}
								className={cn(
									"flex flex-col items-center gap-2 p-5 rounded-full ",
									"hover:text-primary hover:scale-105 transition-all duration-200",
									"focus:outline-none ",
									"disabled:opacity-50 disabled:cursor-not-allowed",
								)}
								disabled={disabled}
								aria-label={option.description}
							>
								<div
									className={cn(
										"flex items-center justify-center",
										option.color,
									)}
								>
									{renderShareIcon(option.icon, "hover:text-primary")}
								</div>
								<div className="text-sm font-medium">{option.name}</div>
							</button>
						))}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	)
}
