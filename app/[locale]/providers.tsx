"use client"

import { ThemeProvider } from "next-themes"
import type * as React from "react"
import { Toaster } from "sonner"

export interface ProvidersProps {
	locale: string
	children: React.ReactNode
}

export function Providers({ children, locale }: ProvidersProps) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<Toaster position="top-center" richColors />
			{children}
		</ThemeProvider>
	)
}
