---
title: "Tailwind CSS 实用技巧分享"
date: "2026-03-08"
categories: ["前端开发", "CSS"]
tags: ["Tailwind", "CSS", "UI"]
excerpt: "在这篇文章中，我将分享一些我在使用 Tailwind CSS 开发项目时总结的实用技巧，帮助你更高效地构建现代网页界面。"
series: "Web开发心得"
---

## 为什么选择 Tailwind CSS？

Tailwind CSS 是一个功能类优先（utility-first）的 CSS 框架。与 Bootstrap 等传统框架不同，它不提供预制的组件，而是提供了一套底层的工具类，让你能够直接在 HTML 中构建完全定制的设计。

### 1. 使用 `@apply` 抽取组件

虽然 Tailwind 提倡在 HTML 中写样式，但在某些情况下（比如按钮、输入框），如果多个地方用到相同的样式组合，可以使用 `@apply` 指令来抽取成一个 CSS 类。

```css
/* globals.css */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors;
  }
}
```

### 2. 自定义配置 `tailwind.config.ts`

Tailwind 的强大之处在于其可配置性。你可以轻松地扩展默认的主题，添加自定义的颜色、字体或断点。

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        'brand-blue': '#0070f3',
      },
      spacing: {
        '128': '32rem',
      }
    },
  },
  // ...
};
export default config;
```

### 3. 暗黑模式 (Dark Mode)

Tailwind 内置了对暗黑模式的支持。只需在类名前加上 `dark:` 前缀即可。

```html
<div class="bg-white dark:bg-gray-800 text-black dark:text-white">
  <h1>自动适配暗黑模式的标题</h1>
</div>
```

## 总结

Tailwind CSS 极大地提高了前端开发的效率，一旦习惯了这种写法，你就很难回去了。希望这些小技巧对你有帮助！
