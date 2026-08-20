import React from "react"

interface StarProps {
	className?: string
}

const Star: React.FC<StarProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<title>Star</title>
		<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
		<defs>
			<linearGradient id="half-star" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="50%" stopColor="currentColor" stopOpacity="1" />
				<stop offset="50%" stopColor="currentColor" stopOpacity="0" />
			</linearGradient>
		</defs>
	</svg>
)

interface StarRatingProps {
	rating: number
	className?: string
	showRatingText?: boolean
}

/**
 * 星级评分组件
 * 支持半星显示和评分文本
 */
const StarRating: React.FC<StarRatingProps> = ({
	rating,
	className = "",
	showRatingText = true,
}) => {
	const fullStars = Math.floor(rating)
	const hasHalfStar = rating % 1 >= 0.5
	const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<div className="flex items-center text-primary">
				{[...Array(fullStars)].map((_, i) => (
					<Star key={`f-${i}`} className="h-4 w-4 fill-current" />
				))}
				{hasHalfStar && (
					<Star key="half" className="h-4 w-4 fill-[url('#half-star')]" />
				)}
				{[...Array(emptyStars)].map((_, i) => (
					<Star key={`e-${i}`} className="h-4 w-4" />
				))}
			</div>
			{showRatingText && (
				<span className="text-sm font-medium text-foreground">
					{rating.toFixed(1)}
				</span>
			)}
		</div>
	)
}

export default StarRating
export { StarRating }
