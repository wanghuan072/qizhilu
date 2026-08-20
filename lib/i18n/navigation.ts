import { routing } from "@/lib/i18n/routing"
import { createNavigation } from "next-intl/navigation"

export const {
	Link,
	getPathname,
	redirect,
	usePathname,
	useRouter,
	permanentRedirect,
} = createNavigation(routing)

export function cleanPathname(locale: string, pathname: string) {
	return pathname === `/${locale}`
		? "/"
		: pathname.replace(new RegExp(`^/${locale}`), "")
}
