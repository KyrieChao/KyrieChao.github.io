---
title: "Rust 学习计划"
date: "2026-08-03 08:00:00 +0800"
excerpt: "Rust 第8天学习"
tags: ["Rust", "学习路线", "编程语言"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"

---

## Day 8 目标

Rustlings 做完了，但并发和 trait 两块还是不够熟。Day 8 集中补这两个方向。

---

## 一、线程与并发深化

### 1.1 `mpsc::channel` —— 消息传递并发

Go 的那句"用通信来共享内存"，Rust 同样支持。`mpsc` 代表 **m**ultiple **p**roducer, **s**ingle **c**onsumer。

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    let tx1 = tx.clone();
    thread::spawn(move || {
        tx1.send("来自线程1").unwrap();
    });

    let tx2 = tx.clone();
    thread::spawn(move || {
        tx2.send("来自线程2").unwrap();
    });

    drop(tx);  // 原始 tx 必须 drop，否则 rx 会永远等待

    for msg in rx {
        println!("{}", msg);
    }
}
```

要点：

- `tx` 克隆后分发给各线程，`rx` 作为迭代器收消息
- **必须 drop 原始 tx**，否则接收端不知道发送者何时全部结束
- `send` 返回 `Result`——接收端已 drop 时会报错

### 1.2 `Arc<Mutex<T>>` —— 共享内存并发

```rust
use std::sync::{Arc, Mutex};
use std::thread;

let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];

for _ in 0..10 {
    let c = Arc::clone(&counter);
    handles.push(thread::spawn(move || {
        let mut num = c.lock().unwrap();
        *num += 1;
    }));
}

for h in handles {
    h.join().unwrap();
}

println!("{}", *counter.lock().unwrap());  // 10
```

每一步的含义：

| 步骤     | 代码                      | 作用                                                 |
| -------- | ------------------------- | ---------------------------------------------------- |
| ① 创建   | `Arc::new(Mutex::new(0))` | 把数据包在 Mutex 里，再包在 Arc 里                   |
| ② 克隆   | `Arc::clone(&counter)`    | 每个线程拿一份 Arc 的拷贝（引用计数 +1，不拷贝数据） |
| ③ 移入   | `move || { ... }`         | 强制闭包获取 Arc 的所有权                            |
| ④ 加锁   | `c.lock().unwrap()`       | 获取 MutexGuard，阻塞直到拿到锁                      |
| ⑤ 修改   | `*num += 1`               | 解引用 MutexGuard 后修改内部数据                     |
| ⑥ 等线程 | `h.join()`                | 主线程等待所有子线程完成                             |

### 1.3 锁中毒（Poisoning）

如果线程在持有锁时 panic，锁会"中毒"——后续 `lock()` 返回 `Err(PoisonError)`。

```rust
// 简单粗暴：中毒也 panic
*counter.lock().unwrap() += 1;

// 更稳健：中毒后仍能恢复数据
match counter.lock() {
    Ok(mut guard) => *guard += 1,
    Err(poisoned) => *poisoned.into_inner() += 1,
}
```

### 1.4 其他并发原语速览

| 原语                   | 一句话                           | 类比                            |
| ---------------------- | -------------------------------- | ------------------------------- |
| `RwLock<T>`            | 多读单写锁                       | 读写锁，读不互斥、写互斥        |
| `Barrier`              | 多个线程在某个点汇合             | 等人齐了一起走                  |
| `Condvar`              | 条件变量，配合 Mutex 做等待/通知 | `while !ready { wait() }`       |
| `OnceLock`             | 只写入一次、之后只读的单值容器   | 线程安全的 lazy static          |
| `AtomicBool/I32/Usize` | 无锁原子操作                     | 简单的计数器/标志位不需要 Mutex |

> 先熟练掌握 `channel` 和 `Arc<Mutex<T>>` 两个模式，够覆盖 80% 的并发场景。其余用到时再查。

---

## 二、Trait —— 共享行为的抽象

### 2.1 基本语法

```rust
// 定义 trait
trait Summary {
    fn summarize(&self) -> String;

    // 默认实现
    fn summarize_author(&self) -> String {
        String::from("(未知作者)")
    }
}

// 为类型实现 trait
struct Article {
    title: String,
    author: String,
    content: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{} —— {}", self.title, self.author)
    }
}

// 调用
let a = Article { ... };
println!("{}", a.summarize());
```

> `impl Trait for Type` —— trait 和类型至少有一个必须在本 crate 中定义（**孤儿规则**）。你不能为外部类型实现外部 trait。

### 2.2 Trait 作为参数

```rust
// 写法一：impl Trait 语法糖
fn notify(item: &impl Summary) {
    println!("{}", item.summarize());
}

// 写法二：trait bound（等价，更显式）
fn notify<T: Summary>(item: &T) {
    println!("{}", item.summarize());
}

// 多个 trait bound
fn notify<T: Summary + Display>(item: &T) { ... }

// where 子句（参数多、约束多时更可读）
fn some_function<T, U>(t: &T, u: &U) -> i32
where
    T: Display + Clone,
    U: Clone + Debug,
{ ... }
```

### 2.3 返回实现了 Trait 的类型

```rust
fn returns_summarizable() -> impl Summary {
    Article { ... }
}
```

> `impl Trait` 作返回类型时，函数只能返回**同一种类型**。不能在某些分支返回 `Article`、另一些分支返回 `Tweet`。

### 2.4 常用标准库 Trait

| Trait           | 用途                   | 获取方式                         |
| --------------- | ---------------------- | -------------------------------- |
| `Debug`         | 调试打印 `{:?}`        | `#[derive(Debug)]`               |
| `Clone`         | 显式深拷贝 `.clone()`  | `#[derive(Clone)]`               |
| `Copy`          | 隐式按位拷贝（栈数据） | `#[derive(Copy, Clone)]`         |
| `PartialEq`     | 相等比较 `==` `!=`     | `#[derive(PartialEq)]`           |
| `Default`       | 默认值                 | `#[derive(Default)]`             |
| `Display`       | 面向用户的格式化 `{}`  | **手动实现**                     |
| `Drop`          | 离开作用域时执行的清理 | 手动实现 `fn drop(&mut self)`    |
| `From` / `Into` | 类型转换               | 手动实现 `From`，`Into` 自动获得 |
| `Iterator`      | 迭代器                 | 手动实现 `fn next(&mut self)`    |

### 2.5 练习——写一个自定义 trait

试着不用 `#[derive]`，手动为你的 `Rectangle` 实现 `PartialEq` 和 `Display`：

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

// 手动实现 PartialEq
impl PartialEq for Rectangle {
    fn eq(&self, other: &Self) -> bool {
        self.width == other.width && self.height == other.height
    }
}

// 手动实现 Display
impl std::fmt::Display for Rectangle {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Rectangle({} x {})", self.width, self.height)
    }
}
```

---

## 三、今日练习清单

| #    | 练习                                                         | 重点               |
| ---- | ------------------------------------------------------------ | ------------------ |
| 1    | 用 `mpsc::channel` 实现：3 个线程各产生 10 个随机数，汇总到主线程求平均值 | channel 消息传递   |
| 2    | 用 `Arc<Mutex<T>>` 实现：5 个线程同时对同一个 `Vec<i32>` 追加元素，最后打印完整列表 | 共享内存 + 锁      |
| 3    | 不用 channel、不用共享内存，只用 `thread::spawn` + `join` 实现：4 个线程各自计算，最后汇总 | 多线程返回值       |
| 4    | 为你的 `Rectangle` 手动实现 `PartialEq`、`Display`、`From<(u32, u32)>` | Trait 实现套路     |
| 5    | 写一个函数 `largest<T: PartialOrd>(list: &[T]) -> &T`，找出切片中最大元素的引用 | 泛型 + trait bound |

---

## 四、Day 8 检查点

- [ ] 能用 `channel` 在多线程间传递消息
- [ ] 能用 `Arc<Mutex<T>>` 安全共享可变数据
- [ ] 理解锁中毒的机制和处理方式
- [ ] 能写出带 trait bound 的泛型函数
- [ ] 能手写 `impl Display for Xxx`（不用 derive）
- [ ] 理解孤儿规则的限制

---

## 五、如果还有时间——再看一眼生命周期

之前 `longest` 能写对，但复杂场景还是会卡。试一下这个结构体标注：

```rust
struct Excerpt<'a> {
    part: &'a str,  // 要求：Excerpt 实例不能比它引用的 str 活得更久
}

impl<'a> Excerpt<'a> {
    // 省略规则自动处理，无需显式标注
    fn announce(&self, msg: &str) -> &str {
        println!("{}", msg);
        self.part
    }
}
```

规则回顾——三个省略规则，当编译器能自动推断时就不用写：

1. 每个引用参数都有各自的生命周期
2. 只有一个输入生命周期 → 赋予所有输出
3. `&self` / `&mut self` → self 的生命周期赋予所有输出

只有当三条规则都不满足时，才需要手动标注。