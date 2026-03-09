import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

export async function getAboutData() {
  const fullPath = path.join(process.cwd(), "_legacy_jekyll/about.md");
  let fileContents;
  
  if (fs.existsSync(fullPath)) {
    fileContents = fs.readFileSync(fullPath, "utf8");
  } else {
    // Fallback if file doesn't exist
    return {
      title: "关于我",
      contentHtml: "<p>暂无关于信息。</p>"
    };
  }

  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .use(remarkGfm)
    .process(matterResult.content);
    
  const contentHtml = processedContent.toString();

  return {
    contentHtml,
    ...(matterResult.data as { title: string }),
  };
}
