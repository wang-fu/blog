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
  let browser;
  try {
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // 尝试使用系统默认浏览器位置，解决找不到Chrome的问题
      ignoreDefaultArgs: ['--disable-extensions']
    });
    
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
    
    // 处理所有图片元素，将data-src转为src
    $('#js_content img').each((index, element) => {
      const $img = $(element);
      const dataSrc = $img.attr('data-src');
      
      // 如果存在data-src属性，则使用data-src的值更新src
      if (dataSrc) {
        $img.attr('src', dataSrc);
        console.log(`修复图片链接 #${index}: ${dataSrc.substring(0, 100)}...`);
      }
    });
    
    // 处理所有视频iframe元素 - 替换为图片和提示
    $('#js_content iframe.video_iframe, #js_content .video_iframe').each((index, element) => {
      const $iframe = $(element);
      const dataCover = $iframe.attr('data-cover');
      const vid = $iframe.attr('vid') || $iframe.attr('data-mpvid');
      
      // 创建用于替换的容器
      const $container = $('<div class="video-placeholder"></div>');
      $container.css({
        'margin': '20px auto',
        'max-width': '100%',
        'text-align': 'center'
      });
      
      // 如果有封面图，添加图片
      if (dataCover) {
        // 处理封面URL (通常URL编码了)
        let coverUrl = dataCover;
        if (coverUrl.startsWith('http%3A')) {
          try {
            coverUrl = decodeURIComponent(coverUrl);
          } catch (e) {
            console.log('无法解码封面URL:', e);
          }
        }
        
        const $img = $('<img />');
        $img.attr('src', coverUrl);
        $img.attr('alt', '视频封面');
        $img.css({
          'max-width': '100%',
          'height': 'auto',
          'border-radius': '8px'
        });
        $container.append($img);
      } else {
        // 没有封面则添加占位图
        const $placeholder = $('<div class="video-no-cover"></div>');
        $placeholder.css({
          'background-color': '#f2f2f2',
          'height': '200px',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'border-radius': '8px'
        });
        $placeholder.text('视频内容');
        $container.append($placeholder);
      }
      
      // 添加提示文字
      const $notice = $('<p class="video-notice"></p>');
      $notice.text('⚠️ [视频]——微信视频无法播放，请访问公众号查看原文');
      $notice.css({
        'margin-top': '10px',
        'font-size': '14px',
        'color': '#888'
      });
      $container.append($notice);
      
      // 替换原有的iframe
      $iframe.replaceWith($container);
      console.log(`替换视频为封面图 #${index}`);
    });
    
    // 特殊处理：针对您示例中的特殊情况
    $('#js_content section[nodeleaf]').each((index, element) => {
      const $section = $(element);
      const html = $section.html();
      
      // 查找视频ID和封面
      if (html && (html.includes('vid=') || html.includes('data-cover'))) {
        let coverUrl = null;
        const coverMatch = html.match(/data-cover="([^"]+)"/);
        if (coverMatch && coverMatch[1]) {
          coverUrl = coverMatch[1];
          // 解码URL
          if (coverUrl.startsWith('http%3A')) {
            try {
              coverUrl = decodeURIComponent(coverUrl);
            } catch (e) {
              console.log('无法解码封面URL:', e);
            }
          }
        }
        
        // 创建替换内容
        const $container = $('<div class="video-placeholder"></div>');
        $container.css({
          'margin': '20px auto',
          'max-width': '100%',
          'text-align': 'center'
        });
        
        if (coverUrl) {
          const $img = $('<img />');
          $img.attr('src', coverUrl);
          $img.attr('alt', '视频封面');
          $img.css({
            'max-width': '100%',
            'height': 'auto',
            'border-radius': '8px'
          });
          $container.append($img);
        } else {
          const $placeholder = $('<div class="video-no-cover"></div>');
          $placeholder.css({
            'background-color': '#f2f2f2',
            'height': '200px',
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'border-radius': '8px'
          });
          $placeholder.text('视频内容');
          $container.append($placeholder);
        }
        
        // 添加提示文字
        const $notice = $('<p class="video-notice"></p>');
        $notice.text('⚠️ [视频]——微信视频无法播放，请访问公众号查看原文');
        $notice.css({
          'margin-top': '10px',
          'font-size': '14px',
          'color': '#888'
        });
        $container.append($notice);
        
        // 替换整个section内容
        $section.html($container);
        console.log(`替换特殊视频区域为封面图 #${index}`);
      }
    });
    
    // 提取文章内容HTML
    const articleContent = $('#js_content').html().trim();
    
    // 处理文章内容，修复相对路径等问题，但保留图片src属性
    const processedContent = articleContent
      // 移除一些微信特定的属性，但保留图片相关的重要属性
      .replace(/data-[a-zA-Z0-9\-_]+="[^"]*"/g, function(match) {
        // 保留data-src属性作为备份
        if (match.startsWith('data-src=')) {
          return match;
        }
        return '';
      })
      // 确保图片可见性
      .replace(/style="visibility:\s*hidden/g, 'style="visibility: visible');
    
    return {
      title,
      author,
      publishDate,
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
- 微信公众号
- ${article.author || '混沌随想'}
---

${article.content}

<hr />

<div class="original-link" style="margin-top: 20px; padding: 10px; background-color: #f8f8f8; border-radius: 6px;">
  <p style="margin: 0; font-size: 14px;">⚠️ 本文自动同步自公众号，排版可能异常，其包含图片、视频内容可能无法正常显示和播放。</p>
  <p style="margin: 5px 0 0; font-size: 14px;">原文链接：<a href="${article.url}" target="_blank" rel="noopener noreferrer">点击查看微信公众号原文</a></p>
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