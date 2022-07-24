<script>
export default {
  name: "BlogPostPreview",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    formatPublishDate() {
      const dateFormat = new Date(this.item.frontmatter.date);
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      return dateFormat.toLocaleDateString(this.$lang, options);
    },
  },
};
</script>

<template>
  <section>
    <div class="title">
      <time>{{ formatPublishDate }}</time>
      <h3 class="blog-post__title">{{ item.frontmatter.title }}</h3>
    </div>

    <p
      v-if="
        item.frontmatter.excerpt
          ? item.frontmatter.excerpt
          : item.frontmatter.description
      "
    >
      {{
        item.frontmatter.excerpt
          ? item.frontmatter.excerpt
          : item.frontmatter.description
      }}
    </p>
    <p v-if="item.readingTime">Estimated time: {{ item.readingTime.text }}</p>
    <router-link class="button blog-post__button" :to="item.path"
      >阅读更多 ></router-link
    >
  </section>
</template>

<style scoped>
.blog-post__button {
  margin-bottom: 1.5rem;
  display: inline-block;
}

.blog-post__title {
  margin-top: 0.5rem;
  margin-bottom: 0px;
}

.button {
  border: 1px solid #32c8cf;
  border-radius: 4px;
  color: #32c8cf;
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  box-shadow: 0 0;
  transition: background-color 0.2s ease-in, color 0.2s ease-in;
}

.tag-list {
  list-style: none;
  padding-left: 0;
  display: flex;
  margin-bottom: 25px;
}

.tag-list__item {
  margin-left: 10px;
}

.tag-list__item:first-child {
  margin-left: 0;
}

.tag-list__btn {
  padding: 5px;
  font-size: 0.9rem;
  background-color: #fff;
}
</style>
