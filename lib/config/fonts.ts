/**
 * 字体配置
 *
 * 这个文件定义了网站使用的字体配置，包括默认字体和可用字体列表
 */

// 默认字体配置
export const DEFAULT_FONTS = {
	sans: "Plus Jakarta Sans, sans-serif",
	serif: "Source Serif 4, serif",
	mono: "JetBrains Mono, monospace",
}

// 可用字体映射表
export const AVAILABLE_FONTS = {
	// 无衬线字体 - 适合游戏网站的现代感字体
	"Plus Jakarta Sans": "Plus Jakarta Sans, sans-serif",
	Inter: "Inter, sans-serif",
	Roboto: "Roboto, sans-serif",
	"Open Sans": "Open Sans, sans-serif",
	Montserrat: "Montserrat, sans-serif",
	"Exo 2": "Exo 2, sans-serif",
	Rajdhani: "Rajdhani, sans-serif",
	Barlow: "Barlow, sans-serif",
	"Noto Sans SC": "Noto Sans SC, sans-serif", // 保留中文支持
	DotGothic16: "DotGothic16, sans-serif", // 像素风格日文字体
	"ZCOOL KuaiLe": "ZCOOL KuaiLe, sans-serif", // 中文快乐字体
	"Potta One": "Potta One, sans-serif", // 圆润可爱的日文字体

	// 衬线字体 - 适合游戏网站的特色标题字体
	"Source Serif 4": "Source Serif 4, serif",
	Lora: "Lora, serif",
	Merriweather: "Merriweather, serif",
	Play: "Play, serif",
	Sora: "Sora, serif",
	"Chakra Petch": "Chakra Petch, serif",
	Audiowide: "Audiowide, serif",
	"Noto Serif SC": "Noto Serif SC, serif", // 保留中文支持
	"Yuji Mai": "Yuji Mai, serif", // 传统日文毛笔字体
	"Reggae One": "Reggae One, serif", // 粗体日文字体

	// 等宽字体 - 适合代码和特殊文本
	"JetBrains Mono": "JetBrains Mono, monospace",
	"Fira Code": "Fira Code, monospace",
	"Source Code Pro": "Source Code Pro, monospace",
	"Roboto Mono": "Roboto Mono, monospace",
	"Space Mono": "Space Mono, monospace",
	"IBM Plex Mono": "IBM Plex Mono, monospace",
	"Share Tech Mono": "Share Tech Mono, monospace",
}

// 字体CDN URL映射表
export const FONT_CDN_URLS: Record<string, string> = {
	// 原有字体
	"Plus Jakarta Sans":
		"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
	"Source Serif 4":
		"https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600;700&display=swap",
	"JetBrains Mono":
		"https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap",
	"Noto Sans SC":
		"https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap",
	"Noto Serif SC":
		"https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700&display=swap",
	Inter:
		"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
	Roboto:
		"https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
	"Open Sans":
		"https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap",
	Merriweather:
		"https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
	Lora: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap",
	"Fira Code":
		"https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap",
	"Source Code Pro":
		"https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&display=swap",
	"Roboto Mono":
		"https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap",

	// 新增游戏网站字体
	Montserrat:
		"https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
	"Exo 2":
		"https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700&display=swap",
	Rajdhani:
		"https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap",
	Barlow:
		"https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&display=swap",
	Play: "https://fonts.googleapis.com/css2?family=Play:wght@400;700&display=swap",
	Sora: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap",
	"Chakra Petch":
		"https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap",
	Audiowide: "https://fonts.googleapis.com/css2?family=Audiowide&display=swap",
	"Space Mono":
		"https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap",
	"IBM Plex Mono":
		"https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap",
	"Share Tech Mono":
		"https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap",

	// 新增特色字体
	DotGothic16:
		"https://fonts.googleapis.com/css2?family=DotGothic16&display=swap",
	"ZCOOL KuaiLe":
		"https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap",
	"Potta One":
		"https://fonts.googleapis.com/css2?family=Potta+One&display=swap",
	"Yuji Mai": "https://fonts.googleapis.com/css2?family=Yuji+Mai&display=swap",
	"Reggae One":
		"https://fonts.googleapis.com/css2?family=Reggae+One&display=swap",
}
