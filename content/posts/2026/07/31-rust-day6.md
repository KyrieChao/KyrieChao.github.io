---
title: "Rust 学习计划"
date: "2026-07-31 08:00:00 +0800"
excerpt: "Rust 第6天学习"
tags: ["Rust", "学习路线", "编程语言"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"
---

# Rust Day6 — Iterators 收尾

> Rustlings iterators 部分全部做完。今天的题每一道都卡了很久，挫败感很强，但回头看也暴露了知识盲区——不知道某些函数的存在，就不可能想出对应的解法。

---

## 一、首字母大写 — `chars()` 迭代器

```rust
// "hello" -> "Hello"
fn capitalize_first(input: &str) -> String {
    let mut ch = input.chars();
    match ch.next() {
        Some(c) => c.to_uppercase().to_string() + ch.as_str(),
        None => String::from(""),
    }
}
```

**拆解：**

1. `input.chars()` — 返回字符串的**字符迭代器**，不是字节迭代器
2. `ch.next()` — 消费第一个字符，剩余字符还在 `ch` 里
3. `c.to_uppercase()` — 返回一个 `Uppercase` 迭代器（因为有些字符大写后不止一个字符，如 ß → SS），用 `to_string()` 收成 `String`
4. `ch.as_str()` — 把迭代器剩余部分直接当 `&str` 取出来
5. 拼接 → 首字母大写完成

### 对切片批量应用 — `map` + `collect`

```rust
// ["hello", "world"] -> ["Hello", "World"]
fn capitalize_words_vector(words: &[&str]) -> Vec<String> {
    words
        .iter()
        .map(|n| {
            let mut s = n.chars();
            match s.next() {
                Some(k) => k.to_uppercase().to_string() + s.as_str(),
                None => String::from(""),
            }
        })
        .collect()
}

// ["hello", " ", "world"] -> "Hello World"
fn capitalize_words_string(words: &[&str]) -> String {
    words
        .iter()
        .map(|s| {
            let mut chars = s.chars();
            match chars.next() {
                None => String::new(),
                Some(f) => f.to_uppercase().to_string() + chars.as_str(),
            }
        })
        .collect()
}
```

> **关键收获：`collect()` 会根据返回类型自动判断收集成什么。** 同样一串 `map` 链，返回值写 `Vec<String>` 就收集成 Vec，写 `String` 就收集成拼接字符串——因为 `String` 也实现了 `FromIterator`。

### `collect()` 类型推断机制

```rust
// 同一个迭代器链，collect 出不同结果：
let v: Vec<String> = words.iter().map(...).collect();  // 返回 Vec
let s: String      = words.iter().map(...).collect();  // 返回 String（拼接）
```

| 目标类型            | collect 行为               |
| ------------------- | -------------------------- |
| `Vec<String>`       | 每个 `String` push 进 Vec  |
| `String`            | 把所有 `String` 拼接成一个 |
| `HashMap<_, _>`     | 收集键值对                 |
| `Result<Vec<_>, _>` | 遇到第一个 Err 就停        |

> 编译器通过函数签名里的返回类型倒推 `collect` 该生成什么——这就是 Rust 的类型推断从返回值"反向传播"的能力。

---

## 二、`divide` — 自定义错误枚举

```rust
enum DivisionError {
    DivideByZero,       // 42 / 0
    IntegerOverflow,    // i64::MIN / -1 → 结果超出 i64::MAX
    NotDivisible,       // 5 / 2 = 2.5 不能整除
}

fn divide(a: i64, b: i64) -> Result<i64, DivisionError> {
    if b == 0 {
        Err(DivisionError::DivideByZero)
    } else if a == i64::MIN && b == -1 {
        Err(DivisionError::IntegerOverflow)
    } else if a % b == 0 {
        Ok(a / b)
    } else {
        Err(DivisionError::NotDivisible)
    }
}
```

> `i64::MIN / -1` 会溢出，因为 `i64::MIN = -9223372036854775808`，取绝对值后比 `i64::MAX` 大 1，这是有符号整数的经典陷阱。

### 2.1 `ok()` + `?` — Result 转 Option 并短路

```rust
// 期望输出: Ok([1, 11, 1426, 3])
fn result_with_list() -> Option<Vec<i32>> {
    let numbers = [27, 297, 38502, 81];
    let mut vec = Vec::new();
    for &n in &numbers {
        let v = divide(n, 27).ok()? as i32;  // Result → Option，Err 时 ? 短路
        vec.push(v);
    }
    Some(vec)
}
```

**`ok()` 做了什么：**

```rust
Result::Ok(v)  --ok()-->  Some(v)
Result::Err(e) --ok()-->  None       // 错误信息直接丢弃
```

> 然后 `?` 在 `Option` 上下文中：遇到 `None` 直接 return `None`。一行代码把两件事都干了。

### 2.2 `map` + `map_err` — 保留错误但不中断

```rust
// 期望输出: [Ok(1), Ok(11), Ok(1426), Ok(3)]
fn list_of_results() -> Vec<Result<i32, &'static str>> {
    let numbers = [27, 297, 38502, 81];
    numbers
        .into_iter()
        .map(|n| {
            divide(n, 27)
                .map(|v| v as i32)           // Ok 分支：类型转换
                .map_err(|_| "division error") // Err 分支：换一个错误信息
        })
        .collect()
}
```

| 方法      | 作用                             |
| --------- | -------------------------------- |
| `map`     | 只碰 `Ok` 里的值，`Err` 原样透传 |
| `map_err` | 只碰 `Err` 里的值，`Ok` 原样透传 |
| `ok()`    | `Result` → `Option`，丢弃错误    |

---

## 三、`(1..=num).product()` — 阶乘一行版

```rust
fn factorial(num: u64) -> u64 {
    (1..=num).product()
}
```

> 这道题卡了最久。知道阶乘就是 `1 * 2 * 3 * … * n`，脑子里想的都是递归或 `fold`，完全不知道标准库自带 `product()`。一行解决后整个人愣住了。

`product()` 对迭代器做连乘——类似 `sum()` 做连加。只用范围和方法调用，没有显式循环、没有中间变量、没有递归。

---

## 四、`filter` + `count` — 统计满足条件的元素

```rust
#[derive(PartialEq)]  // 需要 PartialEq 才能用 == 比较
enum Progress {
    None,
    Some,
    Complete,
}

fn count_iterator(map: &HashMap<String, Progress>, value: Progress) -> usize {
    map.values().filter(|&v| *v == value).count()
}
```

原来 for 循环版 5 行，迭代器版 1 行：`filter` 筛出匹配的，`count` 计数。

---

## 五、`flat_map` — 拍平嵌套结构

### 传统写法（双层 for）

```rust
fn count_collection_for(collection: &[HashMap<String, Progress>], value: Progress) -> usize {
    let mut count = 0;
    for map in collection {
        for val in map.values() {
            if *val == value {
                count += 1;
            }
        }
    }
    count
}
```

### 迭代器版 — `flat_map` 把内层"拍平"

```rust
fn count_collection_iterator(collection: &[HashMap<String, Progress>], value: Progress) -> usize {
    collection
        .iter()                              // 遍历外层 slice
        .flat_map(|map| map.values())        // 把每个 map 的 values 拍平成一个流
        .filter(|&v| *v == value)            // 筛选
        .count()                             // 计数
}
```

**`flat_map` 做了什么：**

```
输入: [{map1}, {map2}, {map3}]
         ↓ flat_map(|m| m.values())
输出: [v1, v2, v3, v4, v5, ...]   ← 所有 map 的 values 连成一条流
```

> `flat_map` 卡住是因为不知道有这个函数。知道之后就简单了：先 `map` 拿到多个 values 迭代器，再 `flat` 把它们拍平。本质上等价于双层 for 循环。

---

## 六、今天踩的坑 & 反思

今天每道题都卡了很久。核心原因不是 Rust 语法难，而是**不知道标准库提供了什么**：

| 卡住的地方         | 原因                                  | 解决方法                  |
| ------------------ | ------------------------------------- | ------------------------- |
| `capitalize_first` | 不知道 `chars()` + `as_str()` 组合    | 查 API                    |
| `factorial`        | 完全不知道 `product()` 存在           | AI 告诉的                 |
| `result_with_list` | 知道 `ok()` 但没想到 `?` 可以接在后面 | 多练                      |
| `list_of_results`  | 知道 `map_err` 但犹豫怎么拼起来       | 多练                      |
| `flat_map`         | 不知道这个函数                        | AI 告诉的                 |
| `collect` 返回不同 | 一直以为只能收集成 Vec                | 今天理解了 `FromIterator` |

**这种挫败感是正常的。** 迭代器是 Rust 里最"需要积累"的部分——标准库给迭代器实现了上百个方法（`product`、`flat_map`、`filter_map`、`take_while`、`partition`……），多数人都是边查边写，见一个记一个。今天的代码写完，至少这几个方法你不会忘了。

---

## 七、剩余进度

```
✅ iterators          §13.2-4    — 今天完成
⬜ smart_pointers     §15, §16.3
⬜ threads            §16.1-3
⬜ macros             §20.5
⬜ clippy             Appendix D
⬜ conversions        n/a
```

**明天目标：** lifetimes。