/**
 * 广告组件自动生成器
 * 根据广告设置自动生成对应的React组件
 */

import * as fs from 'fs';
import * as path from 'path';
import { AdSettings } from '@/lib/types';

// 广告组件输出目录
const ADS_COMPONENTS_DIR = path.resolve(process.cwd(), 'lib/components/ads');

// 模板文件路径
const AD_COMPONENT_TEMPLATE = path.resolve(process.cwd(), 'scripts/templates/ad-component-template.txt');
const EMPTY_COMPONENT_TEMPLATE = path.resolve(process.cwd(), 'scripts/templates/empty-component-template.txt');

// 广告位置到组件名称的映射
const POSITION_TO_COMPONENT: Record<string, string> = {
  'game_page_header_top': 'GamePageHeaderTopSlot',
  'game_area_bottom': 'GameAreaBottomSlot',
  'content_middle_banner': 'ContentMiddleBannerSlot',
  'all_games_top_banner': 'AllGamesTopBannerSlot',
  'all_games_bottom_banner': 'AllGamesBottomBannerSlot',
  'comments_top': 'CommentsTopSlot',
  'comments_bottom': 'CommentsBottomSlot',
  'sidebar_top': 'SidebarTopSlot',
  'sidebar_middle': 'SidebarMiddleSlot',
  'sidebar_bottom': 'SidebarBottomSlot',
  'all_games_content_right_top': 'AllGamesContentRightTopSlot',
  'all_games_content_right_bottom': 'AllGamesContentRightBottomSlot',
  'all_games_mobile_vertical': 'AllGamesMobileVerticalSlot',
  'all_games_sidebar_top': 'AllGamesSidebarTopSlot',
  'all_games_sidebar_bottom': 'AllGamesSidebarBottomSlot',
  'home_top_banner': 'HomeTopBannerSlot',
  'home_middle_banner': 'HomeMiddleBannerSlot',
  'modal_ad': 'ModalAdSlot',
  'article_top_banner': 'ArticleTopBannerSlot',
  'article_bottom_banner': 'ArticleBottomBannerSlot',
};

// 广告位置到CSS类名的映射
const POSITION_TO_CSS_CLASSES: Record<string, string> = {
  'game_page_header_top': 'mt-4 z-20 relative w-full [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'game_area_bottom': 'mt-4 z-20 relative w-full [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto lg:block hidden',
  'content_middle_banner': 'mt-4 z-20 relative w-full [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'all_games_top_banner': 'mt-4 z-20 relative w-full [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'all_games_bottom_banner': 'mt-4 z-20 relative w-full [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'comments_top': 'mt-4 z-20 relative w-full min-w-[300px] [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'comments_bottom': 'mt-4 z-20 relative w-full min-w-[300px] [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'sidebar_top': 'mt-4 z-20 relative w-full min-w-[300px] [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'sidebar_middle': 'mt-4 z-20 relative w-full min-w-[300px] [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'sidebar_bottom': 'mt-4 z-20 relative w-full min-w-[300px] [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'all_games_content_right_top': 'mt-4 z-20 relative w-full min-w-[300px] [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'all_games_content_right_bottom': 'mt-4 z-20 relative w-full min-w-[300px] [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'all_games_mobile_vertical': 'mt-4 z-20 relative w-full [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'all_games_sidebar_top': 'mt-4 z-20 relative w-full min-w-[300px] [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'all_games_sidebar_bottom': 'mt-4 z-20 relative w-full min-w-[300px] [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'home_top_banner': 'mt-4 z-20 relative w-full [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'home_middle_banner': 'mt-4 z-20 relative w-full [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'modal_ad': 'mt-4 z-20 relative w-full min-w-[300px] [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'article_top_banner': 'mt-4 z-20 relative w-full [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
  'article_bottom_banner': 'mt-4 z-20 relative w-full [&_.adsbygoogle]:!min-h-0 [&_.adsbygoogle]:!h-auto',
};

// 广告位置描述
const POSITION_DESCRIPTIONS: Record<string, string> = {
  'game_page_header_top': '游戏页面头部顶部广告位',
  'game_area_bottom': '游戏区域底部广告位',
  'content_middle_banner': '内容区域中部横幅广告位',
  'all_games_top_banner': '所有游戏页面顶部横幅广告位',
  'all_games_bottom_banner': '所有游戏页面底部横幅广告位',
  'comments_top': '评论区顶部广告位',
  'comments_bottom': '评论区底部广告位',
  'sidebar_top': '侧边栏顶部广告位',
  'sidebar_middle': '侧边栏中部广告位',
  'sidebar_bottom': '侧边栏底部广告位',
  'all_games_content_right_top': '所有游戏页面内容右侧顶部广告位',
  'all_games_content_right_bottom': '所有游戏页面内容右侧底部广告位',
  'all_games_mobile_vertical': '所有游戏页面移动端垂直广告位',
  'all_games_sidebar_top': '所有游戏页面侧边栏顶部广告位',
  'all_games_sidebar_bottom': '所有游戏页面侧边栏底部广告位',
  'home_top_banner': '首页顶部横幅广告位',
  'home_middle_banner': '首页中部横幅广告位',
  'modal_ad': '游戏开始前弹窗广告位',
  'article_top_banner': '文章页面顶部横幅广告位',
  'article_bottom_banner': '文章页面底部横幅广告位',
};

/**
 * 将广告位置字符串转换为PascalCase组件名
 */
function toComponentName(position: string): string {
  return POSITION_TO_COMPONENT[position] ||
    position.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('') + 'Slot';
}

/**
 * 读取模板文件内容
 */
function readTemplate(templatePath: string): string {
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`读取模板文件失败: ${templatePath}`, error);
    throw error;
  }
}

/**
 * 替换模板中的占位符
 */
/**
 * 处理广告代码，根据广告类型进行相应处理
 */
function processAdCode(adCode: string, adType: string, position: string): string {
  let cleanedCode = adCode.trim();

  if (adType === 'adsense' && position !== 'modal_ad') {
    // 对于 AdSense，移除脚本标签（因为由组件统一管理）
    cleanedCode = cleanedCode
      .replace(/<script[^>]*src="[^"]*adsbygoogle[^"]*"[^>]*><\/script>/gi, '')
      .replace(/<script[^>]*>\s*\(adsbygoogle[^)]*\)[^;]*;?\s*<\/script>/gi, '')
      .replace(/<script[^>]*>\s*window\.adsbygoogle[^>]*><\/script>/gi, '')
      .trim();
  }
  // 对于第三方广告，保持原始代码不变，让它们自己处理脚本加载

  return cleanedCode;
}

function replaceTemplateVariables(
  template: string,
  componentName: string,
  description: string,
  adCode: string,
  adType: string,
  cssClasses: string,
  position: string
): string {
  const processedAdCode = processAdCode(adCode, adType, position);

  let result = template
    .replace(/{{COMPONENT_NAME}}/g, componentName)
    .replace(/{{DESCRIPTION}}/g, description)
    .replace(/{{AD_CODE}}/g, processedAdCode)
    .replace(/{{CSS_CLASSES}}/g, cssClasses)
    .replace(/{{GENERATED_AT}}/g, new Date().toISOString());

  // 为弹窗广告设置特殊的延迟时间
  if (position === 'modal_ad') {
    // 将默认的2000ms延迟改为500ms
    result = result.replace('setTimeout(loadAd, 2000)', 'setTimeout(loadAd, 500)');
  }

  return result;
}

/**
 * 生成单个广告组件
 */
function generateAdComponent(
  position: string,
  adSettings: AdSettings | null,
  template: string,
  emptyTemplate: string
): void {
  const componentName = toComponentName(position);
  const description = POSITION_DESCRIPTIONS[position] || `${position} 广告位`;
  const cssClasses = POSITION_TO_CSS_CLASSES[position] || 'mt-4 z-20 relative';

  let componentContent: string;

  if (adSettings && adSettings.enabled && adSettings.codeText) {
    // 生成有广告的组件
    const adType = adSettings.type || 'adsense'; // 默认为 adsense
    componentContent = replaceTemplateVariables(
      template,
      componentName,
      description,
      adSettings.codeText,
      adType,
      cssClasses,
      position
    );
    console.log(`✓ 生成广告组件: ${componentName} (类型: ${adType})`);
  } else {
    // 生成空组件
    componentContent = replaceTemplateVariables(
      emptyTemplate,
      componentName,
      description,
      '',
      'empty', // 空组件类型
      cssClasses,
      position
    );
    console.log(`✓ 生成空组件: ${componentName} (无广告配置)`);
  }

  // 写入组件文件
  const filePath = path.join(ADS_COMPONENTS_DIR, `${componentName}.tsx`);
  fs.writeFileSync(filePath, componentContent, 'utf8');
}

/**
 * 确保广告组件目录存在
 */
function ensureAdsDirectory(): void {
  if (!fs.existsSync(ADS_COMPONENTS_DIR)) {
    fs.mkdirSync(ADS_COMPONENTS_DIR, { recursive: true });
    console.log(`创建广告组件目录: ${ADS_COMPONENTS_DIR}`);
  }
}

/**
 * 清理旧的广告组件
 */
function cleanOldAdComponents(): void {
  try {
    if (fs.existsSync(ADS_COMPONENTS_DIR)) {
      const files = fs.readdirSync(ADS_COMPONENTS_DIR);
      const slotFiles = files.filter(file => file.endsWith('Slot.tsx'));

      for (const file of slotFiles) {
        const filePath = path.join(ADS_COMPONENTS_DIR, file);
        fs.unlinkSync(filePath);
        console.log(`删除旧组件: ${file}`);
      }
    }
  } catch (error) {
    console.error('清理旧广告组件时出错:', error);
  }
}

/**
 * 生成所有广告组件
 */
export function generateAdComponents(adsSettings: AdSettings[] = []): void {
  try {
    console.log('\n🎯 开始生成广告组件...');

    // 确保目录存在
    ensureAdsDirectory();

    // 清理旧组件
    cleanOldAdComponents();

    // 读取模板
    const template = readTemplate(AD_COMPONENT_TEMPLATE);
    const emptyTemplate = readTemplate(EMPTY_COMPONENT_TEMPLATE);

    // 获取所有可能的广告位置
    const allPositions = Object.keys(POSITION_TO_COMPONENT);

    // 为每个位置生成组件
    for (const position of allPositions) {
      // 查找对应的广告设置
      const adSetting = adsSettings.find(ad => ad.position === position && ad.enabled) || null;

      generateAdComponent(position, adSetting, template, emptyTemplate);
    }

    console.log(`✓ 广告组件生成完成！共生成 ${allPositions.length} 个组件`);

  } catch (error) {
    console.error('❌ 生成广告组件时出错:', error);
    throw error;
  }
}

/**
 * 生成广告组件的索引文件
 */
export function generateAdComponentsIndex(): void {
  try {
    const allPositions = Object.keys(POSITION_TO_COMPONENT);
    const imports: string[] = [];
    const exports: string[] = [];

    // 生成导入语句
    for (const position of allPositions) {
      const componentName = toComponentName(position);
      imports.push(`import ${componentName} from './${componentName}';`);
      exports.push(`  ${componentName},`);
    }

    const indexContent = `/**
 * 广告组件统一导出文件
 * 自动生成，请勿手动修改
 * 生成时间: ${new Date().toISOString()}
 */

${imports.join('\n')}

export {
${exports.join('\n')}
};
`;

    const indexFilePath = path.join(ADS_COMPONENTS_DIR, 'index.ts');
    fs.writeFileSync(indexFilePath, indexContent, 'utf8');
    console.log(`✓ 生成广告组件索引文件: ${indexFilePath}`);

  } catch (error) {
    console.error('❌ 生成广告组件索引文件时出错:', error);
  }
}

// 如果直接运行此脚本，执行广告组件生成
if (require.main === module) {
  try {
    // 从站点设置获取广告配置
    const { siteSettings } = require('../lib/config/siteSettings');
    generateAdComponents(siteSettings.adsSettings || []);
    generateAdComponentsIndex();
    console.log('\n🎉 广告组件生成完成！');
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  }
}
