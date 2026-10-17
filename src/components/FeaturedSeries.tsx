import Link from "next/link";
import { format } from "date-fns";
import { PostData } from "@/lib/posts";

interface FeaturedSeriesProps {
  posts: PostData[];
  className?: string;
}

export function FeaturedSeries({ posts, className }: FeaturedSeriesProps) {
  const seriesMap = new Map<string, { count: number; latestPost: PostData }>();

  posts.forEach((post) => {
    if (!post.series) return;

    const existing = seriesMap.get(post.series);
    if (!existing) {
      seriesMap.set(post.series, { count: 1, latestPost: post });
      return;
    }

    existing.count += 1;
    if (new Date(post.date).getTime() > new Date(existing.latestPost.date).getTime()) {
      existing.latestPost = post;
    }
  });

  const seriesList = Array.from(seriesMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 2);

  if (seriesList.length === 0) return null;

  return (
    <section className={className}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-gray-100">
            专栏
          </h2>
        </div>
        <Link href="/series" className="shrink-0 text-sm font-medium text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200">
          全部专栏 <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid gap-x-8 sm:grid-cols-2">
        {seriesList.map(({ name, count, latestPost }, index) => (
          <Link
            key={name}
            href={`/series#${encodeURIComponent(`series-${name}`)}`}
            className="group flex items-center gap-4 border-y border-gray-200 py-3 transition-colors hover:text-blue-700 dark:border-gray-800 dark:hover:text-blue-300"
          >
            <span className="font-mono text-xs text-gray-400">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="min-w-0 flex-1 truncate font-medium text-gray-950 dark:text-gray-100">
              {name}
            </h3>
            <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
              {count} 篇 · {latestPost.date ? format(new Date(latestPost.date), "yyyy-MM-dd") : "未知日期"}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
