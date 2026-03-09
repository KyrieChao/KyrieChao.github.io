import { getAboutData } from "@/lib/about";

export default async function About() {
  const aboutData = await getAboutData();

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">
        {aboutData.title || "关于"}
      </h1>
      <div
        className="prose lg:prose-xl dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: aboutData.contentHtml || "" }}
      />
    </div>
  );
}
