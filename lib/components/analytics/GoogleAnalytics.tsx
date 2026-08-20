// GoogleAnalytics.tsx
"use client"

import Script from "next/script"

interface GoogleAnalyticsProps {
  gaId: string
}

/*
 * 这是 Next.js 官方推荐的 GTag 实现方式
 * 它使用两个 Script 标签，完全避免了 useEffect/onLoad 的竞争条件
 */
export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  if (!gaId) {
    return null
  }

  return (
    <>
      {/* 第一个 Script：加载 GTag.js 库
        GTag.js 脚本会寻找 window.dataLayer
      */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />

      {/* 第二个 Script：
        1. 初始化 dataLayer 和 gtag 存根函数 (在 GTag.js 加载前)
        2. 在 GTag.js 加载后，这个内联脚本也会执行 config
        3. 我们在这里注入我们的 consent 和 debug_mode
      */}
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
            console.log("### GTag Inlined Script Executed for ${gaId}");
          `,
        }}
      />
    </>
  )
}
