import withBundleAnalyzer from "@next/bundle-analyzer"
import createMDX from "@next/mdx"
import createNextIntlPlugin from "next-intl/plugin"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkMdxFrontmatter from "remark-mdx-frontmatter"
// 添加支持直接使用本地.mdx文件组件 - 简化配置避免序列化问题
const mdxOptions = {
	remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
	rehypePlugins: [],
}

const withMDX = createMDX({
	extension: /\.(md|mdx)$/,
	options: mdxOptions,
})
const isProd = process.env.NODE_ENV === "production"
console.log("### 是否编译环境:", isProd)
console.log("### NEXT_PUBLIC_DEV_ORIGIN:", process.env.NEXT_PUBLIC_DEV_ORIGIN)
console.log("### 当前应用默认语言:", process.env.NEXT_PUBLIC_DEFAULT_LOCALE)
console.log("### 当前应用API:", process.env.NEXT_PUBLIC_WEB_API_URL)
console.log("### 当前应用项目ID:", process.env.NEXT_PUBLIC_PROJECT_ID)
// @ts-check
/** @type {import("next").NextConfig} */
const nextConfig = {
	staticPageGenerationTimeout: 5000,
	pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
	reactStrictMode: true,
	compress: true,
	...(isProd ? { output: "export" } : {}),
	transpilePackages: ["next-mdx-remote"],
	trailingSlash: false,
	allowedDevOrigins: [
		"localhost:3000",
		"qizhilu.vocalremoveroak.com",
		process.env.NEXT_PUBLIC_DEV_ORIGIN,
	],
	// 设置输出文件跟踪根目录，解决多锁文件警告
	outputFileTracingRoot: process.cwd(),

	// 优化构建配置
	...(isProd && {
		experimental: {
			// 启用优化编译
			optimizePackageImports: [
				"@radix-ui/react-accordion",
				"@radix-ui/react-alert-dialog",
				"@radix-ui/react-aspect-ratio",
				"@radix-ui/react-avatar",
				"@radix-ui/react-checkbox",
				"@radix-ui/react-collapsible",
				"@radix-ui/react-context-menu",
				"@radix-ui/react-dialog",
				"@radix-ui/react-dropdown-menu",
				"@radix-ui/react-hover-card",
				"@radix-ui/react-label",
				"@radix-ui/react-menubar",
				"@radix-ui/react-navigation-menu",
				"@radix-ui/react-popover",
				"@radix-ui/react-progress",
				"@radix-ui/react-radio-group",
				"@radix-ui/react-scroll-area",
				"@radix-ui/react-select",
				"@radix-ui/react-separator",
				"@radix-ui/react-slider",
				"@radix-ui/react-slot",
				"@radix-ui/react-switch",
				"@radix-ui/react-tabs",
				"@radix-ui/react-toggle",
				"@radix-ui/react-toggle-group",
				"@radix-ui/react-tooltip",
				"lucide-react",
				"recharts",
				"date-fns",
				"framer-motion",
				"radash",
			],
		},

		// Webpack优化配置
		webpack: (config, { dev, isServer, webpack }) => {
			if (!dev && !isServer) {
				// 生产环境客户端配置
				config.optimization = {
					...config.optimization,
					splitChunks: {
						chunks: "all",
						maxInitialRequests: 10,
						maxAsyncRequests: 10,
						cacheGroups: {
							// React Player - 单独分包（最大问题文件）
							reactPlayer: {
								test: /[\\/]node_modules[\\/]react-player[\\/]/,
								name: "react-player",
								chunks: "async", // 异步加载，不在初始包中
								priority: 55,
								maxSize: 300000, // 允许更大的包以减少分包数量
								enforce: true,
								reuseExistingChunk: true,
							},
							// React框架核心 - 最高优先级
							framework: {
								test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
								name: "framework",
								chunks: "all",
								priority: 50,
								maxSize: 200000, // 200KB
								enforce: true,
							},
							// Next.js核心
							nextjs: {
								test: /[\\/]node_modules[\\/]next[\\/]/,
								name: "nextjs",
								chunks: "all",
								priority: 45,
								maxSize: 150000, // 150KB
								enforce: true,
							},
							// UI组件库 - 按需分包
							radixui: {
								test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
								name: "radix-ui",
								chunks: "async", // 改为async，避免初始加载
								priority: 30,
								maxSize: 100000, // 100KB
							},
							// 图标库 - 异步加载
							lucide: {
								test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
								name: "lucide",
								chunks: "async", // 异步加载
								priority: 25,
								maxSize: 80000, // 80KB
							},
							// 国际化相关
							intl: {
								test: /[\\/]node_modules[\\/](next-intl|react-intl)[\\/]/,
								name: "intl",
								chunks: "all",
								priority: 35,
								maxSize: 100000, // 100KB
							},
							// 工具库
							utils: {
								test: /[\\/]node_modules[\\/](clsx|class-variance-authority|tailwind-merge)[\\/]/,
								name: "utils",
								chunks: "all",
								priority: 20,
								maxSize: 50000, // 50KB
							},
							// 其他vendor库 - 大幅降低优先级
							vendor: {
								test: /[\\/]node_modules[\\/]/,
								name: "vendors",
								chunks: "async", // 改为async
								priority: 5,
								maxSize: 150000, // 减小到150KB
								minSize: 10000,
							},
							// 应用代码 - 更激进拆分
							common: {
								name: "common",
								minChunks: 2,
								chunks: "all",
								priority: 10,
								maxSize: 100000, // 减小到100KB
								minSize: 10000,
								reuseExistingChunk: true,
							},
						},
					},
				}

				// CSS优化配置 - 移除可能导致重复的CSS拆分配置
				// TailwindCSS v4 已经有自己的优化机制，不需要额外的CSS拆分

				// 移除重复模块
				config.plugins.push(
					new webpack.optimize.LimitChunkCountPlugin({
						maxChunks: 25, // 增加到25以适应CSS拆分
					}),
				)
			}

			return config
		},
	}),

	env: {
		NEXT_PUBLIC_WEB_API_URL: process.env.NEXT_PUBLIC_WEB_API_URL,
		NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
		NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
		NEXT_PUBLIC_DEV_ORIGIN: process.env.NEXT_PUBLIC_DEV_ORIGIN,
	},
	images: {
		remotePatterns: [
			{
				hostname: "images.unsplash.com",
			},
			{
				hostname: "source.unsplash.com",
			},
			{
				hostname: "public-image.fafafa.ai",
			},
			{
				hostname: "img.qizhilu.org",
			},
			{
				hostname: "placehold.co",
			},
		],
	},
}

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts")

// 配置Bundle分析器
const bundleAnalyzer = withBundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
})

export default bundleAnalyzer(withMDX(withNextIntl(nextConfig)))
