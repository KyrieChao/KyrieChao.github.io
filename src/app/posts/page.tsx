import { getSortedPostsData } from "@/lib/posts";
import { ClientPostList } from "@/components/ClientPostList";
import { Suspense } from "react";

export default function PostsPage() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="w-full py-10">
      <header className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-800">
        <h1 className="text-4xl font-bold mb-4 dark:text-white">全部文章</h1>
        <p className="text-base text-gray-600 dark:text-gray-400">浏览、搜索并筛选博客文章</p>
      </header>

      <Suspense fallback={<div>Loading...</div>}>
        <ClientPostList allPostsData={allPostsData} />
      </Suspense>
    </div>
  );
}
