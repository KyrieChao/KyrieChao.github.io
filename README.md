# KyrieChao Blog

个人技术博客，使用 Next.js 静态导出，并通过 GitHub Pages 部署。

🌐 **在线访问**：[https://kyriechao.github.io/](https://kyriechao.github.io/)

## 技术栈

- Next.js 16 App Router、React 19、TypeScript
- Tailwind CSS 4
- Markdown 文章：gray-matter、remark/rehype
- 搜索：Fuse.js
- 评论：Giscus
- 数学公式：KaTeX；代码高亮：highlight.js
- RSS、Atom、JSON Feed 和文章 Open Graph 图片

## 功能与页面

- 首页、文章列表和文章详情
- 分类、标签和专栏聚合
- 全文搜索、目录、阅读进度和暗色模式
- Giscus 评论、RSS 订阅和 Git 提交活动图
- 构建时生成静态页面，部署到 GitHub Pages

主要路由：`/`、`/posts`、`/series`、`/tags`、`/about` 和 `/activity`。

## 本地开发

需要 Node.js 20。

```bash
npm ci
npm run dev
```

开发服务器默认地址为 [http://localhost:3000](http://localhost:3000)。

```bash
npm run lint
npm run build
```

`dev` 和 `build` 会先生成搜索索引、RSS/Atom/JSON Feed 和提交历史数据。生产构建使用 Next.js 静态导出，生成的站点位于 `out/`。

## 添加文章

在 `content/posts/` 下按现有的年份、月份和日期目录结构新建 `.md` 文件。每篇文章需要在 frontmatter 中提供标题和日期；分类、标签、摘要和专栏为可选字段：

```yaml
---
title: "文章标题"
date: "2026-10-17 14:00:00 +0800"
categories: ["技术"]
tags: ["Next.js", "博客"]
excerpt: "文章摘要"
series: "专栏名称"
---

从这里开始写 Markdown 正文。
```

日期晚于构建时间的文章不会显示。GitHub Actions 每天北京时间 05:00、14:00 和 22:00 自动重新构建，以发布到期文章。

关于页面内容位于 `content/about.md`。

## 部署

`.github/workflows/deploy.yml` 会在推送到 `main` 分支、手动触发或定时任务触发时构建站点，并将 `out/` 部署到 GitHub Pages。
