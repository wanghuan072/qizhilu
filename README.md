# 项目概述

这是一个基于 Next.js 15 的国际化网站模板项目，名为 "qizhilu-template-v3"。该项目专为构建多语言游戏网站而设计，支持多种语言（英语、德语、法语、日语、西班牙语、繁体中文、韩语、意大利语、荷兰语、葡萄牙语）和主题定制。

主要技术栈：
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- next-intl (国际化)
- shadcn/ui 组件库
- Bun 包管理器

项目特点：
- 支持静态导出 (SSG)
- 集成 Google Analytics、Microsoft Clarity 等分析工具
- 支持 AdSense 广告
- 响应式设计
- 游戏盒子布局 (Game Box Layout)
- 动态主题切换
- SEO 优化

# 项目结构

```
.
├── app/                    # Next.js 应用目录
│   ├── [locale]/          # 国际化路由
│   │   ├── layout.tsx        # 布局组件
│   │   └── page.tsx          # 首页
├── lib/                    # 核心库文件
│   ├── components/           # React 组件
│   ├── config/               # 配置文件
│   ├── consts/               # 常量定义
│   ├── data/                 # 本地数据文件 (按语言分)
│   ├── hooks/                # React Hooks
│   ├── i18n/                 # 国际化配置
│   ├── repositories/         # 数据访问层
│   ├── services/             # 业务逻辑层
│   ├── themes/               # 主题样式文件
│   ├── types/                # TypeScript 类型定义
│   └── utils/                # 工具函数
├── messages/               # 国际化消息文件 (按语言分)
├── public/                 # 静态资源文件
├── scripts/                # 构建和开发脚本
└── ...
```

# 构建和运行

## 环境要求
- Node.js >= 18
- Bun 包管理器

## 安装依赖
```bash
bun install
```

## 开发环境

> 注意不要修改.env .env.production 当中的NEXT_PUBLIC_PROJECT_ID值，获取站点设置数据的时候会校验该值的正确性

1. 首先获取站点设置:
   ```bash
   bun run fetch-site-settings
   ```
2. 启动开发服务器:
   ```bash
   bun run dev
   ```

## 生产构建
1. 获取站点设置:
   ```bash
   bun run fetch-site-settings
   ```
2. 构建项目:
   ```bash
   bun run build
   ```
3. 启动静态服务器:
   ```bash
   bun run start
   ```

## 测试
- 运行测试: `bun run test`
- 运行测试(单次): `bun run test:run`
- 监听模式运行测试: `bun run test:watch`

## 代码质量
- 代码检查: `bun run lint`
- 代码修复: `bun run lint:fix`
- 代码格式化: `bun run format`
- 综合检查: `bun run check`
- 综合修复: `bun run fix`

# 开发约定

## 国际化 (i18n)
- 使用 `next-intl` 进行国际化
- 语言文件位于 `messages/` 目录
- 支持的语言在 `siteSettings.ts` 中配置
- 路由前缀根据需要自动添加

## 样式和主题
- 使用 Tailwind CSS 进行样式设计
- 主题文件位于 `lib/themes/`
- 支持动态主题切换

## 组件开发
- 使用 shadcn/ui 组件库
- 组件位于 `lib/components/`
- 优先使用现有的 UI 组件

## 数据获取
- 站点设置在构建时通过 `fetch-site-settings` 脚本获取并保存到 `lib/config/siteSettings.ts`
- 游戏数据、文章等按语言保存在 `lib/data/` 目录

## 环境变量
- 开发环境变量在 `.env` 文件中配置
- 生产环境变量在 `.env.production` 文件中配置
- 构建时会自动更新 `NEXT_PUBLIC_DOMAIN` 等变量

## SEO 和分析
- 集成了 Google Analytics、Microsoft Clarity、Plausible 等分析工具
- 支持 AdSense 广告
- 自动生成 `ads.txt` 文件
