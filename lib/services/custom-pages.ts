import * as path from "path"
import * as fs from "fs/promises"

export interface MdxFrontMatter {
	title: string
	description?: string
	showNavigation?: boolean
	showFooter?: boolean
}

export interface MdxArticleData {
	frontMatter: MdxFrontMatter
	content: string
}

/**
 * 解析YAML front matter
 */
function parseFrontMatter(content: string): {
	frontMatter: Record<string, any>
	content: string
} {
	const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
	const match = content.match(frontMatterRegex)

	if (!match || match.length < 3) {
		return { frontMatter: {}, content }
	}

	const frontMatterStr = match[1] || ""
	const restContent = match[2] || ""
	const frontMatter: Record<string, any> = {}

	// 简单的YAML解析
	if (frontMatterStr) {
		frontMatterStr.split("\n").forEach((line) => {
			const [key, ...valueParts] = line.split(":")
			if (key && valueParts.length > 0) {
				let value: any = valueParts.join(":").trim()
				// 移除引号
				if (
					(value.startsWith('"') && value.endsWith('"')) ||
					(value.startsWith("'") && value.endsWith("'"))
				) {
					value = value.slice(1, -1)
				}
				// 转换布尔值
				if (value === "true") value = true
				if (value === "false") value = false
				frontMatter[key.trim()] = value
			}
		})
	}

	return { frontMatter, content: restContent }
}

/**
 * 获取自定义页面的MDX数据
 * @param slug 页面slug
 * @param locale 语言代码
 * @returns MDX数据或null
 */
export async function getCustomPageMdx(
	slug: string,
	locale: string,
): Promise<MdxArticleData | null> {
	try {
		// 根据slug构建路径
		const slugParts = slug.split("/")
		let mdxPath = path.join(process.cwd(), "app/[locale]")

		// 添加slug的各个部分
		for (const part of slugParts) {
			mdxPath = path.join(mdxPath, part)
		}

		const mdxFile = path.join(mdxPath, `${locale}.mdx`)

		// 检查文件是否存在
		try {
			await fs.access(mdxFile)
		} catch {
			console.warn(`Custom page MDX file not found: ${mdxFile}`)
			return null
		}

		// 读取文件内容
		const fileContent = await fs.readFile(mdxFile, "utf-8")

		// 解析front matter和内容
		const { frontMatter, content } = parseFrontMatter(fileContent)

		return {
			frontMatter: frontMatter as MdxFrontMatter,
			content,
		}
	} catch (error) {
		console.error(
			`Error loading custom page MDX for ${slug} (${locale}):`,
			error,
		)
		return null
	}
}

/**
 * 获取首页的MDX数据
 * @param locale 语言代码
 * @returns MDX数据或null
 */
export async function getHomeMdx(
	locale: string,
): Promise<MdxArticleData | null> {
	try {
		const mdxPath = path.join(
			process.cwd(),
			"app/[locale]/(public)/__generated__/home",
			`${locale}.mdx`,
		)

		// 检查文件是否存在
		try {
			await fs.access(mdxPath)
		} catch {
			return null
		}

		// 读取文件内容
		const fileContent = await fs.readFile(mdxPath, "utf-8")

		// 解析front matter和内容
		const { frontMatter, content } = parseFrontMatter(fileContent)

		return {
			frontMatter: frontMatter as MdxFrontMatter,
			content,
		}
	} catch (error) {
		console.error(`Error loading home MDX for ${locale}:`, error)
		return null
	}
}

/**
 * 获取所有自定义页面的slug列表
 * @returns slug数组
 */
export async function getCustomPageSlugs(): Promise<string[]> {
	try {
		const appLocaleDir = path.join(process.cwd(), "app/[locale]")

		// 检查目录是否存在
		try {
			await fs.access(appLocaleDir)
		} catch {
			return []
		}

		const slugs: Set<string> = new Set()

		/**
		 * 递归扫描目录，找出所有包含MDX文件的目录
		 */
		const scanDirectory = async (
			dir: string,
			relativePath = "",
		): Promise<void> => {
			const entries = await fs.readdir(dir, { withFileTypes: true })

			for (const entry of entries) {
				// 跳过特殊目录和系统文件
				if (
					entry.name.startsWith(".") ||
					entry.name === "node_modules" ||
					entry.name === "__pycache__"
				) {
					continue
				}

				const fullPath = path.join(dir, entry.name)
				const relativePathPart = relativePath
					? `${relativePath}/${entry.name}`
					: entry.name

				if (entry.isDirectory()) {
					// 检查是否有MDX文件在这个目录中
					const dirFiles = await fs.readdir(fullPath)
					const hasMDX = dirFiles.some((file) => file.endsWith(".mdx"))

					if (hasMDX) {
						slugs.add(relativePathPart)
					}

					// 递归扫描子目录
					await scanDirectory(fullPath, relativePathPart)
				}
			}
		}

		await scanDirectory(appLocaleDir)
		return Array.from(slugs)
	} catch (error) {
		console.error("Error reading custom page slugs:", error)
		return []
	}
}
