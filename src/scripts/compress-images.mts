// compress-images.mts
// 压缩 public/images 下的图片：限制长边 + 重编码降低体积。
// 默认只报告结果，加 --write 才真正覆盖原文件。
//
//   tsx src/scripts/compress-images.mts                  # 分析，不改文件
//   tsx src/scripts/compress-images.mts --write          # 实际覆盖
//   tsx src/scripts/compress-images.mts --max=1600 --quality=82

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const SKIP_DIRS = new Set(["staging_area"]);

const DEFAULT_MAX_EDGE = 1600;
const DEFAULT_QUALITY = 82;

// 体积小且不需要缩放的图片重编码收益太低，还可能在重编码后变大，直接跳过
const SMALL_FILE_THRESHOLD = 100 * 1024;

// 少于这个比例的收益，不值得为它引入有损重编码
const MIN_SAVING_RATIO = 0.1;

interface Options {
  write: boolean;
  maxEdge: number;
  quality: number;
}

interface Result {
  file: string;
  originalSize: number;
  newSize: number;
  originalDim: string;
  newDim: string;
  action: "resize" | "reencode" | "skip";
  note?: string;
}

function printUsage() {
  console.log(`用法：tsx src/scripts/compress-images.mts [选项]

  --write         实际覆盖原文件（默认只分析）
  --max=<px>      长边上限，默认 ${DEFAULT_MAX_EDGE}
  --quality=<n>   JPEG / WebP 质量，默认 ${DEFAULT_QUALITY}
`);
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    write: false,
    maxEdge: DEFAULT_MAX_EDGE,
    quality: DEFAULT_QUALITY,
  };

  for (const arg of argv) {
    if (arg === "--write") {
      options.write = true;
    } else if (arg.startsWith("--max=")) {
      options.maxEdge = Number(arg.slice("--max=".length));
    } else if (arg.startsWith("--quality=")) {
      options.quality = Number(arg.slice("--quality=".length));
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    } else {
      console.error(`未知参数：${arg}\n`);
      printUsage();
      process.exit(2);
    }
  }

  if (!Number.isInteger(options.maxEdge) || options.maxEdge < 100) {
    console.error("--max 必须是 ≥ 100 的整数");
    process.exit(2);
  }
  if (!Number.isInteger(options.quality) || options.quality < 1 || options.quality > 100) {
    console.error("--quality 必须是 1–100 的整数");
    process.exit(2);
  }

  return options;
}

function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatSaving(before: number, after: number): string {
  if (before === 0) return "0%";
  const pct = Math.round((1 - after / before) * 100);
  return pct >= 0 ? `-${pct}%` : `+${-pct}%`;
}

async function processImage(file: string, options: Options): Promise<Result> {
  const relPath = path.relative(IMAGES_DIR, file).replace(/\\/g, "/");
  const originalSize = fs.statSync(file).size;
  const meta = await sharp(file, { failOn: "none" }).metadata();

  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const format = meta.format;
  const originalDim = `${width}x${height}`;
  const longEdge = Math.max(width, height);
  const needsResize = longEdge > options.maxEdge;

  const skip = (note: string): Result => ({
    file: relPath,
    originalSize,
    newSize: originalSize,
    originalDim,
    newDim: originalDim,
    action: "skip",
    note,
  });

  // GIF 多半是动图，重编码会丢掉其余帧；AVIF 体积本来就小，重编码收益有限
  if (format !== "jpeg" && format !== "png" && format !== "webp") {
    return skip(`格式 ${format ?? "未知"} 不处理`);
  }
  if (!needsResize && originalSize < SMALL_FILE_THRESHOLD) {
    return skip("尺寸和体积都已合适");
  }

  let pipeline = sharp(file, { failOn: "none" });

  // 手机照片带 EXIF Orientation，重编码会丢掉该标记，必须先把像素真正转正
  if (meta.orientation && meta.orientation !== 1) {
    pipeline = pipeline.rotate();
  }

  if (needsResize) {
    // 用正方形边界做 inside 适配，最长边就不会超过 maxEdge，且不依赖图片方向
    pipeline = pipeline.resize({
      width: options.maxEdge,
      height: options.maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  if (format === "jpeg") {
    pipeline = pipeline.jpeg({ quality: options.quality, mozjpeg: true, progressive: true });
  } else if (format === "webp") {
    pipeline = pipeline.webp({ quality: options.quality });
  } else {
    // PNG 保持无损，只靠缩放和重新压缩省体积，避免文字截图出现色块
    pipeline = pipeline.png({ compressionLevel: 9, effort: 7 });
  }

  const output = await pipeline.toBuffer();
  const outMeta = await sharp(output).metadata();
  const newDim = `${outMeta.width ?? width}x${outMeta.height ?? height}`;

  // 省得不多就不必承担有损重编码的代价
  const saving = 1 - output.length / originalSize;
  if (output.length >= originalSize) {
    return skip(`重编码后反而变大（${formatBytes(output.length)}）`);
  }
  if (saving < MIN_SAVING_RATIO) {
    return skip(`只省 ${Math.round(saving * 100)}%，不值得重编码`);
  }

  if (options.write) {
    // 先写临时文件再改名，避免中途失败留下半个图片
    const temp = `${file}.compress-tmp`;
    fs.writeFileSync(temp, output);
    fs.renameSync(temp, file);
  }

  return {
    file: relPath,
    originalSize,
    newSize: output.length,
    originalDim,
    newDim,
    action: needsResize ? "resize" : "reencode",
    note: undefined,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`找不到目录：${IMAGES_DIR}`);
    process.exit(1);
  }

  const files = [...walk(IMAGES_DIR)].filter((f) =>
    /\.(jpe?g|png|webp|gif|avif)$/i.test(f),
  );

  console.log(
    `扫描 ${files.length} 个文件（长边上限 ${options.maxEdge}px，质量 ${options.quality}）\n`,
  );

  const results: Result[] = [];
  for (const file of files) {
    try {
      results.push(await processImage(file, options));
    } catch (err) {
      results.push({
        file: path.relative(IMAGES_DIR, file).replace(/\\/g, "/"),
        originalSize: fs.statSync(file).size,
        newSize: fs.statSync(file).size,
        originalDim: "?",
        newDim: "?",
        action: "skip",
        note: `处理失败：${(err as Error).message}`,
      });
    }
  }

  const changed = results.filter((r) => r.action !== "skip");
  const skipped = results.filter((r) => r.action === "skip");

  const header = ["文件", "尺寸", "体积", "结果"];
  const rows = changed.map((r) => [
    r.file,
    `${r.originalDim} → ${r.newDim}`,
    `${formatBytes(r.originalSize)} → ${formatBytes(r.newSize)}`,
    formatSaving(r.originalSize, r.newSize),
  ]);

  if (rows.length > 0) {
    const widths = header.map((h, i) =>
      Math.max(h.length, ...rows.map((row) => row[i].length)),
    );
    const line = (cells: string[]) =>
      cells.map((c, i) => c.padEnd(widths[i])).join("  ").trimEnd();

    console.log(line(header));
    console.log(widths.map((w) => "-".repeat(w)).join("  "));
    for (const row of rows) console.log(line(row));
    console.log();
  }

  if (skipped.length > 0) {
    console.log(`跳过 ${skipped.length} 个：`);
    for (const r of skipped) {
      console.log(`  ${r.file}  (${r.originalDim}, ${formatBytes(r.originalSize)}) — ${r.note}`);
    }
    console.log();
  }

  const totalBefore = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalAfter = results.reduce((sum, r) => sum + r.newSize, 0);

  console.log(
    `合计 ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)}` +
    `（省 ${formatBytes(totalBefore - totalAfter)}，${formatSaving(totalBefore, totalAfter)}）`,
  );

  if (options.write) {
    console.log(`\n已写入 ${changed.length} 个文件。`);
  } else {
    console.log("\n这是分析结果，没有修改任何文件。确认后加 --write 实际写入。");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
