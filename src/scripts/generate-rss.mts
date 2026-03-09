import fs from 'fs';
import path from 'path';
import { Feed } from 'feed';
import matter from 'gray-matter';

// Script to generate RSS feed at build time
function generateRssFeed() {
  const postsDirectory = path.join(process.cwd(), "content/posts");
  const siteURL = "https://kyriechao.github.io"; // 请替换为您的实际博客地址
  const date = new Date();
  const author = {
    name: "Kyrie Chao",
    email: "your-email@example.com", // 请替换为您的邮箱
    link: "https://github.com/KyrieChao", // 请替换为您的 GitHub 主页
  };

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
        date: new Date(data.date),
        description: data.excerpt || content.slice(0, 150).replace(/[#*`]/g, "") + "...",
        content: content,
        link: `${siteURL}/posts/${id}`,
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const feed = new Feed({
    title: "My Blog",
    description: "Personal blog powered by Next.js",
    id: siteURL,
    link: siteURL,
    image: `${siteURL}/logo.png`, // 请替换为您的 Logo 路径
    favicon: `${siteURL}/favicon.ico`,
    copyright: `All rights reserved ${date.getFullYear()}, Kyrie Chao`,
    updated: date,
    generator: "Feed for Node.js",
    feedLinks: {
      rss2: `${siteURL}/rss.xml`,
      json: `${siteURL}/rss.json`,
      atom: `${siteURL}/atom.xml`,
    },
    author: author,
  });

  allPosts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: post.link,
      link: post.link,
      description: post.description,
      content: post.content,
      author: [author],
      contributor: [author],
      date: post.date,
    });
  });

  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, "rss.xml"), feed.rss2());
  fs.writeFileSync(path.join(publicDir, "atom.xml"), feed.atom1());
  fs.writeFileSync(path.join(publicDir, "rss.json"), feed.json1());
  
  console.log(`RSS feeds generated at ${publicDir}`);
}

generateRssFeed();
