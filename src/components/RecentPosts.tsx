import Link from "next/link";
import { format } from "date-fns";
import { PostData } from "@/lib/posts";

export function RecentPosts({ posts, className }: { posts: PostData[], className?: string }) {
  return (
    <section className={className}>
      <h2 className="text-2xl font-semibold mb-6 dark:text-gray-100">
        最新文章
      </h2>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(({ id, date, title, excerpt, categories, tags }) => (
          <li key={id} className="border dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 flex flex-col h-full group">
            <Link href={`/posts/${id}`} className="block flex-grow">
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-gray-100 line-clamp-2">
                {title}
              </h3>
              {excerpt && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-3">
                  {excerpt}
                </p>
              )}
            </Link>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mt-auto pt-4 border-t dark:border-gray-800">
              <time>{date ? format(new Date(date), "yyyy-MM-dd") : "未知日期"}</time>
              <div className="flex gap-2">
                {Array.isArray(categories) && categories.slice(0, 1).map((cat) => (
                  <span key={cat} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
