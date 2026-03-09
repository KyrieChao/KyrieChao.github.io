---
title: "Next.js 14 实战系列 (一)：从零开始搭建博客"
date: "2026-03-09"
description: "这是 Next.js 学习系列的第一篇文章，我们将介绍如何配置开发环境并创建一个基础的 Next.js 项目。"
tags: ["Next.js", "React", "前端开发"]
categories: ["技术教程"]
series: "Next.js 学习笔记"
---

# Next.js 14 实战系列 (一)

欢迎来到 Next.js 学习笔记的第一篇！在本系列中，我们将一起探索 Next.js 14 的强大功能，特别是 App Router 和服务器组件 (Server Components)。

## 1. 环境准备

首先，确保你已经安装了 Node.js 18.17 或更高版本。

```bash
node -v
# v18.17.0
```

## 2. 创建项目

使用 `create-next-app` 脚手架快速启动项目：

```bash
npx create-next-app@latest my-blog
```

在交互式命令行中，我们选择以下配置：
- TypeScript: **Yes**
- Tailwind CSS: **Yes**
- App Router: **Yes**
- ESLint: **Yes**

## 3. 项目结构概览

创建完成后，你的项目目录应该是这样的：

```
my-blog/
├── app/
│   ├── layout.tsx    # 根布局
│   └── page.tsx      # 首页
├── public/           # 静态资源
├── tailwind.config.ts
└── package.json
```

## 4. 编写第一个页面

打开 `app/page.tsx`，修改内容如下：

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Hello, Next.js 14!</h1>
    </main>
  );
}
```

运行 `npm run dev`，打开浏览器访问 `http://localhost:3000`，你应该能看到我们的新页面了。

---

下一篇文章中，我们将学习如何添加 Markdown 支持来渲染博客文章。敬请期待！
