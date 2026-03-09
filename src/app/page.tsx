import { getSortedPostsData } from "@/lib/posts";
import { RecentPosts } from "@/components/RecentPosts";
import { FeaturedSeries } from "@/components/FeaturedSeries";

export default function Home() {
  const allPostsData = getSortedPostsData();
  const recentPosts = allPostsData.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="mb-10 text-center border-b dark:border-gray-800 pb-6">
        <h1 className="text-4xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 dark:from-blue-400 dark:to-teal-300">
          KyrieChao 的博客
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          分享关于技术、生活和代码的思考
        </p>
      </div>

      <div className="space-y-12">
        <RecentPosts posts={recentPosts} />
        
        <div className="border-t dark:border-gray-800 pt-10">
          <FeaturedSeries posts={allPostsData} />
        </div>
      </div>
    </div>
  );
}
