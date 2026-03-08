---
title: "Markdown 功能展示与富文本示例"
date: 2026-03-08 23:00:00 +0800
categories: [示例, 技术]
tags: [markdown, demo, syntax]
toc: true
toc_label: "目录"
toc_sticky: true
excerpt: "这篇文章展示了 Minimal Mistakes 主题支持的各种 Markdown 语法，包括代码高亮、数学公式、提示块、表格与多媒体。"
header:
  overlay_image: /assets/images/header-image.jpg
  overlay_filter: 0.5
  caption: "Photo credit: [**Unsplash**](https://unsplash.com)"
  actions:
    - label: "GitHub 仓库"
      url: "https://github.com/KyrieChao/KyrieChao.github.io"
---

欢迎阅读这篇功能展示文章！这里将为你演示如何使用 Markdown 撰写丰富的内容。

## 文本样式

你可以在文章中使用 **粗体**、*斜体*、~~删除线~~ 以及 `行内代码`。

> 这是一个引用块。
>
> 支持多行引用。

## 代码高亮

支持多种语言的语法高亮：

```python
def hello_world():
    print("Hello, World!")
    return True

if __name__ == "__main__":
    hello_world()
```

```javascript
const greet = (name) => {
  console.log(`Hello, ${name}!`);
};

greet('Kyrie');
```

## 列表展示

### 无序列表
- 项目一
- 项目二
  - 子项目 A
  - 子项目 B

### 有序列表
1. 第一步
2. 第二步
3. 第三步

### 任务列表
- [x] 已完成任务
- [ ] 待办任务
- [ ] 进行中...

## 表格示例

| 姓名 | 角色 | 技能 |
|:-----|:-----:|-----:|
| Kyrie | 开发者 | Ruby, Python |
| User | 访客 | 阅读, 评论 |

## 提示块 (Notices)

Minimal Mistakes 提供了一些漂亮的提示块样式：

**Primary Notice**
{: .notice--primary}
这是一个主要提示块。

**Info Notice**
{: .notice--info}
这是一个信息提示块。

**Warning Notice**
{: .notice--warning}
这是一个警告提示块。

**Danger Notice**
{: .notice--danger}
这是一个危险/错误提示块。

## 按钮链接

[主要按钮]({{ site.url }}){: .btn .btn--primary}
[成功按钮]({{ site.url }}){: .btn .btn--success}
[警告按钮]({{ site.url }}){: .btn .btn--warning}
[危险按钮]({{ site.url }}){: .btn .btn--danger}

## 图片与媒体

你可以在文章中插入图片：

![示例图片](https://source.unsplash.com/random/800x400/?technology)

## 数学公式

如果启用了 MathJax，你可以编写 LaTeX 公式：

行内公式：$E = mc^2$

块级公式：

$$
\sum_{i=1}^n i = \frac{n(n+1)}{2}
$$

## 结语

这就是 Minimal Mistakes 主题的一些核心功能展示。快去尝试写一篇属于你的文章吧！
