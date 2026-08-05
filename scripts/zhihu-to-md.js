/**
 * 把 scripts/zhihu-dump 下的知乎文章 JSON 转成博客 Markdown，并把图片下载到本地。
 *
 * 用法：node scripts/zhihu-to-md.js <dumpFile> <分类目录> <slug>
 *   例：node scripts/zhihu-to-md.js scripts/zhihu-dump/zhihu-21385240054.json ai black-tea-crohn
 */
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const [dumpFile, category, slug] = process.argv.slice(2);
if (!dumpFile || !category || !slug) {
  console.error('用法: node scripts/zhihu-to-md.js <dumpFile> <分类目录> <slug>');
  process.exit(1);
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const postDir = path.join('docs/blog', category);
const assetDir = path.join(postDir, slug);

async function downloadImage(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Referer: 'https://zhuanlan.zhihu.com/' },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

// 知乎正文里同一张图会有 _r / _b / 原始 三种尺寸，统一取原图
function normalizeImageUrl(url) {
  return url.replace(/_(r|b|hd|1440w|720w)\.(jpg|jpeg|png|gif|webp)$/i, '.$2');
}

function inline($, node) {
  let out = '';
  $(node)
    .contents()
    .each((_, el) => {
      if (el.type === 'text') {
        out += el.data;
        return;
      }
      const $el = $(el);
      const tag = el.tagName?.toLowerCase();
      if (tag === 'br') out += '\n';
      else if (tag === 'strong' || tag === 'b') out += `**${inline($, el).trim()}**`;
      else if (tag === 'em' || tag === 'i') out += `*${inline($, el).trim()}*`;
      else if (tag === 'code') out += `\`${$el.text()}\``;
      else if (tag === 'a') {
        const href = $el.attr('href') || '';
        const text = inline($, el).trim();
        // 知乎站内实体/搜索链接搬到博客没有意义，只保留文字
        const isInternalNoise = /zhida\.zhihu\.com|zhihu\.com\/search/.test(href);
        // 知乎的外链跳转页，取出真实地址
        const real = /link\.zhihu\.com/.test(href)
          ? decodeURIComponent(href.split('target=')[1] || href)
          : href;
        if (!text) out += '';
        else if (isInternalNoise || !real || real.startsWith('#')) out += text;
        else if (text === real) out += `<${real}>`;
        else out += `[${text}](${real})`;
      } else out += inline($, el);
    });
  return out;
}

function clean(text) {
  return text
    .replace(/\u200b/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function main() {
  const dump = JSON.parse(fs.readFileSync(dumpFile, 'utf8'));
  const $ = cheerio.load(`<div id="root">${dump.html}</div>`);

  fs.mkdirSync(assetDir, { recursive: true });

  const images = [];
  const blocks = [];

  async function walk(parent) {
    const children = $(parent).children().toArray();
    for (const el of children) {
      const tag = el.tagName?.toLowerCase();
      const $el = $(el);

      if (tag === 'figure' || ($el.find('img').length && ['p', 'div'].includes(tag) && !$el.text().trim())) {
        const $img = $el.find('img').first();
        const raw = $img.attr('data-original') || $img.attr('data-actualsrc') || $img.attr('src');
        if (raw && raw.startsWith('http')) {
          const src = normalizeImageUrl(raw);
          const ext = (src.match(/\.(jpg|jpeg|png|gif|webp)/i) || [null, 'jpg'])[1].toLowerCase();
          const name = `${slug}-${String(images.length + 1).padStart(2, '0')}.${ext}`;
          images.push({ src, name });
          const caption = $el.find('figcaption').text().trim();
          blocks.push(`![${caption || dump.title}](./${slug}/${name})`);
        }
        continue;
      }

      if (/^h[1-6]$/.test(tag)) {
        const level = Number(tag[1]);
        // 知乎正文最高只到 h2，博客里保持 ## 起步；标题内的加粗是冗余的
        const text = clean(inline($, el)).replace(/\*\*/g, '');
        blocks.push(`${'#'.repeat(Math.max(2, level))} ${text}`);
      } else if (tag === 'p') {
        // 知乎习惯在单个 <p> 里用 <br><br> 分段，逐行还原成独立段落
        clean(inline($, el))
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .forEach((line) => {
            // 手敲 ● / • 的伪列表，还原成 Markdown 列表
            const bullet = line.match(/^[●•·]\s*(.+)$/);
            blocks.push(bullet ? `- ${bullet[1].trim()}` : line);
          });
      } else if (tag === 'blockquote') {
        const text = clean(inline($, el));
        if (text) blocks.push(text.split('\n').map((l) => `> ${l}`).join('\n'));
      } else if (tag === 'ul' || tag === 'ol') {
        const items = $el
          .children('li')
          .toArray()
          .map((li, i) => `${tag === 'ol' ? `${i + 1}.` : '-'} ${clean(inline($, li))}`);
        if (items.length) blocks.push(items.join('\n'));
      } else if (tag === 'pre') {
        const lang = ($el.find('code').attr('class') || '').match(/language-(\w+)/)?.[1] || '';
        blocks.push(`\`\`\`${lang}\n${$el.text().replace(/\n+$/, '')}\n\`\`\``);
      } else if (tag === 'table') {
        const rows = $el
          .find('tr')
          .toArray()
          .map((tr) => $(tr).children().toArray().map((td) => clean(inline($, td)).replace(/\n/g, ' ')));
        if (rows.length) {
          const head = rows[0];
          blocks.push(
            [
              `| ${head.join(' | ')} |`,
              `| ${head.map(() => '---').join(' | ')} |`,
              ...rows.slice(1).map((r) => `| ${r.join(' | ')} |`),
            ].join('\n')
          );
        }
      } else if (tag === 'hr') {
        blocks.push('---');
      } else if (tag === 'div' || tag === 'section') {
        await walk(el);
      } else {
        const text = clean(inline($, el));
        if (text) blocks.push(text);
      }
    }
  }

  await walk($('#root')[0]);

  for (const img of images) {
    const dest = path.join(assetDir, img.name);
    try {
      await downloadImage(img.src, dest);
      console.log(`  图片 ✓ ${img.name}`);
    } catch (e) {
      console.error(`  图片 ✗ ${img.name} ${e.message}`);
    }
  }

  const body = blocks.join('\n\n').replace(/\n{3,}/g, '\n\n');
  const outFile = path.join(postDir, `${slug}.md`);
  fs.writeFileSync(outFile, body + '\n');

  console.log(`正文 → ${outFile}（${body.length} 字符，${images.length} 张图）`);
  console.log(`原始发布时间: ${dump.datePublished}`);
  console.log(`标题: ${dump.title}`);
}

main();
