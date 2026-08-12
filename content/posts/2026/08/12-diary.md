---
title: "2026-08-12 周二 · 数组起步与阶段 3"
date: "2026-08-12 21:00:00 +0800"
excerpt: "C 语言数组（定义/遍历/越界/退化指针/多维/字符数组），Rust 阶段 3 集合、迭代器与 Todo CLI"
tags: ["Rust", "C语言", "培训", "日志"]
categories: ["日志"]
series: "每日日志"

---

## 技术

### C 语言

学习内容：**数组（Array）**

#### 核心概念

数组是相同类型数据的**有序集合**，用于批量处理。下标从 **0** 开始（因为 `arr[i]` 底层是 `*(arr + i)`）。

#### 定义数组的四种语法

| 方式           | 写法                      | 特点                         |
| -------------- | ------------------------- | ---------------------------- |
| 只定义不初始化 | `int a[5];`               | 局部数组垃圾值               |
| 完全初始化     | `int b[5] = {1,2,3,4,5};` | 全部指定                     |
| 部分初始化     | `int c[5] = {1,2};`       | 后面自动清零 → `{1,2,0,0,0}` |
| 省略长度       | `int d[] = {1,2,3};`      | 编译器自动推算长度=3         |

初始化技巧：

- 全零：`int arr[100] = {0};`
- 算长度：`sizeof(arr) / sizeof(arr[0])`
- 常量数组：`const int nums[5] = {...};`

#### 遍历与越界

三种遍历模式：正序 for、用 sizeof 动态算长度、反向遍历。

**数组越界是 C 语言排名第一的隐形杀手。** C 语言不检查越界——为了性能付出安全代价。轻微越界踩坏相邻变量，严重越界直接 Segmentation Fault，最隐蔽的是"看似正常"。防御：宏常量、`assert`、手动检查。

#### 数组与函数——退化指针

数组作函数参数时**长度信息丢失**，三种写法等价：`int arr[]` / `int arr[10]` / `int *arr`。必须额外传 `len` 参数。

> `sizeof` 陷阱：函数内部 `sizeof(arr)` 只能得到指针大小（4 或 8），**不是**数组实际字节数。

#### 其他

- **二维数组**：行优先存储，逻辑上矩阵，内存中连续一排
- **字符数组**：C 语言无 String 类型，用 `\0` 结尾的 char 数组表示字符串。`char s[] = "Hello"` 自动加 `\0`，长度=6
- **C99 VLA**：`int arr[n]`，C11 可选，MSVC 不支持，嵌入式通常禁用

### Rust

学习内容：[Rust Day13 笔记](./12-rust-day-13)——**阶段 3：集合、迭代器与 Todo CLI**

#### MyStack（封装 Vec）

用 `Vec<i32>` 封装自定义栈：`push` / `pop` / `peek` / `is_empty`。`peek()` 返回 `Option<&i32>`——只借看一眼，不拿走值。

#### HashMap 核心：entry API

```rust
*hash.entry(c).or_insert(0) += 1;  // 一次查+插，返回 &mut i32
```

这个模式替代了"先 get 判空，再 insert"的两步操作。练习了字符频率统计、单词频率统计（key 用 `&str` 避免多分配）、`max_by_key` 找最大 value 的 key。

#### HashSet 交集

从 O(n²) 双层 for 优化到 O(n+m)：`set_b.contains(x)` 是 O(1) 的。

#### 迭代器组合技

| 操作                     | 功能                             |
| ------------------------ | -------------------------------- |
| `filter + map + collect` | 标准链式转换                     |
| `flatten`                | `Vec<Vec<T>>` 拍平成 `Vec<T>`    |
| `sort` + `dedup`         | 先排序再删相邻重复（顺序不能反） |
| `partition`              | 根据谓词一次遍历分成两个 Vec     |

#### 文件排序 + Todo CLI

`sort_lines_in_file`：读→`lines()`→`sort()`→`join`→写回。关键：`map(String::from)` 把借用的 `&str` 转为拥有的 `String`，避免悬垂引用。

Todo CLI 完整项目——`Task` struct + serde JSON 持久化 + 四命令（add/list/done/clear），架构：**parse_args → load → 业务 → save**。

#### 本日收获

- `HashMap::entry().or_insert()` 是最常用的 HashMap 模式
- `&str` 做 HashMap key 可以从原字符串借用，零分配
- `Box<dyn Error>` 适合作顶层函数返回类型，灵活
- CLI 项目的基本架构模式：命令行解析 → 加载状态 → 执行操作 → 保存状态

## 明日计划

1. C 语言：跟课堂节奏，可能进入数组进阶或指针章节
2. Rust：继续阶段 3，Maybe 进入阶段 4（泛型/trait/lifetime）