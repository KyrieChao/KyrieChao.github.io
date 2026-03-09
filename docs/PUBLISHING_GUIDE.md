# 文章发布指南

本指南将帮助你了解如何在 Chirpy 博客中创建和发布文章。

## 📁 文件结构

### 目录结构
所有文章都存放在 `content/posts/` 目录下：

```
content/
└── posts/
    ├── 2026-03-08-welcome.md
    ├── 2026-03-08-markdown-demo.md
    └── 你的新文章.md
```

### 文件命名规范
使用以下格式命名你的文章文件：

```
YYYY-MM-DD-文章标题.md
```

例如：
- `2026-03-09-我的第一篇文章.md`
- `2026-03-10-技术教程分享.md`

## 📝 Front Matter 格式

每篇文章的开头都需要包含 Front Matter（元数据），使用 YAML 格式：

```yaml
---
title: "文章标题"
date: "2026-03-09"
description: "文章摘要，显示在首页列表中"
tags: ["标签1", "标签2", "标签3"]
coverImage: ""
---
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 文章标题 |
| `date` | ✅ | 发布日期，格式：YYYY-MM-DD |
| `description` | ✅ | 文章摘要，显示在首页 |
| `tags` | ❌ | 标签数组，用于分类文章 |
| `coverImage` | ❌ | 封面图片URL（可选） |

## ✍️ Markdown 语法指南

### 基础语法

#### 标题
```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
```

#### 文本样式
```markdown
**粗体文本**
*斜体文本*
~~删除线~~
`行内代码`
```

#### 列表
```markdown
# 无序列表
- 项目 1
- 项目 2
  - 子项目

# 有序列表
1. 第一步
2. 第二步

# 任务列表
- [x] 已完成任务
- [ ] 待办任务
```

#### 链接和图片
```markdown
# 链接
[链接文字](https://example.com)

# 图片
![图片描述](图片URL)
```

#### 表格
```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
```

### 代码块

支持语法高亮的代码块：

````markdown
```python
def hello_world():
    print("Hello, World!")
    return True
```

```javascript
const greet = (name) => {
  console.log(`Hello, ${name}!`);
};
```
````

### 数学公式

支持 LaTeX 数学公式：

```markdown
# 行内公式
$E = mc^2$

# 块级公式
$$
\sum_{i=1}^n i = \frac{n(n+1)}{2}
$$
```

## 🎨 自定义组件

### 提示块 (Callouts)

使用 HTML + Tailwind CSS 创建美观的提示块：

#### 信息提示
```html
<div class="p-4 mb-4 text-blue-800 border-l-4 border-blue-300 bg-blue-50">
  <strong>💡 提示</strong>
  <p>这是一个有用的提示信息。</p>
</div>
```

#### 警告提示
```html
<div class="p-4 mb-4 text-yellow-800 border-l-4 border-yellow-300 bg-yellow-50">
  <strong>⚠️ 注意</strong>
  <p>这是一个需要特别注意的警告。</p>
</div>
```

#### 重要提示
```html
<div class="p-4 mb-4 text-red-800 border-l-4 border-red-300 bg-red-50">
  <strong>🚨 重要</strong>
  <p>这是一个非常重要的信息。</p>
</div>
```

### 按钮链接
```html
<a href="/" class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 no-underline">
  主要按钮
</a>
```

## 🚀 发布流程

### 1. 本地预览
在发布之前，先在本地预览你的文章：

```bash
npm run dev
```

然后在浏览器中打开 `http://localhost:3000` 查看效果。

### 2. 检查要点
预览时请检查：
- ✅ Front Matter 格式是否正确
- ✅ 文章标题和日期是否准确
- ✅ 所有链接是否正常工作
- ✅ 图片是否正确显示
- ✅ 代码块是否有语法高亮
- ✅ 数学公式是否正确渲染

### 3. 提交发布
确认无误后，提交你的文章：

```bash
git add content/posts/你的文章.md
git commit -m "发布新文章：文章标题"
git push origin main
```

### 4. 自动部署
提交到 GitHub 后，GitHub Actions 会自动部署你的博客。部署完成后，你的文章就会出现在线上博客中。

## 💡 最佳实践

### 写作建议
1. **标题清晰**：使用描述性的标题，让读者一眼看懂文章内容
2. **段落简洁**：每个段落控制在 3-5 行，便于阅读
3. **适当分段**：使用小标题将长文章分成多个部分
4. **添加示例**：用代码示例或图片来说明复杂的概念
5. **检查语法**：发布前仔细检查拼写和语法错误

### SEO 优化
1. **描述准确**：在 Front Matter 中写清楚文章摘要
2. **标签合理**：使用相关的标签帮助读者找到你的文章
3. **图片优化**：使用合适的图片尺寸和格式
4. **链接友好**：确保内部链接正确，外部链接可靠

### 常见问题

**Q: 文章没有显示在首页？**
A: 检查 Front Matter 中的日期是否设置为今天或更早的日期。

**Q: 代码没有语法高亮？**
A: 确保代码块指定了正确的语言，如 ` ```python `。

**Q: 数学公式没有渲染？**
A: 检查是否使用了正确的 LaTeX 语法，行内公式用 `$...$`，块级公式用 `$$...$$`。

**Q: 提示块样式不对？**
A: 确保复制了完整的 HTML 结构和 Tailwind CSS 类名。

---

🎉 现在你可以开始创作你的第一篇文章了！记得先复制这个模板文件，然后按照指南填写内容。祝写作愉快！