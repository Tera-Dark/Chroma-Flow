
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'zh';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    'app.name': 'CHROMA FLOW',
    'close': 'Close',
    'cancel': 'Cancel',
    'apply': 'Apply',
    'generate': 'Generate',
    'loading': 'Loading...',
    'dreaming': 'Dreaming...',
    'mode': 'Mode',
    'count': 'Count',
    'layout': 'Layout',
    'hint.space': 'PRESS SPACEBAR TO GENERATE',
    'toast.copied': 'Copied',
    'toast.restored': 'Palette restored from history',
    'toast.css_copied': 'CSS Variables Copied!',
    
    // Sidebar Tooltips
    'tool.generate': 'Generate (Space)',
    'tool.toolkit': 'Toolkit',
    'tool.dashboard': 'Dashboard',
    'tool.undo': 'Undo (Ctrl+Z)',
    'tool.export': 'Export CSS',
    'tool.settings': 'Settings',

    // Toolkit Hub Categories
    'cat.header': 'Categories',
    'cat.all': 'All Tools',
    'cat.gen': 'Generators',
    'cat.analysis': 'Analysis',
    'cat.design': 'Design',

    // Toolkit Tools
    'tools.ai.title': 'AI Generator',
    'tools.ai.desc': 'Generate palettes from text prompts using Gemini.',
    'tools.img.title': 'Image Extractor',
    'tools.img.desc': 'Extract dominant colors from any image.',
    'tools.contrast.title': 'Contrast Checker',
    'tools.contrast.desc': 'Ensure your palette meets WCAG accessibility standards.',
    'tools.gradient.title': 'Gradient Maker',
    'tools.gradient.desc': 'Create beautiful, interpolation-corrected gradients.',
    'tools.blindness.title': 'Blindness Sim',
    'tools.blindness.desc': 'Simulate how your palette looks to color-blind users.',
    'tools.uiviz.title': 'UI Visualizer',
    'tools.uiviz.desc': 'Preview your palette on a real interface mockup.',

    // Column Actions
    'action.lock': 'Lock color',
    'action.unlock': 'Unlock color',
    'action.copy': 'Copy Hex',
    'action.tune': 'Fine Tune',

    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.language.en': 'English',
    'settings.language.zh': '中文 (Chinese)',
    'settings.about': 'About',
    'settings.desc': 'Chroma Flow is a procedural color palette generator powered by Gemini AI.',

    // AI Generator
    'ai.title': 'AI Palette Generator',
    'ai.desc': 'Describe a mood, a scene, or a theme. Gemini will create a harmonious palette for you.',
    'ai.placeholder': "e.g., 'Cyberpunk neon city in the rain', 'Pastel french bakery', 'Deep forest mushroom vibes'...",
    'ai.error': 'Failed to generate palette. Try a different description.',

    // Image Extractor
    'img.title': 'Image to Palette',
    'img.desc': 'Upload an image to automatically extract its dominant color palette.',
    'img.click_upload': 'Click to upload image',
    'img.error': 'Could not extract colors.',

    // Dashboard
    'dash.title': 'Dashboard',
    'dash.subtitle': 'Chroma Flow OS',
    'dash.tab.guide': 'User Guide',
    'dash.tab.history': 'History',
    'dash.tab.analytics': 'Analytics',
    
    // Guide
    'guide.title': 'How to use',
    'guide.subtitle': 'Master the art of procedural color generation.',
    'guide.gen.title': 'Generate',
    'guide.gen.desc': 'Press Spacebar to instantly generate a new palette based on your selected harmony mode.',
    'guide.lock.title': 'Lock Colors',
    'guide.lock.desc': 'Click the lock icon on any color to preserve it while regenerating the others.',
    'guide.drag.title': 'Reorder',
    'guide.drag.desc': 'Drag and drop columns using the handle at the top to rearrange your palette sequence.',
    'guide.tune.title': 'Fine Tune',
    'guide.tune.desc': 'Click the sliders icon to open the HSL editor for precise color adjustments.',
    'guide.shortcuts': 'Shortcuts',

    // History
    'history.title': 'Timeline',
    'history.desc': 'Restore your previously generated palettes.',
    'history.restore': 'Restore',
    'history.empty': 'No history yet. Start generating!',

    // Analytics
    'analytics.title': 'Luminance Analysis',
    'analytics.desc': 'Visualizing brightness distribution across your current palette.',
    'analytics.avg': 'Avg Luminance',
    'analytics.contrast': 'Contrast Ratio',
    'analytics.mode': 'Mode',

    // Harmony Modes
    'harmony.Random': 'Random',
    'harmony.Analogous': 'Analogous',
    'harmony.Monochromatic': 'Monochromatic',
    'harmony.Triadic': 'Triadic',
    'harmony.Complementary': 'Complementary',

    // Layout Modes
    'layout.Horizontal': 'Horizontal',
    'layout.Vertical': 'Vertical',
  },
  zh: {
    // General
    'app.name': '流光配色',
    'close': '关闭',
    'cancel': '取消',
    'apply': '应用',
    'generate': '生成',
    'loading': '加载中...',
    'dreaming': '构思中...',
    'mode': '模式',
    'count': '数量',
    'layout': '布局',
    'hint.space': '按空格键生成',
    'toast.copied': '已复制',
    'toast.restored': '已从历史记录恢复',
    'toast.css_copied': 'CSS 变量已复制！',
    
    // Sidebar Tooltips
    'tool.generate': '生成配色 (空格)',
    'tool.toolkit': '工具箱',
    'tool.dashboard': '仪表盘',
    'tool.undo': '撤销 (Ctrl+Z)',
    'tool.export': '导出 CSS',
    'tool.settings': '设置',

    // Toolkit Hub Categories
    'cat.header': '工具分类',
    'cat.all': '全部工具',
    'cat.gen': '生成器',
    'cat.analysis': '分析工具',
    'cat.design': '设计辅助',

    // Toolkit Tools
    'tools.ai.title': 'AI 生成器',
    'tools.ai.desc': '通过文字描述，让 Gemini 为您生成配色。',
    'tools.img.title': '图片取色',
    'tools.img.desc': '从任何图片中提取主色调。',
    'tools.contrast.title': '对比度检查',
    'tools.contrast.desc': '确保您的配色符合 WCAG 无障碍标准。',
    'tools.gradient.title': '渐变生成器',
    'tools.gradient.desc': '创建美观、平滑插值的渐变色。',
    'tools.blindness.title': '色盲模拟',
    'tools.blindness.desc': '模拟色盲用户眼中的配色效果。',
    'tools.uiviz.title': 'UI 预览',
    'tools.uiviz.desc': '在真实的界面模版上预览您的配色方案。',

    // Column Actions
    'action.lock': '锁定颜色',
    'action.unlock': '解锁颜色',
    'action.copy': '复制色值',
    'action.tune': '微调',

    // Settings
    'settings.title': '设置',
    'settings.language': '语言 / Language',
    'settings.language.en': 'English',
    'settings.language.zh': '中文 (Chinese)',
    'settings.about': '关于',
    'settings.desc': '流光配色 (Chroma Flow) 是一款由 Gemini AI 驱动的程序化配色生成工具。',

    // AI Generator
    'ai.title': 'AI 配色生成器',
    'ai.desc': '描述一种心境、场景或主题，Gemini 将为您创造和谐的配色方案。',
    'ai.placeholder': "例如：'雨中的赛博朋克霓虹城市'，'法式甜品店的柔和色调'，'深林菌菇氛围'...",
    'ai.error': '生成失败，请尝试不同的描述。',

    // Image Extractor
    'img.title': '图片取色',
    'img.desc': '上传图片，自动提取其中的主色调。',
    'img.click_upload': '点击上传图片',
    'img.error': '无法提取颜色。',

    // Dashboard
    'dash.title': '仪表盘',
    'dash.subtitle': '控制中心',
    'dash.tab.guide': '使用指南',
    'dash.tab.history': '历史记录',
    'dash.tab.analytics': '数据分析',
    
    // Guide
    'guide.title': '如何使用',
    'guide.subtitle': '掌握程序化配色生成的艺术。',
    'guide.gen.title': '生成',
    'guide.gen.desc': '按空格键基于当前选择的和谐模式即时生成新配色。',
    'guide.lock.title': '锁定颜色',
    'guide.lock.desc': '点击颜色上的锁图标，在生成时保留该颜色。',
    'guide.drag.title': '排序',
    'guide.drag.desc': '按住顶部的抓手图标拖拽，重新排列颜色顺序。',
    'guide.tune.title': '微调',
    'guide.tune.desc': '点击滑块图标打开 HSL 编辑器进行精确调整。',
    'guide.shortcuts': '快捷键',

    // History
    'history.title': '时间轴',
    'history.desc': '恢复您之前生成的配色方案。',
    'history.restore': '恢复',
    'history.empty': '暂无历史记录，开始生成吧！',

    // Analytics
    'analytics.title': '亮度分析',
    'analytics.desc': '可视化当前配色的亮度分布情况。',
    'analytics.avg': '平均亮度',
    'analytics.contrast': '对比度',
    'analytics.mode': '模式',

     // Harmony Modes
    'harmony.Random': '随机',
    'harmony.Analogous': '类比色',
    'harmony.Monochromatic': '单色系',
    'harmony.Triadic': '三角色',
    'harmony.Complementary': '互补色',

    // Layout Modes
    'layout.Horizontal': '横向',
    'layout.Vertical': '竖向',
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to English or check local storage
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('chroma_lang');
    return (saved === 'en' || saved === 'zh') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('chroma_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
