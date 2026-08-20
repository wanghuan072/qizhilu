/**
 * 服务层统一导出
 * 提供所有业务逻辑服务的统一入口
 * 注意：由于 "use server" 限制，此文件不能包含 'use server' 指令
 * Repository 和 Service 模块各自在自己的文件中声明 'use server'
 */

// 缓存和请求工具
export * from "@/lib/utils/cache/cache-utils"
export { fetchFromApi, type FetchOptions } from "@/lib/utils/fetch/fetch-utils"

// Repository 层
export * as ArticleRepository from "@/lib/repositories/article"
export * as CategoryRepository from "@/lib/repositories/category"
export * as GameRepository from "@/lib/repositories/game"
export * as SiteRepository from "@/lib/repositories/site"
export * as TagRepository from "@/lib/repositories/tag"

// Service 层
export * as GameService from "@/lib/services/game"
export * as NavigationService from "@/lib/services/navigation"
export * as SiteService from "@/lib/services/site"

// 重新导出常用类型
export type {
	ApiRequestParams,
	ArticlePost,
	BreadcrumbItem,
	GameCategory,
	GameData,
	GameTag,
	MetadataInfo,
	NavigationItem as NavItem,
	SiteSettings,
} from "@/lib/types"
