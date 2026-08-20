"use client"
export const dynamic = "force-static"
import { useEffect } from "react"

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error
	reset: () => void
}) {
	useEffect(() => {
		// 可在此处上报错误信息
		console.error(error)
	}, [error])

	return (
		<div className="w-full px-4 flex items-center justify-start h-screen md:px-8 bg-gradient-to-b from-gray-50 via-indigo-50 to-gray-100 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 relative overflow-hidden">
			{/* 渐变圆光斑 */}
			<div className="absolute top-20 right-10 w-64 h-64 rounded-full dark:bg-indigo-600/20 bg-indigo-600/10 filter blur-3xl animate-pulse z-0"></div>
			<div
				className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full dark:bg-violet-600/20 bg-violet-600/10 filter blur-3xl animate-pulse z-0"
				style={{ animationDelay: "2s" }}
			></div>
			<div className="absolute inset-0 bg-radial-gradient dark:opacity-40 opacity-20 pointer-events-none z-0"></div>
			<div className="container">
				<div className="max-w-lg mx-auto flex-1 flex-row-reverse gap-12 items-center justify-between md:max-w-none md:flex relative z-10">
					<div className="flex-1 max-w-lg">
						<img
							alt="服务器错误"
							src="/500.svg"
							loading="lazy"
							width={500}
							height={500}
						/>
					</div>
					<div className="mt-12 flex-1 max-w-lg space-y-3 md:mt-0 ">
						<h3 className="text-primary font-semibold text-center text-4xl sm:text-5xl sm:text-left">
							500 服务器错误
						</h3>
						<p className="text-gray-800 text-xl font-semibold text-center sm:text-2xl sm:text-left">
							出现了一些意外情况
						</p>
						<p className="text-gray-600 text-center sm:text-left">
							服务器发生错误，请稍后重试。
						</p>
						{/* 特别显示异常编码 */}
						{error && (error as any).code && (
							<div className="text-center sm:text-left mt-2">
								<span className="inline-block bg-red-100 text-red-600 rounded px-3 py-1 text-sm font-mono tracking-wide shadow-sm">
									错误编码：{(error as any).code}
								</span>
							</div>
						)}
						<div className="text-center sm:text-left">
							<button
								onClick={() => reset()}
								type="button"
								className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-8 py-3 rounded-full duration-150 hover:from-indigo-600 hover:to-violet-600 font-medium inline-flex items-center gap-x-1 shadow-lg transition-all"
							>
								<div className="flex items-center gap-x-1">
									重试
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="w-5 h-5 ml-1"
									>
										<title>重试</title>
										<path
											d="M12 4v16m8-8H4"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</div>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
