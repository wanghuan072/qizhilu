"use client"

import Script from "next/script"
import { Fragment } from "react"

interface ScriptData {
	content: string
	[key: string]: any // for attributes like src, async, defer, etc.
}

interface Props {
	scripts: ScriptData[]
}

export default function RawScriptInjector({ scripts }: Props) {
	if (!scripts || scripts.length === 0) {
		return null
	}

	return (
		<Fragment>
			{scripts.map((scriptData, index) => {
				const { content, type, ...attrs } = scriptData

				// 如果脚本有src属性，使用next/script的src方式
				if (attrs.src) {
					return <Script key={index} {...attrs} />
				}

				// 如果是原始HTML（如link标签），使用dangerouslySetInnerHTML直接注入
				if (type === "raw-html") {
					return (
						<div key={index} dangerouslySetInnerHTML={{ __html: content }} />
					)
				}

				// 如果是内联脚本，使用next/script
				return (
					<Script
						key={index}
						id={`raw-script-${index}`}
						dangerouslySetInnerHTML={{ __html: content }}
						{...attrs}
					/>
				)
			})}
		</Fragment>
	)
}
