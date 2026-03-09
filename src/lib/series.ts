import { getSortedPostsData } from "@/lib/posts";

export function getAllSeries() {
  const allPosts = getSortedPostsData();
  const seriesMap: Record<string, typeof allPosts> = {};

  allPosts.forEach((post) => {
    if (post.series) {
      if (!seriesMap[post.series]) {
        seriesMap[post.series] = [];
      }
      seriesMap[post.series].push(post);
    }
  });

  // Sort posts within each series by date (oldest first usually makes sense for series, but let's keep newest first for consistency or make it configurable)
  // Actually, for series, reading order (oldest to newest) is often better. Let's sort oldest first.
  Object.keys(seriesMap).forEach(series => {
    seriesMap[series].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  return seriesMap;
}
