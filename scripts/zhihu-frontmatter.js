/**
 * 给 zhihu-to-md.js 产出的正文补上 frontmatter。
 * 发布时间取知乎原文的首发时间（UTC 转北京时间），保证博客列表顺序与原始发表顺序一致。
 *
 * 用法：node scripts/zhihu-frontmatter.js
 */
const fs = require('fs');
const path = require('path');

const DUMP_DIR = 'scripts/zhihu-dump';
const mapping = JSON.parse(fs.readFileSync(path.join(DUMP_DIR, 'mapping.json'), 'utf8'));
const meta = JSON.parse(fs.readFileSync(path.join(DUMP_DIR, 'meta.json'), 'utf8'));

const BOOK_URL = 'https://book.imwangfu.com/';
const BOOK_REPO = 'https://github.com/openkursar-flynn/build-ai-agent-platform';
const HALO_REPO = 'https://github.com/openkursar/hello-halo';

function beijingTime(iso) {
  const d = new Date(new Date(iso).getTime() + 8 * 3600 * 1000);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

function bookFooter(chapter) {
  return [
    '',
    '---',
    '',
    `> 本文是《如何从零构建 7×24 小时 AI Agent》的第 ${chapter} 章。`,
    '>',
    `> - 全书在线阅读：<${BOOK_URL}>`,
    `> - 全书仓库与反馈：<${BOOK_REPO}>`,
    `> - 书中所述系统的开源实现 Halo：<${HALO_REPO}>`,
  ].join('\n');
}

for (const m of mapping) {
  const dump = JSON.parse(fs.readFileSync(path.join(DUMP_DIR, `zhihu-${m.id}.json`), 'utf8'));
  const info = meta[m.id];
  if (!info) {
    console.error(`缺少 meta: ${m.id}`);
    continue;
  }

  const file = path.join('docs/blog', m.category, `${m.slug}.md`);
  let body = fs.readFileSync(file, 'utf8').trim();

  // 正文里若重复了标题，去掉，避免和 frontmatter 的 title 撞车
  body = body.replace(/^#{1,2}\s*《?第[一二三四五六七八九十]+章[^\n]*\n+/, '');

  if (info.book) body += `\n${bookFooter(info.book)}`;

  const frontmatter = [
    '---',
    `title: ${info.title}`,
    `date: ${beijingTime(dump.datePublished)}`,
    'type: post',
    'blog: true',
    `description: ${info.description}`,
    'tags:',
    ...info.tags.map((t) => `    - ${t}`),
    '---',
    '',
  ].join('\n');

  fs.writeFileSync(file, `${frontmatter}${body}\n`);
  console.log(`${beijingTime(dump.datePublished)}  ${file}`);
}
