import type { PageQueryable, Pageable } from "@/lib/types"
import { omit, pick } from "radash"

const PRE_PAGE_CURRENT = 1
const PRE_PAGE_SIZE = 20

export function offsetPage({ current, size }: Pageable) {
	const offsetPage = current
		? Number(current) || PRE_PAGE_CURRENT
		: PRE_PAGE_CURRENT
	const offsetSize = size ? Number(size) || PRE_PAGE_SIZE : PRE_PAGE_SIZE
	const v = (offsetPage - 1) * offsetSize
	return {
		skip: v,
		take: offsetSize ?? PRE_PAGE_SIZE,
	}
}

export function stripPage<T>(data: PageQueryable<T>): {
	page: Pageable
	params: Partial<T>
} {
	const page = pick(data, ["current", "size"]) as Pageable
	const params = omit(data, ["current", "size"]) as Partial<T>
	return { page, params }
}

export function isEmptyPage(count: number) {
	return count <= 0
}

export function hasMorePage(count: number, page: number, size = 10): boolean {
	const pages = getPages(count, size)
	return page < pages
}

export function getPages(count: number, size: number): number {
	if (!(count || size)) return 0
	return Math.ceil(count / size)
}
