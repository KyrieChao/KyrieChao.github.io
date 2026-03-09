import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export function getAllTags() {
  const fileNames = fs.readdirSync(postsDirectory);
  const tags: Record<string, number> = {};

  fileNames.forEach((fileName) => {
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);
    
    if (data.tags) {
      const tagList = Array.isArray(data.tags) ? data.tags : [data.tags];
      tagList.forEach((tag: string) => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    }
  });

  return Object.entries(tags).sort((a, b) => b[1] - a[1]);
}

export function getAllCategories() {
  const fileNames = fs.readdirSync(postsDirectory);
  const categories: Record<string, number> = {};

  fileNames.forEach((fileName) => {
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);
    
    if (data.categories) {
      const categoryList = Array.isArray(data.categories) ? data.categories : [data.categories];
      categoryList.forEach((category: string) => {
        categories[category] = (categories[category] || 0) + 1;
      });
    }
  });

  return Object.entries(categories).sort((a, b) => b[1] - a[1]);
}
