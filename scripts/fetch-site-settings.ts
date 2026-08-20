/**
 * 构建前获取站点设置脚本
 * 该脚本在构建前执行，用于获取站点设置并保存到配置文件中
 * 目的是在运行和构建之前已经将基础配置信息保存到项目里面，减少远程API调用
 *
 * 功能：
 * - 获取站点设置并保存到配置文件
 * - 获取文章列表数据（包含完整内容）
 * - 获取游戏数据和标签
 * - 获取本地化设置
 * - 生成ads.txt文件
 * - 更新环境变量配置
 *
 * 命令行使用：
 * - `bun run fetch-site-settings` - 获取所有数据
 */

import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import sharp from 'sharp';
import { fetchFromApi } from '@/lib/utils/fetch/fetch-utils';
import { SiteSettings, ArticlePost, GameDataList, GameTag, ProjectLocaleSiteSetting, CustomPage } from '@/lib/types/api-types';
import { generateAdComponents, generateAdComponentsIndex } from './ad-component-generator';
// 配置文件保存路径
const CONFIG_FILE_PATH = path.resolve(process.cwd(), 'lib/config/siteSettings.ts');
// 数据文件保存路径
const DATA_DIR_PATH = path.resolve(process.cwd(), 'lib/data');
// .env.production 文件路径
const ENV_PRODUCTION_PATH = path.resolve(process.cwd(), '.env.production');
// ads.txt 文件路径
const ADS_TXT_PATH = path.resolve(process.cwd(), 'public/ads.txt');
// favicon 文件路径
const FAVICON_PATH = path.resolve(process.cwd(), 'public/favicon.ico');
const APPLE_TOUCH_ICON_PATH = path.resolve(process.cwd(), 'public/apple-touch-icon.png');

// 脚本配置
const SCRIPT_CONFIG = {
  // 单个请求超时时间（毫秒）
  REQUEST_TIMEOUT: 30000
};

// 内部类型定义（仅用于脚本生成）
interface CustomPageLocale {
  id: string;
  content: string;
  locale: string;
  sourcePageId: string;
  title: string;
  description?: string;
  isHomePage?:boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CustomPageBundle {
  sourcePageId: string;
  slug: string;
  pageType: string;
  locales: CustomPageLocale[];
}

type CustomPageList = CustomPageBundle[];

/**
 * 将对象中的null值转换为undefined
 * 这样在生成TS文件时，null值会变为undefined，避免类型不匹配
 * @param obj 要处理的对象
 * @returns 处理后的对象
 */
function nullToUndefined(obj: any): any {
  if (obj === null) {
    return undefined;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => nullToUndefined(item));
  }

  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = nullToUndefined(obj[key]);
    }
  }

  return result;
}

/**
 * 自定义JSON序列化函数，将null转换为undefined
 * @param _key 键（未使用）
 * @param value 值
 * @returns 处理后的值
 */
function jsonReplacer(_key: string, value: any): any {
  return value === null ? undefined : value;
}

/**
 * 生成 ads.txt 文件
 * @param adsTxtContent ads.txt 内容
 */
function generateAdsTxtFile(adsTxtContent: string) {
  try {
    // 如果内容为空，删除现有的 ads.txt 文件（如果存在）
    if (!adsTxtContent || adsTxtContent.trim() === '') {
      if (fs.existsSync(ADS_TXT_PATH)) {
        fs.unlinkSync(ADS_TXT_PATH);
        console.log('ads.txt 内容为空，已删除现有的 ads.txt 文件');
      } else {
        console.log('ads.txt 内容为空，跳过生成');
      }
    }

    // 确保 public 目录存在
    const publicDir = path.dirname(ADS_TXT_PATH);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log(`创建 public 目录: ${publicDir}`);
    }

    // 写入 ads.txt 文件
    fs.writeFileSync(ADS_TXT_PATH, adsTxtContent.trim(), 'utf8');
    console.log(`ads.txt 文件已生成: ${ADS_TXT_PATH}`);
    console.log(`ads.txt 内容:\n${adsTxtContent.trim()}`);
  } catch (error) {
    console.error('生成 ads.txt 文件时出错:', error);
    // 不抛出错误，让主流程继续执行
  }
}

/**
 * 更新或创建 .env.production 文件中的 NEXT_PUBLIC_DOMAIN
 * @param domain 域名
 */
function updateEnvProductionDomain(domain: string) {
  try {
    let envContent = '';

    // 如果文件存在，读取现有内容
    if (fs.existsSync(ENV_PRODUCTION_PATH)) {
      envContent = fs.readFileSync(ENV_PRODUCTION_PATH, 'utf8');
    }

    // 检查是否已存在 NEXT_PUBLIC_DOMAIN 配置
    const domainRegex = /^NEXT_PUBLIC_DOMAIN\s*=.*$/m;
    const newDomainLine = `NEXT_PUBLIC_DOMAIN=${domain}`;

    if (domainRegex.test(envContent)) {
      // 如果存在，替换现有配置
      envContent = envContent.replace(domainRegex, newDomainLine);
      console.log(`更新 .env.production 中的 NEXT_PUBLIC_DOMAIN: ${domain}`);
    } else {
      // 如果不存在，添加新配置
      // 确保文件末尾有换行符
      if (envContent && !envContent.endsWith('\n')) {
        envContent += '\n';
      }
      envContent += `${newDomainLine}\n`;
      console.log(`添加 NEXT_PUBLIC_DOMAIN 到 .env.production: ${domain}`);
    }

    // 写入文件
    fs.writeFileSync(ENV_PRODUCTION_PATH, envContent, 'utf8');
    console.log(`环境变量已保存到: ${ENV_PRODUCTION_PATH}`);
  } catch (error) {
    console.error('更新 .env.production 文件时出错:', error);
    // 不抛出错误，让主流程继续执行
  }
}

/**
 * 下载远程图片并保存为本地文件
 * @param imageUrl 远程图片URL
 * @param outputPath 本地保存路径
 */
async function downloadImage(imageUrl: string, outputPath: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(SCRIPT_CONFIG.REQUEST_TIMEOUT),
    });

    if (!response.ok) {
      console.warn(`下载图片失败: ${imageUrl} - 状态码: ${response.status}`);
      return false;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // 确保目录存在
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ 图片已下载并保存到: ${outputPath}`);
    return true;
  } catch (error) {
    console.warn(`下载图片时出错: ${imageUrl}`, error);
    return false;
  }
}

/**
 * 生成 favicon 文件
 * 如果 icons 字段中的 favicon 不为空，则远程拉取该图片并转换为 ico 格式
 * 如果为空，则使用 siteName 的第一个字母生成 favicon
 * @param siteSettings 站点设置
 */
async function generateFavicon(siteSettings: any) {
  try {
    // 检查 icons 字段
    const icons = siteSettings.icons || {};
    const { favicon = '', androidIcon = '', appleTouchIcon = '' } = icons;

    // 确保 public 目录存在
    const publicDir = path.dirname(FAVICON_PATH);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log(`创建 public 目录: ${publicDir}`);
    }

    let needAutoGenerate = false;

    // 如果 favicon 不为空，直接下载并保存为原始格式
    if (favicon.trim() !== '') {
      console.log(`正在从远程下载 favicon: ${favicon}`);

      const downloadSuccess = await downloadImage(favicon, FAVICON_PATH);

      if (downloadSuccess) {
        console.log(`✓ favicon 已从远程下载并保存: ${FAVICON_PATH}`);

        // 如果 appleTouchIcon 为空，也用相同的图片生成 Apple Touch Icon
        if (appleTouchIcon.trim() === '') {
          try {
            await sharp(FAVICON_PATH)
              .resize(180, 180)
              .toFile(APPLE_TOUCH_ICON_PATH);
            console.log(`✓ apple-touch-icon.png 已从 favicon 生成: ${APPLE_TOUCH_ICON_PATH}`);
          } catch (error) {
            console.warn('生成 apple-touch-icon.png 时出错:', error);
          }
        }
      } else {
        console.warn('下载远程 favicon 失败，将使用自动生成的 favicon');
        needAutoGenerate = true;
      }
    } else {
      // favicon 为空，需要自动生成
      needAutoGenerate = true;
    }

    // 如果 androidIcon 或 appleTouchIcon 不为空，下载它们
    if (androidIcon.trim() !== '') {
      console.log(`正在从远程下载 android icon: ${androidIcon}`);
      await downloadImage(androidIcon, path.join(publicDir, 'android-chrome-192x192.png'));
    }

    if (appleTouchIcon.trim() !== '') {
      console.log(`正在从远程下载 apple touch icon: ${appleTouchIcon}`);
      await downloadImage(appleTouchIcon, APPLE_TOUCH_ICON_PATH);
    }

    // 如果需要自动生成 favicon（远程下载失败或配置为空）
    if (needAutoGenerate) {
      await generateAutoFavicon(siteSettings);
    }

  } catch (error) {
    console.error('生成 favicon 时出错:', error);
    // 不抛出错误，让主流程继续执行
  }
}

/**
 * 根据主题名称获取主色调
 * @param themeName 主题名称
 * @returns 十六进制颜色值
 */
function getThemePrimaryColor(themeName: string): string {
  const themeColors: Record<string, string> = {
    // 从各个主题文件提取的 --primary 颜色值（HSL 转 HEX）
    'default': '#6366F1',      // 238.73 83.53% 66.67% (Indigo)
    'scheme1': '#5B21B6',      // 238 83% 59% (Purple)
    'scheme2': '#0891B2',      // 187 95% 42% (Cyan)
    'scheme3': '#DC2626',      // 0 84.24% 60.2% (Red)
    'scheme4': '#059669',      // 142 76% 36% (Green)
    'scheme5': '#059669',      // 161 84% 39% (Emerald Green)
    'scheme6': '#7C3AED',      // 262 83% 58% (Violet)
    'green': '#059669'        // 142 76% 36% (Green)
  };

  return themeColors[themeName] || '#3B82F6'; // 默认蓝色
}

/**
 * 将十六进制颜色转换为 RGB 值
 * @param hex 十六进制颜色值
 * @returns RGB 对象
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1] || '00', 16),
    g: parseInt(result[2] || '00', 16),
    b: parseInt(result[3] || '00', 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * 计算颜色的相对亮度
 * @param r 红色分量 (0-255)
 * @param g 绿色分量 (0-255)
 * @param b 蓝色分量 (0-255)
 * @returns 相对亮度值 (0-1)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * 计算两种颜色之间的对比度
 * @param color1 第一种颜色（十六进制）
 * @param color2 第二种颜色（十六进制）
 * @returns 对比度比值 (1-21)
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * 根据背景色选择合适的文字颜色
 * @param backgroundColor 背景颜色（十六进制）
 * @returns 最合适的文字颜色（十六进制）
 */
function getTextColor(backgroundColor: string): string {
  // 预定义的文字颜色选项
  const textColorOptions = [
    '#FFFFFF', // 白色
    '#F3F4F6', // 浅灰色
    '#E5E7EB', // 灰白色
    '#FEFEFE', // 纯白色
    '#000000', // 黑色
    '#1F2937', // 深灰色
    '#111827'  // 更深的灰色
  ];

  // 找出对比度最高的颜色
  let bestColor = '#FFFFFF';
  let bestContrast = 0;

  for (const textColor of textColorOptions) {
    const contrast = getContrastRatio(backgroundColor, textColor);
    if (contrast > bestContrast) {
      bestContrast = contrast;
      bestColor = textColor;
    }
  }

  return bestColor;
}

/**
 * 从网站名称提取缩写文本
 * @param siteName 网站名称
 * @returns 缩写文本
 */
function extractFaviconText(siteName: string): string {
  if (!siteName) return 'S';

  // 先按空格分割，然后再按连字符分割
  const spaceWords = siteName.trim().split(/\s+/);
  const allWords: string[] = [];

  // 处理每个空格分割的部分，如果有连字符则进一步分割
  spaceWords.forEach(word => {
    const hyphenWords = word.split(/[-_]+/);
    allWords.push(...hyphenWords);
  });

  // 过滤掉空字符串
  const words = allWords.filter(word => word.length > 0);

  if (words.length >= 2 && words[0] && words[1]) {
    // 取前两个单词的首字母
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  } else {
    // 只有一个单词，取前两个字母
    const word = words[0];
    if (word) {
      if (word.length >= 2) {
        return word.substring(0, 2).toUpperCase();
      } else {
        return word.charAt(0).toUpperCase();
      }
    } else {
      return "Q";
    }
  }
}

/**
 * 自动生成 favicon（使用 siteName 缩写和主题主色调）
 * @param siteSettings 站点设置
 */
async function generateAutoFavicon(siteSettings: any) {
  try {
    // 获取 siteName 的缩写文本
    const siteName = siteSettings.siteName || 'Site';
    const faviconText = extractFaviconText(siteName);

    // 获取主题主色调
    const themeName = siteSettings.theme?.name || 'default';
    const primaryColor = getThemePrimaryColor(themeName);

    // 根据背景色选择合适的文字颜色
    const textColor = getTextColor(primaryColor);

    console.log(`正在自动生成 favicon，使用 "${faviconText}" 作为图标内容`);
    console.log(`背景色: ${primaryColor} (${themeName}), 文字色: ${textColor}`);

    // 根据文本长度调整字体大小
    const fontSize = faviconText.length === 1 ? 48 : 36;

    // 生成 SVG 内容
    const svgContent = `
      <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="0"
          y="0"
          width="96"
          height="96"
          rx="16"
          fill="${primaryColor}"
        />
        <text
          x="48"
          y="54"
          dominant-baseline="central"
          text-anchor="middle"
          fill="${textColor}"
          font-size="${fontSize}"
          font-family="system-ui, -apple-system, sans-serif"
          font-weight="bold"
        >
          ${faviconText}
        </text>
      </svg>
    `;

    // 使用 sharp 将 SVG 转换为 PNG，然后保存为 ICO
    const svgBuffer = Buffer.from(svgContent);

    // 生成 64x64 的 ICO 文件
    await sharp(svgBuffer)
      .resize(64, 64)
      .toFile(FAVICON_PATH);

    // 生成 180x180 的 Apple Touch Icon PNG 文件
    await sharp(svgBuffer)
      .resize(180, 180)
      .toFile(APPLE_TOUCH_ICON_PATH);

    console.log(`✓ 自动生成的 favicon.ico 已保存: ${FAVICON_PATH}`);
    console.log(`✓ 自动生成的 apple-touch-icon.png 已保存: ${APPLE_TOUCH_ICON_PATH}`);

  } catch (error) {
    console.error('自动生成 favicon 时出错:', error);
    // 不抛出错误，让主流程继续执行
  }
}

/**
 * 打印脚本配置信息
 */
function printScriptConfig() {
  console.log('=== 脚本配置 ===');
  console.log(`请求超时: ${SCRIPT_CONFIG.REQUEST_TIMEOUT}ms`);
  console.log('==================\n');
}

/**
 * 获取所有外部数据并保存到本地文件
 */
async function fetchAndSaveAllData() {
  const startTime = Date.now();

  try {
    console.log('🚀 开始获取所有外部数据...\n');
    printScriptConfig();

    // 获取环境变量
    const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
    if (!projectId) {
      throw new Error('环境变量 NEXT_PUBLIC_PROJECT_ID 未设置');
    }

    // 确保数据目录存在
    if (!fs.existsSync(DATA_DIR_PATH)) {
      fs.mkdirSync(DATA_DIR_PATH, { recursive: true });
    }

    // 并行获取基础数据
    console.log('获取基础数据...');
    const [siteSettings, articleList, games, gameTags, localeSiteSettings, customPages] = await Promise.all([
      fetchFromApi<SiteSettings>("/site-settings", { projectId, skipCache: true }),
      fetchFromApi<ArticlePost[]>("/articles", { projectId, skipCache: true }),
      fetchFromApi<GameDataList>("/games", { projectId, skipCache: true }),
      fetchFromApi<{ locale: string; tags: GameTag[] }[]>("/game-tags", { projectId, skipCache: true }),
      fetchFromApi<ProjectLocaleSiteSetting[]>("/locale-site-settings", { projectId, skipCache: true }),
      fetchFromApi<CustomPage[]>("/custom-pages", { projectId, skipCache: true }).then((pages) => {
        // 将flat的页面列表按sourcePageId聚合
        return aggregateCustomPages(pages);
      }).catch(() => {
        console.log('获取自定义页面失败或接口未实现，使用模拟数据...');
        return []
      })
    ]);

    console.log('基础数据获取完成');

    // 使用文章列表数据（已包含完整内容）
    const completeArticles: ArticlePost[] = articleList || [];
    if (completeArticles.length > 0) {
      console.log(`获取到 ${completeArticles.length} 篇文章数据`);
    } else {
      console.log('文章列表为空');
    }

    console.log('所有数据获取完成');

    // 处理站点设置
    if (siteSettings) {
      // 如果站点设置中有域名，更新 .env.production 文件
      if (siteSettings.domain) {
        updateEnvProductionDomain(siteSettings.domain);
      } else {
        console.log('站点设置中未找到域名，跳过 .env.production 更新');
      }

      // 生成 ads.txt 文件
      if (siteSettings.adsTxtContent !== undefined) {
        generateAdsTxtFile(siteSettings.adsTxtContent);
      } else {
        console.log('站点设置中未找到 ads.txt 内容，跳过 ads.txt 文件生成');
      }

      // 生成广告组件
      if (siteSettings.adsSettings) {
        generateAdComponents(siteSettings.adsSettings);
        generateAdComponentsIndex();
      } else {
        console.log('站点设置中未找到广告配置，生成空的广告组件');
        generateAdComponents([]);
        generateAdComponentsIndex();
      }

      // 生成 favicon
      await generateFavicon(siteSettings);

      // 保存站点设置到 config 目录
      await saveSiteSettingsToConfig(siteSettings);
    }

    // 保存文章数据
    if (completeArticles && completeArticles.length > 0) {
      await saveDataToFile('articles', completeArticles);
      console.log(`已保存 ${completeArticles.length} 篇文章数据`);
    } else {
      console.log('没有文章数据需要保存');
      // 保存空数组以确保文件存在
      await saveDataToFile('articles', []);
    }

    if (games && siteSettings) {
      // 按语言拆分游戏数据
      const supportedLocales = siteSettings.supportedLocales || ['en'];
      await saveGamesByLocale(games, supportedLocales);
    }

    if (gameTags) {
      await saveDataToFile('gameTags', gameTags);
    }

    if (localeSiteSettings) {
      await saveDataToFile('localeSiteSettings', localeSiteSettings);
    }
    const appLocaleDir = path.resolve(process.cwd(), 'app/[locale]');
    const homeGeneratedDir = path.join(appLocaleDir, '(public)/__generated__/home');

    // 清理旧的首页生成文件
    if (fs.existsSync(homeGeneratedDir)) {
      fs.rmSync(homeGeneratedDir, { recursive: true, force: true });
      console.log(`已清理旧的首页目录: ${homeGeneratedDir}`);
    }
    // 生成自定义页面MDX文件
    if (customPages && siteSettings) {
      const supportedLocales = siteSettings.supportedLocales || ['en'];
      await generateCustomPagesMDX(customPages, supportedLocales, siteSettings);
      console.log(`已生成 ${customPages.length} 个自定义页面包`);
    } else {
      console.log('没有自定义页面数据或站点设置缺失，跳过自定义页面生成');
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('\n🎉 所有数据已保存完成！');
    console.log('=== 获取统计 ===');
    console.log(`站点设置: ${siteSettings ? '✓' : '✗'}`);
    console.log(`文章数据: ${completeArticles.length} 篇`);
    console.log(`游戏数据: ${games ? (Array.isArray(games) ? games.length : '已获取') : '✗'}`);
    console.log(`游戏标签: ${gameTags ? gameTags.length : 0} 个语言`);
    console.log(`本地化设置: ${localeSiteSettings ? localeSiteSettings.length : 0} 项`);
    console.log(`总耗时: ${duration} 秒`);
    console.log('==================');
  } catch (error) {
    console.error('❌ 获取或保存数据时出错:', error);
    process.exit(1);
  }
}

/**
 * 按语言拆分游戏数据并保存
 * @param games 游戏数据列表
 * @param supportedLocales 支持的语言列表
 */
async function saveGamesByLocale(games: GameDataList, supportedLocales: string[]) {
  try {
    // 为每种语言创建对应的游戏数据文件
    for (const locale of supportedLocales) {
      const localeGames = games.find(item => item.locale === locale)?.data || [];
      const processedData = nullToUndefined(localeGames);
      const dataJson = JSON.stringify(processedData, jsonReplacer, 2);
      const filePath = path.join(DATA_DIR_PATH, `games-${locale}.json`);
      fs.writeFileSync(filePath, dataJson, 'utf8');
      console.log(`${locale} 语言游戏数据已保存到: ${filePath} (${localeGames.length} 个游戏)`);
    }
  } catch (error) {
    console.error('按语言保存游戏数据时出错:', error);
  }
}

/**
 * 将数据保存到本地文件
 * @param dataType 数据类型
 * @param data 数据内容
 */
async function saveDataToFile(dataType: string, data: any) {
  try {
    // 将null值转换为undefined
    const processedData = nullToUndefined(data);

    // 生成纯净的JSON数据
    const dataJson = JSON.stringify(processedData, jsonReplacer, 2);

    // 生成JSON文件路径
    const filePath = path.join(DATA_DIR_PATH, `${dataType}.json`);
    fs.writeFileSync(filePath, dataJson, 'utf8');
    console.log(`${dataType} 数据已保存到: ${filePath}`);
  } catch (error) {
    console.error(`保存 ${dataType} 数据时出错:`, error);
  }
}

/**
 * 将站点设置保存到config目录
 * @param siteSettings 站点设置数据
 */
async function saveSiteSettingsToConfig(siteSettings: any) {
  try {
    // 将null值转换为undefined
    const processedSettings = nullToUndefined(siteSettings);

    // 生成配置文件内容
    const fileContent = generateConfigFileContent(processedSettings);

    // 确保目录存在
    const dirPath = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 写入配置文件
    fs.writeFileSync(CONFIG_FILE_PATH, fileContent, 'utf8');

    console.log(`站点设置已保存到: ${CONFIG_FILE_PATH}`);
  } catch (error) {
    console.error('保存站点设置时出错:', error);
  }
}

/**
 * 生成配置文件内容
 * @param siteSettings 站点设置对象
 * @returns 配置文件内容字符串
 */
function generateConfigFileContent(siteSettings: any): string {
  // 使用自定义的replacer函数，将null转换为undefined
  const settingsJson = JSON.stringify(siteSettings, jsonReplacer, 2)
    // 将JSON中的null替换为undefined
    .replace(/"([^"]+)":\s*null/g, '"$1": undefined');

  return `/**
 * 站点设置配置文件
 * 该文件由构建脚本自动生成，请勿手动修改
 * 生成时间: ${new Date().toISOString()}
 */

import { SiteSettings } from '@/lib/types';

/**
 * 站点设置
 * 这些设置在构建时从API获取，并保存到此文件中
 * 在运行时可以直接使用，无需再次请求API
 */
export const siteSettings: SiteSettings = ${settingsJson};

export default siteSettings;
`;
}

/**
 * 将平面的CustomPage列表按sourcePageId聚合
 * @param pages CustomPage列表
 * @returns 聚合后的CustomPageList
 */
function aggregateCustomPages(pages: CustomPage[]): CustomPageList {
  if (!pages || pages.length === 0) {
    return [];
  }

  const bundledMap = new Map<string, CustomPageBundle>();

  pages.forEach((page) => {
    const sourcePageId = page.sourcePageId || page.id;
    if (!bundledMap.has(sourcePageId)) {
      bundledMap.set(sourcePageId, {
        sourcePageId,
        slug: page.slug,
        pageType: page.pageType,
        locales: [],
      });
    }

    const bundle = bundledMap.get(sourcePageId)!;
    bundle.locales.push({
      id: page.id,
      content: page.content,
      locale: page.locale,
      sourcePageId,
      title: page.title,
      isHomePage:page.isHomePage,
      description: page.description || undefined,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    });
  });

  return Array.from(bundledMap.values());
}

/**
 * 验证slug规范
 * @param slug slug字符串
 * @returns 是否符合规范
 */
function validateSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * 生成自定义页面的front matter
 * @param pageBundle 页面bundle
 * @param localeData 指定语言的页面数据
 * @returns front matter字符串
 */
function generateFrontMatter(pageBundle: CustomPageBundle, localeData: any): string {
  const frontMatter = {
    title: localeData.title,
    description: localeData.description || '',
    showNavigation: localeData.showNavigation !== false,
    showFooter: localeData.showFooter !== false,
  };

  let yamlContent = '---\n';
  for (const [key, value] of Object.entries(frontMatter)) {
    if (typeof value === 'string') {
      yamlContent += `${key}: "${value.replace(/"/g, '\\"')}"\n`;
    } else {
      yamlContent += `${key}: ${value}\n`;
    }
  }
  yamlContent += '---\n\n';

  return yamlContent;
}

/**
 * 生成自定义页面MDX文件
 * @param customPages 自定义页面列表
 * @param supportedLocales 支持的语言列表
 * @param siteSettings 站点设置（用于获取默认语言）
 */
async function generateCustomPagesMDX(customPages: CustomPageList, supportedLocales: string[], siteSettings: SiteSettings) {
  try {
    if (!customPages || customPages.length === 0) {
      console.log('没有自定义页面数据需要生成');
      return;
    }

    const appLocaleDir = path.resolve(process.cwd(), 'app/[locale]');
    const homeGeneratedDir = path.join(appLocaleDir, '(public)/__generated__/home');

    // 清理旧的首页生成文件
    if (fs.existsSync(homeGeneratedDir)) {
      fs.rmSync(homeGeneratedDir, { recursive: true, force: true });
      console.log(`已清理旧的首页目录: ${homeGeneratedDir}`);
    }

    // 处理每个页面
    for (const pageBundle of customPages) {
      const defaultLocalPage = pageBundle.locales.find((l)=>l.locale===siteSettings.defaultLocale)
      // 验证slug
      if (!validateSlug(pageBundle.slug)) {
        console.warn(`⚠️  跳过无效slug的页面: ${pageBundle.slug}`);
        continue;
      }
      // 判断默认页面
      if (defaultLocalPage && defaultLocalPage.isHomePage) {
        // 处理首页 - 在page.tsx中直接使用MDX内容
        console.log(`处理首页 MDX 内容`);
        if (!fs.existsSync(homeGeneratedDir)) {
          fs.mkdirSync(homeGeneratedDir, { recursive: true });
        }

        // 为每种语言生成MDX文件供首页page.tsx读取
        for (const locale of supportedLocales) {
          const localeData = pageBundle.locales.find((l) => l.locale === locale);
          if (localeData) {
            const mdxContent = generateFrontMatter(pageBundle, localeData) + localeData.content;
            const mdxFilePath = path.join(homeGeneratedDir, `${locale}.mdx`);
            fs.writeFileSync(mdxFilePath, mdxContent, 'utf8');
            console.log(`✓ 生成首页MDX文件: ${mdxFilePath}`);
          }
        }
        console.log(`✓ 首页MDX文件已生成，可在 page.tsx 中使用 getHomeMdx() 读取`);
      } else {
        // 处理普通自定义页面 - 根据slug直接写入到app/[locale]下
        console.log(`处理自定义页面: ${pageBundle.slug}`);

        // 构建完整的页面路径 (根据slug分层)
        const slugParts = pageBundle.slug.split('/').filter(Boolean);
        let pageDir = appLocaleDir;

        // 如果slug包含多个层级，按层级创建目录
        for (const slugPart of slugParts) {
          pageDir = path.join(pageDir, slugPart);
        }

        if (!fs.existsSync(pageDir)) {
          fs.mkdirSync(pageDir, { recursive: true });
        }

        // 为每种语言生成MDX文件
        for (const locale of supportedLocales) {
          const localeData = pageBundle.locales.find((l) => l.locale === locale);
          if (localeData) {
            const mdxContent = generateFrontMatter(pageBundle, localeData) + localeData.content;
            const mdxFilePath = path.join(pageDir, `${locale}.mdx`);
            fs.writeFileSync(mdxFilePath, mdxContent, 'utf8');
            console.log(`✓ 生成页面MDX文件: ${mdxFilePath}`);
          }
        }

        // 生成page.tsx模板（如果不存在则生成）
        const pageTsxPath = path.join(pageDir, 'page.tsx');
        if (!fs.existsSync(pageTsxPath)) {
          const pageTsxContent = `import { MdxArticle } from '@/lib/components/common/MdxArticle';
import { getCustomPageMdx } from '@/lib/services/custom-pages';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh-TW' }];
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const mdxData = await getCustomPageMdx('${pageBundle.slug}', locale);

  if (!mdxData) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <MdxArticle mdxData={mdxData} />
    </main>
  );
}
`;
          fs.writeFileSync(pageTsxPath, pageTsxContent, 'utf8');
          console.log(`✓ 生成页面模板: ${pageTsxPath}`);
        } else {
          console.log(`✓ 页面模板已存在，跳过生成: ${pageTsxPath}`);
        }
      }
    }

    console.log(`\n✓ 自定义页面MDX文件生成完成！`);
  } catch (error) {
    console.error('生成自定义页面MDX文件时出错:', error);
  }
}


// 执行主函数
fetchAndSaveAllData();
