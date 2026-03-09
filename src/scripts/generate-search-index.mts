import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Script to generate search index at build time
function generateSearchIndex() {
  const postsDirectory = path.join(process.cwd(), "content/posts");
  
  if (!fs.existsSync(postsDirectory)) {
    console.warn(`Posts directory not found at ${postsDirectory}`);
    return;
  }
  
  const fileNames = fs.readdirSync(postsDirectory);

  const allPosts = fileNames
    .filter(fileName => fileName.endsWith(".md"))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        id,
        title: data.title,
        date: data.date,
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
        categories: Array.isArray(data.categories) ? data.categories : (data.categories ? [data.categories] : []),
        excerpt: data.excerpt || content.slice(0, 150).replace(/[#*`]/g, "") + "...",
      };
    });

  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const searchIndexPath = path.join(publicDir, "search-index.json");
  fs.writeFileSync(searchIndexPath, JSON.stringify(allPosts));
  console.log(`Search index generated at ${searchIndexPath} with ${allPosts.length} posts.`);
}

generateSearchIndex();
