const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const slugify = require('slugify');

// 从命令行获取微信文章URL
const articleUrl = process.argv[2];
if (!articleUrl) {
  console.error('请提供微信文章URL');
  process.exit(1);
}

console.log(`开始处理文章: ${articleUrl}`);

// 微信文章抓取函数
async function fetchWechatArticle(url) {
  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('浏览器已启动，正在打开页面...');
    
    // 打开页面
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36');
    
    // 访问文章URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('页面已加载，正在提取内容...');
    
    // 等待内容加载
    await page.waitForSelector('#activity-name', { timeout: 30000 });
    await page.waitForSelector('#js_content', { timeout: 30000 });
    
    // 获取页面HTML
    const content = await page.content();
    
    // 关闭浏览器
    await browser.close();
    console.log('浏览器已关闭，正在解析内容...');
    
    // 使用cheerio解析HTML
    const $ = cheerio.load(content);
    
    // 提取文章信息
    const title = $('#activity-name').text().trim();
    const publishTime = $('#publish_time').text().trim();
    const author = $('.rich_media_meta_text').first().text().trim();
    
    // 格式化发布时间
    const publishDate = moment(publishTime, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
    
    // 提取文章内容HTML
    const articleContent = $('#js_content').html().trim();
    
    // 处理文章内容，修复相对路径等问题
    const processedContent = articleContent
      // 移除微信特定的data属性和样式
      .replace(/data-[a-zA-Z0-9\-_]+="[^"]*"/g, '')
      // 确保图片可见性
      .replace(/style="visibility:\s*hidden/g, 'style="visibility: visible')
      // 移除微信特定的类
      .replace(/class="[^"]*"/g, '');
    
    return {
      title,
      author,
      publishDate,
      content: processedContent,
      url
    };
  } catch (error) {
    console.error('抓取文章时出错:', error);
    await browser.close();
    throw error;
  }
}

// 生成Markdown文件
function generateMarkdownFile(article) {
  // 创建文件名 (基于日期和标题)
  const datePrefix = moment(article.publishDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
  const titleSlug = slugify(article.title, {
    lower: true,
    strict: true,
    locale: 'zh-CN'
  });
  
  const fileName = `${datePrefix}-${titleSlug}.md`;
  const filePath = path.join('docs/blog/wechat', fileName);
  
  // 创建frontmatter
  const frontmatter = `---
title: ${article.title}
date: ${article.publishDate}
type: post
blog: true
render_type: html
description: ${article.title.substring(0, 100)}
tags:
- 微信公众号
- ${article.author || '混沌福王'}
---

${article.content}
`;
  
  // 写入文件
  fs.writeFileSync(filePath, frontmatter);
  console.log(`文章已保存到: ${filePath}`);
  
  return filePath;
}

// 主函数
async function main() {
  try {
    console.log('开始抓取微信文章...');
    const article = await fetchWechatArticle(articleUrl);
    
    console.log('文章信息:');
    console.log(`- 标题: ${article.title}`);
    console.log(`- 作者: ${article.author}`);
    console.log(`- 发布时间: ${article.publishDate}`);
    
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