import React from "react"

interface GameHeaderProps {
	name: string
	slogan?: string
}

/**
 * 游戏标题和标语组件
 * 负责显示游戏的基本标题信息
 */
export const GameHeader: React.FC<GameHeaderProps> = ({ name, slogan }) => {
	return (
		<div className="mb-6">
			<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-foreground">
				{name}
			</h1>
			{slogan && (
				<p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
					{slogan}
				</p>
			)}
		</div>
	)
}
