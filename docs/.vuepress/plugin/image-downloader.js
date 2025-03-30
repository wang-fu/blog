/**
 * 微信图片下载和本地化插件
 * 用于自动下载微信文章中的图片并替换为本地路径
 */
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const crypto = require('crypto')
const url = require('url')

module.exports = (options = {}, context) => {
  const {
    sourceDir, // docs 文件夹的绝对路径
    outDir, // 构建输出目录
    tempPath, // 临时目录路径
    isProd, // 是否生产环境
  } = context

  // 持久存储图片的目录（源码的一部分）
  const ASSETS_DIR = path.resolve(sourceDir, 'assets/images/wechat')
  
  // 开发环境临时目录（不会提交到git）
  const TEMP_ASSETS_DIR = path.resolve(tempPath, 'images/wechat')
  
  // 确保目录存在
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true })
  }
  
  if (!fs.existsSync(TEMP_ASSETS_DIR)) {
    fs.mkdirSync(TEMP_ASSETS_DIR, { recursive: true })
  }

  // 图片缓存记录，避免重复下载
  const imageCache = {}
  
  // 下载图片到本地
  const downloadImage = async (imageUrl, filename) => {
    const localPath = path.join(ASSETS_DIR, filename)
    const publicPath = `/assets/images/wechat/${filename}`
    
    // 如果文件已存在，直接返回路径
    if (fs.existsSync(localPath)) {
      // 同时确保开发环境临时目录也有这个文件
      const tempPath = path.join(TEMP_ASSETS_DIR, filename)
      if (!fs.existsSync(tempPath)) {
        fs.copyFileSync(localPath, tempPath)
      }
      return publicPath
    }
    
    try {
      const response = await axios({
        method: 'get',
        url: imageUrl,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
          'Referer': 'https://mp.weixin.qq.com/'
        }
      })
      
      // 写入到持久存储目录
      const writer = fs.createWriteStream(localPath)
      response.data.pipe(writer)
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          // 同时写入到开发环境临时目录
          try {
            fs.copyFileSync(localPath, path.join(TEMP_ASSETS_DIR, filename))
          } catch (e) {
            console.error('复制到临时目录失败:', e)
          }
          resolve(publicPath)
        })
        writer.on('error', reject)
      })
    } catch (error) {
      console.error(`下载图片失败: ${imageUrl}`, error.message)
      return imageUrl // 失败时返回原始URL
    }
  }
  
  // 生成图片文件名
  const generateFilename = (imageUrl) => {
    // 从URL提取域名作为前缀
    const parsedUrl = url.parse(imageUrl)
    const domain = parsedUrl.hostname.replace(/\./g, '_')
    
    // 用MD5哈希URL作为文件名
    const hash = crypto.createHash('md5').update(imageUrl).digest('hex')
    
    // 尝试保留原始文件扩展名
    let ext = 'jpg' // 默认扩展名
    const queryParams = new URLSearchParams(parsedUrl.search || '')
    if (queryParams.get('wx_fmt')) {
      ext = queryParams.get('wx_fmt')
    } else if (imageUrl.includes('.png')) {
      ext = 'png'
    } else if (imageUrl.includes('.gif')) {
      ext = 'gif'
    } else if (imageUrl.includes('.webp')) {
      ext = 'webp'
    }
    
    return `${domain}_${hash}.${ext}`
  }
  
  // 处理HTML内容中的图片
  const processHtmlImages = async (html) => {
    if (!html) return html
    
    // 匹配图片标签
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    let match
    let promises = []
    let replacements = []
    
    // 收集所有图片URL和下载任务
    while ((match = imgRegex.exec(html)) !== null) {
      const [fullTag, imageUrl] = match
      
      // 判断是否是微信图片
      if (imageUrl.includes('mmbiz.qpic.cn') || 
          imageUrl.includes('mmbiz.qlogo.cn') || 
          imageUrl.includes('wx_fmt=')) {
        
        // 生成本地文件名
        const filename = generateFilename(imageUrl)
        
        // 添加到下载队列
        if (!imageCache[imageUrl]) {
          promises.push(
            downloadImage(imageUrl, filename).then(localPath => {
              imageCache[imageUrl] = localPath
              replacements.push({ original: imageUrl, local: localPath })
            })
          )
        } else {
          replacements.push({ original: imageUrl, local: imageCache[imageUrl] })
        }
      }
    }
    
    // 等待所有图片下载完成
    await Promise.all(promises)
    
    // 替换HTML中的图片URL
    let processedHtml = html
    for (const { original, local } of replacements) {
      processedHtml = processedHtml.replace(
        new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
        local
      )
    }
    
    return processedHtml
  }

  // 在构建后处理阶段，复制图片到输出目录
  const copyImagesToOutput = () => {
    const outputImagesDir = path.resolve(outDir, 'assets/images/wechat')
    
    // 确保输出目录存在
    if (!fs.existsSync(outputImagesDir)) {
      fs.mkdirSync(outputImagesDir, { recursive: true })
    }
    
    // 复制图片文件
    if (fs.existsSync(ASSETS_DIR)) {
      const files = fs.readdirSync(ASSETS_DIR)
      files.forEach(file => {
        const srcPath = path.join(ASSETS_DIR, file)
        const destPath = path.join(outputImagesDir, file)
        
        // 只复制文件，不复制子目录
        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath)
        }
      })
    }
  }
  
  // 初始时就复制已有图片到临时目录
  const syncExistingImages = () => {
    if (fs.existsSync(ASSETS_DIR)) {
      const files = fs.readdirSync(ASSETS_DIR)
      files.forEach(file => {
        const srcPath = path.join(ASSETS_DIR, file)
        const tempPath = path.join(TEMP_ASSETS_DIR, file)
        
        // 只复制文件，不复制子目录
        if (fs.statSync(srcPath).isFile() && !fs.existsSync(tempPath)) {
          try {
            fs.copyFileSync(srcPath, tempPath)
          } catch (e) {
            console.error(`复制文件到临时目录失败 ${file}:`, e)
          }
        }
      })
    }
  }

  // 注册开发服务器中间件，提供静态文件访问
  const addDevServerMiddleware = (app) => {
    // 注册一个中间件，处理微信图片请求
    app.use('/assets/images/wechat', (req, res, next) => {
      const requestedFile = path.basename(req.path);
      const filePath = path.join(TEMP_ASSETS_DIR, requestedFile);
      
      if (fs.existsSync(filePath)) {
        // 确定MIME类型
        let contentType = 'image/jpeg';
        if (requestedFile.endsWith('.png')) {
          contentType = 'image/png';
        } else if (requestedFile.endsWith('.gif')) {
          contentType = 'image/gif';
        } else if (requestedFile.endsWith('.webp')) {
          contentType = 'image/webp';
        }
        
        // 设置内容类型并发送文件
        res.setHeader('Content-Type', contentType);
        fs.createReadStream(filePath).pipe(res);
      } else {
        next();
      }
    });
  };

  // 插件初始化时同步已有图片
  syncExistingImages()

  return {
    name: 'vuepress-plugin-image-downloader',
    
    // 注册开发服务器中间件
    beforeDevServer(app) {
      addDevServerMiddleware(app);
    },
    
    // 在 VuePress 准备构建阶段处理内容
    async extendPageData($page) {
      const { frontmatter, _strippedContent } = $page
      
      // 只处理带有 render_type: html 的页面
      if (frontmatter && frontmatter.render_type === 'html' && _strippedContent) {
        try {
          // 处理HTML内容中的图片
          const processedContent = await processHtmlImages(_strippedContent)
          
          // 将处理后的内容保存回页面数据
          $page.processedHtmlContent = processedContent
        } catch (error) {
          console.error(`处理页面图片失败: ${$page.path}`, error)
        }
      }
    },
    
    // 在生成完所有页面后，复制图片到输出目录 (仅在生产环境)
    generated() {
      copyImagesToOutput()
    }
  }
} 