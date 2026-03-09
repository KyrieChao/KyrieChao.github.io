import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface PostData {
  id: string;
  date: string;
  title: string;
  contentHtml?: string;
  toc?: { id: string; text: string; level: number }[];
  tags?: string[];
  categories?: string[];
  excerpt?: string;
  [key: string]: any;
}

export function getSortedPostsData() {
  // Get file names under /posts
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

  const allPostsData = allFiles.map((fullPath) => {
    // Remove ".md" from file name to get id
    // Use relative path as id to support nested folders, replacing path separators with slashes
    const relativePath = path.relative(postsDirectory, fullPath);
    const id = relativePath.replace(/\.md$/, "").replace(/\\/g, "/");

    // Read markdown file as string
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    const data = matterResult.data as { date: string; title: string; tags?: string[] | string; categories?: string[] | string; excerpt?: string; series?: string };
    
    return {
      id,
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
      categories: Array.isArray(data.categories) ? data.categories : (data.categories ? [data.categories] : []),
    };
  });
  
  // Filter out future posts
  const now = new Date();
  const visiblePosts = allPostsData.filter(post => {
    const postDate = new Date(post.date);
    return postDate <= now;
  });

  // Sort posts by date
  return visiblePosts.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
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

  return allFiles.map((fullPath) => {
    const relativePath = path.relative(postsDirectory, fullPath);
    // Encode the id to handle slashes in URL
    const id = relativePath.replace(/\.md$/, "").replace(/\\/g, "/");
    return {
      params: {
        id: id.split("/"), // Return as array for catch-all route if needed, or handle in page
      },
    };
  });
}

export async function getPostData(id: string | string[]) {
  // Handle id being an array (from catch-all route) or string
  const idStr = Array.isArray(id) ? id.join("/") : id;
  const fullPath = path.join(postsDirectory, `${idStr}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Extract TOC
  const toc: { id: string; text: string; level: number }[] = [];
  const headingRegex = /^(#{2,3})\s+(.*)$/gm;
  let match;
  while ((match = headingRegex.exec(matterResult.content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, "-");
    toc.push({ id, text, level });
  }

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(remarkGfm) // Support GFM (tables, etc.)
    .use(remarkMath) // Support Math
    .use(remarkRehype, { allowDangerousHtml: true }) // Convert to HTML AST, allowing raw HTML
    .use(rehypeKatex) // Render Math
    .use(rehypeHighlight) // Highlight code blocks
    .use(rehypeSlug) // Add IDs to headings
    .use(rehypeAutolinkHeadings) // Add links to headings
    .use(rehypeStringify, { allowDangerousHtml: true }) // Convert AST to HTML string, preserving raw HTML
    .process(matterResult.content);
    
  const contentHtml = processedContent.toString();

  const data = matterResult.data as { date: string; title: string; tags?: string[] | string; categories?: string[] | string; excerpt?: string; series?: string };

  return {
    id,
    contentHtml,
    toc,
    ...data,
    tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
    categories: Array.isArray(data.categories) ? data.categories : (data.categories ? [data.categories] : []),
  };
}

export function getAdjacentPosts(id: string) {
  const allPosts = getSortedPostsData();
  const index = allPosts.findIndex((post) => post.id === id);

  if (index === -1) {
    return { prev: null, next: null };
  }

  // index - 1 is newer (Next Post in timeline, usually shown on right or as "Next")
  // index + 1 is older (Previous Post in timeline, usually shown on left or as "Previous")
  const nextPost = index > 0 ? allPosts[index - 1] : null;
  const prevPost = index < allPosts.length - 1 ? allPosts[index + 1] : null;

  return {
    prev: prevPost,
    next: nextPost,
  };
}
