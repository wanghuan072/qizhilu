// lib/components/view/GamePage/components/BackgroundEffects.tsx
"use client"

/**
 * 背景效果组件 - 包含所有复杂的动态背景效果
 * 此组件会被延迟加载以优化 LCP 性能
 */
export const BackgroundEffects = () => {
	return (
		<div className="absolute inset-0 transition-opacity duration-1000">
			{/* 渐变背景层 */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background/40 to-secondary/30 dark:from-primary/20 dark:via-background/30 dark:to-secondary/20" />
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.2),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary)/0.2),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary)/0.15),transparent_70%)]" />

			{/* 动态发光效果层 */}
			<div className="absolute top-0 left-1/4 w-full h-1/2 bg-primary/15 dark:bg-primary/10 rotate-12 transform-gpu blur-2xl opacity-50 animate-pulse" />
			<div className="absolute bottom-0 right-1/4 w-full h-1/2 bg-secondary/15 dark:bg-secondary/10 -rotate-12 transform-gpu blur-2xl opacity-50 animate-pulse delay-200" />
			<div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-primary/15 dark:bg-primary/10 rotate-45 transform-gpu blur-2xl opacity-50 animate-pulse delay-400" />
			<div className="absolute bottom-1/4 left-0 w-1/2 h-1/2 bg-secondary/15 dark:bg-secondary/10 -rotate-45 transform-gpu blur-2xl opacity-50 animate-pulse delay-600" />

			{/* 轻微的光线纹理 */}
			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz48L3N2Zz4=')] opacity-5" />
		</div>
	)
}

export default BackgroundEffects
