import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "页面不存在",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-7xl font-bold tracking-tight text-gray-200 dark:text-gray-800">404</p>
      <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
        找不到这个页面
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        链接可能已经失效，或者这篇文章还没到发布时间。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          返回首页
        </Link>
        <Link
          href="/posts"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          浏览文章
        </Link>
      </div>
    </div>
  );
}
