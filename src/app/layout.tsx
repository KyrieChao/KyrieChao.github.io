import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css"; // Math support
// Highlight.js styles are now in globals.css to support dark mode switching
import { Providers } from "./providers";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search } from "@/components/Search";
import { CodeBlockEnhancer } from "@/components/CodeBlockEnhancer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kyriechao.github.io"),
  title: "KyrieChao Blog",
  description: "基于 Next.js 14 构建的个人博客",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen h-full`}
      >
        <Providers>
          <CodeBlockEnhancer />
          <div className="min-h-screen flex flex-col">
            <header className="p-4 border-b dark:border-gray-800 flex justify-between items-center w-full px-8 max-w-[1920px] mx-auto">
              <a href="/" className="font-bold text-xl hover:text-blue-500 transition-colors">
                KyrieChao
              </a>
              <div className="flex items-center gap-4">
                <nav className="flex gap-4 text-sm font-medium">
                  <a href="/posts" className="hover:text-blue-500 transition-colors">文章</a>
                  <a href="/series" className="hover:text-blue-500 transition-colors">专栏</a>
                  <a href="/tags" className="hover:text-blue-500 transition-colors">标签</a>
                  <a href="/about" className="hover:text-blue-500 transition-colors">关于</a>
                  <a href="/rss.xml" className="hover:text-blue-500 transition-colors" target="_blank" aria-label="RSS Feed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rss"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
                  </a>
                </nav>
                <a href="/activity" className="hover:text-blue-500 transition-colors" aria-label="Activity Log">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </a>
                <a href="https://github.com/KyrieChao" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors" aria-label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 1.5-1 4.5 2.5 1.5-1 3.5-1 4.5-2.5 0 0 1.5-1 4.5 2.5a5.5 5.5 0 0 1-5.5 0c0 .9.3 1.8.8 2.5-2.5 1-4.5 2-6.5 2-2 0-3-1.5-4-3-1-1.5-2-1.5-2-1.5"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                </a>
                <a href="https://huggingface.co/spaces/KyrieChao/code-method-namer" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors" aria-label="Code Method Namer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </a>
                <Search />
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-grow w-full px-8 py-4 max-w-[1920px] mx-auto">{children}</main>
            <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm border-t dark:border-gray-800 mt-10">
              © {new Date().getFullYear()} KyrieChao. Powered by Next.js & GitHub Pages.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
