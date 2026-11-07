import type { Metadata } from "next";
import { format } from "date-fns";
import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export const metadata: Metadata = {
  title: "归档",
  description: "按年月浏览全部文章",
};

type Post = ReturnType<typeof getSortedPostsData>[number];

export default function ArchivePage() {
  const posts = getSortedPostsData();

  const byYear = new Map<string, Map<string, Post[]>>();
  for (const post of posts) {
    const date = new Date(post.date);
    if (Number.isNaN(date.getTime())) continue;

    const year = format(date, "yyyy");
    const month = format(date, "MM");

    let months = byYear.get(year);
    if (!months) {
      months = new Map<string, Post[]>();
      byYear.set(year, months);
    }

    let list = months.get(month);
    if (!list) {
      list = [];
      months.set(month, list);
    }
    list.push(post);
  }

  const years = Array.from(byYear.keys()).sort().reverse();

  return (
    <div className="w-full py-10">
      <header className="mb-10 border-b border-gray-200 pb-6 dark:border-gray-800">
        <h1 className="mb-4 text-4xl font-bold dark:text-white">归档</h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          共 {posts.length} 篇文章，按年月排列
        </p>
      </header>

      <div className="space-y-12">
        {years.map((year) => {
          const months = byYear.get(year)!;
          const monthKeys = Array.from(months.keys()).sort().reverse();
          const count = monthKeys.reduce((sum, m) => sum + months.get(m)!.length, 0);

          return (
            <section key={year}>
              <h2 className="mb-6 flex items-baseline gap-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {year}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{count} 篇</span>
              </h2>

              <div className="space-y-6">
                {monthKeys.map((month) => (
                  <div key={month} className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                    <div className="w-16 shrink-0 pt-0.5 text-sm font-medium text-gray-400 dark:text-gray-500">
                      {month} 月
                    </div>
                    <ul className="flex-1 space-y-2">
                      {months.get(month)!.map((post) => (
                        <li key={post.id} className="flex items-baseline gap-3">
                          <time
                            dateTime={post.date}
                            className="w-10 shrink-0 text-sm tabular-nums text-gray-400 dark:text-gray-500"
                          >
                            {format(new Date(post.date), "dd")}
                          </time>
                          <Link
                            href={`/posts/${post.id}`}
                            className="text-gray-800 transition-colors hover:text-blue-700 dark:text-gray-200 dark:hover:text-blue-300"
                          >
                            {post.title}
                          </Link>
                          {post.series && (
                            <span className="hidden text-xs text-gray-400 dark:text-gray-500 sm:inline">
                              {post.series}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
