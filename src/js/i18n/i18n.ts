import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { applyZhPageOverrides } from './zh-page-overrides';

const LANGUAGE_PREFERENCE_KEY = 'i18nextLngPreference';
const LEGACY_LANGUAGE_KEY = 'i18nextLng';

export const supportedLanguages = ['en', 'zh'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  zh: '中文',
};

languageNames.zh = '中文';

export const getLanguageFromUrl = (): SupportedLanguage => {
  const params = new URLSearchParams(window.location.search);
  const queryLanguage = params.get('lang');
  if (isSupportedLanguage(queryLanguage)) return queryLanguage;

  const storedLanguage =
    localStorage.getItem(LANGUAGE_PREFERENCE_KEY) ||
    localStorage.getItem(LEGACY_LANGUAGE_KEY);
  if (isSupportedLanguage(storedLanguage)) return storedLanguage;

  return 'en';
};

let initialized = false;

const isSupportedLanguage = (
  language: string | null
): language is SupportedLanguage => {
  return supportedLanguages.includes(language as SupportedLanguage);
};

export const initI18n = async (): Promise<typeof i18next> => {
  if (initialized) return i18next;

  await i18next.use(HttpBackend).init({
    lng: getLanguageFromUrl(),
    fallbackLng: 'en',
    supportedLngs: supportedLanguages as unknown as string[],
    ns: ['common', 'tools'],
    defaultNS: 'common',
    backend: {
      loadPath: `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}locales/{{lng}}/{{ns}}.json`,
    },
    interpolation: {
      escapeValue: false,
    },
  });

  await i18next.loadNamespaces('tools');
  await i18next.loadLanguages('en');

  initialized = true;
  return i18next;
};

const isBrokenTranslation = (value: string): boolean => {
  return value.includes('?');
};

export const t = (key: string, options?: Record<string, unknown>): string => {
  const translation = i18next.t(key, options);

  if (
    typeof translation === 'string' &&
    i18next.language !== 'en' &&
    isBrokenTranslation(translation)
  ) {
    const fallback = i18next.getFixedT('en')(key, options);
    if (typeof fallback === 'string') return fallback;
  }

  return translation;
};

export const changeLanguage = (lang: SupportedLanguage): void => {
  localStorage.setItem(LANGUAGE_PREFERENCE_KEY, lang);
  localStorage.setItem(LEGACY_LANGUAGE_KEY, lang);
  void i18next.changeLanguage(lang).then(() => {
    applyTranslations();
    window.dispatchEvent(
      new CustomEvent('localpdfkit:language-changed', { detail: { lang } })
    );
    window.location.reload();
  });
};

export const applyTranslations = (): void => {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      const translation = t(key);
      if (translation && translation !== key) {
        element.textContent = translation;
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key && element instanceof HTMLInputElement) {
      const translation = t(key);
      if (translation && translation !== key) {
        element.placeholder = translation;
      }
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const key = element.getAttribute('data-i18n-title');
    if (key) {
      const translation = t(key);
      if (translation && translation !== key) {
        (element as HTMLElement).title = translation;
      }
    }
  });

  const language = isSupportedLanguage(i18next.language)
    ? i18next.language
    : 'en';
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.documentElement.dir = 'ltr';

  applyPageMetadataTranslations(language);
  autoTranslateStaticText(language);
  applyZhPageOverrides(language);
  observeDynamicTranslations(language);
};

const flattenResourceEntries = (
  value: unknown,
  prefix = '',
  out: Record<string, string> = {}
): Record<string, string> => {
  if (typeof value === 'string') {
    out[prefix] = value;
    return out;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return out;
  }

  Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
    flattenResourceEntries(child, prefix ? `${prefix}.${key}` : key, out);
  });

  return out;
};

const toLooseTitleCase = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
};

const extraZhStaticTranslations: Record<string, string> = {
  'Workflow Hub': '工作流中心',
  'Start with the PDF task, not the tool name':
    '从 PDF 任务开始，而不是从工具名称开始',
  'Use these workflow paths to move from a real document problem to the right LocalPDFKit tools, step-by-step tutorials, and follow-up cleanup actions.':
    '这些工作流路径会从真实文档问题出发，带你找到合适的 LocalPDFKit 工具、分步教程和后续清理动作。',
  'Share-ready PDF': '适合分享的 PDF',
  'Prepare a PDF for email, upload, or client delivery':
    '将 PDF 准备好用于邮件、上传或客户交付',
  'Use this path when a document is too large, has extra pages, or needs a cleaner final order before you send it.':
    '当文档过大、包含多余页面，或在发送前需要整理成更清晰的顺序时，使用这条路径。',
  'Compression guide': '压缩教程',
  'Page cleanup guide': '页面清理教程',
  'Metadata guide': '元数据教程',
  'Combine and reorder': '合并和重新排序',
  'Build one clean PDF from several sources': '从多个来源整理出一份干净的 PDF',
  'Use this path when reports, scans, forms, or attachments need to become one organized package.':
    '当报告、扫描件、表单或附件需要整合成一个有序文件包时，使用这条路径。',
  'Merge guide': '合并教程',
  'Organize guide': '整理教程',
  'Convert and extract': '转换和提取',
  'Reuse text, tables, images, or office files':
    '复用文本、表格、图片或 Office 文件',
  'Use this path when a PDF contains content you need to edit, analyze, reuse, or export into another format.':
    '当 PDF 中包含需要编辑、分析、复用或导出到其他格式的内容时，使用这条路径。',
  'PDF to Word guide': 'PDF 转 Word 教程',
  'Table extraction guide': '表格提取教程',
  'Text extraction guide': '文本提取教程',
  'Scans and OCR': '扫描件和 OCR',
  'Make scanned documents easier to search and share':
    '让扫描文档更容易搜索和分享',
  'Use this path when the PDF is made from scanned pages or photos and the text cannot be selected.':
    '当 PDF 来自扫描页面或照片，且其中的文字无法选中时，使用这条路径。',
  'OCR guide': 'OCR 教程',
  'OCR FAQ': 'OCR 常见问题',
  'Image workflows': '图片工作流',
  'Move between PDF pages and image files': '在 PDF 页面和图片文件之间转换',
  'Use this path for receipts, screenshots, scanned forms, page previews, or image assets embedded inside PDFs.':
    '适用于收据、截图、扫描表单、页面预览，或嵌入在 PDF 中的图片资源。',
  'Images to PDF guide': '图片转 PDF 教程',
  'Archive and repair': '归档和修复',
  'Prepare long-term records or recover damaged files':
    '准备长期归档记录或恢复损坏文件',
  'Use this path when documents need archive-oriented conversion, metadata cleanup, validation, or damage recovery.':
    '当文档需要面向归档的转换、元数据清理、验证或损坏恢复时，使用这条路径。',
  'Archive guide': '归档教程',
  'Repair guide': '修复教程',
  'Privacy FAQ': '隐私常见问题',
  'Still know the tool name?': '已经知道工具名称？',
  'Go directly to the full tools directory, or browse the blog if you want a step-by-step explanation first.':
    '可以直接进入完整工具目录；如果想先看分步说明，也可以浏览博客。',
  'Browse the blog': '浏览博客',
  'Practical PDF tutorials for real document work':
    '面向真实文档工作的实用 PDF 教程',
  Blog: '博客',
  'More PDF tutorials and workflow articles': '更多 PDF 教程和工作流文章',
  'LocalPDFKit blog posts are written to support search intent, teach workflows clearly, and make it easy to move from a question into the right PDF tool.':
    'LocalPDFKit 的博客围绕搜索需求撰写，清楚讲解工作流，并帮助你从一个问题快速找到合适的 PDF 工具。',
  'All posts': '全部文章',
  'Page 1 of 5': '第 1 页，共 5 页',
  'Browse workflows': '浏览工作流',
  'PDF Security': 'PDF 安全',
  'PDF Review': 'PDF 审阅',
  'Business Documents': '商务文档',
  'PDF Conversion': 'PDF 转换',
  'PDF Privacy': 'PDF 隐私',
  'PDF Editing': 'PDF 编辑',
  'Change PDF Permissions Before Sharing a Read-Only File':
    '分享只读文件前更改 PDF 权限',
  'A read-only PDF workflow is about reducing accidental edits and reuse. Set permissions after the document is final, then share the controlled copy.':
    '只读 PDF 工作流的重点是减少意外编辑和重复使用。文档定稿后设置权限，再分享受控副本。',
  'Compare Two PDF Versions Before Sending a Revised Contract or Report':
    '发送修订合同或报告前比较两个 PDF 版本',
  'Version review is easier when you compare the old and new PDFs directly instead of relying on file names, memory, or scattered comments.':
    '直接比较新旧 PDF，比依赖文件名、记忆或零散评论更容易完成版本审阅。',
  'Extract Tables From a PDF Report Without Copying Rows by Hand':
    '无需手动复制行，从 PDF 报告中提取表格',
  'PDF tables are easy to read but painful to reuse. A focused table extraction workflow can save time and reduce manual data entry errors.':
    'PDF 表格易读却难复用。专门的表格提取工作流可以节省时间，并减少手工录入错误。',
  'Extract Text From a PDF for Notes, Search, or Content Reuse':
    '从 PDF 中提取文本，用于笔记、搜索或内容复用',
  'When the goal is reusable words instead of page design, PDF to text is often faster than converting the whole file to Word.':
    '如果目标是复用文字而不是保留页面设计，PDF 转文本通常比整份转 Word 更快。',
  'Prepare a PDF for AI Before Summarizing Contracts, Reports, or Meeting Packs':
    '在总结合同、报告或会议资料前为 AI 准备 PDF',
  'Better AI summaries usually start with cleaner input. Prepare the PDF first so the model receives usable document structure instead of messy page fragments.':
    '更好的 AI 摘要通常来自更干净的输入。先整理 PDF，让模型获得可用的文档结构，而不是凌乱的页面片段。',
  'Sanitize a PDF Before Sharing Legal, HR, or Client Documents':
    '分享法律、人事或客户文档前净化 PDF',
  'A PDF can contain more than the visible pages. Sanitizing a share copy helps reduce hidden document baggage before legal, HR, or client delivery.':
    'PDF 中可能包含可见页面之外的信息。分享前净化副本，有助于减少法律、人事或客户交付中的隐藏文档负担。',
  'Validate a Signed PDF Before You Approve a Contract, Invoice, or Vendor Form':
    '批准合同、发票或供应商表单前验证已签名 PDF',
  'A visible signature image is not the same as a verified digital signature. Validate the signed PDF before treating it as approved.':
    '可见的签名图片不等于已验证的数字签名。在视为批准前，应先验证签名 PDF。',
  'View PDF Metadata Before Sending Files to Clients, Portals, or Public Downloads':
    '发送给客户、门户或公开下载前查看 PDF 元数据',
  'Metadata review is a quick final check before a PDF leaves your team. It helps you see what the file says about itself before you share it.':
    '元数据检查是 PDF 离开团队前的快速最终检查。它能帮助你在分享前了解文件自身暴露了哪些信息。',
  'Add a Draft Watermark to a PDF Before Client Review or Internal Approval':
    '客户审阅或内部批准前给 PDF 添加草稿水印',
  'Watermarks are not just decorative. They help prevent confusion when a document is still under review.':
    '水印不只是装饰。当文档仍在审阅时，它能帮助避免状态混淆。',
  'Start now': '立即开始',
  'Need the tool first?': '想先使用工具？',
  'Jump into the full tool library, or use the workflow hub if you want a clearer path from question to action.':
    '可以直接进入完整工具库；如果想从问题到操作有更清晰的路径，也可以使用工作流中心。',
  'Browse all tools': '浏览全部工具',
  'Open workflow hub': '打开工作流中心',
  'Image to PDF': '图片转 PDF',
  'PDF to ZIP': 'PDF 转 ZIP',
  'Edit PDF': '编辑 PDF',
  'Custom Rotation': '自定义旋转',
  'Organize PDF': '整理 PDF',
  'Text Color': '文字颜色',
  'Extract Tables': '提取表格',
  'N-up PDF': 'N 合 1 PDF',
  'PDF Layers': 'PDF 图层',
  'Alternate Merge': '交替合并',
  'Combine Pages': '合并页面',
  'Prepare for AI': '为 AI 准备',
  'Bookmark PDF': 'PDF 书签',
  'Form Creator': '表单创建器',
  'Form Filler': '表单填写器',
  'PDF Multi-Tool': 'PDF 多功能工具',
  'PDF Converter hub': 'PDF 转换中心',
  'PDF Editor hub': 'PDF 编辑中心',
  'PDF Security hub': 'PDF 安全中心',
  'Merge & Split hub': '合并与拆分中心',
  'Blog Tutorials': '博客教程',
  'Privacy & browser FAQ': '隐私与浏览器处理 FAQ',
  Next: '下一页',
};

const pageMetadataTranslations: Record<
  string,
  { title: string; description: string }
> = {
  blog: {
    title: 'LocalPDFKit 博客 | PDF 教程和工作流指南',
    description: '阅读 LocalPDFKit 的实用 PDF 教程、故障排查文章和工作流指南。',
  },
  workflows: {
    title: 'PDF 工作流中心 | LocalPDFKit',
    description:
      '从常见 PDF 工作流开始，找到适合分享、转换、OCR、清理、归档和修复的 LocalPDFKit 工具与教程。',
  },
  tools: {
    title: '全部 PDF 工具目录 - 免费在线 PDF 工具 | LocalPDFKit',
    description:
      '按类别浏览 LocalPDFKit PDF 工具，查找浏览器端转换、编辑、安全、合并拆分和日常 PDF 实用工具。',
  },
};

const applyPageMetadataTranslations = (language: SupportedLanguage): void => {
  if (language !== 'zh') return;

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const pageKey = path.startsWith('/blog')
    ? 'blog'
    : path === '/workflows'
      ? 'workflows'
      : path === '/tools'
        ? 'tools'
        : null;
  if (!pageKey) return;

  const metadata = pageMetadataTranslations[pageKey];
  document.title = metadata.title;

  document
    .querySelectorAll(
      'meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]'
    )
    .forEach((element) => {
      element.setAttribute('content', metadata.description);
    });

  document
    .querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]')
    .forEach((element) => {
      element.setAttribute('content', metadata.title);
    });
};

const getExactTextTranslations = (
  language: SupportedLanguage
): Map<string, string> => {
  const translations = new Map<string, string>();
  if (language === 'en') return translations;

  ['common', 'tools'].forEach((namespace) => {
    const englishResource = i18next.getResourceBundle('en', namespace);
    const localizedResource = i18next.getResourceBundle(language, namespace);
    const englishValues = flattenResourceEntries(englishResource);
    const localizedValues = flattenResourceEntries(localizedResource);

    Object.entries(englishValues).forEach(([key, englishValue]) => {
      const localizedValue = localizedValues[key];
      const source = englishValue.trim();
      const target = localizedValue?.trim();

      if (
        !source ||
        !target ||
        source === target ||
        isBrokenTranslation(target)
      ) {
        return;
      }

      translations.set(source, target);

      const pdfVariant = source.replace(/\bPDF\b/g, 'Pdf');
      if (pdfVariant !== source) translations.set(pdfVariant, target);

      const titleCaseVariant = toLooseTitleCase(source);
      if (titleCaseVariant !== source) {
        translations.set(titleCaseVariant, target);
      }
    });
  });

  Object.entries(extraZhStaticTranslations).forEach(([source, target]) => {
    translations.set(source, target);
  });

  return translations;
};

const autoTranslateStaticText = (language: SupportedLanguage): void => {
  const translations = getExactTextTranslations(language);
  if (translations.size === 0) return;

  const ignoredTags = new Set([
    'SCRIPT',
    'STYLE',
    'NOSCRIPT',
    'TEXTAREA',
    'CODE',
    'PRE',
  ]);

  document.querySelectorAll('body *').forEach((element) => {
    if (
      ignoredTags.has(element.tagName) ||
      element.hasAttribute('data-no-i18n') ||
      element.hasAttribute('data-i18n')
    ) {
      return;
    }

    if (element.childElementCount > 0) return;

    const text = element.textContent?.trim();
    if (!text) return;

    const translation = translations.get(text);
    if (translation) {
      element.textContent = translation;
      return;
    }

    if (language === 'zh') {
      const pageMatch = text.match(/^Page (\d+) of (\d+)$/);
      if (pageMatch) {
        element.textContent = `第 ${pageMatch[1]} 页，共 ${pageMatch[2]} 页`;
      }
    }
  });
};

let dynamicTranslationObserver: MutationObserver | null = null;
let dynamicTranslationFrame: number | null = null;

const scheduleDynamicStaticTranslation = (
  language: SupportedLanguage
): void => {
  if (dynamicTranslationFrame !== null) return;

  dynamicTranslationFrame = window.requestAnimationFrame(() => {
    dynamicTranslationFrame = null;
    autoTranslateStaticText(language);
  });
};

const observeDynamicTranslations = (language: SupportedLanguage): void => {
  dynamicTranslationObserver?.disconnect();
  dynamicTranslationObserver = null;

  if (
    language === 'en' ||
    typeof MutationObserver === 'undefined' ||
    !document.body
  ) {
    return;
  }

  dynamicTranslationObserver = new MutationObserver(() => {
    scheduleDynamicStaticTranslation(language);
  });

  dynamicTranslationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

export const rewriteLinks = (): void => {};

export default i18next;
