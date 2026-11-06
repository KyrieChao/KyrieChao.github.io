import fs from "fs";
import path from "path";
import matter from "gray-matter";

// 生成 sitemap.xml 和 robots.txt，输出到 public/ 由静态导出带走
const siteURL = "https://kyriechao.github.io";
const postsDirectory = path.join(process.cwd(), "content/posts");
const publicDir = path.join(process.cwd(), "public");

interface Entry {
  loc: string;
  lastmod?: string;
}

function getAllFiles(dir: string, fileList: string[] = []) {
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith(".md")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// 和 lib/posts.ts 的 getAllPostIds 保持一致：逐段编码，中文和斜杠都能正确处理
function encodePostPath(id: string) {
  return id
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildEntries(): Entry[] {
  const now = new Date();

  const staticPages: Entry[] = [
    { loc: `${siteURL}/` },
    { loc: `${siteURL}/posts` },
    { loc: `${siteURL}/series` },
    { loc: `${siteURL}/tags` },
    { loc: `${siteURL}/about` },
    { loc: `${siteURL}/activity` },
  ];

  if (!fs.existsSync(postsDirectory)) return staticPages;

  const posts = getAllFiles(postsDirectory)
    .map((fullPath) => {
      const id = path
        .relative(postsDirectory, fullPath)
        .replace(/\.md$/, "")
        .replace(/\\/g, "/");
      const { data } = matter(fs.readFileSync(fullPath, "utf8"));
      return { id, date: new Date(data.date) };
    })
    // 未来文章还没上线，不该出现在 sitemap 里
    .filter((post) => !Number.isNaN(post.date.getTime()) && post.date <= now)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return [
    ...staticPages,
    ...posts.map((post) => ({
      loc: `${siteURL}/posts/${encodePostPath(post.id)}`,
      lastmod: post.date.toISOString().split("T")[0],
    })),
  ];
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemap() {
  const entries = buildEntries();

  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : "";
      return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml, "utf8");
  console.log(`sitemap.xml: ${entries.length} 条`);
}

function generateRobots() {
  const robots = `User-agent: *
Allow: /

Sitemap: ${siteURL}/sitemap.xml
`;

  fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");
  console.log("robots.txt 已生成");
}

generateSitemap();
generateRobots();
