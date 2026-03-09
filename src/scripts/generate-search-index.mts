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
  
  const getAllFiles = (dir: string, fileList: string[] = []) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        getAllFiles(filePath, fileList);
      } else if (file.endsWith(".md")) {
        fileList.push(filePath);
      }
    });
    return fileList;
  };

  const allFiles = getAllFiles(postsDirectory);

  const allPosts = allFiles
    .map((fullPath) => {
      const relativePath = path.relative(postsDirectory, fullPath);
      const id = relativePath.replace(/\.md$/, "").replace(/\\/g, "/");
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
