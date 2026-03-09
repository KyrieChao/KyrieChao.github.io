---
title: "Next.js 14 实战系列 (二)：深入理解路由与布局"
date: "2026-03-10"
description: "接上一篇，深入讲解 Next.js 的文件系统路由、动态路由以及嵌套布局的使用方法。"
tags: ["Next.js", "Routing", "Layout"]
categories: ["技术教程"]
series: "Next.js 学习笔记"
---

# Next.js 14 实战系列 (二)

在上一篇文章中，我们搭建了基础环境。今天我们来聊聊 Next.js 的核心特性之一：**路由系统**。

## 1. 静态路由

在 `app` 目录下创建一个文件夹 `about`，并在其中新建 `page.tsx`：

```tsx
// app/about/page.tsx
export default function About() {
  return <h1>关于我们</h1>;
}
```

现在访问 `/about`，Next.js 会自动渲染这个组件。这就是**文件系统路由**的魔力。

## 2. 动态路由

如果我们需要为每篇博客文章生成一个页面，比如 `/posts/1`、`/posts/2`，就需要用到动态路由。

创建 `app/posts/[id]/page.tsx`：

```tsx
export default function Post({ params }: { params: { id: string } }) {
  return <div>Post ID: {params.id}</div>;
}
```

## 3. 嵌套布局 (Nested Layouts)

Next.js 允许你为特定的路由段定义布局。例如，你可以为博客部分创建一个侧边栏布局，而不影响首页。

```tsx
// app/blog/layout.tsx
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      <nav>Blog Navigation</nav>
      {children}
    </section>
  )
}
```

### 总结

- `page.tsx` 定义路由的 UI。
- `layout.tsx` 定义共享 UI。
- `[folderName]` 创建动态路由段。

掌握这些规则，你就能构建出复杂的应用结构了。下一章我们将讨论数据获取 (Data Fetching)。
