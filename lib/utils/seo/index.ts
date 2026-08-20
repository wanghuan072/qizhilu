// 导出 JSON-LD 组件
export { JsonLd } from "@/lib/components/seo/JsonLd"
export type { JsonLdData } from "@/lib/components/seo/JsonLd"

// 导出 JSON-LD 生成器
export {
	generateSoftwareApplicationJsonLd,
	generateBreadcrumbJsonLd,
	generateArticleJsonLd,
	generateCollectionPageJsonLd,
	generateVideoObjectJsonLd,
	generateOrganizationJsonLd,
	generateFAQPageJsonLd,
	generateWebSiteJsonLd,
	generateWebPageJsonLd,
	generateItemListJsonLd,
	generateJsonLdGraph,
	generateCustomPageJsonLd,
} from "./jsonld-generators"

// 导出 Metadata 生成器
export {
	generateGameMetadata,
	generateBlogMetadata,
	generateCategoryMetadata,
	generateTagMetadata,
	generateCustomPageMetadata,
} from "./metadata-generators"
