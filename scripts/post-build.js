const fs = require('fs-extra');
const path = require('path');

const OUT_DIR = path.join(process.cwd(), 'out');

async function moveFiles() {
    try {

        // 获取默认语言
        const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
        // 将 en 目录下的所有文件移动到根目录
        await fs.copy(path.join(OUT_DIR, defaultLocale), OUT_DIR);
        // 删除原来的 en 目录
        await fs.remove(path.join(OUT_DIR, defaultLocale));
        // 将 en.html 重命名为 index.html
        const enHtmlPath = path.join(OUT_DIR, `${defaultLocale}.html`);
        const enTextPath = path.join(OUT_DIR, `${defaultLocale}.txt`);
        const indexHtmlPath = path.join(OUT_DIR, 'index.html');
        const indexTextPath = path.join(OUT_DIR, 'index.txt');
        if (await fs.pathExists(enHtmlPath)) {
            await fs.move(enHtmlPath, indexHtmlPath, { overwrite: true });
        }
        if (await fs.pathExists(enTextPath)) {
            await fs.move(enTextPath, indexTextPath, { overwrite: true });
        }
        // 在out目录下生成.ok文件，用于标识成功便于 python 脚本判断是否成功
        const okFilePath = path.join(OUT_DIR, '.ok');
        await fs.writeFile(okFilePath, '');
        
        // 为 Vercel 创建 routes-manifest.json（静态导出模式下 Next.js 不会生成此文件）
        // Vercel 需要这个文件来识别 Next.js 项目
        const routesManifestPath = path.join(OUT_DIR, 'routes-manifest.json');
        const routesManifest = {
            version: 3,
            pages404: true,
            basePath: '',
            pages: {
                '/': {
                    initialRevalidateSeconds: false,
                    srcRoute: null,
                    dataRoute: null
                }
            },
            dynamicRoutes: [],
            staticRoutes: [
                {
                    page: '/',
                    regex: '^/',
                    routeKeys: {},
                    namedRegex: '^/'
                }
            ],
            dataRoutes: [],
            rscRoutes: {},
            rewrites: [],
            headers: [],
            redirects: [],
            i18n: {
                locales: [defaultLocale],
                defaultLocale: defaultLocale,
                localeDetection: false,
                domains: []
            }
        };
        await fs.writeFile(routesManifestPath, JSON.stringify(routesManifest, null, 2));
        console.log('Created routes-manifest.json for Vercel compatibility');
        
        console.log('Successfully moved files from en directory to root');
    } catch (error) {
        console.error('Error moving files:', error);
        process.exit(1);
    }
}

moveFiles();