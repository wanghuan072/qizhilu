import cachedSiteSettings from "@/lib/config/siteSettings"
import deMessages from "@/messages/de.json"
import enMessages from "@/messages/en.json"
import esEsMessages from "@/messages/es-ES.json"
import frMessages from "@/messages/fr.json"
import itMessages from "@/messages/it.json"
import jaMessages from "@/messages/ja.json"
import koMessages from "@/messages/ko.json"
import nlMessages from "@/messages/nl.json"
import ptPtMessages from "@/messages/pt-PT.json"
import zhCnMessages from "@/messages/zh-CN.json"
// 导入本地国际化文件
import zhTwMessages from "@/messages/zh-TW.json"
import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"
// 获取站点配置中的语言设置
const defaultLocale = cachedSiteSettings.defaultLocale

// 本地国际化文件映射(必须包含工具当中定义的所有语言，这些属于模板当中直接使用到的国际化内容，不需要通过api获取)
const localMessages: Record<string, any> = {
	de: deMessages,
	en: enMessages,
	"es-ES": esEsMessages,
	fr: frMessages,
	it: itMessages,
	ja: jaMessages,
	ko: koMessages,
	nl: nlMessages,
	"pt-PT": ptPtMessages,
	"zh-CN": zhCnMessages,
	"zh-TW": zhTwMessages,
}

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale

	// 验证locale是否有效，如果无效则使用默认语言
	const finalLocale = hasLocale(routing.locales, requested)
		? requested
		: routing.defaultLocale

	try {
		// 加载请求的语言消息
		// 获取本地消息
		const messages = localMessages[finalLocale] || {}
		return {
			locale: finalLocale,
			messages,
			onError(error) {
				console.error("加载国际化内容时出现异常：")
				console.error(error)
			},
		}
	} catch (error) {
		console.error(
			`无法加载 ${finalLocale} 的翻译文件，将使用默认语言 ${defaultLocale}`,
		)

		// 加载默认语言消息作为备份
		const fallbackMessages = localMessages[defaultLocale] || {}

		return { locale: defaultLocale, messages: fallbackMessages }
	}
})
