import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import { alternatesCanonical, alternatesLanguage } from "@/lib/i18n"
import {
	getArticleBySlug,
	getArticlesByLocale,
} from "@/lib/repositories/article"
import { ArticlePost as BaseArticlePost, BreadcrumbItem } from "@/lib/types"
import { processMarkdown } from "@/lib/utils/markdownProcessor"
import {
	JsonLd,
	generateArticleJsonLd,
	generateJsonLdGraph,
	generateWebPageJsonLd,
} from "@/lib/utils/seo"

// 扩展ArticlePost类型，添加href属性
type ArticlePost = BaseArticlePost & { href?: string }

import { Link } from "@lib/i18n"
import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	Clock,
	Share2,
} from "lucide-react"
import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

import {
	ArticleTopBannerSlot,
	ArticleBottomBannerSlot,
} from "@/lib/components/ads"
import { ShareButton } from "@/lib/components/ui/ShareButton"
import ClientImage from "@/lib/components/ui/view/ClientImage"
import siteSettings from "@/lib/config/siteSettings"
import { locales as apiLocales, defaultLocale } from "@/lib/i18n/locales"
export const dynamic = "force-static"

type Props = {
	params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
	try {
		// Generate parameters for each locale and blog post
		const params: any[] = []
		// Get all blog posts
		const posts = await getArticlesByLocale(defaultLocale)
		if (!posts || posts.length === 0) {
			console.warn(
				"generateStaticParams: No blog posts found, returning fallback params.",
			)
			// 生成一个不存在的slug值，避免编译无法通过，但这个路径默认不加入sitemap无法被发现
			for (const locale of apiLocales) {
				params.push({
					locale,
					slug: "no_fount_blog",
				})
			}
			return params
		}

		for (const locale of apiLocales) {
			for (const post of posts) {
				// Ensure post and post.slug are valid
				if (post?.slug) {
					params.push({
						locale,
						slug: post.slug,
					})
				} else {
					console.warn(
						`generateStaticParams: Skipping post with invalid slug for locale ${locale}. Post:`,
						post,
					)
				}
			}
		}

		if (params.length === 0) {
			console.warn(
				"generateStaticParams: No valid params generated, returning fallback params.",
			)
			// 提供fallback参数
			for (const locale of apiLocales) {
				params.push({
					locale,
					slug: "index",
				})
			}
		}

		console.log(`Generated ${params.length} static params for article pages`)
		return params
	} catch (error) {
		console.error("Failed to fetch data for generateStaticParams:", error)

		// 提供fallback参数以确保静态生成不会失败
		const fallbackParams: any[] = []

		console.log(`Using fallback params: ${fallbackParams.length} entries`)
		return fallbackParams
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, slug } = await params
	setRequestLocale(locale)

	try {
		// 获取博客文章数据
		const post = await getArticleBySlug(locale, slug)
		if (!post) {
			return {
				title: "Article Not Found",
				description: "The requested article could not be found.",
			}
		}

		// 构建页面路径
		const path = `/t/${slug}`
		const canonicalUrl = alternatesCanonical(locale, path)
		const hreflangData = alternatesLanguage(path)

		const metadata = post.metadata
		// 返回增强的元数据
		return {
			title: `${metadata.title}`,
			description: metadata.description,
			openGraph: {
				title: metadata.title,
				description: metadata.description,
				images: [{ url: post.titleImageUrl }],
				type: "article",
				publishedTime: post.updateTime,
				authors: [post.author ? post.author : ""],
				tags: post.category?.name,
				url: canonicalUrl,
			},
			twitter: {
				card: "summary_large_image",
				title: post.title,
				description: metadata.description,
				images: [post.titleImageUrl],
			},
			alternates: {
				languages: hreflangData,
				canonical: canonicalUrl,
			},
		}
	} catch (error) {
		console.error("Error generating metadata:", error)
		return {
			title: "Article Not Found",
			description: "The requested article could not be found.",
		}
	}
}

export default async function PostsPage({ params }: Props) {
	const { locale, slug } = await params
	setRequestLocale(locale)
	const ct = await getTranslations()
	const t = await getTranslations("BlogPage")

	// Get blog post data from repository
	try {
		const post = await getArticleBySlug(locale, slug)
		if (!post) {
			return notFound()
		}

		// Get related posts (same category or recent posts)
		const allPosts = await getArticlesByLocale(locale)
		const relatedPosts: ArticlePost[] = allPosts
			.filter((p) => p.id !== post.id && p.category?.id === post.category?.id)
			.slice(0, 3)
			.map((p) => ({ ...p, href: `/t/${p.slug}` }))

		// 构建面包屑导航项
		const breadcrumbItems: BreadcrumbItem[] = [
			{ label: ct("Common.Home"), href: "/" },
			{ label: ct("Common.Blog"), href: "/blogs" },
			{ label: post.title, isActive: true, href: `/t/${slug}` },
		]

		// 获取 canonical 数据
		const canonical = alternatesCanonical(locale, `/t/${post.slug}`)
		// 组合所有 JSON-LD 实体到 @graph 结构
		const jsonLdEntities = [
			generateWebPageJsonLd(
				post.title,
				post.metadata.description,
				canonical,
				siteSettings,
				breadcrumbItems,
				generateArticleJsonLd(post, siteSettings, canonical),
				alternatesCanonical(locale, ""), // 传入网站基础URL
			),
		]
		const jsonLdGraph = generateJsonLdGraph(jsonLdEntities)

		return (
			<>
				{/* 组合的 JSON-LD 结构化数据（使用 @graph） */}
				<JsonLd data={jsonLdGraph} />

				<Breadcrumb items={breadcrumbItems} />

				<main className="container mx-auto bg-background px-4 py-8">
					<article className="max-w-6xl mx-auto">
						{/* Article header */}
						<header className="mb-8">
							<div className="flex items-center text-sm text-muted-foreground mb-4">
								{post.category?.name && (
									<span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
										{post.category?.name}
									</span>
								)}
								<span className="mx-2">•</span>
								<div className="flex items-center">
									<Calendar className="h-4 w-4 mr-1" />
									<span>{post.updateTime}</span>
								</div>
								<span className="mx-2">•</span>
								<div className="flex items-center">
									<Clock className="h-4 w-4 mr-1" />
									<span>
										{t("readTime", {
											minutes: post.readTime?.replace(/[^\d]/g, "") || "0",
										})}
									</span>
								</div>
							</div>
							{post.author && (
								<div className="flex items-center">
									<ClientImage
										src={post.authorImageUrl || ""}
										alt={post.author || ""}
										className="rounded-full mr-3 w-10 h-10"
									/>
									<div>
										<div className="font-medium text-foreground">
											{post.author}
										</div>
										<div className="text-sm text-muted-foreground">
											{t("author")}
										</div>
									</div>
									<div className="text-sm text-muted-foreground">
										{t("author")}
									</div>
								</div>
							)}
						</header>

						{/* Featured image */}
						{post.titleImageUrl && (
							<div className="relative h-64 md:h-96 mb-8 rounded-xl overflow-hidden">
								<ClientImage
									src={post.titleImageUrl || ""}
									alt={post.title}
									className="object-cover w-full h-full"
								/>
							</div>
						)}

						{/* Top Ad */}
						<ArticleTopBannerSlot />

						{/* Article content */}
						<div
							className="prose prose-lg max-w-none mb-12"
							dangerouslySetInnerHTML={{
								__html: await processMarkdown(post.mdxContent),
							}}
						/>

						{/* Bottom Ad */}
						<ArticleBottomBannerSlot />

						{/* Share buttons */}
						<div className="border-t border-b border-border py-6 mb-8">
							<div className="flex items-center">
								<span className="text-foreground font-medium mr-4">
									{t("shareThisArticle")}
								</span>
								<ShareButton
									gameTitle={post.title}
									customUrl={
										typeof window !== "undefined" ? window.location.href : ""
									}
									customText={post.metadata?.description || post.title}
									align="start"
								>
									<button
										type="button"
										className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
										aria-label={t("shareThisArticle")}
										title={t("shareThisArticle")}
									>
										<Share2 className="h-5 w-5 text-muted-foreground hover:text-primary" />
									</button>
								</ShareButton>
							</div>
						</div>

						{/* Navigation between articles */}
						<div className="flex flex-col sm:flex-row justify-between mb-12">
							<Link
								href="/blogs"
								className="flex items-center text-primary hover:text-primary/80 mb-4 sm:mb-0 transition-colors"
								title={t("backToBlog")}
							>
								<ChevronLeft className="h-4 w-4 mr-1" />
								{t("backToBlog")}
							</Link>
						</div>
					</article>

					{/* Related articles */}
					{relatedPosts.length > 0 && (
						<section className="max-w-4xl mx-auto">
							<h2 className="text-2xl font-bold text-foreground mb-6">
								{t("relatedArticles")}
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{relatedPosts.map((post: ArticlePost) => (
									<Link key={post.id} href={post.href || "#"} className="group">
										<div className="bg-card rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow border border-border">
											<div className="relative h-40">
												<ClientImage
													src={post.titleImageUrl || ""}
													alt={post.title}
													className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-300"
												/>
												<div className="absolute top-0 left-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 m-3 rounded">
													{post.category?.name}
												</div>
											</div>
											<div className="p-4">
												<h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
													{post.title}
												</h3>
												<p className="text-muted-foreground text-sm mb-3 line-clamp-2">
													{post.metadata.description}
												</p>
												<div className="text-xs text-muted-foreground">
													{post.updateTime}
												</div>
											</div>
										</div>
									</Link>
								))}
							</div>
						</section>
					)}
				</main>
			</>
		)
	} catch (error) {
		console.error("Error loading article:", error)
		return notFound()
	}
}
