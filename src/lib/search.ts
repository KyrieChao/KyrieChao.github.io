import fs from "fs";
import path from "path";
import matter from "gray-matter";

export function generateSearchIndex() {
  const postsDirectory = path.join(process.cwd(), "content/posts");
  const fileNames = fs.readdirSync(postsDirectory);

  const allPosts = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      id,
      title: data.title,
      date: data.date,
      tags: data.tags || [],
      categories: data.categories || [],
      excerpt: data.excerpt || content.slice(0, 150).replace(/[#*`]/g, "") + "...",
    };
  });

  const searchIndexPath = path.join(process.cwd(), "public/search-index.json");
  fs.writeFileSync(searchIndexPath, JSON.stringify(allPosts));
}
