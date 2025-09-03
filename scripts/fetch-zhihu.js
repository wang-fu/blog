const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const slugify = require('slugify');

// 从命令行获取知乎文章URL
const articleUrl = process.argv[2];
if (!articleUrl) {
  console.error('请提供知乎文章URL');
  process.exit(1);
}

console.log(`开始处理知乎文章: ${articleUrl}`);

// 知乎文章抓取函数
async function fetchZhihuArticle(url) {
  let browser;
  try {
    // 启动浏览器 - 使用更多反检测参数
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      ignoreDefaultArgs: ['--disable-extensions']
    });
    
    console.log('浏览器已启动，正在打开页面...');
    
    // 打开页面并设置反检测
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // 设置额外的反检测参数
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
    
    // 设置语言和其他headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
    });
    
    // 访问文章URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('页面已加载，正在提取内容...');
    
    // 尝试等待知乎页面的结构加载，但不强制要求
    console.log('尝试等待页面元素加载...');
    
    // 使用更宽容的等待策略
    let foundElement = false;
    const selectors = [
      '.Post-Row-Content',
      'article.Post-Main', 
      '.Post-Main',
      '.Post-Title',
      'h1',
      'article'
    ];
    
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`找到元素: ${selector}`);
        foundElement = true;
        break;
      } catch (e) {
        console.log(`未找到元素: ${selector}`);
      }
    }
    
    if (!foundElement) {
      console.log('未找到任何预期元素，但继续处理...');
    }
    
    // 额外等待一些时间让页面完全加载（使用Promise包装）
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('页面处理完成，开始提取内容...');
    
    // 获取页面HTML
    const content = await page.content();
    
    // 调试：保存页面HTML到文件
    // const debugFile = path.join(__dirname, '../debug-zhihu.html');
    // fs.writeFileSync(debugFile, content);
    // console.log(`调试HTML已保存到: ${debugFile}`);
    
    // 调试：检查页面基本信息
    console.log('=== 页面调试信息 ===');
    const pageInfo = await page.evaluate(() => {
      // 获取页面上所有可能的选择器
      const selectors = [
        'h1', 'h2', 'h3', 'article', '.Post-Title', '.Post-Main', 
        '.Post-Row-Content', '.Post-RichTextContainer', '.Post-RichTextContainer #content',
        '.AuthorInfo-name', '.UserLink-link', '.ContentItem-time', '.RichText'
      ];
      
      const selectorResults = {};
      selectors.forEach(sel => {
        const elements = document.querySelectorAll(sel);
        selectorResults[sel] = {
          count: elements.length,
          text: elements.length > 0 ? elements[0].textContent.substring(0, 100) : ''
        };
      });
      
      return {
        title: document.title,
        url: window.location.href,
        bodyText: document.body ? document.body.innerText.substring(0, 1000) : 'No body text',
        selectors: selectorResults
      };
    });
    
    console.log('页面标题:', pageInfo.title);
    console.log('页面URL:', pageInfo.url);
    console.log('页面内容前1000字符:');
    console.log(pageInfo.bodyText);
    console.log('');
    console.log('=== 选择器检测结果 ===');
    Object.entries(pageInfo.selectors).forEach(([selector, info]) => {
      if (info.count > 0) {
        console.log(`${selector}: ${info.count}个 - "${info.text}"`);
      }
    });
    console.log('=== 调试信息结束 ===');
    
    // 关闭浏览器
    await browser.close();
    console.log('浏览器已关闭，正在解析内容...');
    
    // 使用cheerio解析HTML
    const $ = cheerio.load(content);
    
    // 调试：输出页面中存在的主要元素
    console.log('调试 - 页面元素检查:');
    console.log('- h1.Post-Title:', $('h1.Post-Title').length);
    console.log('- .Post-Main:', $('.Post-Main').length);
    console.log('- article:', $('article').length);
    console.log('- .Post-Row-Content:', $('.Post-Row-Content').length);
    console.log('- .Post-RichTextContainer:', $('.Post-RichTextContainer').length);
    console.log('- .Post-RichTextContainer #content:', $('.Post-RichTextContainer #content').length);
    console.log('- .AuthorInfo-name:', $('.AuthorInfo-name').length);
    console.log('- title标签内容:', $('title').text().substring(0, 100));
    
    // 提取文章信息
    let title = '';
    let author = '';
    let publishDate = '';
    
    // 尝试从多个可能的位置提取标题
    if ($('h1.Post-Title').length > 0) {
      title = $('h1.Post-Title').text().trim();
      console.log('标题提取策略: h1.Post-Title');
    } else if ($('h2[data-first-child]').length > 0) {
      title = $('h2[data-first-child]').text().trim();
      console.log('标题提取策略: h2[data-first-child]');
    } else if ($('.Post-Main .Post-Header h1').length > 0) {
      title = $('.Post-Main .Post-Header h1').text().trim();
      console.log('标题提取策略: .Post-Main .Post-Header h1');
    } else if ($('h1').length > 0) {
      title = $('h1').first().text().trim();
      console.log('标题提取策略: h1 (first)');
    } else {
      // 从页面标题中提取
      title = $('title').text().split(' - ')[0].trim();
      console.log('标题提取策略: title标签');
    }
    
    console.log(`提取到的标题: ${title}`);
    
    // 提取作者信息 - 根据实际HTML结构
    if ($('.AuthorInfo-name .UserLink-link').length > 0) {
      author = $('.AuthorInfo-name .UserLink-link').text().trim();
      console.log('作者提取策略: .AuthorInfo-name .UserLink-link');
    } else if ($('.AuthorInfo-name').length > 0) {
      author = $('.AuthorInfo-name').text().trim();
      console.log('作者提取策略: .AuthorInfo-name');
    } else if ($('.UserLink-link').length > 0) {
      author = $('.UserLink-link').first().text().trim();
      console.log('作者提取策略: .UserLink-link (first)');
    } else {
      // 从meta标签中提取
      const metaAuthor = $('meta[itemprop="name"]').attr('content');
      if (metaAuthor) {
        author = metaAuthor;
        console.log('作者提取策略: meta[itemprop="name"]');
      } else {
        author = '未知作者';
        console.log('作者提取策略: 使用默认值');
      }
    }
    
    console.log(`提取到的作者: ${author}`);
    
    // 提取发布时间
    if ($('.ContentItem-time').length > 0) {
      publishDate = $('.ContentItem-time').text().trim();
    } else if ($('.Post-Header .ContentItem-time').length > 0) {
      publishDate = $('.Post-Header .ContentItem-time').text().trim();
    } else {
      // 使用当前时间作为默认值
      publishDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    
    // 处理发布时间格式
    let formattedDate = publishDate;
    if (publishDate.includes('发布于')) {
      formattedDate = publishDate.replace('发布于 ', '');
    }
    
    // 尝试解析日期
    try {
      const parsed = moment(formattedDate, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD', 'MM-DD HH:mm']);
      if (parsed.isValid()) {
        formattedDate = parsed.format('YYYY-MM-DD HH:mm:ss');
      } else {
        formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
      }
    } catch (e) {
      formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    
    // 处理图片元素 - 知乎的图片结构
    $('.Post-RichTextContainer #content img, .Post-RichTextContainer img, article img').each((index, element) => {
      const $img = $(element);
      const dataSrc = $img.attr('data-src') || $img.attr('data-actualsrc');
      const src = $img.attr('src');
      
      // 如果存在data-src或data-actualsrc，优先使用
      if (dataSrc && (!src || !src.startsWith('http'))) {
        $img.attr('src', dataSrc);
        console.log(`修复图片链接 #${index}: ${dataSrc.substring(0, 100)}...`);
      }
      
      // 移除懒加载属性
      $img.removeAttr('data-src');
      $img.removeAttr('data-actualsrc');
      
      // 处理知乎的srcset属性
      if ($img.attr('srcset')) {
        $img.removeAttr('srcset');
      }
    });
    
    // 处理视频元素 - 知乎的视频结构
    $('.Post-RichTextContainer #content video, .Post-RichTextContainer video, article video').each((index, element) => {
      const $video = $(element);
      const poster = $video.attr('poster');
      
      // 创建视频占位符
      const $container = $('<div class="video-placeholder"></div>');
      $container.css({
        'margin': '20px auto',
        'max-width': '100%',
        'text-align': 'center',
        'border': '1px solid #ddd',
        'padding': '20px',
        'border-radius': '8px'
      });
      
      if (poster) {
        const $img = $('<img />');
        $img.attr('src', poster);
        $img.attr('alt', '视频封面');
        $img.css({
          'max-width': '100%',
          'height': 'auto',
          'border-radius': '4px'
        });
        $container.append($img);
      }
      
      // 添加提示文字
      const $notice = $('<p class="video-notice"></p>');
      $notice.text('⚠️ [视频内容] - 请访问原文查看完整视频');
      $notice.css({
        'margin-top': '10px',
        'font-size': '14px',
        'color': '#666'
      });
      $container.append($notice);
      
      // 替换视频元素
      $video.replaceWith($container);
      console.log(`替换视频为占位符 #${index}`);
    });
    
    // 提取文章内容 - 根据实际HTML结构
    let articleContent = '';
    if ($('.Post-RichTextContainer #content').length > 0) {
      articleContent = $('.Post-RichTextContainer #content').html().trim();
      console.log('使用选择器: .Post-RichTextContainer #content');
    } else if ($('.Post-RichTextContainer').length > 0) {
      articleContent = $('.Post-RichTextContainer').html().trim();
      console.log('使用选择器: .Post-RichTextContainer');
    } else if ($('.RichText.ztext.Post-RichText').length > 0) {
      articleContent = $('.RichText.ztext.Post-RichText').html().trim();
      console.log('使用选择器: .RichText.ztext.Post-RichText');
    } else if ($('.Post-RichTextContainer .RichText').length > 0) {
      articleContent = $('.Post-RichTextContainer .RichText').html().trim();
      console.log('使用选择器: .Post-RichTextContainer .RichText');
    } else if ($('.RichText').length > 0) {
      articleContent = $('.RichText').first().html().trim();
      console.log('使用选择器: .RichText');
    } else if ($('article.Post-Main').length > 0) {
      // 如果以上都找不到，提取整个文章主体
      articleContent = $('article.Post-Main').html().trim();
      console.log('使用选择器: article.Post-Main (fallback)');
    }
    
    console.log(`提取的内容长度: ${articleContent.length} 字符`);
    
    // 清理内容，保留代码块格式
    let processedContent = articleContent
      // 移除一些知乎特定的属性
      .replace(/data-[a-zA-Z0-9\-_]+="[^"]*"/g, '')
      .replace(/class="[^"]*ztext[^"]*"/g, 'class="content"')
      .trim();
    
    // 保护代码块内容的格式
    const codeBlocks = [];
    let placeholderIndex = 0;
    
    // 先保护 <pre> 标签内的内容
    processedContent = processedContent.replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, (match) => {
      const placeholder = `__CODE_BLOCK_${placeholderIndex}__`;
      codeBlocks[placeholderIndex] = match;
      placeholderIndex++;
      return placeholder;
    });
    
    // 再保护 <code> 标签内的内容  
    processedContent = processedContent.replace(/<code[^>]*>[\s\S]*?<\/code>/gi, (match) => {
      const placeholder = `__CODE_BLOCK_${placeholderIndex}__`;
      codeBlocks[placeholderIndex] = match;
      placeholderIndex++;
      return placeholder;
    });
    
    // 清理非代码块区域的多余空白
    processedContent = processedContent.replace(/\s+/g, ' ');
    
    // 恢复代码块内容
    codeBlocks.forEach((block, index) => {
      processedContent = processedContent.replace(`__CODE_BLOCK_${index}__`, block);
    });
    
    return {
      title: title || '未知标题',
      author: author || '未知作者',
      publishDate: formattedDate,
      content: processedContent,
      url
    };
  } catch (error) {
    console.error('抓取文章时出错:', error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

// 生成唯一的文件名
function generateUniqueFileName(title, publishDate, baseDir) {
  const datePrefix = moment(publishDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
  
  let titleSlug = slugify(title, {
    lower: true,
    strict: true,
    locale: 'zh-CN'
  });
  
  // 生成随机后缀确保唯一性
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  // 如果有titleSlug就用，没有就直接用随机后缀
  if (!titleSlug || titleSlug.trim() === '') {
    titleSlug = randomSuffix;
    console.log(`标题slugify结果为空，使用随机字符串: ${titleSlug}`);
  } else {
    titleSlug = `${titleSlug}-${randomSuffix}`;
    console.log(`添加随机后缀确保唯一性: ${titleSlug}`);
  }
  
  // 生成最终文件名（随机后缀已确保唯一性，无需再检测冲突）
  const fileName = `${datePrefix}-${titleSlug}.md`;
  const filePath = path.join(baseDir, fileName);
  
  return { fileName, filePath };
}

// 生成Markdown文件
function generateMarkdownFile(article) {
  // 创建目录（如果不存在）
  const baseDir = 'docs/blog/wechat';
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  // 生成唯一文件名
  const { fileName, filePath } = generateUniqueFileName(article.title, article.publishDate, baseDir);

  
  // 创建frontmatter
  const frontmatter = `---
title: ${article.title}
date: ${article.publishDate}
type: post
blog: true
render_type: html
description: ${article.title.substring(0, 100)}
tags:
- 知乎专栏
- ${article.author}
---

${article.content}

<hr />

<div class="original-link" style="margin-top: 20px; padding: 10px; background-color: #f8f8f8; border-radius: 6px;">
  <p style="margin: 0; font-size: 14px;">📝 本文自动同步自知乎，格式排版可能异常，其包含图片、视频内容可能无法正常显示和播放。</p>
  <p style="margin: 5px 0 0; font-size: 14px;">原文链接：<a href="${article.url}" target="_blank" rel="noopener noreferrer">点击查看原文</a></p>
</div>
`;
  
  // 写入文件
  fs.writeFileSync(filePath, frontmatter);
  console.log(`文章已保存到: ${filePath}`);
  
  return filePath;
}

// 主函数
async function main() {
  try {
    console.log('开始抓取知乎文章...');
    const article = await fetchZhihuArticle(articleUrl);
    
    console.log('文章信息:');
    console.log(`- 标题: ${article.title}`);
    console.log(`- 作者: ${article.author}`);
    console.log(`- 发布时间: ${article.publishDate}`);
    console.log(`- 内容长度: ${article.content.length} 字符`);
    
    const filePath = generateMarkdownFile(article);
    console.log(`同步完成! 文件已保存到: ${filePath}`);
    
    return {
      status: 'success',
      title: article.title,
      filePath
    };
  } catch (error) {
    console.error('处理文章时出错:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 