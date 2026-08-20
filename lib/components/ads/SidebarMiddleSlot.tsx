/**
 * 侧边栏中部广告位
 * 自动生成的广告组件，请勿手动修改
 * 生成时间: 2026-08-20T06:42:17.137Z
 */

'use client';

import { useEffect, useRef } from 'react';

export default function SidebarMiddleSlot() {
    const adRef = useRef<HTMLDivElement>(null);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        // 确保只在客户端执行一次
        if (typeof window === 'undefined' || isInitializedRef.current) {
            return;
        }

        const loadAd = async () => {
            try {
                // 等待DOM渲染完成，确保容器有正确的尺寸
                await new Promise(resolve => setTimeout(resolve, 100));

                const adCode = `<!-- 游戏页侧边正方形广告1 -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-8041655671892982"
     data-ad-slot="7680139223"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>`;

                // 动态检测广告类型：检查代码内容而非配置类型
                const isAdSense = adCode.includes('adsbygoogle') || adCode.includes('googlesyndication');

                if (isAdSense) {
                    // AdSense 广告处理
                    if (!window.adsbygoogle) {
                        // 从广告代码中提取 client ID
                        const clientMatch = adCode.match(/data-ad-client="([^"]+)"/);
                        const clientId = clientMatch ? clientMatch[1] : 'ca-pub-4588747915346334';

                        const script = document.createElement('script');
                        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
                        script.async = true;
                        script.crossOrigin = 'anonymous';
                        document.head.appendChild(script);

                        // 等待脚本加载完成
                        await new Promise((resolve) => {
                            script.onload = resolve;
                        });
                    }

                    // 注入广告代码到DOM
                    if (adRef.current) {
                        adRef.current.innerHTML = adCode;

                        // 等待一小段时间确保DOM更新完成
                        setTimeout(() => {
                            const adElement = adRef.current?.querySelector('.adsbygoogle');
                            if (adElement && !adElement.hasAttribute('data-ad-status')) {
                                // 初始化广告
                                (window.adsbygoogle = window.adsbygoogle || []).push({});
                                isInitializedRef.current = true;
                            }
                        }, 100);
                    }
                } else {
                    // 第三方广告处理 - 直接渲染
                    if (adRef.current) {
                        adRef.current.innerHTML = adCode;

                        // 执行脚本标签
                        const scripts = adRef.current.querySelectorAll('script');
                        scripts.forEach((oldScript) => {
                            const newScript = document.createElement('script');
                            Array.from(oldScript.attributes).forEach((attr) => {
                                newScript.setAttribute(attr.name, attr.value);
                            });
                            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                            oldScript.parentNode?.replaceChild(newScript, oldScript);
                        });

                        isInitializedRef.current = true;
                    }
                }
            } catch (error) {
                console.error('广告加载失败:', error);
            }
        };

        // 延迟加载以确保页面布局稳定
        const timer = setTimeout(loadAd, 1000);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    const adCode = `<!-- 游戏页侧边正方形广告1 -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-8041655671892982"
     data-ad-slot="7680139223"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>`;
    const adType = '{{AD_TYPE}}';

    // 在渲染前确定广告类型
    const isAdSenseCode = adCode.includes('adsbygoogle') || adCode.includes('googlesyndication');

    return (
        <div className="mt-4 z-20 relative w-full min-w-[300px] [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto" ref={adRef}>
        </div>
    );
}
