import type { PropsWithChildren } from "react"

type Props = PropsWithChildren<{ params: Promise<{ locale: string }> }>

export default async function AdLayout({ children }: Props) {
	return <div className="flex min-h-[100dvh] w-full">{children}</div>
}
