<template>
  <div>
    <div class="blog">
      <div class="blog__header">
        <p class="publish-date">
          <time :datetime="$frontmatter.date">{{ publishDate }}</time>
        </p>
        <h1 class="blog__title">{{ $page.title }}</h1>
      </div>
      
      <!-- 用于直接渲染 HTML 内容的区域 -->
      <div class="wechat-content" v-html="$frontmatter.html_content"></div>

      <div class="copyright" style="font-style: italic;white-space: break-spaces;white-space: normal;font-size:14px;line-height: 1.5;">
——————<br/>
文档信息
<br/>
<br/>
<div>标题：<a target="__blank" v-bind:href="'https://imwangfu.com' + $page.path" >{{$page.title}}</a></div>
<div style="word-break: break-all;">发表时间：{{ publishDate }}</div>
<div style="word-break: break-all;">笔名：混沌福王</div>
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

      <div id="gitalk-container"></div>
    </div>
    <div class="blog" id="disqus_thread">
    </div>
  </div>
</template>

<script>
import { resolvePage, normalize, outboundRE, endingSlashRE } from "../util";

export default {
  name: "WechatPost",

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
  }
};

function resolvePrev(page, items) {
  return find(page, items, -1);
}

function resolveNext(page, items) {
  return find(page, items, 1);
}

function find(page, items, offset) {
  const res = [];
  flatten(items, res);
  for (let i = 0; i < res.length; i++) {
    const cur = res[i];
    if (cur.type === "page" && cur.path === decodeURIComponent(page.path)) {
      return res[i + offset];
    }
  }
}

function flatten(items, res) {
  for (let i = 0, l = items.length; i < l; i++) {
    if (items[i].type === "group") {
      flatten(items[i].children || [], res);
    } else {
      res.push(items[i]);
    }
  }
}
</script>

<style lang="stylus">
.blog
  padding-bottom 4rem
  padding-top 4.6rem
  .blog__header
    padding-top 2.4rem
    padding-bottom 1.2rem
  .publish-date
    color transparentify($textColor, 0.4)
  .blog__title
    margin-top 0
    font-size 2.4rem
  
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

@media (min-width: $MQMobile)
  .blog
    padding-left 1rem
    padding-right 1rem

@media (min-width: $MQNarrow)
  .blog
    padding-left 2rem
    padding-right 2rem

@media (min-width: $MQWide)
  .blog
    width $contentWidth
    margin 0 auto
    padding-left 0rem
    padding-right 0rem
</style> 