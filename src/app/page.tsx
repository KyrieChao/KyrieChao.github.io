import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import { RecentPosts } from "@/components/RecentPosts";
import { FeaturedSeries } from "@/components/FeaturedSeries";
import { PersonalWriting } from "@/components/PersonalWriting";

export default function Home() {
  const posts = getSortedPostsData();

  return (
    <div className="w-full py-10 sm:py-14">
      <section className="border-b border-gray-200 pb-10 dark:border-gray-800 md:pb-12">
        <div>
          <p className="mb-4 font-mono text-sm font-medium uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
            Kyrie Chao / 个人记录
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-gray-950 dark:text-white xl:text-5xl">
            技术、阅读与日常
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-400">
            项目之外，也记录读书、生活和一些想法。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href="/posts"
              className="inline-flex items-center rounded-md bg-gray-950 px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-blue-700 dark:bg-white dark:text-gray-950 dark:hover:bg-blue-200"
            >
              浏览文章
              <span aria-hidden="true" className="ml-2">→</span>
            </Link>
            <Link
              href="/about"
              className="text-base font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-blue-700 dark:text-gray-300 dark:decoration-gray-700 dark:hover:text-blue-300"
            >
              关于我
            </Link>
          </div>
        </div>
      </section>

      <PersonalWriting />

      <div className="space-y-8 py-8 sm:space-y-10 sm:py-10">
        <RecentPosts posts={posts.slice(0, 2)} />
        <FeaturedSeries posts={posts} />
      </div>
    </div>
  );
}
