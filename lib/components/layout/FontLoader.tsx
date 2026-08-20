"use client"

import { siteSettings } from "@/lib/config/siteSettings"
import React from "react"

// 字体CDN URL映射表
const FONT_CDN_URLS = {
  // 原有字体
  "Plus Jakarta Sans": "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
  "Source Serif 4": "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600;700&display=swap",
  "JetBrains Mono": "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap",
  "Noto Sans SC": "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap",
  "Noto Serif SC": "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700&display=swap",
  "Inter": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "Roboto": "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
  "Open Sans": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap",
  "Merriweather": "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
  "Lora": "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap",
  "Fira Code": "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap",
  "Source Code Pro": "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&display=swap",
  "Roboto Mono": "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap",

  // 新增游戏网站字体
  "Montserrat": "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
  "Exo 2": "https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700&display=swap",
  "Rajdhani": "https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap",
  "Barlow": "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&display=swap",
  "Play": "https://fonts.googleapis.com/css2?family=Play:wght@400;700&display=swap",
  "Sora": "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap",
  "Chakra Petch": "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap",
  "Audiowide": "https://fonts.googleapis.com/css2?family=Audiowide&display=swap",
  "Space Mono": "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap",
  "IBM Plex Mono": "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap",
  "Share Tech Mono": "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap",

  // 新增特色字体
  "DotGothic16": "https://fonts.googleapis.com/css2?family=DotGothic16&display=swap",
  "ZCOOL KuaiLe": "https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap",
  "Potta One": "https://fonts.googleapis.com/css2?family=Potta+One&display=swap",
  "Yuji Mai": "https://fonts.googleapis.com/css2?family=Yuji+Mai&display=swap",
  "Reggae One": "https://fonts.googleapis.com/css2?family=Reggae+One&display=swap",
}

export const FontLoader = () => {
  // 获取当前配置的字体
  const fonts = [
    siteSettings.fonts?.sans || "Plus Jakarta Sans",
    siteSettings.fonts?.serif || "Source Serif 4",
    siteSettings.fonts?.mono || "JetBrains Mono"
  ]
  console.log("###fonts",fonts)
  // 去重
  const uniqueFonts = Array.from(new Set(fonts))

  // 过滤出有效的字体URL
  const fontUrls:any[] = uniqueFonts
    // @ts-ignore
    .map(fontName => FONT_CDN_URLS[fontName])
    .filter(Boolean)
 console.log("###fontUrls",fontUrls)
  // 使用 useEffect 在客户端添加字体链接
  React.useEffect(() => {
    // 添加预连接
    const preconnect1 = document.createElement('link')
    preconnect1.rel = 'preconnect'
    preconnect1.href = 'https://fonts.googleapis.com'
    document.head.appendChild(preconnect1)

    const preconnect2 = document.createElement('link')
    preconnect2.rel = 'preconnect'
    preconnect2.href = 'https://fonts.gstatic.com'
    preconnect2.crossOrigin = 'anonymous'
    document.head.appendChild(preconnect2)

    // 添加字体链接
    const fontLinks = fontUrls.map((fontUrl) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = fontUrl
      document.head.appendChild(link)
      console.log("###插入link")
      return link
    })

    // 清理函数
    return () => {
      preconnect1.remove()
      preconnect2.remove()
      fontLinks.forEach(link => link.remove())
    }
  }, [fontUrls])

  // 该组件不渲染任何可见内容
  return null
}
