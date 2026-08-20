import type { LucideProps } from "lucide-react"
import {
	AlertCircle,
	// 导航图标
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	Bell,
	// 其他常用图标
	BookOpen,
	Bookmark,
	// 其他必需图标
	Calendar,
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	Clock,
	Copy,
	CornerDownRight,
	Download,
	Edit,
	ExternalLink,
	Facebook,
	File,
	Folder,
	// 游戏相关图标
	Gamepad,
	Gamepad2,
	Github,
	Heart,
	// 核心图标
	HelpCircle,
	Home,
	// 媒体图标
	Image,
	Info,
	Instagram,
	Lightbulb,
	Link,
	Linkedin,
	Loader,
	Mail,
	Maximize,
	Menu,
	MessageCircle,
	Minimize,
	Minus,
	Moon,
	Music,
	Pause,
	Phone,
	Play,
	// 界面图标
	Plus,
	RefreshCw,
	Search,
	Send,
	Settings,
	// 社交分享图标
	Share,
	Share2,
	// 额外图标
	Star,
	Sun,
	Tag,
	Target,
	ThumbsDown,
	ThumbsUp,
	Trash,
	Trophy,
	// 社交媒体图标
	Twitter,
	Upload,
	User,
	Video,
	Volume,
	X,
	Youtube,
} from "lucide-react"
import { dash } from "radash"
import { ComponentType } from "react"

// 静态图标组件映射
const iconComponents = {
	// 核心图标
	Home,
	Search,
	Menu,
	X,
	Star,
	Heart,
	Play,
	User,
	Settings,

	// 导航图标
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	ArrowUp,
	ArrowDown,
	ArrowLeft,
	ArrowRight,

	// 游戏相关图标
	Gamepad2,
	Gamepad,
	Trophy,
	Target,

	// 界面图标
	Plus,
	Minus,
	Check,
	Info,
	HelpCircle,
	AlertCircle,

	// 媒体图标
	Image,
	Video,
	Music,
	Pause,
	Volume,

	// 社交分享图标
	Share,
	Share2,

	// 其他必需图标
	Calendar,
	Clock,
	File,
	Folder,
	Tag,
	Link,
	Mail,
	Phone,
	Bell,
	Sun,
	Moon,
	Loader,

	// 社交媒体图标
	Twitter,
	Facebook,
	Instagram,
	Youtube,
	Linkedin,
	Github,

	// 其他常用图标
	BookOpen,
	Lightbulb,
	Send,
	CornerDownRight,
	Maximize,
	Minimize,
	Copy,
	Download,
	Upload,
	Edit,
	Trash,
	RefreshCw,
	ExternalLink,
	Bookmark,
	ThumbsUp,
	ThumbsDown,

	// 额外图标
	MessageCircle,
}

// 图标名称映射到组件
const ICON_NAME_MAP: Record<string, keyof typeof iconComponents> = {
	// 核心图标
	home: "Home",
	search: "Search",
	menu: "Menu",
	x: "X",
	star: "Star",
	heart: "Heart",
	play: "Play",
	user: "User",
	settings: "Settings",

	// 导航图标
	"chevron-down": "ChevronDown",
	"chevron-left": "ChevronLeft",
	"chevron-right": "ChevronRight",
	"chevron-up": "ChevronUp",
	"arrow-up": "ArrowUp",
	"arrow-down": "ArrowDown",
	"arrow-left": "ArrowLeft",
	"arrow-right": "ArrowRight",

	// 游戏相关图标
	"gamepad-2": "Gamepad2",
	gamepad2: "Gamepad2",
	gamepad: "Gamepad",
	trophy: "Trophy",
	target: "Target",

	// 界面图标
	plus: "Plus",
	minus: "Minus",
	check: "Check",
	info: "Info",
	"help-circle": "HelpCircle",
	"alert-circle": "AlertCircle",

	// 媒体图标
	image: "Image",
	video: "Video",
	music: "Music",
	pause: "Pause",
	volume: "Volume",

	// 社交分享图标
	share: "Share",
	"share-2": "Share2",
	share2: "Share2",

	// 其他必需图标
	calendar: "Calendar",
	clock: "Clock",
	file: "File",
	folder: "Folder",
	tag: "Tag",
	link: "Link",
	mail: "Mail",
	phone: "Phone",
	bell: "Bell",
	sun: "Sun",
	moon: "Moon",
	loader: "Loader",

	// 社交媒体图标
	twitter: "Twitter",
	facebook: "Facebook",
	instagram: "Instagram",
	youtube: "Youtube",
	linkedin: "Linkedin",
	github: "Github",

	// 其他常用图标
	"book-open": "BookOpen",
	bookOpen: "BookOpen",
	lightbulb: "Lightbulb",
	send: "Send",
	"corner-down-right": "CornerDownRight",
	maximize: "Maximize",
	minimize: "Minimize",
	copy: "Copy",
	download: "Download",
	upload: "Upload",
	edit: "Edit",
	trash: "Trash",
	refresh: "RefreshCw",
	"refresh-cw": "RefreshCw",
	"external-link": "ExternalLink",
	bookmark: "Bookmark",
	thumbsUp: "ThumbsUp",
	thumbsDown: "ThumbsDown",
	"thumbs-up": "ThumbsUp",
	"thumbs-down": "ThumbsDown",
	"message-circle": "MessageCircle",
	messageCircle: "MessageCircle",
}

/**
 * 获取图标组件（静态导入）
 */
export function getIcon(name: string): ComponentType<LucideProps> | null {
	if (!name) return null

	const normalizedName = dash(name)
	const componentKey = ICON_NAME_MAP[normalizedName]

	if (!componentKey) {
		console.warn(`Icon mapping not found for: ${name}`)
		return null
	}

	return iconComponents[componentKey] || null
}
