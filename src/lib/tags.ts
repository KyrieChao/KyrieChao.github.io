import { getSortedPostsData } from "./posts";

export function getAllTags() {
  const allPosts = getSortedPostsData();
  const tags: Record<string, number> = {};

  allPosts.forEach((post) => {
    if (post.tags) {
      const tagList = Array.isArray(post.tags) ? post.tags : [post.tags];
      tagList.forEach((tag: string) => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    }
  });

  return Object.entries(tags).sort((a, b) => b[1] - a[1]);
}

export function getAllCategories() {
  const allPosts = getSortedPostsData();
  const categories: Record<string, number> = {};

  allPosts.forEach((post) => {
    if (post.categories) {
      const categoryList = Array.isArray(post.categories) ? post.categories : [post.categories];
      categoryList.forEach((category: string) => {
        categories[category] = (categories[category] || 0) + 1;
      });
    }
  });

  return Object.entries(categories).sort((a, b) => b[1] - a[1]);
}
