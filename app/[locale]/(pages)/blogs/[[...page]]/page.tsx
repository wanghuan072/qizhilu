import { Breadcrumb } from "@/lib/components/ui/view/Breadcrumb"
import ClientImage from "@/lib/components/ui/view/ClientImage"
import {
	alternatesCanonical,
	alternatesLanguage,
	locales as apiLocales,
	defaultLocale,
} from "@/lib/i18n/locales"
import { getArticlesByLocale } from "@/lib/repositories/article"
import { ArticlePost } from "@/lib/types"
import { Link } from "@lib/i18n"
import { Calendar, ChevronRight, Clock, User } from "lucide-react"
import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import React from "react"

export const dynamic = "force-static"

type Props = {
	params: Promise<{ locale: string; page?: string[] }>
}

export async function generateStaticParams() {
	try {
		// Get all blog posts to determine total pages
		const allPosts: ArticlePost[] = await getArticlesByLocale(defaultLocale)

		// Calculate total pages (assuming 20 posts per page)
		const postsPerPage = 20
		const totalPages = Math.ceil(allPosts.length / postsPerPage)

		// Generate params for each locale and page
		const params = []

		// First add the main blog page (no page number)
		for (const locale of apiLocales) {
			params.push({
				locale,
				page: [],
			})
		}

		// Then add each page number
		for (const locale of apiLocales) {
			for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
				params.push({
					locale,
					page: [pageNum.toString()],
				})
			}
		}

		console.log(`Generated ${params.length} static params for blog pages`)
		return params
	} catch (error) {
		console.error("Failed to fetch data for generateStaticParams:", error)

		// 提供fallback参数以确保静态生成不会失败
		const fallbackParams = []

		// 为每个语言生成基本的博客页面参数
		for (const locale of apiLocales) {
			// 主博客页面
			fallbackParams.push({
				locale,
				page: [],
			})
			// 第一页
			fallbackParams.push({
				locale,
				page: ["1"],
			})
		}

		console.log(`Using fallback params: ${fallbackParams.length} entries`)
		return fallbackParams
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, page } = await params
	setRequestLocale(locale)

	// Determine page number
	const pageNumber =
		page && page.length > 0 ? Number.parseInt(page[0] || "1", 10) : 1

	// Build URL path for alternates
	let path = "/blogs"
	if (pageNumber > 1) {
		path += `/${pageNumber}`
	}

	const t = await getTranslations("BlogPage")
	// Set title based on page number
	const baseTitle = t("blog")
	const title =
		pageNumber > 1
			? `${baseTitle} - Page ${pageNumber}`
			: `${baseTitle} - Latest News and Insights`

	const description = t("description")
	// 获取 hreflang 数据
	const hreflangData = alternatesLanguage(path)
	// 获取 canonical 数据
	const canonical = alternatesCanonical(locale, path)

	return {
		title,
		description,
		alternates: {
			languages: hreflangData,
			canonical,
		},
	}
}

export default async function BlogPage({ params }: Props) {
	const { locale, page } = await params
	setRequestLocale(locale)
	const t = await getTranslations()

	// Determine page number
	const pageNumber =
		page && page.length > 0 ? Number.parseInt(page[0] || "1", 10) : 1
	const postsPerPage = 20

	// Fetch blog posts from repository
	const allPosts: ArticlePost[] = await getArticlesByLocale(locale)

	// Calculate pagination
	const startIndex = (pageNumber - 1) * postsPerPage
	const endIndex = startIndex + postsPerPage
	const paginatedPosts: ArticlePost[] = allPosts.slice(startIndex, endIndex)
	const totalPages = Math.ceil(allPosts.length / postsPerPage)

	// Breadcrumb items
	const breadcrumbItems =
		pageNumber > 1
			? [
					{ label: t("Common.Home"), href: "/" },
					{ label: t("Common.Blog"), href: "/blogs" },
					{
						label: t("Common.Page", { page: pageNumber }),
						isActive: true,
						href: `/blogs/${pageNumber}`,
					},
				]
			: [
					{ label: t("Common.Home"), href: "/" },
					{ label: t("Common.Blog"), isActive: true, href: "/blogs" },
				]

	// Function to get pagination URL
	const getPaginationUrl = (page: number) => {
		return page === 1 ? "/blogs" : `/blogs/${page}`
	}

	return (
		<>
			<Breadcrumb items={breadcrumbItems} />

			<main className="container mx-auto px-4 py-8 max-w-6xl">
				{/* Page title */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-2">
						{t("BlogPage.blog")}
					</h1>
					<p className="text-muted-foreground">{t("BlogPage.description")}</p>
				</div>

				{/* Articles list */}
				<section className="mb-12">
					<h2 className="text-2xl font-bold text-foreground mb-6">
						{pageNumber > 1
							? `${t("BlogPage.blogPosts")} - Page ${pageNumber}`
							: t("BlogPage.blogPosts")}
					</h2>

					{paginatedPosts.length === 0 && (
						<div className="text-center py-12">
							<p className="text-muted-foreground">
								{t("BlogPage.noBlogPosts")}
							</p>
						</div>
					)}

					<div className="space-y-8">
						{paginatedPosts.map((post: ArticlePost) => (
							<article
								key={post.id}
								className="bg-card rounded-lg shadow-md overflow-hidden"
							>
								<div className="md:flex">
									<div className="md:w-1/4 relative h-48 md:h-auto">
										<ClientImage
											src={
												post.titleImageUrl ||
												`https://placehold.co/600x400?text=${post.title.substring(0, 2)}`
											}
											alt={post.title}
											className="object-cover"
										/>
									</div>
									<div className="p-6 md:w-3/4">
										<div className="flex items-center text-xs text-muted-foreground mb-3">
											{post.category && (
												<>
													<span className="bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
														{post.category.name}
													</span>
													<span className="mx-2">•</span>
												</>
											)}
											<div className="flex items-center">
												<Calendar className="h-3 w-3 mr-1" />
												<span>
													{new Date(post.updateTime).toLocaleDateString()}
												</span>
											</div>
										</div>

										<Link href={`/t/${post.slug}`}>
											<h3 className="font-bold text-xl text-card-foreground mb-2 hover:text-primary transition-colors">
												{post.title}
											</h3>
										</Link>

										<p className="text-muted-foreground text-sm mb-4">
											{post.metadata.description}
										</p>

										<div className="flex items-center justify-between">
											<div className="flex items-center text-xs text-muted-foreground">
												<div className="flex items-center">
													<User className="h-3 w-3 mr-1" />
													<span>{post.author || "Admin"}</span>
												</div>
												{post.readTime && (
													<>
														<span className="mx-2">•</span>
														<div className="flex items-center">
															<Clock className="h-3 w-3 mr-1" />
															<span>{post.readTime}</span>
														</div>
													</>
												)}
											</div>

											<Link
												href={`/t/${post.slug}`}
												className="text-primary text-sm font-medium flex items-center hover:text-primary/80 transition-colors"
												title={`阅读 ${post.title}`}
											>
												{t("BlogPage.readMore")}
												<ChevronRight className="h-4 w-4 ml-1" />
											</Link>
										</div>
									</div>
								</div>
							</article>
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex justify-center mt-12">
							<nav className="flex items-center">
								{pageNumber > 1 && (
									<Link
										href={getPaginationUrl(pageNumber - 1)}
										className="px-4 py-2 border border-border rounded-l-md text-sm font-medium text-foreground bg-background hover:bg-muted"
									>
										{t("Common.previous")}
									</Link>
								)}

								{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
									// Show pages around current page
									let pageNum = 0
									if (totalPages <= 5) {
										pageNum = i + 1
									} else if (pageNumber <= 3) {
										pageNum = i + 1
									} else if (pageNumber >= totalPages - 2) {
										pageNum = totalPages - 4 + i
									} else {
										pageNum = pageNumber - 2 + i
									}

									return (
										<Link
											key={pageNum}
											href={getPaginationUrl(pageNum)}
											className={`px-4 py-2 border-t border-b border-r ${
												pageNum === pageNumber
													? "border-primary bg-primary/10 text-primary"
													: "border-border bg-background text-foreground hover:bg-muted"
											} text-sm font-medium`}
										>
											{pageNum}
										</Link>
									)
								})}

								{pageNumber < totalPages && (
									<Link
										href={getPaginationUrl(pageNumber + 1)}
										className="px-4 py-2 border border-l-0 border-border rounded-r-md text-sm font-medium text-foreground bg-background hover:bg-muted"
									>
										{t("Common.next")}
									</Link>
								)}
							</nav>
						</div>
					)}
				</section>
			</main>
		</>
	)
}
