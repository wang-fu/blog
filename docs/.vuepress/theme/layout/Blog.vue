<template>
  <div>
  <div class="blog">
    <div class="blog__header">
      <p class="publish-date">
        <time :datetime="$frontmatter.date">{{ publishDate }}</time>
      </p>
      <p v-if="$page.readingTime">Time to read: {{ $page.readingTime.text }}</p>
      <h1 class="blog__title">{{ $page.title }}</h1>
    </div>
    <div v-if="$page.isHtmlContent" class="wechat-content html-isolated" v-html="$page.processedHtmlContent || $page.htmlContent || $page._strippedContent"></div>
    <Content v-else class="custom" />

    <div class="copyright" style="font-style: italic;white-space: break-spaces;white-space: normal;font-size:14px;line-height: 1.5;">
——————<br/>
文档信息
<br/>
<br/>
<div>标题：<a target="__blank" v-bind:href="'https://imwangfu.com' + $page.path" >{{$page.title}}</a></div>
<div style="word-break: break-all;">发表时间：{{ publishDate }}</div>
<div style="word-break: break-all;">笔名：混沌随想</div>
<div style="word-break: break-all;">原链接：<a target="__blank" v-bind:href="'https://imwangfu.com' + $page.path" >https://imwangfu.com{{$page.path}}</a></div>
<div style="word-break: break-all;">版权声明：如需转载，请邮件知会 imwangfu@gmail.com，并保留此文档信息申明</div>
<br/>
<div style="word-break: break-all;">更多深度随想可以关注公众号：混沌随想</div>
——————
    </div>
    <div class="wx-qrcode">
      <img style="width:36%" src="/left.png" alt="" />
      <img style="width:64%" src="/right.png" alt="" />
    </div>

    <div class="page-edit">
      <div class="edit-link" v-if="editLink">
        <a :href="editLink" target="_blank" rel="noopener noreferrer">{{
          editLinkText
        }}</a>
        <OutboundLink />
      </div>
      <div class="last-updated" v-if="lastUpdated">
        <span class="prefix">{{ lastUpdatedText }}: </span>
        <time class="time" :datetime="$page.lastUpdated">{{
          lastUpdated
        }}</time>
      </div>
    </div>

    <div class="page-nav" v-if="prev || next">
      <p class="inner">
        <span v-if="prev" class="prev">
          ←
          <router-link v-if="prev" class="prev" :to="prev.path">
            {{ prev.title || prev.path }}
          </router-link>
        </span>

        <span v-if="next" class="next">
          <router-link v-if="next" :to="next.path">
            {{ next.title || next.path }}
          </router-link>
          →
        </span>
      </p>
    </div>

    <slot name="bottom" />
    <div id="gitalk-container"></div>
  </div>
  <div class="blog" id="disqus_thread">
  </div>
  </div>
</template>

<script>
import { resolvePage, normalize, outboundRE, endingSlashRE } from "../util";
import "gitalk/dist/gitalk.css";
import Gitalk from "gitalk";

export default {
  name: "Blog",

  props: ["sidebarItems"],

  computed: {
    lastUpdated() {
      if (this.$page.lastUpdated) {
        const dateFormat = new Date(this.$page.lastUpdated);

        const options = {
          year: "numeric",
          month: "long",
          day: "numeric",
        };

        return `${dateFormat.toLocaleDateString(
          this.$lang,
          options
        )}, ${dateFormat.toLocaleTimeString(this.$lang)}`;
      }
    },

    lastUpdatedText() {
      if (typeof this.$themeLocaleConfig.lastUpdated === "string") {
        return this.$themeLocaleConfig.lastUpdated;
      }
      if (typeof this.$site.themeConfig.lastUpdated === "string") {
        return this.$site.themeConfig.lastUpdated;
      }
      return "Last Updated";
    },

    prev() {
      const prev = this.$page.frontmatter.prev;
      if (prev === false) {
        return;
      } else if (prev) {
        return resolvePage(this.$site.pages, prev, this.$route.path);
      } else {
        return resolvePrev(this.$page, this.sidebarItems);
      }
    },

    next() {
      const next = this.$page.frontmatter.next;
      if (next === false) {
        return;
      } else if (next) {
        return resolvePage(this.$site.pages, next, this.$route.path);
      } else {
        return resolveNext(this.$page, this.sidebarItems);
      }
    },

    editLink() {
      if (this.$page.frontmatter.editLink === false) {
        return;
      }
      const {
        repo,
        editLinks,
        docsDir = "",
        docsBranch = "master",
        docsRepo = repo,
      } = this.$site.themeConfig;

      let path = normalize(this.$page.path);
      if (endingSlashRE.test(path)) {
        path += "README.md";
      } else {
        path += ".md";
      }
      if (docsRepo && editLinks) {
        return this.createEditLink(repo, docsRepo, docsDir, docsBranch, path);
      }
    },

    editLinkText() {
      return (
        this.$themeLocaleConfig.editLinkText ||
        this.$site.themeConfig.editLinkText ||
        `Edit this page`
      );
    },

    publishDate() {
      let dateFormat = new Date(this.$frontmatter.date);
      const removeUtcString = this.$frontmatter.date.split(".000Z");
      // 默认时区是 utc, 把 .000Z 时区标识去掉
      if (removeUtcString && removeUtcString.length) {
        dateFormat = new Date(removeUtcString[0]);
      }
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return dateFormat.toLocaleDateString(this.$lang, options);
    },
  },
  mounted: () => {
    // const gitalk = new Gitalk({
    //   clientID: 'Iv1.a9c8f13d8adef63c',
    //   clientSecret: '68c8b5b28726846b97eca4922bd7a624bc74d6f2',
    //   repo: 'wang-fu.github.iocc',
    //   owner: 'wang-fu',
    //   admin: ['wang-fu'],
    //   id: location.pathname,      // Ensure uniqueness and length less than 50
    //   distractionFreeMode: false  // Facebook-like distraction free mode
    // })
    // gitalk.render('gitalk-container');


    /**
    *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
    *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
    /*
    var disqus_config = function () {
    this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
    this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };
    */
      (function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = 'https://hun-dun-fu-wang.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();

  },
  methods: {
    createEditLink(repo, docsRepo, docsDir, docsBranch, path) {
      const bitbucket = /bitbucket.org/;
      if (bitbucket.test(repo)) {
        const base = outboundRE.test(docsRepo) ? docsRepo : repo;
        return (
          base.replace(endingSlashRE, "") +
          `/${docsBranch}` +
          (docsDir ? "/" + docsDir.replace(endingSlashRE, "") : "") +
          path +
          `?mode=edit&spa=0&at=${docsBranch}&fileviewer=file-view-default`
        );
      }

      const base = outboundRE.test(docsRepo)
        ? docsRepo
        : `https://github.com/${docsRepo}`;

      return (
        base.replace(endingSlashRE, "") +
        `/edit/${docsBranch}` +
        (docsDir ? "/" + docsDir.replace(endingSlashRE, "") : "") +
        path
      );
    },
  },
};

function resolvePrev(page, items) {
  return find(page, items, -1);
}

function resolveNext(page, items) {
  return find(page, items, 1);
}

function find(page, items, offset) {
  const res = [];
  items.forEach((item) => {
    if (item.type === "group") {
      res.push(...(item.children || []));
    } else {
      res.push(item);
    }
  });
  for (let i = 0; i < res.length; i++) {
    const cur = res[i];
    if (cur.type === "page" && cur.path === page.path) {
      return res[i + offset];
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../styles/config.styl';
@require '../styles/wrapper.styl';
.blog {
  @extend $wrapper;
}

.wx-qrcode {
  padding: 20px 0px 10px 0px;
  display: flex;
  max-width: 530px;
}

.blog__header {
  padding-top: 4.6rem;
}

.blog__title {
  margin-top: 0;
}

.publish-date {
  margin-bottom: 0.5rem;
  font-family: 'Poppins';
}

.page-edit {
  @extend $wrapper;
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-left: 0;
  padding-right: 0;
  overflow: auto;

  .edit-link {
    display: inline-block;

    a {
      color: lighten($textColor, 25%);
      margin-right: 0.25rem;
    }
  }

  .last-updated {
    float: right;
    font-size: 0.9em;

    .prefix {
      font-weight: 500;
      color: lighten($textColor, 25%);
    }

    .time {
      font-weight: 400;
      color: #aaa;
    }
  }
}

.page-nav {
  padding-top: 1rem;
  padding-bottom: 0;

  .inner {
    min-height: 2rem;
    margin-top: 0;
    border-top: 1px solid $borderColor;
    padding-top: 1rem;
    overflow: auto; // clear float
  }

  .next {
    float: right;
  }
}

@media (max-width: $MQMobile) {
  .page-edit {
    .edit-link {
      margin-bottom: 0.5rem;
    }

    .last-updated {
      font-size: 0.8em;
      float: none;
      text-align: left;
    }
  }
}

@media (max-width: $MQMobileNarrow) {
  .blog__title {
    font-size: 2.441rem;
  }
}

.wechat-content
  margin-bottom 2rem
  overflow-wrap break-word


  
  img
    max-width 100%

  p, li, ul, ol
    line-height 1.7

  a
    font-weight 500
    color $accentColor
    text-decoration none

  blockquote
    font-size 1rem
    color #999
    border-left .2rem solid #dfe2e5
    margin 1rem 0
    padding .25rem 0 .25rem 1rem

    & > p
      margin 0

  ul, ol
    padding-left 1.2em

  .header-anchor
    font-size 0.85em
    float left
    margin-left -0.87em
    padding-right 0.23em
    margin-top 0.125em
    opacity 0

    &:hover
      text-decoration none

  code, kbd, .line-number
    font-family source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace

  p, ul, ol
    line-height 1.7

  hr
    border 0
    border-top 1px solid $borderColor

  .table-of-contents
    .badge
      vertical-align middle
</style>

<style>
.custom img {
  width: 100%;
}

/* HTML内容样式隔离 */
.html-isolated {
  /* 重置所有可能的样式继承 */
  all: initial;
  /* 保留区块显示和宽度 */
  display: block;
  width: 100%;
  /* 保留字体和颜色 */
  color: #2c3e50;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  /* 基本内边距 */
  padding: 0;
  margin-bottom: 2rem;
}

/* 只为HTML隔离区域内的图片设置必要样式 */
.html-isolated img {
  max-width: 100%;
  height: auto;
}

/* 确保链接颜色正确 */
.html-isolated a {
  color: #3eaf7c;
  text-decoration: none;
}

/* 允许HTML内容中的元素使用自己的样式 */
.html-isolated * {
  /* 保留内联样式 */
  max-width: 100%;
}

.html-isolated p, .html-isolated li, .html-isolated ul, .html-isolated ol {
  line-height: 1.5;
  margin: 12px 0px;
}

/* 确保区块引用样式看起来不错 */
.html-isolated blockquote {
  border-left: 4px solid #dfe2e5;
  padding-left: 1rem;
  color: #6a737d;
  margin: 1rem 0;
}
</style>