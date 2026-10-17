import Link from "next/link";
import { format } from "date-fns";
import { PostData } from "@/lib/posts";

function PostDate({ date }: { date: string }) {
  return (
    <time dateTime={date} className="font-mono text-xs text-gray-500 dark:text-gray-400">
      {date ? format(new Date(date), "yyyy-MM-dd") : "未知日期"}
    </time>
  );
}

export function RecentPosts({ posts, className }: { posts: PostData[]; className?: string }) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-gray-100">
            最近更新
          </h2>
        </div>
        <Link href="/posts" className="shrink-0 text-sm font-medium text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200">
          全部文章 <span aria-hidden="true">→</span>
        </Link>
      </div>

      {posts.length > 0 ? (
        <ul className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3"
              >
                <PostDate date={post.date} />
                <span className="min-w-0 flex-1 font-medium text-gray-900 transition-colors group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300">
                  {post.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {post.categories?.[0] ?? post.tags?.[0] ?? "文章"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-3 text-sm text-gray-500 dark:text-gray-400">暂无文章。</p>
      )}
    </section>
  );
}
