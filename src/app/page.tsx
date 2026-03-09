import { getSortedPostsData } from "@/lib/posts";
import { ClientPostList } from "@/components/ClientPostList";
import { Suspense } from "react";

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-12 text-center border-b dark:border-gray-800 pb-8">
        <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 dark:from-blue-400 dark:to-teal-300">
          KyrieChao's Blog
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Sharing thoughts on Tech, Life, and Code.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ClientPostList allPostsData={allPostsData} />
      </Suspense>
    </div>
  );
}
