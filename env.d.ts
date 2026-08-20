import type { PrismaClient } from "@prisma/client"

declare global {
	// 全局持有 Prisma 避免在开发环境下Prisma 链接未关闭导致的报错
	var prisma: PrismaClient | undefined

	namespace NodeJS {
		interface ProcessEnv {}
	}
}
