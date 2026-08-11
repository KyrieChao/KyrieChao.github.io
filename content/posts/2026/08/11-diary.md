---
title: "2026-08-11 周二 · 递归、构建过程与阶段 2"
date: "2026-08-11 21:00:00 +0800"
excerpt: "C 语言递归函数 + 程序构建四工序（预处理→编译→汇编→链接），Rust 阶段 2 枚举、Result、自定义错误"
tags: ["Rust", "C语言", "培训", "日志"]
categories: ["日志"]
series: "每日日志"

---

## 技术

### C 语言

学习内容：**递归函数 + 程序构建过程**

#### 递归函数

**两个关键点缺一不可：** 递推关系（大→小） + 结束条件（Base Case）。

底层原理：每次调用在**栈区**分配栈帧（Stack Frame），存放返回地址、形参、局部变量。递���过深 → 栈空间耗尽 → **Stack Overflow**。

| 例子     | 递推关系                      | 复杂度               |
| -------- | ----------------------------- | -------------------- |
| 阶乘     | `n! = n × (n-1)!`             | O(n)                 |
| 斐波那契 | `F(n) = F(n-1) + F(n-2)`      | O(2^n)，大量重复计算 |
| 汉诺塔   | n-1→辅助，最大→目标，n-1→目标 | O(2^n)               |

> 简单用循环，分治/回溯用递归。不要为了递归而递归。汉诺塔是非递归极其困难、递归极其优雅的典型案例。

#### C 程序构建四工序

从 `.c` 到可执行文件，四道工序：

```
hello.c  →  ①预处理  →  hello.i  →  ②编译  →  hello.s  →  ③汇编  →  hello.o  →  ④链接  →  hello
```

| 阶段     | 负责者   | 输入 → 输出        | 做什么                                                       | GCC 命令 |
| -------- | -------- | ------------------ | ------------------------------------------------------------ | -------- |
| ① 预处理 | 预处理器 | `.c` → `.i`        | 删注释、处理 `#` 命令（`#include` copy 头文件、`#define` 宏替换、条件编译） | `gcc -E` |
| ② 编译   | 编译器   | `.i` → `.s`        | C → 汇编代码，语法错误在此报                                 | `gcc -S` |
| ③ 汇编   | 汇编器   | `.s` → `.o`        | 汇编 → 机器码，生成目标文件                                  | `gcc -c` |
| ④ 链接   | 链接器   | `.o` + 库 → 可执行 | 合并目标文件，解析符号引用（如 `printf` 地址），分静态链接和动态链接 | `gcc`    |

几个要点：

- **`#include <file>` vs `"file"`** — 尖括号搜系统目录，双引号先搜当前目录
- **头文件保护** — 每个 `.h` 标配 `#ifndef` / `#define` / `#endif`，防止重复包含
- **头文件放声明性语句** — 函数声明、`extern` 全局变量、`#define` 宏、类型声明
- **`gcc hello.c -o hello`** — 一步到位，四合一

### Rust

学习内容：[Rust Day12 笔记](./11-rust-day-12.md)——**阶段 2：枚举、Result、Option、自定义错误、文件 I/O**

今天在 `demo3.rs` 里写了阶段 2 的练习：

| #    | 练习                           | 涉及点                          |
| ---- | ------------------------------ | ------------------------------- |
| 1    | `Shape` 枚举 + `area()`        | `match` + 海伦公式              |
| 2    | `Operation` 枚举 + `execute()` | `match` + `Result` + 除零检查   |
| 3    | `parse_int` / `parse_float`    | 字符串解析，`map_err`           |
| 4    | `calculate("a/b")`             | `?` 链式调用                    |
| 5    | `find_in_vec`                  | `iter().position()`             |
| 6    | `double_if_even`               | `Option::filter().map()` 组合   |
| 7    | `get_or_zero`                  | `unwrap_or()`                   |
| 8    | `read_file`                    | `match` + `ErrorKind::NotFound` |
| 9    | `copy_file`                    | `fs::read` + `fs::write`        |
| 10   | `MyError` 自定义错误           | `impl Display` + `impl Error`   |
| 11   | `read_config`                  | 文件读取 + io 错误 → 自定义错误 |
| 12   | `sum_numbers`                  | `for` + `?`，任何一步失败就短路 |
| 13   | `while let`                    | 遍历 `Vec<Option<i32>>`         |

几个新收获：

- `ErrorKind::NotFound` 的模式匹配写法：`Err(e) if e.kind() == ErrorKind::NotFound`
- 自定义错误类型需要同时 `impl Display` 和 `impl Error`
- `Option::filter()` 可以直接筛 `Some` 里的值，不符合变 `None`
- `while let Some(x) = iter.next()` 处理嵌套 Option 比 `for` + 判空简洁

## 明日计划

1. C 语言：跟课堂节奏，递归章节作业
2. Rust：阶段 2 收尾，进入阶段 3