---
title: "Rust 学习计划"
date: "2026-08-01 08:00:00 +0800"
excerpt: "Rust 第6天学习 — Rustlings 完结"
tags: ["Rust", "学习路线", "编程语言"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"

---

# Rust Day7 — Rustlings 完结 & 综合练习

Rustlings 全部做完，看到 Fe-nish line 那一刻还是挺有成就感的。

但说实话，我只是**知道了几个函数怎么用**，离"完全掌握"还有距离。今天把薄弱环节集中补一下。

---

## 1. 今日手写代码

### 1.1 生命周期（Lifetimes）

```rust
#[derive(Debug)]
enum List {
    Cons(i32, Box<List>),
    Nil,
}

impl List {
    fn len(&self) -> i32 {
        match self {
            List::Cons(_, next) => 1 + next.len(),
            List::Nil => 0,
        }
    }
}

struct Book<'a> {
    title: &'a str,
    author: &'a str,
}

impl<'a> Book<'a> {
    fn get_title(&self) -> &str {
        self.title
    }

    fn longer_title<'b>(&self, other: &'a str) -> &'a str {
        if self.title.len() > other.len() {
            self.title
        } else {
            other
        }
    }
}
```

**生命周期知识点：**

| 概念                | 说明                                                         |
| ------------------- | ------------------------------------------------------------ |
| `'a` 语法           | 生命周期参数，标注引用"活多久"。`&'a str` 表示这个引用的有效期至少为 `'a` |
| struct 中的生命周期 | 当 struct 持有引用时，必须标注生命周期：编译器需要保证 struct 实例活得比引用短 |
| impl 中的生命周期   | `impl<'a> Book<'a>` — 在 impl 后声明泛型生命周期，在类型后使用 |
| 省略规则            | `fn get_title(&self) -> &str` 编译器能自动推断，不用显式写   |
| 多引用返回          | `longer_title` 返回的引用可能来自 `self.title` 或 `other`，生命期标注告诉编译器"返回值的生命周期等于较短的那个" |

> **核心直觉：** 生命周期标注不改变代码逻辑，只是在给编译器"画约束线"——"这个引用不能比那个引用活得久"。标注完后编译器帮你检查是否违反了约束。

### 1.2 闭包（Closures）

```rust
fn main() {
    // 不可变借用 —— 实现 Fn
    let base = 10;
    let add_base = |n| base + n;
    println!("{}", add_base(5));  // 15

    // 可变借用 —— 实现 FnMut
    let mut count = 0;
    let mut counter = || {
        count += 1;
        count
    };
    println!("{}", counter());  // 1
    println!("{}", counter());  // 2

    // 闭包作为参数 —— Fn trait bound
    fn apply_twice<F>(f: F, n: i32) -> i32
    where
        F: Fn(i32) -> i32,
    {
        f(f(n))
    }
    println!("{}", apply_twice(|n| n * 2, 5));  // 20
}
```

| trait    | 调用方式    | 捕获方式   | 能多次调用    |
| -------- | ----------- | ---------- | ------------- |
| `Fn`     | `&self`     | 不可变借用 | ✓             |
| `FnMut`  | `&mut self` | 可变借用   | ✓             |
| `FnOnce` | `self`      | 转移所有权 | ✗（只能一次） |

### 1.3 迭代器（Iterators）

```rust
let nums = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// filter + map + collect
let result: Vec<i32> = nums
    .iter()
    .filter(|&&x| x % 2 == 0)
    .map(|&x| x * 3)
    .collect();
println!("{:?}", result);  // [6, 12, 18, 24, 30]

// fold 累积
let product = nums.iter().fold(1, |acc, &x| acc * x);
println!("{}", product);  // 3628800

// zip 并行迭代
let names = vec!["Tom", "Jerry", "Spike"];
let scores = vec![80, 95, 60];
for (name, score) in names.iter().zip(scores.iter()) {
    println!("{}:{}", name, score);
}

// 链式查找：第一个大于5的偶数，乘2
let first = nums
    .iter()
    .filter(|&&x| x % 2 == 0 && x > 5)
    .map(|&o| o * 2)
    .next()
    .unwrap_or(0);
println!("{}", first);  // 12
```

### 1.4 智能指针（Smart Pointers）

```rust
use std::{
    cell::RefCell,
    rc::Rc,
};

// Rc<Vec<i32>> — 共享所有权
let v = Rc::new(vec![1, 2, 3]);
let v2 = Rc::clone(&v);
let v3 = Rc::clone(&v);
println!("{}", Rc::strong_count(&v));  // 3

// Rc<RefCell<i32>> — 共享 + 内部可变
let num = Rc::new(RefCell::new(5));
let num2 = Rc::clone(&num);
*num.borrow_mut() += 1;    // 5 + 1 = 6
*num2.borrow_mut() *= 2;   // 6 * 2 = 12
println!("{}", num.borrow());  // 12

// Box 实现递归链表
#[derive(Debug)]
enum List {
    Cons(i32, Box<List>),
    Nil,
}

let list = Box::new(List::Cons(
    1,
    Box::new(List::Cons(2, Box::new(List::Cons(3, Box::new(List::Nil))))),
));
println!("{}", list.len());  // 3
```

**三种智能指针对比：**

| 智能指针     | 用途             | 线程安全 | 等价于                    |
| ------------ | ---------------- | -------- | ------------------------- |
| `Box<T>`     | 堆分配，递归类型 | —        | C 的 `malloc`（自动释放） |
| `Rc<T>`      | 单线程共享所有权 | ❌        | 非原子的引用计数          |
| `Arc<T>`     | 多线程共享所有权 | ✓        | 原子的引用计数            |
| `RefCell<T>` | 运行时借用检查   | ❌        | 编译期检查的"后门"        |
| `Mutex<T>`   | 多线程互斥访问   | ✓        | 互斥锁                    |
| `Cow<T>`     | 写时克隆         | —        | 懒克隆优化                |

### 1.5 并发（Concurrency）

```rust
use std::{
    sync::{Arc, Mutex},
    thread,
};

// 10 个线程共享一个计数器，每个 +1
let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];

for _ in 0..10 {
    let c = Arc::clone(&counter);
    handles.push(thread::spawn(move || {
        *c.lock().unwrap() += 1;
    }));
}

for h in handles {
    h.join().unwrap();
}
println!("{:?}", counter.lock().unwrap());  // 10
```

**并发三板斧：**

```
Arc<Mutex<T>>
  │   └── 互斥锁：保证同一时刻只有一个线程能修改数据
  └────── 原子引用计数：保证多线程共享所有权（Rc 不行！）
```

| 组件            | 作用                                                    |
| --------------- | ------------------------------------------------------- |
| `thread::spawn` | 创建新线程，返回 `JoinHandle`                           |
| `move` 闭包     | 强制把外部变量所有权移入线程闭包                        |
| `Arc::clone`    | 给每个线程一份"共享指针的副本"（不拷贝数据）            |
| `Mutex::lock()` | 获取锁，返回 `LockResult<MutexGuard<T>>`                |
| `unwrap()`      | 简化错误处理——若其他线程 panic 导致锁中毒，这里也 panic |
| `join()`        | 主线程等待子线程完成                                    |

---

## 2. Rustlings 19~23 练习总结

### 2.1 19_smart_pointers — 智能指针

| 练习题    | 涉及内容              | 关键收获                                                     |
| --------- | --------------------- | ------------------------------------------------------------ |
| `box1.rs` | `Box<T>` 解决递归类型 | Rust 需要在编译期知道类型大小，`Box` 把递归部分放堆上，因为是固定大小的指针 |
| `rc1.rs`  | `Rc<T>` 共享所有权    | 太阳系模型：一颗 Sun，8 颗行星通过 `Rc::clone` 共享太阳。`strong_count` 增减可视化 |
| `arc1.rs` | `Arc<T>` 多线程共享   | `Rc` 不实现 `Send`，多线程必须用 `Arc`。8 个线程各持有 `Arc::clone` |
| `cow1.rs` | `Cow<T>` 写时克隆     | `Cow::Borrowed` 不拷贝；`to_mut()` 触发克隆变 `Cow::Owned`。只有需要修改才拷贝 |

### 2.2 20_threads — 线程

| 练习题        | 涉及内容                 | 关键收获                                                     |
| ------------- | ------------------------ | ------------------------------------------------------------ |
| `threads1.rs` | `thread::spawn` + `join` | `JoinHandle.join().unwrap()` 等待线程结束并取返回值          |
| `threads2.rs` | `Arc<Mutex<T>>`          | `lock().unwrap()` 获取 `MutexGuard`，解引用后修改。离开作用域自动释放锁 |
| `threads3.rs` | `mpsc::channel`          | 消息传递并发。多生产者单消费者：`tx.clone()` 克隆发送端，`rx` 收所有消息 |

> **为什么需要 Mutex？** 如果多个线程直接 `+=1`，会有数据竞争（data race）——读-改-写不是原子操作。Mutex 保证"锁住 → 修改 → 释放"这个序列是互斥的。

### 2.3 21_macros — 宏

| 练习题       | 涉及内容          | 关键收获                                                     |
| ------------ | ----------------- | ------------------------------------------------------------ |
| `macros1.rs` | 宏调用语法        | `my_macro!()` — 声明宏调用必须加 `!`                         |
| `macros2.rs` | 宏定义顺序        | 宏必须在调用**之前**定义（与函数不同）                       |
| `macros3.rs` | `#[macro_export]` | 模块内的宏默认私有，加 `#[macro_export]` 导出到 crate root   |
| `macros4.rs` | 宏重载            | 同一个宏名可定义多个匹配分支：无参 `()` 和带参 `($val:expr)` |

**声明宏基础语法：**

```rust
macro_rules! 宏名 {
    (模式1) => { 展开1 };
    (模式2) => { 展开2 };
}

// 模式中常用设计符：
// $var:expr   — 表达式
// $var:ty     — 类型
// $var:ident  — 标识符
// $var:literal — 字面量
// $var:tt     — 单个 token tree（最通用）
```

> 说实话 macros 这四道题太简单了，只碰了声明宏的皮毛。过程宏（`#[proc_macro]`）、`#[derive]` 宏、属性宏才是真正强大的部分，但 Rustlings 没涉及。

### 2.4 22_clippy — 代码规范 Lint

| 练习题       | Clippy 规则            | 修正方法                                                     |
| ------------ | ---------------------- | ------------------------------------------------------------ |
| `clippy1.rs` | `approx_constant`      | `3.14` → `std::f32::consts::PI`                              |
| `clippy2.rs` | `if_let` 替代 `unwrap` | `option.unwrap()` → `if let Some(x) = option { ... }`        |
| `clippy3.rs` | 多个 lint 综合         | `if let` 替代 `unwrap`；`swap` 替代手动交换；`vec.resize` 替代 `vec![..].resize(0,..)` 等 |

**常用 Clippy 规则速查：**

| Lint 名                   | 检测内容                                                     |
| ------------------------- | ------------------------------------------------------------ |
| `clippy::unwrap_used`     | 禁止 `unwrap()`（生产代码推荐用 `?` 或 `expect`）            |
| `clippy::needless_return` | 函数末尾多余的 `return`                                      |
| `clippy::if_let`          | 能用 `if let` 的地方不要 `match` 单分支                      |
| `clippy::approx_constant` | 硬编码的数学常量（如 `3.14` 应替换为 `std::f32::consts::PI`） |
| `clippy::manual_swap`     | 手动三行交换两个变量，应用 `std::mem::swap`                  |

> Clippy 就像 Rust 的"代码规范老师"——它不光告诉你哪里不对，还告诉你为什么以及怎么改。生产项目建议配 `cargo clippy -- -D warnings`，把所有警告当错误处理。

### 2.5 23_conversions — 类型转换

| 练习题             | 涉及 trait            | 关键收获                                                     |
| ------------------ | --------------------- | ------------------------------------------------------------ |
| `using_as.rs`      | `as` 关键字           | `values.len() as f64` — `as` 做基本类型转换。注意：`as` 不检查溢出 |
| `from_into.rs`     | `From` + `Into`       | 实现 `From<&str> for Person`，`Into` 自动获得。失败时 fallback 到 `Default` |
| `from_str.rs`      | `FromStr`             | 与 `From` 不同：返回 `Result`，失败带错误信息。实现后可直接 `.parse::<Person>()` |
| `try_from_into.rs` | `TryFrom` + `TryInto` | 可能失败的转换。实现了 tuple、数组、slice 三种输入版本的 `TryFrom` |
| `as_ref_mut.rs`    | `AsRef` + `AsMut`     | `AsRef<str>` 让函数同时接受 `&str` 和 `String`。`AsMut` 同理用于可变引用 |

**转换 trait 选择指南：**

```
值到值的转换：
  ┌─ 不会失败 ──→ 实现 From
  └─ 可能失败 ──→ 实现 TryFrom（自动得 TryInto）

字符串解析：
  └── 可能失败 ──→ 实现 FromStr（自动得 .parse()）

引用到引用的转换（零成本）：
  └── 实现 AsRef / AsMut

简单数值转换（不检查）：
  └── 用 as 关键字
```

> 老实说 conversions 这几题主要就是反复练习 trait 实现的套路，没有特别新的概念。`FromStr` vs `From` 的区别值得记住：一个返回 `Result`，一个返回 `Self`。

---

## 3. 薄弱环节深入

### 3.1 线程与并发 — 补充理解

**`Arc<Mutex<T>>` 模式的工作流程：**

```rust
use std::sync::{Arc, Mutex};
use std::thread;

let data = Arc::new(Mutex::new(0));     // ① 创建共享数据

let data_clone = Arc::clone(&data);     // ② 克隆 Arc（引用计数 +1）
thread::spawn(move || {                 // ③ move 移入闭包
    let mut guard = data_clone.lock().unwrap();  // ④ 获取锁
    *guard += 1;                        // ⑤ 修改数据
});                                     // ⑥ guard drop → 自动释放锁
```

**Mutex 锁中毒（Poisoning）：**

```rust
// 如果一个线程在持有锁时 panic，锁会"中毒"
// lock() 的返回值是 LockResult<MutexGuard<T>>
// 中毒时 lock() 返回 Err(PoisonError)

// 简单处理：unwrap() — 中毒也 panic
*counter.lock().unwrap() += 1;

// 更安全的处理：
match counter.lock() {
    Ok(mut guard) => *guard += 1,
    Err(poisoned) => {
        // 锁已中毒，但仍可通过 into_inner() 恢复数据
        *poisoned.into_inner() += 1;
    }
}
```

**`mpsc::channel`（消息传递并发）：**

```rust
use std::sync::mpsc;
use std::thread;

let (tx, rx) = mpsc::channel();        // tx = 发送端, rx = 接收端

let tx1 = tx.clone();                   // 多个发送者
thread::spawn(move || {
    tx1.send("来自线程1").unwrap();     // 发送消息
});

let tx2 = tx.clone();
thread::spawn(move || {
    tx2.send("来自线程2").unwrap();
});

drop(tx);                               // 原始 tx 也要 drop，否则 rx 会永远等待

for msg in rx {                         // rx 作为迭代器，直到所有 tx 都 drop
    println!("{}", msg);
}
```

> **Go 的哲学是"用通信来共享内存"**，Rust 同时支持两种范式：channel（消息传递）和 `Arc<Mutex<T>>`（共享内存）。Mutex 更直观但容易死锁，channel 更安全但有时不方便。

### 3.2 Rc + RefCell 的内部原理

```rust
use std::{cell::RefCell, rc::Rc};

// Rc 解决 "谁拥有这块数据" — 引用计数
// RefCell 解决 "不可变引用下怎么修改" — 运行时借用检查
let shared = Rc::new(RefCell::new(vec![1, 2, 3]));

{
    let mut v = shared.borrow_mut();    // 运行时检查：有没有其他借用？
    v.push(4);                          // 可变借用，修改数据
}                                       // v drop → 可变借用释放

let v2 = shared.borrow();              // 不可变借用，读取数据
println!("{:?}", v2);                  // [1, 2, 3, 4]
```

**RefCell 的运行时检查规则（与编译期规则完全对应）：**

| 操作           | 成功条件                       | 失败结果 |
| -------------- | ------------------------------ | -------- |
| `borrow()`     | 当前没有 `borrow_mut()` 持有中 | `panic!` |
| `borrow_mut()` | 当前没有任何 borrow（读或写）  | `panic!` |

> **为什么需要 RefCell？** 编译期借用检查是保守的——有时你明知逻辑上安全，但编译器不买账。RefCell 把检查推迟到运行时，给你更大的灵活性，代价是写错会 panic 而不是编译报错。

### 3.3 宏 — 声明宏进阶

Rustlings 教到的最远的地方是多分支宏。补充几个实际场景：

```rust
// vec! 宏的实际实现思路（简化版）
macro_rules! my_vec {
    () => { Vec::new() };
    ($elem:expr; $n:expr) => {              // vec![0; 10] → 10 个 0
        std::vec::from_elem($elem, $n)
    };
    ($($x:expr),+ $(,)?) => {               // vec![1, 2, 3] → 可变参数
        {
            let mut v = Vec::new();
            $(v.push($x);)+
            v
        }
    };
}

// 重复模式语法：
// $($var:expr),*     — 零个或多个，逗号分隔
// $($var:expr),+     — 一个或多个，逗号分隔
// $(,)?              — 可选的尾随逗号
```

四种宏类型的对比：

| 宏类型   | 定义方式                  | 使用方式           | 典型场景           |
| -------- | ------------------------- | ------------------ | ------------------ |
| 声明宏   | `macro_rules!`            | `macro!()`         | `println!`、`vec!` |
| 派生宏   | `#[proc_macro_derive]`    | `#[derive(Debug)]` | 自动实现 trait     |
| 属性宏   | `#[proc_macro_attribute]` | `#[route("GET")]`  | 代码标注/转换      |
| 函数式宏 | `#[proc_macro]`           | `sql!(SELECT ...)` | 自定义语法         |

> Rustlings 只教了声明宏的入门，剩下三种过程宏需要单独深入。

---

## 4. Rustlings 全阶段学习反思

### 4.1 能力自评

| 知识模块                     | 自评         | 说明                                                         |
| ---------------------------- | ------------ | ------------------------------------------------------------ |
| 所有权 / 借用 / 生命周期     | 基本会用     | 生命周期标注遇到复杂场景还是会卡                             |
| 枚举 / 模式匹配              | 熟练         | `match`、`if let`、`Option`/`Result` 操作顺手                |
| Vec / String / HashMap       | 会用         | 常用方法熟悉，Entry API 是亮点                               |
| 闭包                         | 基本会用     | `Fn`/`FnMut`/`FnOnce` 区别理解，但写 trait bound 时偶尔会忘  |
| 迭代器                       | 会用但不熟   | 上百个方法只记住了常用的十几个，遇到新需求经常想不出该用哪个 |
| `Box` / `Rc` / `RefCell`     | 会用         | 知道各自用途和限制，组合使用没问题                           |
| `Arc` / `Mutex` / 线程       | 了解         | 能写简单多线程程序，但并发模式的积累不够                     |
| `From` / `TryFrom` / `AsRef` | 会用         | 懂了套路，缺的是多练                                         |
| 宏                           | 能读懂不会写 | 声明宏基础语法会了，过程宏还没碰                             |
| 错误处理                     | 会用         | `Result` + `?` 很顺手，自定义错误类型也练过                  |
| 测试                         | 会用         | `#[test]` + `assert_eq!` 基础够用                            |

### 4.2 下一步学习方向

1. **迭代器方法库**：精读 Iterator trait 文档，记住 20~30 个常用方法
2. **并发深入**：`mpsc`、`RwLock`、`Barrier`、`Condvar`、`OnceLock` 等更多并发原语
3. **过程宏**：尝试写一个 `#[derive]` 宏，理解 `syn` + `quote` 工作流
4. **生命周期实战**：多写几个需要显式标注生命周期签名的复杂 struct/fn
5. **实际项目**：用 Rust 写一个小项目（CLI 工具或嵌入式驱动），把碎片知识串起来

---

## 5. Rustlings 全部章节对照表

| 练习            | 《Rust Book》章节 | 完成 |
| --------------- | ----------------- | ---- |
| variables       | §3.1              | ✓    |
| functions       | §3.3              | ✓    |
| if              | §3.5              | ✓    |
| primitive_types | §3.2, §4.3        | ✓    |
| vecs            | §8.1              | ✓    |
| move_semantics  | §4.1-2            | ✓    |
| structs         | §5.1, §5.3        | ✓    |
| enums           | §6, §18.3         | ✓    |
| strings         | §8.2              | ✓    |
| modules         | §7                | ✓    |
| hashmaps        | §8.3              | ✓    |
| options         | §10.1             | ✓    |
| error_handling  | §9                | ✓    |
| generics        | §10               | ✓    |
| traits          | §10.2             | ✓    |
| lifetimes       | §10.3             | ✓    |
| tests           | §11.1             | ✓    |
| iterators       | §13.2-4           | ✓    |
| smart_pointers  | §15, §16.3        | ✓    |
| threads         | §16.1-3           | ✓    |
| macros          | §20.5             | ✓    |
| clippy          | Appendix D        | ✓    |
| conversions     | n/a               | ✓    |

---

## 6. 备忘

- `as` 转换不检查溢出，生产代码中跨类型窄化转换建议用 `TryFrom` 或用 `.try_into()` 后处理 `Result`
- `Rc` 不能跨线程（不实现 `Send`），改用 `Arc`；`RefCell` 也不能跨线程（不实现 `Sync`），改用 `Mutex` 或 `RwLock`
- `Mutex::lock()` 会阻塞当前线程直到获取锁；`try_lock()` 不阻塞，获取不到马上返回 `Err`
- Clippy 默认只 warn，配 `-D warnings` 才能让 lint 阻止编译