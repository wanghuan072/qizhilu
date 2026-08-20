import { resolve } from "path"
import { defineConfig } from "vitest/config"

// 手动加载环境变量文件，确保正确的优先级
// .env.local 优先级高于 .env
// config({ path: resolve(__dirname, ".env") })
// config({ path: resolve(__dirname, ".env.local") })

export default defineConfig({
	test: {
		// 设置测试环境
		environment: "node",
		// 测试超时时间
		testTimeout: 30000,
		// 确保环境变量传递到测试环境
		env: {
			// 从进程环境变量中获取，这些已经通过上面的 dotenv 配置加载
			NEXT_PUBLIC_WEB_API_URL: process.env.NEXT_PUBLIC_WEB_API_URL!,
			NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID!,
			NODE_ENV: process.env.NODE_ENV || "test",
		},
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "."),
		},
	},
})
