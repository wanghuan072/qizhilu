"use client"

import React from "react"

interface ClientButtonProps {
	id?: string
	title?: string
	className?: string
	icon?: React.ReactNode
	onClick?: () => void
	children?: React.ReactNode
}

/**
 * 客户端按钮组件，处理点击事件
 */
export const ClientButton: React.FC<ClientButtonProps> = ({
	id,
	title,
	className,
	icon,
	onClick,
	children,
}) => {
	return (
		<button
			id={id}
			title={title}
			type="button"
			className={className}
			onClick={onClick}
		>
			{icon}
			{children}
		</button>
	)
}

export default ClientButton
