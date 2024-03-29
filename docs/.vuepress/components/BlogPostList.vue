<script>
export default {
  name: "BlogPostList",
  props: {
    pages: {
      type: Array,
      default: [],
    },
    pageSize: {
      type: Number,
      default: 5,
    },
    startPage: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      currentPage: Math.ceil(this.startPage / this.pageSize),
      selectedTags: [],
    };
  },
  computed: {
    filteredList() {
      if (this.pages) {
        return this.pages
          .filter((item) => {
            const isBlogPost = !!item.frontmatter.blog;
            if (!item.frontmatter.date) {
              return false;
            }
            const removeUtcString = item.frontmatter.date.split(".000Z");
            let localDate = new Date(item.frontmatter.date);
            // 默认时区是 utc, 把 .000Z 时区标识去掉
            if (removeUtcString && removeUtcString.length) {
              localDate = new Date(removeUtcString[0]);
            }
            const isReadyToPublish =
              localDate <= new Date();
            // check for locales
            let isCurrentLocale = true;
            if (this.$site.locales) {
              const localePath = this.$route.path.split("/")[1] || "";
              isCurrentLocale = item.relativePath.startsWith(localePath);
            }
            // check if tags contain all of the selected tags
            const hasTags =
              !!item.frontmatter.tags &&
              this.selectedTags.every((tag) =>
                item.frontmatter.tags.includes(tag)
              );

            if (
              !isBlogPost ||
              !isReadyToPublish ||
              (this.selectedTags.length > 0 && !hasTags) ||
              !isCurrentLocale
            ) {
              return false;
            }

            return true;
          })
          .sort(
            (a, b) =>
              new Date(b.frontmatter.date) - new Date(a.frontmatter.date)
          );
      }
    },

    totalPages() {
      return Math.ceil(this.filteredList.length / this.pageSize);
    },
  },

  mounted() {
    this.currentPage = Math.min(
      Math.max(this.currentPage, 0),
      this.totalPages - 1
    );
  },

  methods: {
    nextPage() {
      this.currentPage =
        this.currentPage >= this.totalPages - 1
          ? this.totalPages - 1
          : this.currentPage + 1;
      document.querySelector(".hero").scrollIntoView();
    },
    previousPage() {
      this.currentPage = this.currentPage < 0 ? 0 : this.currentPage - 1;
      document.querySelector(".hero").scrollIntoView();
    },
    addTag(tag) {
      const tagExists = this.selectedTags.some((item) => {
        return item === tag;
      });

      if (!tagExists) {
        this.selectedTags = this.selectedTags.concat(tag);
      }
      this.currentPage = 0;
    },
    removeTag(tag) {
      this.selectedTags.filter((t) => t != tag);
    },
    resetTags() {
      this.selectedTags = [];
    },
  },
};
</script>

<template>
  <div>
    <div v-if="selectedTags.length > 0" class="filtered-heading">
      <h2>按标签过滤 ：{{ selectedTags.join(",") }}</h2>
      <button type="button" @click="resetTags" class="btn clear-filter-btn">
        清除过滤
      </button>
    </div>
    <ul class="blog-list">
      <li
        v-for="(item, index) in filteredList"
        class="blog-list__item"
        :key="index"
        v-show="
          index >= currentPage * pageSize &&
          index < (currentPage + 1) * pageSize
        "
      >
        <BlogPostPreview :item="item" />
        <ul class="blog-list__tags">
          <li v-for="(tag, index2) in item.frontmatter.tags" :key="index2">
            <button @click="addTag(tag)">{{ tag }}</button>
          </li>
        </ul>
      </li>
    </ul>

    <div class="pagination">
      <button
        v-show="currentPage > 0"
        @click="previousPage"
        class="button--pagination"
        type="button"
      >
        上一页
      </button>
      <button
        v-show="currentPage < totalPages - 1"
        @click="nextPage"
        class="button--pagination"
        type="button"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.blog-list {
  padding: 0;
  margin: 0;
  text-align: center;
}

.blog-list__item {
  list-style-type: none;
  margin-bottom: 55px;
}

.blog-list__tags {
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-content: center;
  list-style: none;
  margin-right: 10px;
}
.blog-list__tags button {
  outline: none;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-right: 10px;
}
.button--pagination {
  background-color: #32c8cf;
  border-radius: 4px;
  color: #fff;
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  border: none;
  text-transform: uppercase;
  font-weight: 700;
  box-shadow: 0 0;
  transition: background-color 0.2s ease-in, color 0.2s ease-in;
}

.button--pagination:hover {
  cursor: pointer;
}

.clear-filter-btn {
  align-self: center;
  margin-left: 20px;
}

.filtered-heading {
  display: flex;
}

.pagination {
  text-align: center;
}
</style>
