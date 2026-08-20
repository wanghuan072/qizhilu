#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 可用的主题列表
 */
const AVAILABLE_THEMES = [
  "default",
  "green",
  "scheme1",
  "scheme2",
  "scheme3",
  "scheme4",
  "scheme5",
  "scheme6",
];

/**
 * 主题文件映射
 */
const THEME_FILES = {
  default: "../../lib/themes/default-theme.css",
  green: "../../lib/themes/green-theme.css",
  scheme1: "../../lib/themes/scheme1-theme.css", // 深邃蓝
  scheme2: "../../lib/themes/scheme2-theme.css", // 赛博朋克
  scheme3: "../../lib/themes/scheme3-theme.css", // 暗夜模式
  scheme4: "../../lib/themes/scheme4-theme.css", // 活力橙
  scheme5: "../../lib/themes/scheme5-theme.css", // 森林绿
  scheme6: "../../lib/themes/scheme6-theme.css", // 霓虹粉
};

/**
 * 默认字体配置
 */
const DEFAULT_FONTS = {
  sans: "Plus Jakarta Sans, sans-serif",
  serif: "Source Serif 4, serif",
  mono: "JetBrains Mono, monospace",
};

/**
 * 可用字体映射表
 */
const AVAILABLE_FONTS = {
  // 无衬线字体
  "Plus Jakarta Sans": "Plus Jakarta Sans, sans-serif",
  "Inter": "Inter, sans-serif",
  "Roboto": "Roboto, sans-serif",
  "Open Sans": "Open Sans, sans-serif",
  "Montserrat": "Montserrat, sans-serif",
  "Exo 2": "Exo 2, sans-serif",
  "Rajdhani": "Rajdhani, sans-serif",
  "Barlow": "Barlow, sans-serif",
  "Noto Sans SC": "Noto Sans SC, sans-serif",
  "DotGothic16": "DotGothic16, sans-serif",
  "ZCOOL KuaiLe": "ZCOOL KuaiLe, sans-serif",
  "Potta One": "Potta One, sans-serif",

  // 衬线字体
  "Source Serif 4": "Source Serif 4, serif",
  "Lora": "Lora, serif",
  "Merriweather": "Merriweather, serif",
  "Play": "Play, serif",
  "Sora": "Sora, serif",
  "Chakra Petch": "Chakra Petch, serif",
  "Audiowide": "Audiowide, serif",
  "Noto Serif SC": "Noto Serif SC, serif",
  "Yuji Mai": "Yuji Mai, serif",
  "Reggae One": "Reggae One, serif",

  // 等宽字体
  "JetBrains Mono": "JetBrains Mono, monospace",
  "Fira Code": "Fira Code, monospace",
  "Source Code Pro": "Source Code Pro, monospace",
  "Roboto Mono": "Roboto Mono, monospace",
  "Space Mono": "Space Mono, monospace",
  "IBM Plex Mono": "IBM Plex Mono, monospace",
  "Share Tech Mono": "Share Tech Mono, monospace",
};

/**
 * 字体CDN URL映射表
 */
const FONT_CDN_URLS = {
  // 原有字体
  "Plus Jakarta Sans": "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
  "Source Serif 4": "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600;700&display=swap",
  "JetBrains Mono": "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap",
  "Noto Sans SC": "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap",
  "Noto Serif SC": "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700&display=swap",
  "Inter": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "Roboto": "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
  "Open Sans": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap",
  "Merriweather": "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
  "Lora": "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap",
  "Fira Code": "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap",
  "Source Code Pro": "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&display=swap",
  "Roboto Mono": "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap",

  // 新增游戏网站字体
  "Montserrat": "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
  "Exo 2": "https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700&display=swap",
  "Rajdhani": "https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap",
  "Barlow": "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&display=swap",
  "Play": "https://fonts.googleapis.com/css2?family=Play:wght@400;700&display=swap",
  "Sora": "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap",
  "Chakra Petch": "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap",
  "Audiowide": "https://fonts.googleapis.com/css2?family=Audiowide&display=swap",
  "Space Mono": "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap",
  "IBM Plex Mono": "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap",
  "Share Tech Mono": "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap",

  // 新增特色字体
  "DotGothic16": "https://fonts.googleapis.com/css2?family=DotGothic16&display=swap",
  "ZCOOL KuaiLe": "https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap",
  "Potta One": "https://fonts.googleapis.com/css2?family=Potta+One&display=swap",
  "Yuji Mai": "https://fonts.googleapis.com/css2?family=Yuji+Mai&display=swap",
  "Reggae One": "https://fonts.googleapis.com/css2?family=Reggae+One&display=swap",
};

/**
 * 读取站点设置配置
 */
function loadSiteSettings() {
  try {
    const projectRoot = path.resolve(__dirname, '..');
    const siteSettingsPath = path.join(projectRoot, 'lib', 'config', 'siteSettings.ts');

    if (!fs.existsSync(siteSettingsPath)) {
      console.error('❌ 站点设置文件不存在:', siteSettingsPath);
      return null;
    }

    // 读取文件内容
    const content = fs.readFileSync(siteSettingsPath, 'utf8');

    // 简单的正则表达式提取配置对象
    const match = content.match(/export const siteSettings:\s*\w+\s*=\s*({[\s\S]*?})\s*;\s*(?:export|$)/);
    if (!match) {
      console.error('❌ 无法解析站点设置文件，找不到export const siteSettings:');
      return null;
    }

    // 使用eval解析配置对象（注意：这在生产环境中不安全，但在构建脚本中可以接受）
    const configStr = match[1];
    const siteSettings = eval('(' + configStr + ')');

    return siteSettings;
  } catch (error) {
    console.error('❌ 读取站点设置失败:', error.message);
    return null;
  }
}

/**
 * 生成主题CSS文件
 */
function generateThemeFile(theme) {
  const projectRoot = path.resolve(__dirname, '..');
  const themeImportPath = path.join(projectRoot, 'app', '[locale]', 'current-theme.css');

  // 获取主题配置，如果没有则使用默认主题
  const themeName = theme?.name && AVAILABLE_THEMES.includes(theme.name) ? theme.name : "default";

  // 获取对应的主题文件
  const themeFile = THEME_FILES[themeName];

  // 生成主题导入文件内容
  const themeImportContent = `/*
 * 自动生成的主题导入文件
 * 主题: ${themeName}
 * 文件: ${themeFile}
 */
@import '${themeFile}';
`;

  try {
    // 确保目录存在
    const dir = path.dirname(themeImportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(themeImportPath, themeImportContent);
    console.log(`✅ 主题文件已生成: ${path.relative(projectRoot, themeImportPath)}`);
    console.log(`   使用主题: ${themeName} (${themeFile})`);
  } catch (error) {
    console.error(`❌ 生成主题文件失败: ${error.message}`);
  }
}

/**
 * 生成字体CSS文件
 */
function generateFontFile(fonts) {
  const projectRoot = path.resolve(__dirname, '..');
  const fontThemePath = path.join(projectRoot, 'app', '[locale]', 'font-theme.css');

  try {
    // 确定最终使用的字体名称
    const sansFontName = fonts?.sans && AVAILABLE_FONTS[fonts.sans]
      ? fonts.sans
      : "Plus Jakarta Sans";

    const serifFontName = fonts?.serif && AVAILABLE_FONTS[fonts.serif]
      ? fonts.serif
      : "Source Serif 4";

    const monoFontName = fonts?.mono && AVAILABLE_FONTS[fonts.mono]
      ? fonts.mono
      : "JetBrains Mono";

    // 获取对应的字体族字符串
    const sansFont = AVAILABLE_FONTS[sansFontName];
    const serifFont = AVAILABLE_FONTS[serifFontName];
    const monoFont = AVAILABLE_FONTS[monoFontName];

    // 收集需要导入的字体URL
    const fontImports = [];
    const fontNames = [sansFontName, serifFontName, monoFontName];

    fontNames.forEach(fontName => {
      const fontUrl = FONT_CDN_URLS[fontName];
      if (fontUrl && !fontImports.includes(fontUrl)) {
        fontImports.push(fontUrl);
      }
    });

    // 生成CSS内容
    let cssContent = '';

    // 添加Google Fonts导入
    if (fontImports.length > 0) {
      cssContent += `/* Google Fonts Import */\n`;
      fontImports.forEach(fontUrl => {
        cssContent += `@import url('${fontUrl}');\n`;
      });
      cssContent += `\n`;
    }

    // 添加CSS变量
    cssContent += `:root {
  --font-sans: ${sansFont};
  --font-serif: ${serifFont};
  --font-mono: ${monoFont};
}

.dark {
  --font-sans: ${sansFont};
  --font-serif: ${serifFont};
  --font-mono: ${monoFont};
}`;

    // 确保目录存在
    const dir = path.dirname(fontThemePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fontThemePath, cssContent);
    console.log(`✅ 字体文件已生成: ${path.relative(projectRoot, fontThemePath)}`);
    console.log(`   Sans字体: ${sansFontName} -> ${sansFont}`);
    console.log(`   Serif字体: ${serifFontName} -> ${serifFont}`);
    console.log(`   Mono字体: ${monoFontName} -> ${monoFont}`);
    if (fontImports.length > 0) {
      console.log(`   已导入 ${fontImports.length} 个Google Fonts`);
    }
  } catch (error) {
    console.error(`❌ 生成字体文件失败: ${error.message}`);
  }
}

/**
 * 删除指定的CSS文件
 */
function deleteFiles() {
  const projectRoot = path.resolve(__dirname, '..');
  const localeDir = path.join(projectRoot, 'app', '[locale]');

  const filesToDelete = [
    path.join(localeDir, 'current-theme.css'),
    path.join(localeDir, 'font-theme.css')
  ];

  console.log('开始删除CSS文件...');

  filesToDelete.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ 已删除: ${path.relative(projectRoot, filePath)}`);
      } else {
        console.log(`⚠️  文件不存在: ${path.relative(projectRoot, filePath)}`);
      }
    } catch (error) {
      console.error(`❌ 删除文件失败: ${path.relative(projectRoot, filePath)}`);
      console.error(`   错误信息: ${error.message}`);
    }
  });

  console.log('CSS文件删除操作完成。');
}

/**
 * 主函数：生成主题和字体文件
 */
function generateConfigFiles() {
  console.log('开始生成配置文件...');

  // 读取站点设置
  const siteSettings = loadSiteSettings();
  if (!siteSettings) {
    console.error('❌ 无法读取站点设置，跳过文件生成');
    return;
  }

  console.log('✅ 站点设置读取成功');

  // 生成主题文件
  if (siteSettings.theme) {
    generateThemeFile(siteSettings.theme);
  } else {
    console.log('⚠️  未找到主题配置，使用默认主题');
    generateThemeFile({ name: 'default' });
  }

  // 生成字体文件
  if (siteSettings.fonts) {
    generateFontFile(siteSettings.fonts);
  } else {
    console.log('⚠️  未找到字体配置，使用默认字体');
    generateFontFile({});
  }

  console.log('配置文件生成完成。');
}

// 执行操作
if (require.main === module) {
  // 先删除旧文件，再生成新文件
  deleteFiles();
  generateConfigFiles();
}

module.exports = {
  deleteFiles,
  generateConfigFiles,
  generateThemeFile,
  generateFontFile,
  loadSiteSettings
};