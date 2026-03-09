import { getSortedPostsData } from "@/lib/posts";
import { ClientPostList } from "@/components/ClientPostList";
import { Suspense } from "react";

export default function PostsPage() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4 dark:text-white">全部文章</h1>
        <p className="text-gray-600 dark:text-gray-400">浏览所有的博客文章</p>
      </header>

      <Suspense fallback={<div>Loading...</div>}>
        <ClientPostList allPostsData={allPostsData} />
      </Suspense>
    </div>
  );
}
