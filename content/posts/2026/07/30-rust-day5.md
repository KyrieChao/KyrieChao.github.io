---
title: "Rust 学习计划"
date: "2026-07-30 08:00:00 +0800"
excerpt: "Rust 第5天学习"
tags: ["Rust", "学习路线", "编程语言"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"
---

# Rust Day5 — 闭包、迭代器与智能指针

> Rustlings 测试全部完成，今天集中写代码练习。

---

## 一、Option 补充方法

### 1.1 `filter` — 按条件过滤 Some 值

```rust
fn main() {
    let x = Some(5);
    let even = x.filter(|n| n % 2 == 0);
    println!("{even:?}");  // None — 5 不是偶数

    let y = Some(4);
    let even = y.filter(|n| n % 2 == 0);
    println!("{even:?}");  // Some(4)
}
```

> `filter` 接收一个谓词闭包：若为 `Some` 且条件满足 → 保持不变；否则 → `None`。不会改变内部值，只决定"通过"还是"拦截"。

### 1.2 `transpose` — Option 与 Result 相互翻转

```rust
let x: Option<Result<i32, String>> = Some(Err("bad".to_string()));
let y = x.transpose();
println!("{y:?}");  // Err("bad")
```

| 输入           | `transpose()` 输出 |
| -------------- | ------------------ |
| `Some(Ok(v))`  | `Ok(Some(v))`      |
| `Some(Err(e))` | `Err(e)`           |
| `None`         | `Ok(None)`         |

> 常见场景：把 `Option<Result<T, E>>` 翻成 `Result<Option<T>, E>`，方便用 `?` 传播错误。

---

## 二、闭包（Closures）

### 2.1 基础闭包与类型推断

```rust
// 闭包自动推断参数和返回类型
let add = |a, b| a + b;
let x = add(1, 2);
println!("{x}");  // 3
```

> 第一次调用 `add(1, 2)` 时编译器推断出 `a: i32, b: i32 -> i32`。之后类型就锁定了，不能再传 `&str` 之类。

### 2.2 捕获外部变量

```rust
let factor = 2;
let multiply = |n| n * factor;  // 不可变借用 factor

println!("{}", multiply(5));   // 10
println!("{}", multiply(10));  // 20 —— 闭包可以多次调用
```

> 这个闭包只借用了 `factor`（不可变引用），实现了 `Fn` trait，可以反复调用。

### 2.3 `FnMut` — 可变借用捕获

```rust
let mut count = 0;

let mut inc = || {
    count += 1;   // 可变借用 count
    count
};

println!("{}", inc());  // 1
println!("{}", inc());  // 2
println!("{}", inc());  // 3
```

> 闭包持有 `&mut count`，每调用一次 +1。这类闭包实现的是 `FnMut` trait。

### 2.4 `move` — 强制所有权转移

```rust
let s = String::from("hello");

let f = move || {
    println!("{}", s);  // s 的所有权移入闭包
};
f();
// println!("{}", s);  // ❌ s 已被移走，编译不通过
```

> **纠正一个常见误区：** `move` 关键字表示"按值捕获"（把所有权拿进来），但闭包**仍然可以多次调用**。只有实现了 `FnOnce` 的闭包才只能调用一次。这里 `println!` 只是借用了 `s`，所以 `f` 实现的是 `Fn`，可以反复调用。

| trait    | 调用方式                | 典型场景                  |
| -------- | ----------------------- | ------------------------- |
| `Fn`     | `&self`，可多次调用     | 只读捕获                  |
| `FnMut`  | `&mut self`，可多次调用 | 修改捕获的变量            |
| `FnOnce` | `self`，只能调一次      | 消费捕获的值（如 `drop`） |

---

## 三、迭代器（Iterators）

### 3.1 手动迭代 — `next()`

```rust
let v = vec![1, 2, 3];
let mut iter = v.iter();

println!("{:?}", iter.next());  // Some(1)
println!("{:?}", iter.next());  // Some(2)
println!("{:?}", iter.next());  // Some(3)
println!("{:?}", iter.next());  // None —— 迭代结束
```

### 3.2 常用消费者（Consumers）

```rust
let sum: i32 = v.iter().sum();          // 求和
let count = v.iter().count();           // 计数
let collected: Vec<i32> = v.iter().copied().collect();  // 收集到 Vec
```

> `copied()` 把 `&i32` 转成 `i32`（对 `Copy` 类型适用），然后 `collect()` 收进 `Vec<i32>`。

### 3.3 `filter` + `map` — 经典组合

```rust
let v2 = vec![1, 2, 3, 4, 5];

let result: Vec<i32> = v2
    .iter()
    .filter(|&&x| x % 2 == 0)  // 保留偶数
    .map(|&x| x * 2)            // 翻倍
    .collect();

println!("{result:?}");  // [4, 8]
```

> **注意双重引用 `&&x`：** `v2.iter()` 产生 `&i32`，`filter` 再借一次变成 `&&i32`，所以需要 `&&x` 来解两层引用，或者直接用 `|x| **x % 2 == 0`。

### 3.4 `fold` — 累积归约

```rust
let sum = v2.iter().fold(0, |acc, &x| acc + x);
println!("{}", sum);  // 15
```

| 方法            | 输入                       | 输出         |
| --------------- | -------------------------- | ------------ |
| `fold(init, f)` | 迭代器 + 初始值 + 累积函数 | 单值         |
| 等价于          | 循环 `acc = f(acc, item)`  | 最终累积结果 |

### 3.5 `zip` — 并行迭代两个集合

```rust
let names = vec!["Alice", "Bob"];
let scores = vec![85, 90];

for (name, score) in names.iter().zip(scores.iter()) {
    println!("{} {}", name, score);
}
// Alice 85
// Bob 90
```

> 两个迭代器按位置配对，较短的耗尽时停止。

---

## 四、智能指针

### 4.1 `Box<T>` — 堆分配

```rust
use std::{cell::RefCell, rc::Rc};

enum List {
    Cons(i32, Box<List>),
    Nil,
}

fn main() {
    let b = Box::new(5);
    println!("{b}");  // 5

    // let list = List::Cons(1, Box::new(List::Cons(2, Box::new(List::Nil))));
    // println!("{list:?}");
}
```

> Rust 要求编译期知道每个类型的大小。`List` 是递归的，编译器算不出大小，所以用 `Box<List>` 把递归部分放堆上——`Box` 是指针，大小固定。

### 4.2 `Rc<T>` — 引用计数（单线程共享所有权）

```rust
let data = Rc::new(String::from("hello"));
let data2 = Rc::clone(&data);

println!("引用计数: {}", Rc::strong_count(&data));  // 2
println!("{}", data2);  // hello
```

> `Rc::clone` 不深拷贝数据，只增加引用计数。`Rc<T>` **不是线程安全**的（没有 `Send`/`Sync`），多线程场景用 `Arc<T>`。

### 4.3 `RefCell<T>` — 内部可变性（运行时借用检查）

```rust
let data = RefCell::new(5);
{
    let mut ref_mut = data.borrow_mut();
    *ref_mut += 1;
}  // ref_mut 在此 drop，释放可变借用
println!("{}", data.borrow());  // 6
```

| 对比     | `&mut T`（编译期） | `RefCell<T>`（运行时） |
| -------- | ------------------ | ---------------------- |
| 检查时机 | 编译期             | 运行时                 |
| 违规后果 | 编译错误           | **panic**              |
| 灵活性   | 受限于借用规则     | 可在不可变上下文中修改 |

> **关键规则：** 同一作用域内只能有一个 `borrow_mut()`，或者多个 `borrow()`，不能同时——这和 `&mut` / `&` 的规则一样，只不过从编译期挪到了运行时。

### 4.4 `Rc<RefCell<T>>` — 组合拳：共享 + 可变

```rust
let data = Rc::new(RefCell::new(5));
let data2 = Rc::clone(&data);

*data2.borrow_mut() += 1;    // 通过 data2 修改内部值

println!("{}", data.borrow());   // 6 —— data 也看到了变化
println!("{:?}", data2);         // RefCell { value: 6 }
```

> `Rc` 允许多个所有者，`RefCell` 允许在不可变引用下修改内部值。组合起来就是**多个所有者都可以修改同一块数据**——类似于单线程下的共享可变状态。

---

## 五、本日小结

| 知识点                             | 掌握程度 | 说明                             |
| ---------------------------------- | -------- | -------------------------------- |
| `Option::filter`                   | 会用     | 条件过滤 Some，不满足转 None     |
| `Option::transpose`                | 会用     | Option<Result> ↔ Result<Option>  |
| 闭包 `\|a\| a + b`                 | 会用     | 自动推断类型，捕获环境变量       |
| `Fn` / `FnMut` / `FnOnce`          | 了解     | 三种闭包 trait，决定调用方式     |
| `move` 闭包                        | 会用     | 强制按值捕获，不等于"只能调一次" |
| 迭代器 `filter`/`map`/`fold`/`zip` | 会用     | 链式组合，惰性求值               |
| `Box<T>`                           | 会用     | 堆分配，递归类型必用             |
| `Rc<T>`                            | 会用     | 单线程引用计数，共享所有权       |
| `RefCell<T>`                       | 会用     | 运行时借用检查，内部可变性       |
| `Rc<RefCell<T>>`                   | 会用     | 组合：多个所有者 + 可变          |

**明天目标：** 推进到 lifetimes（生命周期标注）。