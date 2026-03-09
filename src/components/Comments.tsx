"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

export function Comments() {
  const { theme } = useTheme();

  return (
      <div className="mt-10 pt-10 border-t dark:border-gray-800">
          <Giscus
              id="comments"
              repo="KyrieChao/KyrieChao.github.io"
              repoId="R_kgDORhgM3Q"           // ← 用官方生成的
              category="General"
              categoryId="DIC_kwDORhgM3c4C3_VP"  // ← 用官方生成的
              mapping="pathname"
              term=""                        // ← 清空或删除
              reactionsEnabled="1"
              emitMetadata="0"
              inputPosition="bottom"         // ← 改为 bottom 更自然
              theme="preferred_color_scheme" // ← 自动跟随系统，或保持你的 theme 变量
              lang="zh-CN"
              loading="lazy"
          />
      </div>
  );
}
