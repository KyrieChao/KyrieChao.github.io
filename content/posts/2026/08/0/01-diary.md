---
title: "周六放松"
date: "2026-08-01 21:00:00 +0800"
excerpt: "C 隐式类型转换规则补充，Rustlings 完结"
tags: ["Rust", "C语言", "培训", "日志"]
categories: ["日志"]
series: "每日日志"
---

## 技术

### C 语言

今天没有做 C 语言编程练习，但补充了一个关于隐式类型转换的知识点。

#### 整数类型比较规则（C 语言隐式转换）

当两个不同类型的整数做比较或运算时，编译器会按以下规则做隐式类型转换：

**1. 整形提升（Integer Promotion）**

比 `int` 小的类型（`char`、`short`），运算前会先统一提升为 `int`（有符号）再参与运算。

```c
char a = 10;
short b = 20;
// a + b 运算时，a 和 b 都会先被提升为 int
```

**2. 同级整数的符号处理**

和 `int` 同级的类型比较时，**无符号比有符号"大"**——有符号数会被强制转换为无符号数再比较。

```c
int a = -1;
unsigned int b = 1;
// a > b ？不，-1 被转成无符号后变成一个极大的正数（UINT_MAX），所以 a > b
```

> 这是 C 语言里一个常见的坑：有符号和无符号混用时，结果往往违反直觉。

**3. 浮点与整型混用**

等级排序：`long double` > `double` > `float` > 整型（`long long` > `long` > `int` > `short` > `char`）

规则：

- **等级低的向等级高的转**
- 同等级整数内，**无符号吃掉有符号**

```c
int i = 5;
double d = 3.14;
// i + d → i 先转为 double，结果为 double 类型

int si = -10;
unsigned int ui = 5;
// si + ui → si 先转为 unsigned int，结果可能很大
```

### Rust

今天完成了 Rustlings 全部练习，看到 Congratulations 的 Finish line。

具体内容记录在 [Rust Day7 笔记](01-rust-day7.md)，要点：

- **生命周期标注**：手写了带生命周期的 `Book<'a>` 结构体及 `impl` 块，能写 `longer_title` 这类多引用返回的方法
- **闭包**：`Fn` / `FnMut` / `FnOnce` 三个 trait 的区别和适用场景
- **迭代器**：`filter` + `map` + `collect` 链式调用、`fold`、`zip`、`next`
- **智能指针**：`Box`（递归类型）、`Rc`（共享所有权）、`RefCell`（内部可变性）、`Arc`（多线程共享）
- **并发**：`Arc<Mutex<T>>` 模式、`thread::spawn` + `join`、`mpsc::channel` 消息传递
- **宏**：声明宏基础语法（`macro_rules!`），四种宏类型对比
- **Clippy**：常用 lint 规则和处理方式
- **类型转换**：`From` / `TryFrom` / `FromStr` / `AsRef` 的实现套路

能力自评：所有权/借用基本内化，迭代器方法库是目前的短板，过程宏还没碰。

## 思考

（今天没有特别的思考内容）

## 明日计划

1. 继续 Rust 后续课程（Trait / 泛型约束深入，如果课程还没到则自己看 Rust Book §10）
2. 精读 Iterator trait 文档，扩充迭代器方法储备