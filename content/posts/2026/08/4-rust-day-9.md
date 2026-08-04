---
title: "Rust 学习计划"
date: "2026-08-04 08:00:00 +0800"
excerpt: "Rust 第9天学习 — 并发深入练习"
tags: ["Rust", "学习路线", "编程语言"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"

---

# Rust Day9 — 并发深入练习

今天把线程相关的每个概念拆开单独练了一遍，**感觉有些理解了。** 之前看文档觉得 `Arc<Mutex<T>>` 这套绕，一个个写过去之后发现其实就是三层组合。

---

## 1. 线程基础 — spawn 与 join

### 1.1 最简单的多线程

```rust
use std::{thread, time::Duration};

fn download() {
    println!("开始下载...");
    thread::sleep(Duration::from_secs(3));
    println!("下载完成!");
}

fn main() {
    // 直接调用：主线程卡 3 秒，期间什么都干不了
    // download();

    // spawn：子线程后台跑，主线程继续往下
    thread::spawn(|| {
        download();
    });
    println!("界面继续运行");  // 这行先打印，不等 download

    thread::spawn(|| {
        println!("子线程：开始下载...");
        thread::sleep(Duration::from_secs(3));
        println!("子线程：下载完成!");
    });
    println!("界面继续运行");
    thread::sleep(Duration::from_secs(5));  // 给子线程跑完的时间
}
```

**关键认知：**

| 行为                   | 说明                                         |
| ---------------------- | -------------------------------------------- |
| `spawn` 立即返回       | 主线程不等子线程，各跑各的                   |
| main 结束 → 程序退出   | 所有子线程被强制终止                         |
| `thread::sleep` 等线程 | 简单粗暴但不靠谱（万一子线程需要更长时间？） |

### 1.2 join — 正确等线程的方式

```rust
let handle = thread::spawn(|| {
    thread::sleep(Duration::from_secs(3));
    println!("子线程：下载完成!");
});

println!("主线程：做别的事");    // 先打印
handle.join().unwrap();          // 阻塞，直到子线程跑完
println!("主线程：子线程结束了，我也结束了");
```

**执行顺序一目了然：**

```
主线程：做别的事          ← 立即
子线程：下载完成!         ← 3 秒后
主线程：子线程结束了...   ← join 结束后
```

| API        | 作用                                                   |
| ---------- | ------------------------------------------------------ |
| `join()`   | 阻塞当前线程，等待 `JoinHandle` 对应的线程结束         |
| `unwrap()` | 子线程 panic 时 `join` 返回 `Err`，这里直接 panic 传播 |

---

## 2. move — 所有权移入线程

### 2.1 为什么必须 move

```rust
let s = String::from("hello");

// ❌ 这样写编译不过：
// thread::spawn(|| {
//     println!("{}", s);  // s 是局部变量，可能在线程跑完前就被释放了
// });

// ✓ move：所有权给闭包，编译器不再担心生命周期
let val = s.clone();
let handle = thread::spawn(move || {
    println!("{}", val);
});

println!("{}", s);  // s 还在，因为只移走了 clone 出来的 val
handle.join().unwrap();
```

**move 的决策表：**

| 主线程之后还要用 | 做法                              |
| ---------------- | --------------------------------- |
| 还要用           | `clone()` 一份，`move` 移走克隆品 |
| 不用了           | 直接 `move` 移走原值              |
| 多线程共享只读   | 用 `Arc` 替代 `move`              |

---

## 3. Arc — 多线程共享一份数据

### 3.1 基础用法

```rust
use std::sync::Arc;

let data = Arc::new(vec![1, 2, 3]);

let handle = thread::spawn(move || {
    println!("{:?}", data);
});
handle.join().unwrap();
```

### 3.2 strong_count — 看引用计数变化

```rust
let data = Arc::new(String::from("Hello!"));
let data2 = Arc::clone(&data);
let data3 = Arc::clone(&data);

let count = Arc::strong_count(&data);  // 3

let handle = thread::spawn(move || {
    println!("子线程1：{:?}", data2);
    println!("子线程1 内计数：{}", Arc::strong_count(&data2));
});

let handle2 = thread::spawn(move || {
    println!("子线程2：{:?}", data3);
    println!("子线程2 内计数：{}", Arc::strong_count(&data3));
});

println!("主线程：{}", count);
handle.join().unwrap();
handle2.join().unwrap();
```

> `Arc` 只解决了"多个线程同时拥有一份数据"。要修改，还得加 `Mutex`。

---

## 4. Arc<Mutex<T>> — 多个线程读写共享数据

### 4.1 10 线程各加 1（最经典模式）

```rust
use std::sync::{Arc, Mutex};

let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];

for _ in 0..10 {
    let c = Arc::clone(&counter);
    handles.push(thread::spawn(move || {
        let mut num = c.lock().unwrap();  // 获取锁
        *num += 1;                         // 修改
        // num (MutexGuard) 在此 drop → 锁自动释放
    }));
}

for h in handles {
    h.join().unwrap();
}

println!("结果：{}", counter.lock().unwrap());  // 10
```

**三层组合拆解：**

```
Arc<Mutex<i32>>
 │   │    └── 实际数据（整数 0）
 │   └────── 互斥锁：保证同一时刻只有一个人能碰数据
 └────────── 引用计数：保证多线程能共同拥有这把锁
```

### 4.2 换个起始值，同样套路

```rust
let counter = Arc::new(Mutex::new(5));
let mut arr = vec![];

for _ in 0..10 {
    let c = Arc::clone(&counter);
    arr.push(thread::spawn(move || {
        let mut num = c.lock().unwrap();
        *num += 1;
    }));
}

for i in arr {
    i.join().unwrap();
}
println!("{:?}", counter);  // Mutex { data: 15, poisoned: false, .. }
```

---

## 5. mpsc::channel — 线程间发消息

### 5.1 单发单收

```rust
use std::sync::mpsc;

let (tx, rx) = mpsc::channel();

thread::spawn(move || {
    let val = String::from("子线程的消息");
    tx.send(val).unwrap();
    // val 已移入 channel，这里不能再用
});

let received = rx.recv().unwrap();  // 阻塞等待
println!("主线程收到：{}", received);
```

### 5.2 多发单收（mpsc 的本意）

```rust
let (tx, rx) = mpsc::channel();

for i in 0..5 {
    let tx_clone = tx.clone();
    thread::spawn(move || {
        tx_clone.send(i).unwrap();
    });
}

drop(tx);  // ← 必须 drop 原始 tx，否则 rx 永远等不到结束

for received in rx {
    println!("收到：{}", received);
}
```

> **为什么必须 `drop(tx)`？** rx 的迭代器只在所有 tx（包括克隆的）都 drop 后才返回 `None`。原始 tx 不用了却不 drop，rx 会永远阻塞。

### 5.3 10 线程发消息求和

```rust
let (sx, rx) = mpsc::channel();

for _ in 0..10 {
    let sx_clone = sx.clone();
    thread::spawn(move || {
        sx_clone.send(1).unwrap();
    });
}
drop(sx);

let mut sum = 0;
for _ in 0..10 {
    sum += rx.recv().unwrap();
}
println!("{}", sum);  // 10
```

---

## 6. 死锁 — 自己制造然后理解它

```rust
use std::sync::{Arc, Mutex};
use std::{thread, time::Duration};

let m1 = Arc::new(Mutex::new(0));
let m2 = Arc::new(Mutex::new(0));

// 线程 A：先拿 m1，再拿 m2
let a1 = Arc::clone(&m1);
let a2 = Arc::clone(&m2);
let h1 = thread::spawn(move || {
    let _g1 = a1.lock().unwrap();
    println!("A 拿到 m1");
    thread::sleep(Duration::from_millis(100));
    let _g2 = a2.lock().unwrap();  // 等 m2 → B 正持有 m2 → 死锁
    println!("A 拿到 m2");
});

// 线程 B：先拿 m2，再拿 m1
let b1 = Arc::clone(&m1);
let b2 = Arc::clone(&m2);
let h2 = thread::spawn(move || {
    let _g2 = b2.lock().unwrap();
    println!("B 拿到 m2");
    thread::sleep(Duration::from_millis(100));
    let _g1 = b1.lock().unwrap();  // 等 m1 → A 正持有 m1 → 死锁
    println!("B 拿到 m1");
});

h1.join().unwrap();  // 永远不会返回
h2.join().unwrap();
```

**死锁的本质：**

```
线程 A：持有 m1 → 等待 m2
                    ✗ 互相等
线程 B：持有 m2 → 等待 m1
```

**避免原则：** 所有线程按相同顺序拿锁（如始终先 m1 后 m2）。

---

## 7. AtomicUsize — 简单计数不用锁

```rust
use std::sync::atomic::{AtomicUsize, Ordering};

static COUNTER: AtomicUsize = AtomicUsize::new(0);

fn main() {
    let mut handles = vec![];
    for _ in 0..10 {
        handles.push(thread::spawn(|| {
            for _ in 0..1000 {
                COUNTER.fetch_add(1, Ordering::SeqCst);
            }
        }));
    }
    for h in handles {
        h.join().unwrap();
    }
    println!("结果：{}", COUNTER.load(Ordering::SeqCst));  // 10000
}
```

| 对比       | `Mutex<i32>`                 | `AtomicUsize`       |
| ---------- | ---------------------------- | ------------------- |
| 保护范围   | 整个临界区（多条语句）       | 单个整数操作        |
| 性能       | 有锁开销                     | 无锁，硬件原子指令  |
| 阻塞       | 会阻塞                       | 不阻塞              |
| 使用复杂度 | 简单（lock → 改 → 自动释放） | 需要理解 `Ordering` |

> `Ordering::SeqCst` 是最严格的顺序保证，刚开始不用纠结，记住这是"最安全但最慢"的选择就行。

---

## 8. 今日总结

### 8.1 并发选型指南

| 需求         | 方案                     |
| ------------ | ------------------------ |
| 只读共享     | `Arc<T>`                 |
| 读写共享     | `Arc<Mutex<T>>`          |
| 线程间传数据 | `mpsc::channel`          |
| 简单计数     | `AtomicUsize`            |
| 启动后台任务 | `thread::spawn` + `join` |

### 8.2 心态记录

之前 Rustlings 做 threads 的时候，是照着注释填空，知其然不知其所以然。今天把每个概念拆成最小单元单独跑：

1. 先玩 `spawn` + `join`（不用共享数据）
2. 再加 `move`（理解所有权）
3. 再加 `Arc`（理解多所有者）
4. 再加 `Mutex`（理解互斥）
5. 最后组合 `Arc<Mutex<T>>`

分开写清楚每个概念在解决什么问题，组合起来就不觉得神秘了。

### 8.3 明天计划

- 继续练并发，加入错误处理（`lock()` 返回的 `Result` 不只用 `unwrap`）
- `RwLock` — 多读单写，读多写少场景比 Mutex 性能更好
- 如果有时间，写一个小的多线程 demo（比如多线程下载器模拟）