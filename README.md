# KyrieChao Blog

基于 Next.js 14 构建的个人博客，部署于 GitHub Pages。

🌐 **在线访问**: [https://kyriechao.github.io/](https://kyriechao.github.io/)

## ✨ 特性

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **内容管理**: 基于 Markdown 文件
- **暗黑模式**: 完美支持日间/夜间模式切换
- **功能**:
  - 全文搜索 (Fuse.js)
  - RSS 订阅
  - 代码高亮
  - 数学公式支持 (KaTeX)
  - 响应式设计 (移动端/PC端适配)

## 🚀 本地开发

首先，安装依赖：

```bash
npm install
# 或者
yarn
# 或者
pnpm install
```

启动开发服务器：

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可看到效果。

## 📝 写文章

详细指南请参考：[博客写作指南 (docs/WRITING_GUIDE.md)](docs/WRITING_GUIDE.md)

简而言之：
1. 在 `content/posts/` 目录下创建 Markdown 文件。
2. 添加必要的 Frontmatter 元数据（标题、日期、分类等）。

## ⚙️ 部署

本项目通过 GitHub Actions 自动部署到 GitHub Pages。

- **触发条件**: 推送到 `main` 分支时。
- **定时构建**: 每天北京时间 05:00, 14:00, 22:00 自动触发（用于发布定时文章）。

## 📄 License

MIT
