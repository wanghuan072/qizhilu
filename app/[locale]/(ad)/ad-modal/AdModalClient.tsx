"use client"

import { Button } from "@/lib/components/ui/button"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

export function AdModalClient() {
    const [countdown, setCountdown] = useState(10)
    const t = useTranslations("Game")

    // 倒计时
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev - 1)
            }, 1000)
            return () => clearTimeout(timer)
        } else {
            // 倒计时结束，通知父窗口关闭广告
            handleClose()
        }
    }, [countdown])

    const handleClose = () => {
        // 通知父窗口关闭广告
        window.parent.postMessage({ type: 'AD_CLOSED' }, '*')
    }

    return (
        <>
            {/* 关闭按钮和倒计时 */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClose}
                    className="bg-white/90 hover:bg-white shadow-md"
                >
                    <X className="w-4 h-4 mr-1" />
                    {t("close")}
                </Button>
                <div className="bg-gray-800/70 text-white rounded-full px-3 py-1 text-sm font-medium shadow-md">
                    {countdown}s
                </div>
            </div>

        </>
    )
}
