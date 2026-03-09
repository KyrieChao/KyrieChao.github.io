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
  [key: string]: any;
}

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "");

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    const data = matterResult.data as { date: string; title: string; tags?: string[] | string; categories?: string[] | string };
    
    return {
      id,
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
      categories: Array.isArray(data.categories) ? data.categories : (data.categories ? [data.categories] : []),
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
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

  const data = matterResult.data as { date: string; title: string; tags?: string[] | string; categories?: string[] | string };

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
