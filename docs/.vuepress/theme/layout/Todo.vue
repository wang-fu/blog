<template>
  <div class="blog">
    <div class="blog__header">
      <p class="publish-date"><time :datetime="$frontmatter.date">{{ publishDate }}</time></p>
      <p v-if="$page.readingTime">Time to read: {{ $page.readingTime.text }}</p>
      <h1 class="blog__title">{{ $page.title }}</h1>
    </div>
    您访问到了暂未完成的文章链接，此文章可能正在编辑、未发布状态，或者已经被作者废弃。
    <div  class="copyright" style="white-space: break-spaces">
——————
文档信息

标题：<a target="__blank" v-bind:href="'https://imwangfu.com' + $page.path" >{{$page.title}}</a>
发表时间：待定
笔名：混沌福王
原链接：<a target="__blank" v-bind:href="'https://imwangfu.com' + $page.path" >https://imwangfu.com{{$page.path}}</a>
版权声明：未完成文章，禁止转载
——————
</div>
  

    <div class="page-edit">
      <div
        class="edit-link"
        v-if="editLink"
      >
        <a
          :href="editLink"
          target="_blank"
          rel="noopener noreferrer"
        >{{ editLinkText }}</a>
        <OutboundLink/>
      </div>
      <div
        class="last-updated"
        v-if="lastUpdated"
      >
        <span class="prefix">{{ lastUpdatedText }}: </span>
        <time class="time" :datetime="$page.lastUpdated">{{ lastUpdated }}</time>
      </div>
    </div>

    <slot name="bottom"/>
    <div id="gitalk-container"></div>
  </div>
</template>

<script>
import { resolvePage, normalize, outboundRE, endingSlashRE } from '../util'
import 'gitalk/dist/gitalk.css'
import Gitalk from 'gitalk'

export default {
  name: 'Blog',

  props: ['sidebarItems'],

  computed: {
    lastUpdated () {
      if (this.$page.lastUpdated) {
        const dateFormat = new Date(this.$page.lastUpdated)

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        } 
        
        return `${dateFormat.toLocaleDateString(this.$lang, options)}, ${dateFormat.toLocaleTimeString(this.$lang)}`
      }
    },

    lastUpdatedText () {
      if (typeof this.$themeLocaleConfig.lastUpdated === 'string') {
        return this.$themeLocaleConfig.lastUpdated
      }
      if (typeof this.$site.themeConfig.lastUpdated === 'string') {
        return this.$site.themeConfig.lastUpdated
      }
      return 'Last Updated'
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
  },
  methods: {
  
  }
}

</script>

<style lang="stylus" scoped>
@import '../styles/config.styl'
@require '../styles/wrapper.styl'
.blog {
  @extend $wrapper
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

.page-edit
  @extend $wrapper
  padding-top 1rem
  padding-bottom 1rem
  padding-left 0
  padding-right 0
  overflow auto
  .edit-link
    display inline-block
    a
      color lighten($textColor, 25%)
      margin-right 0.25rem
  .last-updated
    float right
    font-size 0.9em
    .prefix
      font-weight 500
      color lighten($textColor, 25%)
    .time
      font-weight 400
      color #aaa

.page-nav
  padding-top 1rem
  padding-bottom 0
  .inner
    min-height 2rem
    margin-top 0
    border-top 1px solid $borderColor
    padding-top 1rem
    overflow auto // clear float
  .next
    float right

@media (max-width: $MQMobile)
  .page-edit
    .edit-link
      margin-bottom .5rem
    .last-updated
      font-size .8em
      float none
      text-align left

@media (max-width: $MQMobileNarrow) {
  .blog__title {
    font-size: 2.441rem;
  }
}
.copyright {
  white-space: break-spaces;
  font-size: 14px;
  line-height: 1.5;
}
.blog img{
  width: 100%;
}
</style>
