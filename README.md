<div align="center">

# KyrieChao Blog

个人技术博客 · Markdown 写作 · 构建时静态导出 · GitHub Pages 托管

[**在线访问 →**](https://kyriechao.github.io/)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-087EA4?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deploy](https://github.com/KyrieChao/KyrieChao.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/KyrieChao/KyrieChao.github.io/actions/workflows/deploy.yml)

</div>

## 特性

- **Markdown 写作**：frontmatter 驱动文章元信息，分类、标签、摘要、专栏全部自动聚合
- **全文搜索**：构建时生成索引，前端 Fuse.js 即时匹配
- **定时发布**：把 `date` 设为未来时间，到期由 GitHub Actions 自动上线
- **数学与代码**：KaTeX 公式渲染，highlight.js 代码高亮并带复制按钮
- **阅读体验**：目录导航、阅读进度条、暗色模式
- **自动化产物**：每篇文章自动生成 OG 分享图，同时输出 RSS 2.0 / Atom / JSON Feed
- **活动热力图**：从 git 提交历史生成贡献图

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | Next.js 16（App Router，`output: "export"` 静态导出） |
| UI | React 19 · Tailwind CSS 4 · framer-motion |
| 内容 | Markdown + gray-matter，remark / rehype 渲染 |
| 搜索 | Fuse.js |
| 公式 / 高亮 | KaTeX（`remark-math` + `rehype-katex`）· highlight.js |
| 评论 | Giscus |
| 订阅 | `feed`，输出 RSS 2.0、Atom、JSON Feed |
| OG 图 | `@vercel/og` |
| 主题 | next-themes |

## 目录结构

```text
content/
  posts/YYYY/MM/      文章 Markdown
  about.md            关于页内容
public/images/
  YYYY/MM/DD/         文章配图，按发布日期分目录
  site/               站点装饰图
  staging_area/       待归档的原始图片（不纳入版本控制）
src/
  app/                路由与页面
  lib/                数据层（文章、标签、专栏、关于页）
  components/         组件
  scripts/            构建前置脚本与本地工具源码
.github/workflows/
  deploy.yml          构建并部署到 GitHub Pages
```

主要路由：`/`、`/posts`、`/series`、`/tags`、`/about`、`/activity`。

## 本地开发

需要 Node.js 20。

```bash
npm ci
npm run dev      # http://localhost:3000
```

```bash
npm run lint     # ESLint
npm run build    # 静态导出到 out/
```

`dev` 和 `build` 会先生成搜索索引、订阅源和提交历史数据。

## 写一篇文章

在 `content/posts/YYYY/MM/` 下新建 `.md` 文件，frontmatter 中标题与日期必填：

```yaml
---
title: "文章标题"
date: "2026-10-17 14:00:00 +0800"
categories: ["技术"]
tags: ["Next.js", "博客"]
excerpt: "文章摘要（可省略，省略时自动截取正文）"
series: "专栏名称"
---

从这里开始写 Markdown 正文。
```

`date` 晚于当前时间的文章不会出现在页面上，到点后由定时任务重新构建发布。

### 配图

图片放在 `public/images/YYYY/MM/DD/`，日期与文章发布日期一致，文件名用当日序号：

```text
public/images/2026/11/05/1.jpg
public/images/2026/11/05/2.jpg
```

正文中以绝对路径引用：

```markdown
![图](/images/2026/11/05/1.jpg)
```

非文章配图（例如首页装饰图）放在 `public/images/site/`。

图片提交前可以跑一次压缩：长边限制到 1600px，JPEG 质量 82，PNG 保持无损。

```bash
npm run compress            # 只分析，列出每张图能省多少
npm run compress -- --write # 确认后实际覆盖
```

站点使用 `images.unoptimized`，浏览器拿到的就是原始文件，所以体积要在提交前处理掉。

### 本地工具（可选）

`src/scripts/blog.cpp` 是一个辅助命令行工具，需要自行编译，产物不进版本控制：

```bash
g++ -std=c++17 -O2 -static -o blog.exe src/scripts/blog.cpp
```

```bash
./blog.exe day            # 创建今天的日记
./blog.exe plan day       # 创建规划（day / half-mon / week）
./blog.exe img            # 把 staging_area/ 的图片归档到今天
./blog.exe img 2026-11-5  # 归档到指定日期；也可写 11-5 或 5 省略年、月
```

## 部署

推送 `main` 分支、手动触发或定时任务触发时，`.github/workflows/deploy.yml` 会构建站点并将 `out/` 部署到 GitHub Pages。

定时任务每天北京时间 05:00、14:00、22:00 各运行一次，用于发布到期的定时文章。
