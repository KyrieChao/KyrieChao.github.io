import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 启用静态导出
  images: {
    unoptimized: true, // GitHub Pages 不支持 Next.js 图片优化
  },
  // 如果需要自定义 basePath（如项目不在根域名），请取消注释并设置
  // basePath: "/your-repo-name",
};

export default nextConfig;
