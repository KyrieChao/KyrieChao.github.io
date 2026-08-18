---
title: "Rust 学习计划"
date: "2026-08-05 08:00:00 +0800"
excerpt: "Rust 第10天学习 — 文件 I/O 练习"
tags: ["Rust", "学习路线", "编程语言"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"

---

# Rust Day10 — 文件 I/O 练习

> 今天没有跟 Rustlings，自己写了三个文件操作函数练手。

---

## 一、统计文件行数 — `BufReader::lines()`

```rust
use std::fs::File;
use std::io::{BufRead, BufReader};

fn count_lines(path: &str) -> Result<usize, std::io::Error> {
    let file = File::open(path)?;
    let reader = BufReader::new(file);
    let mut count = 0;
    for _ in reader.lines() {
        count += 1;
    }
    Ok(count)
}
```

**逐行拆解：**

| 步骤 | 代码                   | 说明                                   |
| ---- | ---------------------- | -------------------------------------- |
| 1    | `File::open(path)?`    | 打开文件，失败时 `?` 直接返回 `Err`    |
| 2    | `BufReader::new(file)` | 包装成带缓冲的读取器，减少系统调用次数 |
| 3    | `reader.lines()`       | 返回一个迭代器，每次 `next()` 读一行   |
| 4    | `for _ in ...`         | 逐行迭代，不关心内容，只计数           |

**`lines()` 的细节：**

- 返回 `io::Result<String>`，每次读取自动处理 `\n`、`\r\n` 跨平台换行
- 每行末尾的换行符会被自动去掉
- 遇到读取错误时，下一次迭代返回 `Err`

---

## 二、文件内容替换 — 临时文件 + 原子重命名

```rust
use std::fs;

fn replace_in_file(path: &str, from: &str, to: &str) -> Result<(), std::io::Error> {
    let content = fs::read_to_string(path)?;    // 1. 一次性读入内存
    let new_content = content.replace(from, to); // 2. 字符串替换
    let temp_path = format!("{}.tmp", path);

    fs::write(&temp_path, new_content)?;         // 3. 写到临时文件
    fs::rename(&temp_path, path)?;               // 4. 原子重命名
    Ok(())
}
```

**为什么用临时文件而不是直接覆盖？**

```
❌ 直接写原文件：
   打开原文件 → 写入 → 中途崩溃 → 原文件损坏（一半旧一半新）

✅ 临时文件 + rename：
   写 .tmp → 成功 → rename(原文件) → 失败也不影响原文件
           → 崩溃 → .tmp 损坏，原文件完好无损
```

> `rename` 在同一个文件系统上是原子操作——要么成功替换，要么什么都没发生。这是保证数据安全的经典模式。

**`fs::read_to_string` vs `BufReader`：**

| 方法                 | 适用场景                                   |
| -------------------- | ------------------------------------------ |
| `read_to_string`     | 文件不大，需要一次性处理全部内容（如替换） |
| `BufReader::lines()` | 文件很大，逐行处理省内存（如统计行数）     |

---

## 三、递归计算目录大小

```rust
use std::fs::{self, read_dir};
use std::path::Path;

fn dir_size(path: impl AsRef<Path>) -> Result<u64, std::io::Error> {
    let path = path.as_ref();
    let meta = fs::symlink_metadata(path)?;

    // 文件或符号链接 → 直接返回大小
    if meta.is_symlink() || meta.is_file() {
        return Ok(meta.len());
    }

    // 目录 → 递归累加
    if meta.is_dir() {
        let mut total = 0;
        for entry in read_dir(path)? {
            let entry = entry?;
            match dir_size(&entry.path()) {
                Ok(size) => total += size,
                Err(e) => eprintln!("Warning: {}: {}", entry.path().display(), e),
            }
        }
        Ok(total)
    } else {
        Ok(0)
    }
}
```

**三个设计决策：**

### 3.1 `symlink_metadata` 而不是 `metadata`

| 方法               | 跟随符号链接？ | 风险                                |
| ------------------ | -------------- | ----------------------------------- |
| `metadata`         | 是             | 符号链接指向自身 → 死循环           |
| `symlink_metadata` | 否             | 安全，但需要手动判断 `is_symlink()` |

> `symlink_metadata` 获取文件自身的信息，不会跟随符号链接。遇到符号链接直接返回它的大小（通常是路径字符串的字节数），不往下追。

### 3.2 `impl AsRef<Path>` 而不是 `&str`

```rust
// ✓ 兼容多种传参方式
dir_size("/tmp");           // &str
dir_size(String::from(".")); // String
dir_size(Path::new("."));    // &Path
dir_size(&path_buf);         // &PathBuf
```

> `AsRef<Path>` 让函数对调用者更友好，标准库里大量使用这种写法。

### 3.3 遇错打印警告而不是直接崩溃

```rust
match dir_size(&entry.path()) {
    Ok(size) => total += size,
    Err(e) => eprintln!("Warning: {}: {}", entry.path().display(), e),
    // 不 return Err —— 跳过一个文件无伤大雅
}
```

如果是没有权限访问的子目录（如 Windows 的 `System Volume Information`），跳过它继续统计其余部分，比直接报错退出更实用。

---

## 四、本日小结

| 知识点               | 说明                                      |
| -------------------- | ----------------------------------------- |
| `BufReader::lines()` | 逐行迭代，自动处理跨平台换行              |
| `read_to_string`     | 小文件一次性读入内存                      |
| `rename` 原子性      | 临时文件 + rename = 安全的文件替换        |
| `symlink_metadata`   | 不跟随符号链接，防死循环                  |
| `impl AsRef<Path>`   | 让函数接受多种路径类型                    |
| 容错处理             | 非致命错误打 warning 跳过，不中断整体流程 |

**明天继续文件 I/O 还是回 Rustlings？** 还剩 smart_pointers、threads、macros、clippy、conversions 五个模块。