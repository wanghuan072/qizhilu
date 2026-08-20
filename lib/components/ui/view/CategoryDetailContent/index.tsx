"use client"
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/lib/components/ui/pagination"
import { GameCard } from "@/lib/components/ui/view/GamePage/components/GameCard"
import { GameData } from "@/lib/types"
import { Link } from "@i18n/navigation"
import { ChevronRight } from "lucide-react"
import React from "react"

// Define the category interface
export interface CategoryDetail {
	id: string
	name: string
	slug: string
	description: string
	imageUrl?: string
	iconName?: string
	count?: number
	metaTitle?: string
	metaDescription?: string
}

// Define the pagination interface
export interface PaginationData {
	currentPage: number
	totalPages: number
	totalItems: number
	pageSize: number
}

// Props interface
interface CategoryDetailContentProps {
	category: CategoryDetail
	games: GameData[]
	pagination: PaginationData
	paginationUrlFormat?: string // 分页URL格式，例如 "/categories/[categoryName]/%page%"
}

export const CategoryDetailContent: React.FC<CategoryDetailContentProps> = ({
	category,
	games,
	pagination,
	paginationUrlFormat,
}) => {
	// Calculate pagination URLs
	const getPageUrl = (page: number) => {
		if (paginationUrlFormat) {
			// 如果提供了自定义URL格式，使用它
			if (page === 1) {
				// 对于第一页，可能需要特殊处理
				return paginationUrlFormat.replace("/%page%", "")
			}
			return paginationUrlFormat.replace("%page%", page.toString())
		}

		// 默认URL格式：第一页不显示页码，其他页面显示页码
		if (page === 1) {
			return `/c/${category.slug}`
		}
		return `/c/${category.slug}/${page}`
	}

	return (
		<div className="mb-10">
			{/* Category header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-3">
					{category.name}
				</h1>
				<p className="text-gray-600">{category.description}</p>
			</div>

			{/* Category stats */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-8">
				<div className="flex flex-wrap justify-between items-center">
					<div className="mb-4 md:mb-0">
						<span className="text-gray-600">Total Games:</span>
						<span className="ml-2 font-bold text-gray-900">
							{pagination.totalItems}
						</span>
					</div>

					<div className="flex items-center text-sm">
						<span className="text-gray-600 mr-2">Sort by:</span>
						<select
							className="bg-transparent text-indigo-600 font-medium focus:outline-none"
							aria-label="Sort games"
						>
							<option>Newest</option>
							<option>Popular</option>
							<option>A-Z</option>
						</select>
					</div>
				</div>
			</div>

			{/* Games grid */}
			<div className="mb-8">
				{games.length > 0 ? (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
						{games.map((game) => (
							<div key={game.id} className="w-full">
								<GameCard
									name={game.gameLocaleName || game.name}
									slug={game.slug}
									image={game.screenshotUrl}
									rating={game.gameInfo?.rating}
								/>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12 bg-muted/50 rounded-lg">
						<p className="text-muted-foreground">
							No games found in this category.
						</p>
					</div>
				)}
			</div>

			{/* Pagination */}
			{pagination.totalPages > 1 && (
				<div className="mt-8">
					<Pagination>
						<PaginationContent>
							{pagination.currentPage > 1 && (
								<PaginationItem>
									<PaginationPrevious
										href={getPageUrl(pagination.currentPage - 1)}
									/>
								</PaginationItem>
							)}

							{Array.from({ length: pagination.totalPages })
								.map((_, i) => {
									const page = i + 1
									// Show current page, first, last, and pages around current
									const shouldShow =
										page === 1 ||
										page === pagination.totalPages ||
										(page >= pagination.currentPage - 1 &&
											page <= pagination.currentPage + 1)

									// Show ellipsis for gaps
									if (!shouldShow) {
										// Show ellipsis only once for each gap
										if (page === 2 || page === pagination.totalPages - 1) {
											return (
												<PaginationItem key={`ellipsis-${page}`}>
													<PaginationEllipsis />
												</PaginationItem>
											)
										}
										return null
									}

									return (
										<PaginationItem key={page}>
											<PaginationLink
												href={getPageUrl(page)}
												isActive={page === pagination.currentPage}
											>
												{page}
											</PaginationLink>
										</PaginationItem>
									)
								})
								.filter(Boolean)}

							{pagination.currentPage < pagination.totalPages && (
								<PaginationItem>
									<PaginationNext
										href={getPageUrl(pagination.currentPage + 1)}
									/>
								</PaginationItem>
							)}
						</PaginationContent>
					</Pagination>
				</div>
			)}

			{/* Related categories */}
			<div className="mt-12">
				<h2 className="text-2xl font-bold text-gray-900 mb-6">
					Explore Other Categories
				</h2>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
					{/* This would be populated with actual related categories from the API */}
					{["Action", "Adventure", "RPG", "Strategy"].map((name, index) => (
						<Link
							key={index}
							href={`/c/${name.toLowerCase()}`}
							className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
						>
							<div className="flex items-center justify-between">
								<span className="font-medium text-gray-900">{name}</span>
								<ChevronRight className="h-5 w-5 text-gray-400" />
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	)
}
