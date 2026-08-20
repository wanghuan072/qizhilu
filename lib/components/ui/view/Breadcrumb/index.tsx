"use client"
import { Icon } from "@/lib/components/common"
import { BreadcrumbItem } from "@/lib/types"
import { Link } from "@i18n/navigation"
import React from "react"

interface BreadcrumbProps {
	items: BreadcrumbItem[]
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
	if (!items || items.length === 0) {
		return null
	}
	return (
		<div className="bg-muted py-2 border-b border-border hidden md:block">
			<div className="container mx-auto px-4">
				<div className="flex items-center text-sm text-muted-foreground overflow-hidden">
					{items.map((item, index) => {
						const isLast = index === items.length - 1

						return (
							<React.Fragment key={index}>
								{item.href && !item.isActive ? (
									<Link
										href={item.href}
										className="hover:text-primary inline-block flex-shrink-0 whitespace-nowrap"
										title={item.label}
									>
										{item.label}
									</Link>
								) : (
									<span
										className={`${item.isActive ? "font-bold text-primary truncate min-w-0" : "flex-shrink-0 whitespace-nowrap"}`}
									>
										{item.label}
									</span>
								)}

								{!isLast && (
									<Icon
										name="ChevronRight"
										className="h-3 w-3 mx-2"
										size={12}
									/>
								)}
							</React.Fragment>
						)
					})}
				</div>
			</div>
		</div>
	)
}

export const MobileBreadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
	if (!items || items.length === 0) {
		return null
	}
	return (
		<div className="bg-muted py-2 border-t border-border block md:hidden">
			<div className="container mx-auto px-4">
				<div className="flex items-center text-sm text-muted-foreground overflow-hidden">
					{items.map((item, index) => {
						const isLast = index === items.length - 1

						return (
							<React.Fragment key={index}>
								{item.href && !item.isActive ? (
									<Link
										href={item.href}
										className="hover:text-primary inline-block flex-shrink-0 whitespace-nowrap"
										title={item.label}
									>
										{item.label}
									</Link>
								) : (
									<span
										className={`${item.isActive ? "font-bold text-primary truncate min-w-0" : "flex-shrink-0 whitespace-nowrap"}`}
									>
										{item.label}
									</span>
								)}

								{!isLast && (
									<Icon
										name="ChevronRight"
										className="h-3 w-3 mx-2"
										size={12}
									/>
								)}
							</React.Fragment>
						)
					})}
				</div>
			</div>
		</div>
	)
}

export default Breadcrumb
