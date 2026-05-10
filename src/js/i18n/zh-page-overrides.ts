type SupportedLanguage = 'en' | 'zh';

type BlogPostZh = {
  title: string;
  excerpt: string;
  category: string;
  focus: string;
};

const normalizePath = (): string => {
  return window.location.pathname.replace(/\/+$/, '') || '/';
};

const setText = (selector: string, text: string): void => {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
};

const setMetadata = (title: string, description: string): void => {
  document.title = title;
  document
    .querySelectorAll(
      'meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]'
    )
    .forEach((element) => element.setAttribute('content', description));
  document
    .querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]')
    .forEach((element) => element.setAttribute('content', title));
};

const categoryZh: Record<string, string> = {
  'Application Documents': '申请材料',
  'Business Documents': '商务文档',
  'Expense Workflows': '报销工作流',
  'Image Workflows': '图片工作流',
  'OCR Tutorials': 'OCR 教程',
  'PDF Cleanup': 'PDF 清理',
  'PDF Conversion': 'PDF 转换',
  'PDF Editing': 'PDF 编辑',
  'PDF Forms': 'PDF 表单',
  'PDF Privacy': 'PDF 隐私',
  'PDF Review': 'PDF 审阅',
  'PDF Security': 'PDF 安全',
  'Sharing PDFs': 'PDF 分享',
};

const commonTextZh: Record<string, string> = {
  Home: '首页',
  Blog: '博客',
  'Updated April 5, 2026': '更新于 2026 年 4 月 5 日',
  'Updated April 8, 2026': '更新于 2026 年 4 月 8 日',
  'Updated April 9, 2026': '更新于 2026 年 4 月 9 日',
  'Updated April 10, 2026': '更新于 2026 年 4 月 10 日',
  'Updated April 11, 2026': '更新于 2026 年 4 月 11 日',
  'Updated April 12, 2026': '更新于 2026 年 4 月 12 日',
  'Updated April 13, 2026': '更新于 2026 年 4 月 13 日',
  'Updated April 14, 2026': '更新于 2026 年 4 月 14 日',
  'Updated April 15, 2026': '更新于 2026 年 4 月 15 日',
  'Updated April 16, 2026': '更新于 2026 年 4 月 16 日',
  'Updated April 17, 2026': '更新于 2026 年 4 月 17 日',
  'Updated April 19, 2026': '更新于 2026 年 4 月 19 日',
  'Updated May 1, 2026': '更新于 2026 年 5 月 1 日',
  'LocalPDFKit Editorial Team': 'LocalPDFKit 编辑团队',
  '2 min read': '约 2 分钟阅读',
  '3 min read': '约 3 分钟阅读',
  '4 min read': '约 4 分钟阅读',
  'Related tools': '相关工具',
  'Open the workflow without leaving the article': '直接打开本文相关工具',
  'Open the tool directly on LocalPDFKit.': '在 LocalPDFKit 中直接打开工具。',
  'Keep reading': '继续阅读',
  'More tutorials from the blog': '更多博客教程',
  'Next step': '下一步',
  'Keep the workflow moving': '继续推进这个工作流',
  'Open the tool, browse the full tool directory, or return to the blog for the next tutorial in your PDF workflow.':
    '你可以打开工具、浏览完整工具目录，或回到博客继续阅读下一个 PDF 工作流教程。',
  'Browse all tools': '浏览全部工具',
  'Back to blog': '返回博客',
  'On this page': '本页内容',
  'Read guide': '阅读教程',
};

const blogPosts: Record<string, BlogPostZh> = {
  'add-a-draft-watermark-to-a-pdf-before-client-review': {
    title: '客户审阅或内部批准前给 PDF 添加草稿水印',
    excerpt: '水印不只是装饰。它能在文档仍处于审阅阶段时减少误用和状态混淆。',
    category: 'PDF 编辑',
    focus: '适合合同草稿、内部审批、提案评审和需要标记状态的共享文件。',
  },
  'change-pdf-permissions-before-sharing-a-read-only-file': {
    title: '分享只读文件前更改 PDF 权限',
    excerpt:
      '只读 PDF 工作流的重点是减少误编辑和随意复用。定稿后再设置权限并分享受控副本。',
    category: 'PDF 安全',
    focus: '适合客户草稿、内部政策、审批材料和不希望被随意编辑的文件。',
  },
  'combine-receipts-into-one-pdf': {
    title: '将收据合并成一个 PDF，用于报销或费用报告',
    excerpt:
      '把手机照片、邮件附件和下载的收据整理成一个 PDF，便于审核、保存和提交。',
    category: '报销工作流',
    focus: '适合报销、记账、税务归档和需要一次性上传多张收据的场景。',
  },
  'compare-two-pdf-versions-before-sending-a-revised-contract-or-report': {
    title: '发送修订合同或报告前比较两个 PDF 版本',
    excerpt: '直接比较新旧 PDF，比依赖文件名、记忆或零散评论更可靠。',
    category: 'PDF 审阅',
    focus: '适合合同、报告、政策、报价单和审批包的版本核对。',
  },
  'compress-a-pdf-for-a-job-application': {
    title: '压缩求职申请 PDF，同时保持专业观感',
    excerpt:
      '求职系统经常拒绝过大的 PDF。合理压缩能通过上传限制，同时保留简历和作品集的可读性。',
    category: '申请材料',
    focus: '适合简历、证书、作品集和求职门户上传前的文件减重。',
  },
  'convert-excel-to-pdf-for-invoices-budgets-or-quote-approvals': {
    title: '将 Excel 转为 PDF，用于发票、预算或报价审批',
    excerpt: '电子表格适合编辑，但 PDF 往往更适合审阅、确认和对外分享。',
    category: '商务文档',
    focus: '适合发票、预算汇总、报价单和财务审批材料。',
  },
  'convert-jpg-to-pdf-for-printing': {
    title: '将 JPG 转为 PDF，用于打印、表单和文档上传',
    excerpt:
      '当照片或扫描件需要像正式文档一样使用时，转成 PDF 通常更容易打印、分享和归档。',
    category: '图片工作流',
    focus: '适合照片收据、扫描表单、签名页和需要稳定页面顺序的图片文件。',
  },
  'convert-pdf-to-jpg-for-slides-or-social-media': {
    title: '将 PDF 转为 JPG，用于幻灯片、审阅或社交媒体预览',
    excerpt: '当 PDF 页面需要变成图片素材时，导出为 JPG 通常是最快的复用方式。',
    category: '图片工作流',
    focus: '适合演示文稿、聊天审阅、缩略图和视觉预览。',
  },
  'convert-pdf-to-word-without-losing-formatting': {
    title: '尽量保留格式地将 PDF 转为 Word',
    excerpt:
      'PDF 转 Word 很少完美，但更合理的流程可以保留更多版式并减少后续清理。',
    category: 'PDF 转换',
    focus: '适合需要二次编辑的报告、合同、说明文档和可选中文本型 PDF。',
  },
  'convert-png-screenshots-into-one-pdf-for-bug-reports-or-approvals': {
    title: '将 PNG 截图合并成一个 PDF，用于缺陷报告、审批或文档',
    excerpt: '截图一多就容易混乱。合并为一个 PDF 往往更便于审阅。',
    category: 'PDF 转换',
    focus: '适合产品反馈、设计确认、审批记录和文档归档。',
  },
  'convert-word-to-pdf-before-sending-a-resume-or-contract': {
    title: '发送简历、提案或合同前将 Word 转为 PDF',
    excerpt: '发送 DOCX 可能出现排版差异。PDF 通常是更安全的最终分享格式。',
    category: 'PDF 转换',
    focus: '适合简历、合同、提案和最终稿对外发送。',
  },
  'crop-a-pdf-to-remove-scan-borders-before-sharing': {
    title: '分享或上传前裁剪 PDF，去除扫描边框',
    excerpt:
      'PDF 即使可读，也可能因为扫描边框和多余留白显得粗糙。裁剪能让页面更干净。',
    category: 'PDF 清理',
    focus: '适合扫描件、证件材料、表单和需要更整洁版面的文件。',
  },
  'edit-a-pdf-with-comments-highlights-or-redactions-before-review': {
    title: '审阅前用评论、高亮或遮盖编辑 PDF',
    excerpt: '编辑 PDF 往往不是重写全文，而是让审阅信息更清晰。',
    category: 'PDF 编辑',
    focus: '适合审阅反馈、重点标注、敏感信息遮盖和团队协作。',
  },
  'export-a-pdf-page-as-png-for-docs-design-or-product-updates': {
    title: '将 PDF 页面导出为 PNG，用于文档、设计交付或产品更新',
    excerpt: '有时 PDF 页面需要变成图片，才能放进文档、幻灯片或产品更新中。',
    category: 'PDF 转换',
    focus: '适合文档截图、设计交付、产品更新和高质量页面预览。',
  },
  'extract-pages-from-a-pdf-for-a-visa-application': {
    title: '为签证、求职或政府申请从 PDF 中提取页面',
    excerpt: '申请系统通常只需要长文件中的一部分。提取准确页面能让上传更清晰。',
    category: '申请材料',
    focus: '适合签证、求职、政务申请和只需提交部分页面的场景。',
  },
  'extract-pdf-tables-to-excel-for-bookkeeping-or-reconciliation': {
    title: '将 PDF 表格提取到 Excel，用于记账或对账',
    excerpt:
      '当数字在 PDF 里但需要表格处理时，目标不是简单转换，而是得到可用的数据表。',
    category: '商务文档',
    focus: '适合财务报表、对账单、清单和需要进一步计算的数据。',
  },
  'extract-tables-from-a-pdf-report-without-copying-rows-by-hand': {
    title: '无需手动复制，从 PDF 报告中提取表格',
    excerpt:
      'PDF 表格易读但难复用。专门的表格提取流程能节省时间并减少手工录入错误。',
    category: '商务文档',
    focus: '适合报告、账单、运营数据和需要复用表格的 PDF。',
  },
  'extract-text-from-a-pdf-for-notes-search-or-content-reuse': {
    title: '从 PDF 提取文本，用于笔记、搜索或内容复用',
    excerpt: '如果目标是复用文字而不是保留页面设计，PDF 转文本通常更快。',
    category: 'PDF 转换',
    focus: '适合摘录、搜索索引、笔记整理和内容迁移。',
  },
  'fill-a-pdf-form-online-without-printing-or-scanning': {
    title: '在线填写 PDF 表单，无需打印或扫描',
    excerpt:
      'PDF 表单通常没有必要先变成纸质流程。数字填写、仔细检查后再发送即可。',
    category: 'PDF 表单',
    focus: '适合申请表、入职表、供应商表单和需要快速回传的文件。',
  },
  'flatten-a-pdf-before-sending-a-form': {
    title: '发送已填写表单前扁平化 PDF',
    excerpt:
      '如果希望收件人看到的内容与你看到的一致，扁平化最终版本通常更稳妥。',
    category: 'PDF 表单',
    focus: '适合填写后的表单、签名文件和不希望交互层变化的最终副本。',
  },
  'make-a-pdf-smaller-for-email': {
    title: '压缩 PDF 以便邮件发送，同时不破坏可读性',
    excerpt:
      '当 PDF 对 Gmail、Outlook 或提交门户来说太大时，先审阅再压缩更安全。',
    category: 'PDF 分享',
    focus: '适合邮件附件、上传门户和需要控制文件大小的文档。',
  },
  'merge-bank-statements-into-one-pdf': {
    title: '将银行流水合并成一个 PDF，用于房贷、签证或贷款申请',
    excerpt:
      '如果申请门户要求一个文件而不是多份流水，这个流程可以帮你按正确顺序合并。',
    category: '申请材料',
    focus: '适合房贷、签证、贷款和需要提交多期流水的申请。',
  },
  'organize-a-pdf-before-submitting-final-documents': {
    title: '向客户、学校或门户提交最终文件前整理 PDF',
    excerpt:
      '内容正确但顺序混乱的 PDF 仍会造成阻力。提交前整理能减少来回沟通。',
    category: '申请材料',
    focus: '适合最终材料包、学校申请、客户交付和门户上传。',
  },
  'password-protect-a-pdf-before-emailing-it': {
    title: '通过邮件发送前给 PDF 加密保护',
    excerpt:
      '如果通过邮件发送 PDF 且希望增加保护层，应在所有编辑完成后加密最终版本。',
    category: 'PDF 安全',
    focus: '适合合同、个人材料、财务文件和敏感附件。',
  },
  'prepare-a-pdf-for-ai-before-summarizing-contracts-reports-or-meeting-packs':
    {
      title: '总结合同、报告或会议资料前为 AI 准备 PDF',
      excerpt:
        '更好的 AI 摘要通常来自更干净的输入。先整理 PDF，模型才能获得可用结构。',
      category: 'PDF 转换',
      focus: '适合 AI 总结、RAG、会议材料整理和长文档分析。',
    },
  'remove-blank-pages-from-a-scanned-pdf-before-upload': {
    title: '上传、审阅或归档前删除扫描 PDF 中的空白页',
    excerpt:
      '扫描批次常会产生空白页，让 PDF 变得更长更乱。重要提交前应先清理。',
    category: 'PDF 清理',
    focus: '适合扫描件、申请材料、档案整理和批量文档上传。',
  },
  'remove-metadata-before-sharing-a-pdf': {
    title: '向团队外分享 PDF 前移除元数据',
    excerpt:
      'PDF 可能暴露可见页面之外的信息。对外发送前应检查并移除不该随文件传播的元数据。',
    category: 'PDF 隐私',
    focus: '适合客户交付、公开下载、法律文件和内部模板导出的 PDF。',
  },
  'remove-pages-from-a-pdf-without-reprinting': {
    title: '无需重新打印或重做，直接从 PDF 删除页面',
    excerpt: '如果只需要删除少量页面，页面级清理比重新导出或打印更高效。',
    category: 'PDF 编辑',
    focus: '适合去除多余页面、错误页、空白页和不应提交的附件。',
  },
  'repair-a-pdf-that-wont-open-before-you-reupload-it': {
    title: '重新上传、转发或归档前修复无法打开的 PDF',
    excerpt:
      '损坏的 PDF 不一定需要从头重做。有时一次修复就足以让文件重新可用。',
    category: 'PDF 清理',
    focus: '适合无法打开、预览异常、上传失败或结构不稳定的 PDF。',
  },
  'rotate-a-scanned-pdf-so-every-page-is-upright': {
    title: '上传前旋转扫描 PDF，让每一页保持正向',
    excerpt:
      '横着或倒置的页面会让文件显得不完整。发送前旋转页面是快速清理步骤。',
    category: 'PDF 清理',
    focus: '适合手机扫描、证件材料、混合扫描批次和门户上传。',
  },
  'sanitize-a-pdf-before-sharing-legal-hr-or-client-documents': {
    title: '分享法律、人事或客户文档前净化 PDF',
    excerpt: 'PDF 可能包含可见页面之外的隐藏内容。净化副本有助于减少外发风险。',
    category: 'PDF 隐私',
    focus: '适合法律草稿、人事表单、客户交付、采购材料和公开模板。',
  },
  'sign-a-pdf-contract-before-sending-it-back': {
    title: '将 PDF 合同签名后发回客户、供应商或雇主',
    excerpt:
      '收到需要签署的 PDF 时，直接在文件中签名通常比打印再扫描更快更清晰。',
    category: 'PDF 安全',
    focus: '适合合同、offer、入职材料、供应商审批和需要回传签名的文件。',
  },
  'split-a-pdf-into-separate-files-for-upload': {
    title: '将 PDF 拆分成多个文件，用于上传门户和申请表单',
    excerpt:
      '有些门户不接受一个大 PDF，而是要求按类别分别上传。拆分能避免漏页和上传错误。',
    category: '申请材料',
    focus: '适合政务表单、求职门户、客户报告和需要分组提交的材料。',
  },
  'turn-a-scanned-pdf-into-searchable-text': {
    title: '将扫描 PDF 变成可搜索文本',
    excerpt: '无法选中文字的扫描件需要 OCR，才能更容易搜索、复制和审阅。',
    category: 'OCR 教程',
    focus: '适合纸质扫描件、旧档案、图片型 PDF 和需要文本检索的文件。',
  },
  'unlock-a-pdf-you-own-before-printing-merging-or-uploading': {
    title: '打印、合并或上传前解锁你有权处理的 PDF',
    excerpt: '有时问题不在文档内容，而是 PDF 被限制了你有权执行的流程。',
    category: 'PDF 安全',
    focus: '仅适合你拥有、控制或明确获准处理的 PDF 文件。',
  },
  'validate-a-signed-pdf-before-you-approve-a-contract-invoice-or-vendor-form':
    {
      title: '批准合同、发票或供应商表单前验证签名 PDF',
      excerpt: '可见签名图片不等于已验证的数字签名。审批前应检查签名状态。',
      category: 'PDF 安全',
      focus: '适合合同审批、发票审核、供应商表单和数字签名核验。',
    },
  'view-pdf-metadata-before-sending-files-to-clients-portals-or-public-downloads':
    {
      title: '发送给客户、门户或公开下载前查看 PDF 元数据',
      excerpt:
        '元数据检查是 PDF 离开团队前的快速最终检查，能帮助发现文件暴露的信息。',
      category: 'PDF 隐私',
      focus: '适合客户交付、公开下载、法律材料、HR 文件和内部模板导出。',
    },
};

const pageHtml: Record<
  string,
  { title: string; description: string; body: string }
> = {
  '/privacy': {
    title: '隐私政策 - 你的数据保持私密 | LocalPDFKit',
    description:
      'LocalPDFKit 隐私政策：核心 PDF 工具尽量在浏览器中处理文件，无需账号，并坚持隐私优先。',
    body: `
      <section class="max-w-4xl mx-auto py-12">
        <h1 class="text-4xl md:text-5xl font-bold text-center text-white mb-4">隐私政策</h1>
        <p class="text-center text-gray-500">最后更新：2026 年 4 月 15 日</p>
        <div class="legal-content mt-12">
          <h2>1. 我们对隐私的承诺</h2>
          <p>LocalPDFKit 是一个以隐私为核心的 PDF 工具站。我们的基本原则很简单：你的文件属于你。核心 PDF 操作尽量在你的浏览器和设备本地完成，我们不会查看、访问、存储或分享这些本地处理的文档内容。</p>
          <h3>1.1 浏览器端处理原则</h3>
          <p>与依赖服务器上传处理的在线 PDF 服务不同，LocalPDFKit 的许多工具通过 JavaScript 和 WebAssembly 在你的设备上运行。这样可以减少不必要的文件传输，让文档处理保持在你的控制之下。</p>
          <h2>2. 我们不会收集的文件信息</h2>
          <ul><li>你的 PDF 或其他文档内容。</li><li>文档中包含的个人数据。</li><li>你的文件名。</li><li>本地处理文件产生的派生内容或元数据，除非工具在当前会话中临时需要，且会在任务结束后丢弃。</li></ul>
          <h2>3. 可能收集的非个人信息</h2>
          <p>为了改进网站，我们可能收集匿名、汇总的使用或性能信息，例如哪些工具更常用、错误是否发生、页面是否正常加载。这类数据不会包含你的文件内容，也不会用于识别个人文档。</p>
          <h2>4. 第三方库</h2>
          <p>LocalPDFKit 使用 PDF-lib、PDF.js 等开源库实现浏览器端处理。我们会尽力选择可靠的组件，但你仍可查看相关开源项目的说明以了解更多细节。</p>
          <h2>5. 浏览器存储</h2>
          <p>网站可能在你的浏览器中保存界面偏好、语言设置或工具选项。这些信息通常保留在本地浏览器中，不属于账号数据。</p>
          <h2>6. 安全</h2>
          <p>由于核心流程不需要把文件上传到我们的服务器，文件传输和服务器存储带来的风险会降低。你仍应保护自己的设备、浏览器和原始文件备份。</p>
          <h2>7. 政策更新与联系</h2>
          <p>我们可能不时更新本政策。若你有隐私相关问题，请通过 <a href="mailto:contact@localpdfkit.com">contact@localpdfkit.com</a> 联系我们。</p>
        </div>
      </section>`,
  },
  '/terms': {
    title: '条款与条件 - 服务协议 | LocalPDFKit',
    description:
      'LocalPDFKit 服务条款：免费、浏览器端 PDF 工具，以及使用本服务时的责任边界。',
    body: `
      <section class="max-w-4xl mx-auto py-12">
        <h1 class="text-4xl md:text-5xl font-bold text-center text-white mb-4">条款与条件</h1>
        <p class="text-center text-gray-500">最后更新：2026 年 4 月 12 日</p>
        <div class="legal-content mt-12">
          <h2>1. 接受条款</h2>
          <p>访问或使用 LocalPDFKit 即表示你同意遵守这些条款。如果你不同意，请不要使用本服务。</p>
          <h2>2. 服务说明</h2>
          <p>LocalPDFKit 提供一组用于处理 PDF 文件的浏览器端工具。核心操作尽量在你的浏览器中完成，文件不会上传或存储在我们的服务器上。</p>
          <h2>3. 用户责任</h2>
          <p>你需要对自己处理的文件内容负责，并确保不会使用本服务处理违法、侵权、诽谤、恶意或未经授权的材料。</p>
          <h2>4. 不作保证</h2>
          <p>本服务按“现状”和“可用”提供。文件转换、压缩、OCR、编辑等结果可能受文件质量、浏览器环境和文档复杂度影响。请在依赖输出前自行检查结果。</p>
          <h2>5. 责任限制</h2>
          <p>在适用法律允许的范围内，LocalPDFKit 不对因使用或无法使用本服务导致的间接、附带、特殊或后果性损失承担责任。</p>
          <h2>6. 备份与重要文件</h2>
          <p>处理重要文件前请保留原始副本。任何在线或本地工具都不应替代你的备份流程。</p>
          <h2>7. 条款更新与联系</h2>
          <p>我们可能更新这些条款。继续使用本服务即表示你接受更新后的条款。如有问题，请联系 <a href="mailto:contact@localpdfkit.com">contact@localpdfkit.com</a>。</p>
        </div>
      </section>`,
  },
  '/cookies': {
    title: 'Cookie 政策 | LocalPDFKit',
    description: '了解 LocalPDFKit 如何使用 Cookie、本地存储和类似浏览器技术。',
    body: `
      <section class="max-w-4xl mx-auto py-12">
        <h1 class="text-4xl md:text-5xl font-bold text-center text-white mb-4">Cookie 政策</h1>
        <p class="text-center text-gray-500">最后更新：2026 年 4 月 12 日</p>
        <div class="legal-content mt-12">
          <h2>1. 政策范围</h2><p>本政策说明 LocalPDFKit 在你访问或使用 localpdfkit.com 时如何使用 Cookie、本地存储和类似浏览器技术。</p>
          <h2>2. 必要的浏览器存储</h2><p>我们可能使用浏览器端存储来保存界面偏好、语言、布局或工具设置，使网站在多次访问之间保持可用。</p>
          <h2>3. 分析与测量</h2><p>我们可能使用隐私友好的统计方式了解页面和工具的使用情况。此类数据用于改进产品，不包含你的文件内容。</p>
          <h2>4. 可选第三方服务</h2><p>未来如果加入广告、同意管理或第三方统计服务，我们会在政策中说明相关用途和控制方式。</p>
          <h2>5. 管理偏好</h2><p>你可以通过浏览器设置清除 Cookie、本地存储或站点数据。清除后，某些偏好需要重新设置。</p>
          <h2>6. 联系</h2><p>如有 Cookie 或隐私问题，请联系 <a href="mailto:contact@localpdfkit.com">contact@localpdfkit.com</a>。</p>
        </div>
      </section>`,
  },
  '/disclaimer': {
    title: '免责声明 | LocalPDFKit',
    description:
      'LocalPDFKit 关于工具输出、教程内容、准确性和专业建议边界的免责声明。',
    body: `
      <section class="max-w-4xl mx-auto py-12">
        <h1 class="text-4xl md:text-5xl font-bold text-center text-white mb-4">免责声明</h1>
        <p class="text-center text-gray-500">最后更新：2026 年 4 月 12 日</p>
        <div class="legal-content mt-12">
          <h2>1. 信息和教程内容</h2><p>LocalPDFKit 上的教程、FAQ 和帮助页面仅供一般信息参考，不构成法律、税务、合规、会计、医疗或其他专业建议。</p>
          <h2>2. 工具输出和准确性</h2><p>文件转换、OCR、压缩、编辑和其他输出可能因文件质量、字体、扫描清晰度、浏览器支持或文档复杂度而不同。请在使用结果前自行检查。</p>
          <h2>3. 文件责任</h2><p>你需要确保自己有权处理上传或选择的文件，并保留必要的原始备份。</p>
          <h2>4. 隐私和安全说明</h2><p>我们强调浏览器端处理带来的隐私优势，但你的设备、浏览器、网络环境和可选第三方资源也会影响实际安全边界。</p>
          <h2>5. 第三方软件和服务</h2><p>本网站可能依赖开源库和第三方组件。相关组件可能有自己的许可证、限制和行为。</p>
          <h2>6. 无保证</h2><p>LocalPDFKit 按“现状”提供，不保证服务始终无错误、不中断或完全适合你的特定用途。</p>
          <h2>7. 联系</h2><p>如有问题，请联系 <a href="mailto:contact@localpdfkit.com">contact@localpdfkit.com</a>。</p>
        </div>
      </section>`,
  },
};

const appHtml: Record<
  string,
  { title: string; description: string; body: string }
> = {
  '/contact': {
    title: '联系 LocalPDFKit | 支持与反馈',
    description:
      '联系 LocalPDFKit，反馈问题、工具建议、隐私政策或开源授权相关事项。',
    body: `
      <section class="text-center py-16 md:py-24">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">联系我们</h1>
        <p class="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">如果你有问题、反馈或功能建议，欢迎直接联系我。</p>
      </section>
      <div class="max-w-2xl mx-auto text-center py-8">
        <p class="text-lg text-gray-400">邮箱：<a href="mailto:contact@localpdfkit.com" class="text-indigo-400 underline hover:text-indigo-300">contact@localpdfkit.com</a></p>
      </div>
      <section class="max-w-5xl mx-auto py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article class="bg-gray-800 border border-gray-700 rounded-2xl p-6"><h2 class="text-xl font-bold text-white mb-3">一般帮助</h2><p class="text-gray-400 leading-relaxed">关于工具、浏览器兼容性、文件处理失败或功能行为的问题。</p></article>
          <article class="bg-gray-800 border border-gray-700 rounded-2xl p-6"><h2 class="text-xl font-bold text-white mb-3">授权与 AGPL</h2><p class="text-gray-400 leading-relaxed">源代码请求、署名修正和开源合规相关问题。</p><a href="https://github.com/chensanhuohuo/localpdfkit" class="inline-flex mt-4 text-indigo-400 hover:underline break-all" rel="noopener noreferrer" target="_blank">github.com/chensanhuohuo/localpdfkit</a></article>
          <article class="bg-gray-800 border border-gray-700 rounded-2xl p-6"><h2 class="text-xl font-bold text-white mb-3">隐私与政策</h2><p class="text-gray-400 leading-relaxed">关于 Cookie、浏览器存储、免责声明或广告披露计划的问题。</p></article>
        </div>
      </section>`,
  },
  '/source-code': {
    title: '源代码与 AGPL 说明 | LocalPDFKit',
    description:
      'LocalPDFKit 的源代码可用性、AGPL 说明、上游项目署名和品牌边界。',
    body: `
      <section class="max-w-4xl mx-auto py-16 md:py-24 text-center"><h1 class="text-4xl md:text-6xl font-bold text-white mb-4">源代码与 <span class="marker-slanted">AGPL</span> 说明</h1><p class="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">LocalPDFKit 按 AGPL 合规路线运营。本页说明对应源代码可用性、上游项目署名，以及 LocalPDFKit 品牌资产与上游代码之间的边界。</p></section>
      <div class="section-divider"></div>
      <section class="max-w-5xl mx-auto py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <article class="bg-gray-800 border border-gray-700 rounded-2xl p-8"><h2 class="text-2xl font-bold text-white mb-4">发布路线</h2><p class="text-gray-400 leading-relaxed">用于本站部署且受 AGPL 覆盖的网站代码，应通过公开仓库或清晰记录的源码分发渠道提供对应源代码。</p></article>
        <article class="bg-gray-800 border border-gray-700 rounded-2xl p-8"><h2 class="text-2xl font-bold text-white mb-4">上游署名</h2><p class="text-gray-400 leading-relaxed">LocalPDFKit 是独立品牌网站，基于 BentoPDF 和其他第三方 PDF 开源库构建。相关上游许可证、声明和署名条款仍适用于对应代码与组件。</p></article>
      </section>
      <section class="max-w-5xl mx-auto py-8"><div class="bg-gray-800 border border-gray-700 rounded-2xl p-8"><h2 class="text-3xl font-bold text-white mb-6">源代码可用性覆盖范围</h2><ul class="space-y-3 text-gray-400 leading-relaxed list-disc pl-5"><li>本站部署中使用的 AGPL 覆盖代码的对应源代码。</li><li>与上游开源项目相关的声明和署名。</li><li>LocalPDFKit 特定改动、页面文案和站点集成。</li><li>上游软件权利与 LocalPDFKit 品牌资产之间的清晰区分。</li></ul></div></section>
      <section class="max-w-5xl mx-auto py-8"><div class="bg-gradient-to-r from-indigo-600/20 to-sky-500/20 border border-indigo-500/30 rounded-2xl p-8"><h2 class="text-3xl font-bold text-white mb-4">仓库链接</h2><p class="text-gray-300 leading-relaxed mb-4">公开仓库：<a href="https://github.com/chensanhuohuo/localpdfkit" class="text-white underline hover:no-underline font-semibold break-all" rel="noopener noreferrer" target="_blank">https://github.com/chensanhuohuo/localpdfkit</a></p><a href="https://github.com/chensanhuohuo/localpdfkit" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors" rel="noopener noreferrer" target="_blank">打开 GitHub 仓库</a></div></section>`,
  },
  '/about': {
    title: '关于 LocalPDFKit - 隐私优先的免费 PDF 工具',
    description:
      '了解 LocalPDFKit 如何提供免费、隐私优先、基于浏览器的 PDF 工具。',
    body: `
      <section class="text-center py-16 md:py-24"><h1 class="text-3xl md:text-6xl font-bold text-white mb-4">我们相信 PDF 工具应该快速、私密、易用。</h1><p class="text-xl text-gray-400">不需要注册，不强迫上传，不设置不必要的门槛。</p></section>
      <section class="py-16 max-w-4xl mx-auto"><p class="text-sm uppercase tracking-[0.3em] text-indigo-300 mb-4">我们的使命</p><h2 class="text-3xl font-bold text-white mb-6">提供尊重隐私的综合 PDF 工具箱</h2><p class="text-gray-400 leading-relaxed">LocalPDFKit 希望把日常文档处理变得简单：合并、拆分、压缩、转换、OCR、签名、元数据检查和页面整理，都尽可能在浏览器中完成。</p></section>
      <section class="py-12 grid grid-cols-1 md:grid-cols-3 gap-6"><article class="bg-gray-800 border border-gray-700 rounded-2xl p-6"><h3 class="text-xl font-bold text-white mb-3">隐私优先</h3><p class="text-gray-400">核心任务尽量在你的设备上处理，减少文件上传。</p></article><article class="bg-gray-800 border border-gray-700 rounded-2xl p-6"><h3 class="text-xl font-bold text-white mb-3">免费使用</h3><p class="text-gray-400">基础 PDF 工作流不需要注册或付费墙。</p></article><article class="bg-gray-800 border border-gray-700 rounded-2xl p-6"><h3 class="text-xl font-bold text-white mb-3">面向真实工作</h3><p class="text-gray-400">工具、教程和工作流围绕日常办公、学习和申请材料处理设计。</p></article></section>
      <section class="text-center py-16"><h2 class="text-3xl font-bold text-white mb-4">准备开始了吗？</h2><p class="text-lg text-gray-400 mb-8">体验隐私和性能带来的不同。</p><a href="/tools" class="inline-block px-8 py-3 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600 text-white font-semibold">探索全部工具</a></section>`,
  },
  '/faq': {
    title: '常见问题 | LocalPDFKit',
    description:
      'LocalPDFKit 常见问题：文件隐私、免费使用、离线处理、文件大小、失败原因和开源信息。',
    body: `
      <section class="text-center py-16 md:py-24"><h1 class="text-4xl md:text-5xl font-bold text-white mb-4">常见问题</h1><p class="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">这里整理了用户最常问的 LocalPDFKit 使用问题。</p></section>
      <div class="max-w-4xl mx-auto space-y-4">
        ${[
          [
            '我的文件安全吗？',
            '核心处理尽量在你的浏览器中完成，文件不会作为常规流程上传到我们的服务器。请查看隐私政策和工作原理页面了解边界。',
          ],
          [
            'LocalPDFKit 真的免费吗？',
            '是的，核心浏览器端 PDF 任务可以免费使用，并且不需要账号。',
          ],
          [
            '需要联网才能使用吗？',
            '首次加载网站和处理引擎需要网络。加载后，许多核心工具可以在浏览器中继续运行，但某些需要外部资源的工具仍可能需要连接。',
          ],
          [
            '有文件大小或次数限制吗？',
            '我们不设置人为次数限制。实际限制主要来自你的设备内存、浏览器能力和文件复杂度。',
          ],
          [
            '为什么 PDF 处理失败？',
            '常见原因包括文件损坏、加密、动态表单、浏览器内存不足或文件结构过于复杂。',
          ],
          [
            '是否使用 Cookie 或浏览器存储？',
            '会使用浏览器存储保存语言、界面偏好等设置。未来如加入广告或同意管理，会在政策页面说明。',
          ],
          [
            'LocalPDFKit 使用什么技术？',
            '网站主要使用 JavaScript、WebAssembly、PDF-lib、PDF.js 等现代 Web 技术。',
          ],
          [
            'LocalPDFKit 是开源的吗？',
            'LocalPDFKit 按 AGPL 开源路线运营。你可以查看授权和源代码说明页面。',
          ],
        ]
          .map(
            ([question, answer]) =>
              `<details class="bg-gray-800 border border-gray-700 rounded-lg p-5 group"><summary class="flex items-center justify-between cursor-pointer"><h3 class="font-semibold text-white text-lg">${question}</h3></summary><div class="mt-4 text-gray-400"><p>${answer}</p></div></details>`
          )
          .join('')}
      </div>
      <section class="max-w-5xl mx-auto py-16 text-center"><h2 class="text-3xl font-bold text-white mb-4">还需要更多说明？</h2><p class="text-gray-400 mb-6">你可以继续阅读隐私、转换和 OCR 相关的深度 FAQ。</p><div class="flex flex-wrap justify-center gap-4"><a href="/pdf-privacy-and-browser-processing-faq" class="lp-solid-cta">隐私与浏览器处理 FAQ</a><a href="/pdf-conversion-and-ocr-faq" class="lp-solid-cta">转换与 OCR FAQ</a></div></section>`,
  },
  '/workflows': {
    title: 'PDF 工作流中心 | LocalPDFKit',
    description:
      '从真实 PDF 任务出发，找到适合分享、合并、转换、OCR、图片处理、归档和修复的工具路径。',
    body: `
      <section class="max-w-5xl mx-auto py-16 text-center"><p class="text-sm uppercase tracking-[0.3em] text-indigo-300 mb-4">工作流中心</p><h1 class="text-4xl md:text-6xl font-bold text-white mb-4">从 PDF 任务开始，而不是从工具名称开始</h1><p class="text-gray-400 text-lg">这些路径会把真实文档问题连接到合适的 LocalPDFKit 工具、教程和后续清理动作。</p></section>
      <section class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
        ${[
          [
            '适合分享的 PDF',
            '准备要通过邮件、上传入口或客户交付的 PDF。',
            ['压缩 PDF', '整理页面', '移除元数据'],
          ],
          [
            '合并和重新排序',
            '把报告、扫描件、表单或附件整理成一个干净的 PDF 包。',
            ['合并 PDF', '拆分 PDF', '整理 PDF'],
          ],
          [
            '转换和提取',
            '从 PDF 中复用文字、表格、图片，或转换 Office 文件。',
            ['PDF 转 Word', '提取表格', 'PDF 转文本'],
          ],
          [
            '扫描件和 OCR',
            '让图片型 PDF 更容易搜索、复制和分享。',
            ['OCR PDF', '修复 PDF', '压缩 PDF'],
          ],
          [
            '图片工作流',
            '在 PDF 页面和图片文件之间转换，处理截图、收据和页面预览。',
            ['图片转 PDF', 'PDF 转 JPG', '提取图片'],
          ],
          [
            '归档和修复',
            '准备长期记录，清理元数据，或恢复损坏文件。',
            ['PDF 转 PDF/A', '修复 PDF', '查看元数据'],
          ],
        ]
          .map(
            ([title, desc, tools]) =>
              `<article class="bg-gray-800 border border-gray-700 rounded-2xl p-7"><h2 class="text-2xl font-bold text-white mb-3">${title}</h2><p class="text-gray-400 mb-5">${desc}</p><div class="flex flex-wrap gap-2">${(
                tools as string[]
              )
                .map((tool) => `<span class="blog-chip">${tool}</span>`)
                .join('')}</div></article>`
          )
          .join('')}
      </section>
      <section class="max-w-5xl mx-auto py-16 text-center"><h2 class="text-3xl font-bold text-white mb-4">已经知道工具名称？</h2><p class="text-gray-400 mb-6">可以直接进入完整工具目录，或继续浏览博客教程。</p><div class="flex flex-wrap justify-center gap-4"><a href="/tools" class="lp-solid-cta">浏览全部工具</a><a href="/blog" class="lp-solid-cta">浏览博客</a></div></section>`,
  },
};

const toolSlugZh: Record<string, string> = {
  'add-watermark': '添加水印',
  'change-permissions': '更改权限',
  'compare-pdfs': '比较 PDF',
  'compress-pdf': '压缩 PDF',
  'decrypt-pdf': '解密 PDF',
  'delete-pages': '删除页面',
  'edit-pdf': '编辑 PDF',
  'encrypt-pdf': '加密 PDF',
  'excel-to-pdf': 'Excel 转 PDF',
  'extract-images': '提取图片',
  'extract-pages': '提取页面',
  'extract-tables': '提取表格',
  'flatten-pdf': '扁平化 PDF',
  'form-filler': '填写表单',
  'image-to-pdf': '图片转 PDF',
  'jpg-to-pdf': 'JPG 转 PDF',
  'merge-pdf': '合并 PDF',
  'ocr-pdf': 'OCR PDF',
  'organize-pdf': '整理 PDF',
  'pdf-to-docx': 'PDF 转 Word',
  'pdf-to-jpg': 'PDF 转 JPG',
  'pdf-to-png': 'PDF 转 PNG',
  'pdf-to-text': 'PDF 转文本',
  'png-to-pdf': 'PNG 转 PDF',
  'prepare-pdf-for-ai': '为 AI 准备 PDF',
  'remove-annotations': '移除批注',
  'remove-blank-pages': '移除空白页',
  'remove-metadata': '移除元数据',
  'remove-restrictions': '移除限制',
  'repair-pdf': '修复 PDF',
  'rotate-pdf': '旋转 PDF',
  'sanitize-pdf': '净化 PDF',
  'sign-pdf': '签署 PDF',
  'split-pdf': '拆分 PDF',
  'validate-signature-pdf': '验证签名',
  'view-metadata': '查看元数据',
  'word-to-pdf': 'Word 转 PDF',
};

const replaceTextNodes = (): void => {
  const dictionary = { ...commonTextZh, ...categoryZh };
  Object.values(blogPosts).forEach((post) => {
    dictionary[post.title] = post.title;
    dictionary[post.excerpt] = post.excerpt;
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  nodes.forEach((node) => {
    const source = node.textContent?.replace(/\s+/g, ' ').trim();
    if (!source) return;
    const post = Object.values(blogPosts).find(
      (entry) => entry.title === source || entry.excerpt === source
    );
    const translated = post
      ? post.title === source
        ? post.title
        : post.excerpt
      : dictionary[source];
    if (!translated || translated === source) return;
    node.textContent =
      node.textContent?.replace(source, translated) || translated;
  });
};

const getBlogSlug = (): string | null => {
  const match = normalizePath().match(/^\/blog\/([^/]+)$/);
  return match?.[1] || null;
};

const translateBlogIndex = (): void => {
  setText('.blog-page .blog-panel-eyebrow', '博客');
  setText('.blog-page .blog-title', '面向真实文档工作的 PDF 教程');
  document
    .querySelectorAll<HTMLAnchorElement>('a[href^="/blog/"]')
    .forEach((link) => {
      const slug = link.getAttribute('href')?.split('/').pop();
      const post = slug ? blogPosts[slug] : null;
      if (!post) return;
      link.querySelector('strong,h2,h3')?.replaceChildren(post.title);
      const excerpt = link.querySelector('p,span:not(.blog-chip)');
      if (excerpt) excerpt.textContent = post.excerpt;
      link.querySelector('.blog-chip')?.replaceChildren(post.category);
    });
};

const translateToolResourceCards = (): void => {
  document
    .querySelectorAll<HTMLAnchorElement>('.blog-resource-card[href^="/"]')
    .forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('/blog/')) return;

      const slug = href.replace(/^\/+/, '').replace(/\/$/, '');
      const toolName = toolSlugZh[slug];
      if (toolName) link.querySelector('strong')?.replaceChildren(toolName);

      const description = link.querySelector('span');
      if (description)
        description.textContent = '在 LocalPDFKit 中直接打开工具。';
    });
};

const renderBlogArticle = (post: BlogPostZh): string => {
  const toolLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      '.blog-resource-card[href^="/"]:not([href^="/blog/"])'
    )
  )
    .slice(0, 4)
    .map((link) => {
      const slug = (link.getAttribute('href') || '')
        .replace(/^\/+/, '')
        .replace(/\/$/, '');
      const label =
        toolSlugZh[slug] ||
        link.querySelector('strong')?.textContent?.trim() ||
        '相关工具';
      return `<li><a href="${link.getAttribute('href')}" class="text-indigo-300 hover:underline">${label}</a>：打开后先处理副本，再检查输出文件。</li>`;
    })
    .join('');

  return `
    <h2>这篇教程解决什么问题</h2>
    <p>${post.excerpt}</p>
    <p>${post.focus}</p>
    <h2>推荐处理顺序</h2>
    <ol>
      <li>先保留原始文件，不要直接覆盖重要文档。</li>
      <li>确认目标：是要上传、分享、归档、审阅，还是继续编辑。</li>
      <li>使用本文相关工具完成核心处理，并在导出后逐页检查结果。</li>
      <li>如果文件要发给他人，再检查文件大小、页面顺序、可读性和隐藏信息。</li>
    </ol>
    <h2>可直接使用的工具</h2>
    <ul>${toolLinks || '<li>从工具目录中选择和当前任务最接近的 PDF 工具。</li>'}</ul>
    <h2>提交或分享前的检查清单</h2>
    <ul>
      <li>页面顺序正确，没有缺页或重复页。</li>
      <li>关键文字、数字、日期和签名区域清晰可读。</li>
      <li>文件名能说明用途，方便收件人或门户识别。</li>
      <li>如涉及外发，先考虑压缩、移除元数据或净化副本。</li>
    </ul>
    <h2>常见错误</h2>
    <p>不要在没有检查输出的情况下直接提交最终文件；不要只看第一页就认为整个 PDF 都正确；也不要在没有权限的情况下处理他人的受限文件。</p>
  `;
};

const translateBlogDetail = (): void => {
  const slug = getBlogSlug();
  const post = slug ? blogPosts[slug] : null;
  if (!post) return;

  setMetadata(`${post.title} | LocalPDFKit 博客`, post.excerpt);
  setText('.blog-title', post.title);
  setText('.blog-lead', post.excerpt);
  document
    .querySelector('.blog-breadcrumbs span:last-child')
    ?.replaceChildren(post.title);
  document.querySelector('.blog-chip-strong')?.replaceChildren(post.category);

  const prose = document.querySelector<HTMLElement>('.blog-prose');
  if (prose) prose.innerHTML = renderBlogArticle(post);

  const sidebar = document.querySelector<HTMLElement>('.blog-sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="blog-panel blog-sticky-panel">
        <p class="blog-panel-eyebrow">本页内容</p>
        <nav class="blog-toc">
          <a class="blog-toc-link blog-toc-level-2" href="#">这篇教程解决什么问题</a>
          <a class="blog-toc-link blog-toc-level-2" href="#">推荐处理顺序</a>
          <a class="blog-toc-link blog-toc-level-2" href="#">可直接使用的工具</a>
          <a class="blog-toc-link blog-toc-level-2" href="#">提交或分享前的检查清单</a>
          <a class="blog-toc-link blog-toc-level-2" href="#">常见错误</a>
        </nav>
      </div>`;
  }

  translateBlogIndex();
  translateToolResourceCards();
};

const applyPageShellOverride = (): boolean => {
  const path = normalizePath();
  const override = pageHtml[path] || appHtml[path];
  if (!override) return false;

  setMetadata(override.title, override.description);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = override.body;
    return true;
  }
  return false;
};

export const applyZhPageOverrides = (language: SupportedLanguage): void => {
  if (language !== 'zh') return;

  if (applyPageShellOverride()) return;

  const path = normalizePath();
  if (path === '/blog' || path.startsWith('/blog/page/')) {
    setMetadata(
      'LocalPDFKit 博客 | PDF 教程和工作流指南',
      '阅读面向真实文档工作的 PDF 教程、故障排查文章和工作流指南。'
    );
    translateBlogIndex();
    translateToolResourceCards();
  } else if (path.startsWith('/blog/')) {
    translateBlogDetail();
  }

  replaceTextNodes();
};

export const translateCategory = (category: string): string => {
  return categoryZh[category] || category;
};
