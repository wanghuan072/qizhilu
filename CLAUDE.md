# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 始终使用中文回答我

## Project Overview

This is **nexoui**, a multilingual gaming website template built with Next.js 15, TypeScript, and Tailwind CSS. It supports 6 languages (en, de, fr, ja, ko, zh-TW) and uses a component-driven architecture with shadcn/ui.

## Development Commands

### Primary Development
- `bun dev` or `npm run dev` - Start development server with Turbo
- `bun run fetch-site-settings` - Sync API data (required before first build)

### Code Quality (Use Biome, not ESLint/Prettier)
- `bun run check` - Run all checks (lint + format)
- `bun run fix` - Fix all auto-fixable issues
- `bun run lint` / `bun run format` - Individual checks

### Build & Deploy
- `bun run build` - Production build (includes post-build processing)
- `bun run start` - Start production server

### Database (Prisma)
- `bun run db:generate` - Generate Prisma client
- `bun run db:migrate` - Run migrations
- `bun run db:push` - Push schema changes

## Architecture Overview

### Internationalization-First Design
- **Route Structure**: `app/[locale]/` with locale-based routing
- **Middleware Required**: `middleware.ts` handles locale detection and routing
- **Build Constraint**: Cannot use trailing slashes (`trailingSlash: false`)
- **Translation Files**: Located in `messages/` directory

### Component Architecture
- **UI Components**: `lib/components/ui/` (shadcn/ui based)
- **Business Components**: `lib/components/view/` (GameCard, GameIframe, etc.)
- **Path Aliases**: Use `@/`, `@lib/`, `@components/`, `@ui/` extensively

### Theme System
- **Theme Files**: `lib/themes/` with CSS variables
- **Available Themes**: scheme1-6, default, green
- **Dynamic Switching**: Theme can be changed at runtime

### Content Management
- **API-Driven**: Content fetched from external API and cached locally
- **Build-Time Sync**: Run `fetch-site-settings` before building
- **MDX Support**: Rich content with markdown processing

## Key Configuration

### TypeScript Paths
```typescript
"@/*": ["./*"]
"@lib/*": ["./lib/*"]
"@components/*": ["./lib/components/*"]
"@ui/*": ["./lib/components/ui/*"]
```

### Build Settings
- **Output**: Static export in production (`output: "export"`)
- **Image Domains**: Multiple external domains configured
- **Supported Locales**: en (default), de, fr, ja, ko, zh-TW

### Code Standards
- **Formatting**: Biome with tabs, 80-character line width
- **TypeScript**: Strict mode enabled
- **Import Organization**: Biome handles import sorting

## Important Patterns

### Component Development
- Follow existing shadcn/ui patterns in `lib/components/ui/`
- Business logic components go in `lib/components/view/`
- Use TypeScript interfaces from `lib/types/`

### Internationalization
- All user-facing text must be internationalized
- Use `useTranslations()` hook from next-intl
- Add new keys to all files in `messages/` directory

### Game Integration
- Games are embedded via iframe in `GameIframe` component
- Game data comes from API with local caching
- SEO optimization with JSON-LD structured data

## Common Workflows

### Adding New shadcn Components
```bash
bunx shadcn@latest add [component-name]
```

### Updating Translations
1. Add keys to `messages/en.json` (source)
2. Copy to other language files in `messages/`
3. Update translation values for each locale

### Theme Development
1. Create new CSS file in `lib/themes/`
2. Define CSS variables following existing patterns
3. Update theme configuration in relevant config files

## Development Environment Notes

- **Preferred Runtime**: Bun (fallback to npm if needed)
- **Middleware Dependency**: Project requires `middleware.ts` for proper routing
- **API Dependency**: Must sync site settings before building (`fetch-site-settings`)
- **Static Generation**: Production builds are statically exported
