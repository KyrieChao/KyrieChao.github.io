# KyrieChao.github.io

我的个人博客，基于 Jekyll，部署在 GitHub Pages。

## 本地运行

1. 安装 Ruby 与 Bundler。
2. 执行 `bundle install`。
3. 执行 `bundle exec jekyll serve`。
4. 打开 `http://localhost:4000` 预览。

## 如何写新文章

1. 在 `_posts` 目录下新建文件：`YYYY-MM-DD-title.md`
2. 在文件顶部添加 Front Matter：
   ```markdown
   ---
   layout: single
   title:  "你的文章标题"
   date:   YYYY-MM-DD HH:MM:SS +0800
   categories: blog
   comments: true
   ---
   ```
3. 使用 Markdown 写正文内容。

## 部署

将改动推送到 GitHub 的 `main` 或 `master` 分支后，GitHub Pages 会自动构建并发布。

访问地址： [https://KyrieChao.github.io](https://KyrieChao.github.io)

## 主题与评论

- 主题：使用 `Minimal Mistakes`，已配置中文与分页，导航包含首页、归档、分类、标签、关于。
- 功能：
  - 站点搜索：点击导航栏搜索图标即可。
  - 社交链接：侧边栏与页脚包含 GitHub 与 Email 链接。
  - 统计：已预留 Google Analytics 配置（需替换 ID）。
- 评论：启用 `Utterances`（基于 GitHub Issues）。
  - 在仓库中开启 Issues
  - 访问 https://utteranc.es 安装 GitHub App 并选择仓库 `KyrieChao/KyrieChao.github.io`
  - 配置 `Issue Term` 为 `pathname`（已在 `_config.yml` 中设置）
