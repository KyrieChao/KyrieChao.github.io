---
title: "Rust 学习计划"
date: "2026-08-11 08:00:00 +0800"
excerpt: "Rust 第11天学习 — 格式化宏 + 阶段 0 热身 + 阶段 1 所有权与借用"
tags: ["Rust", "学习路线", "编程语言"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"

---

# Rust Day11 — 格式化、热身与所有权

---

## 一、格式化宏

Rust 的格式化宏（`println!`、`format!`）在概念上与 C 的 `printf` 类似，但语法更现代，且**在编译时**进行检查。占位符使用花括号 `{}` 而不是 `%`。

完整语法：

```text
{ [参数] : [填充字符] [对齐方式] [符号] [#] [0] [宽度] [.精度] [类型] }
```

> `[]` 内的部分都是可选的。

### 1.1 占位符基础

```rust
// 默认占位符 —— 使用 Display trait
println!("{} 天", 31);  // 31 天

// 位置参数 —— 可重复、可调整顺序
println!("{0}, 这是 {1}。{1}, 这是 {0}", "爱丽丝", "鲍勃");

// 命名参数
println!("{subject} {verb} {object}",
    object="那只懒狗",
    subject="那只敏捷的棕色狐狸",
    verb="跳过");
```

### 1.2 格式说明符速查

| 组成部分 | Rust 语法                  | C 类比   |
| -------- | -------------------------- | -------- |
| 填充字符 | `{:-<10}`                  | 无       |
| 对齐方式 | `<` 左 / `>` 右 / `^` 居中 | `-` 标志 |
| 符号     | `+` 始终显示 / `-` 仅负号  | `+` 标志 |
| 备用格式 | `#`（如 `{:#x}` → `0xff`） | `#` 标志 |
| 零填充   | `0`                        | `0` 标志 |
| 宽度     | 数字或 `{n}$`              | 数字     |
| 精度     | `.数字`（如 `{:.2}`）      | `.数字`  |

### 1.3 类型（转换字符）

| Rust      | C 类比      | 说明                          |
| --------- | ----------- | ----------------------------- |
| （无）    | `%s`        | `Display` trait，用户友好输出 |
| `?`       | 无          | `Debug` trait，调试输出       |
| `#?`      | 无          | 美化 Debug 输出               |
| `b`       | 无          | 二进制                        |
| `o`       | `%o`        | 八进制                        |
| `x` / `X` | `%x` / `%X` | 十六进制                      |
| `p`       | `%p`        | 指针地址                      |

### 1.4 `Display` vs `Debug`

| Trait     | 占位符 | 用途       | 实现方式                       |
| --------- | ------ | ---------- | ------------------------------ |
| `Display` | `{}`   | 面向用户   | 需手动实现                     |
| `Debug`   | `{:?}` | 面向开发者 | 可 `#[derive(Debug)]` 自动派生 |

```rust
#[derive(Debug)]
struct Point { x: i32, y: i32 }

let p = Point { x: 10, y: 20 };
println!("{:?}", p);   // Point { x: 10, y: 20 }
// println!("{}", p);  // 错误！没有实现 Display
```

> Rust **没有** C 的长度修饰符（`%ld`、`%zu`），类型信息在编译时已知，无需手动指定。

---

## 二、阶段 0：热身（10 题）

> 熟悉基础语法，每道题都是独立的 `main()` 函数。

### 2.1 题目清单

| #    | 练习                    | 涉及知识点                             |
| ---- | ----------------------- | -------------------------------------- |
| 1    | 摄氏度 → 华氏度         | `read_line` + `parse` + `flush`        |
| 2    | BMI 计算                | `split_whitespace` 解析多个输入        |
| 3    | 闰年判断                | `if` + 逻辑运算符                      |
| 4    | 乘法表                  | 嵌套 `for` + `{:02}` 宽度格式化        |
| 5    | 最大公约数 & 最小公倍数 | 辗转相除 `gcd2` + 穷举 `gcd`           |
| 6    | 素数判断                | `sqrt` 优化 + `step_by(2)` 跳过偶数    |
| 7    | 阶乘 & 斐波那契         | 递归版 vs 迭代版 `fibonacci2`          |
| 8    | 菱形打印                | `abs(i - n/2)` 算空格数                |
| 9    | 猜数字                  | `rand::rng()` + `match` + `Ordering`   |
| 10   | 输入输出综合            | `io::stdin()` + `io::stdout().flush()` |

### 2.2 核心代码片段

```rust
// 辗转相除法
fn gcd2(n: i32, m: i32) -> i32 {
    let mut m = m.abs();
    let mut n = n.abs();
    while m != 0 {
        let temp = m;
        m = n % m;
        n = temp;
    }
    n
}

// 素数判断（sqrt 优化 + 跳偶数）
fn prime(n: i32) -> bool {
    if n == 2 { return true; }
    if n < 2 || n % 2 == 0 { return false; }
    let limit = (n as f64).sqrt() as i32 + 1;
    for i in (3..=limit).step_by(2) {
        if n % i == 0 { return false; }
    }
    true
}

// 菱形打印
for i in 0..n {
    let offset = (i - n / 2).abs();  // 距中心行距离
    for _ in 0..offset { print!(" "); }
    for _ in 0..(n - 2 * offset) { print!("*"); }
    println!();
}

// 猜数字
let number = rand::rng().random_range(1..=100);
loop {
    let guess: i32 = match num.trim().parse() {
        Ok(num) => num,
        Err(_) => continue,  // 非数字 → 重来
    };
    match guess.cmp(&number) {
        Ordering::Less => println!("太小了!"),
        Ordering::Greater => println!("太大了!"),
        Ordering::Equal => { println!("你赢了!"); break; }
    }
}
```

---

## 三、阶段 1：所有权与借用（完成）

> 逐个概念拆开练习，从所有权转移到切片，全部跑通。

### 3.1 所有权转移

```rust
fn print_length(s: String) {
    println!("长度: {}", s.len());
}  // s 在此被 drop

fn main() {
    let s = String::from("hello");
    print_length(s);
    // println!("{s}");  // ❌ s 的所有权已经被移走
}
```

### 3.2 不可变借用 `&T`

```rust
fn print_length(s: &String) {
    println!("长度: {}", s.len());
}

fn main() {
    let s = String::from("hello");
    print_length(&s);       // 借出去
    println!("{}", s);      // ✓ 还能用，只是借了一下
}
```

### 3.3 可变借用 `&mut T`

```rust
fn append_exclamation(s: &mut String) {
    s.push_str("!");
}

fn main() {
    let mut s = String::from("hello");
    append_exclamation(&mut s);
    println!("{}", s);  // "hello!"
}
```

### 3.4 `&str` — 字符串切片

```rust
fn get_length(s: &str) -> usize {
    s.len()
}

fn main() {
    let s = String::from("hello");
    let len1 = get_length(&s);       // &String 自动转 &str（Deref 强制转换）
    let len2 = get_length("world");  // 字面量本身就是 &str
    println!("{} {}", len1, len2);
}
```

> `&String` 可以自动转为 `&str`，因此函数参数写 `&str` 比 `&String` 更通用。

### 3.5 生命周期标注

```rust
fn longer<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() > b.len() { a } else { b }
}

fn main() {
    let s1 = String::from("short");
    let s2 = String::from("loooooong");
    let result = longer(&s1, &s2);
    println!("{}", result);  // "loooooong"
}
```

> 当返回值是引用时，编译器需要知道它来自哪个参数——`'a` 告诉编译器：返回值与两个参数活得一样久。

### 3.6 所有权转换：`String` → `Vec<char>`

```rust
fn take_ownership(s: String) -> Vec<char> {
    s.chars().collect()
}

fn main() {
    let s = String::from("hello");
    let chars = take_ownership(s);
    // println!("{s}");  // ❌ s 已死
    println!("{:?}", chars);  // ['h', 'e', 'l', 'l', 'o']
    // chars 拥有的是从 s 中拆出来的字符，s 本身已被消费
}
```

### 3.7 返回切片的引用 — `first_word`

```rust
fn first_word(s: &str) -> &str {
    match s.find(char::is_whitespace) {
        Some(index) => &s[..index],
        None => s,
    }
}

fn main() {
    let s = String::from("hello world");
    let word = first_word(&s);
    println!("{}", word);       // "hello"

    let s2 = "no_space";
    println!("{}", first_word(s2));  // "no_space"
}
```

> 返回的 `&str` 是从原字符串"借"出来的一个视图，不复制数据。

### 3.8 `swap` — 通过可变引用交换值

```rust
fn swap(a: &mut i32, b: &mut i32) {
    let temp = *a;   // 解引用取值
    *a = *b;         // 解引用赋值
    *b = temp;
}

fn main() {
    let mut x = 5;
    let mut y = 10;
    swap(&mut x, &mut y);
    println!("x = {}, y = {}", x, y);  // x = 10, y = 5
}
```

### 3.9 切片 `&[T]` — 数组和 Vec 通用

```rust
fn sum_slice(nums: &[i32]) -> i32 {
    let mut sum = 0;
    for i in nums { sum += i; }
    sum
}

fn main() {
    let v = vec![1, 2, 3, 4, 5];
    println!("{}", sum_slice(&v));       // 15（Vec 自动转切片）

    let arr = [10, 20, 30];
    println!("{}", sum_slice(&arr));     // 60（数组也能当切片传）
}
```

> `&[T]` 是 Rust 里最通用的"连续数据视图"——Vec 和数组都能自动转为它。

### 3.10 `while i < v.len()` 删除模式

**为什么 `for i in 0..v.len()` + `v.remove(i)` 有 bug？**

因为 `v.len()` 在循环开始时就被固定了，`remove` 之后数组长度变了但 `v.len()` 不变，导致：

1. 索引越界
2. 删除后后续元素前移，下一次 `i++` 会跳过一个元素

**正确做法：**

```rust
fn clear_short(v: &mut Vec<String>) {
    // 原地删除长度 < 3 的字符串
    let mut i: usize = 0;
    while i < v.len() {
        if v[i].len() < 3 {
            v.remove(i);  // 删除后不 i++，因为下一个元素移到当前位置了
        } else {
            i += 1;
        }
    }
}

fn remove_even(v: &mut Vec<i32>) {
    let mut i = 0;
    while i < v.len() {
        if v[i] % 2 == 0 {
            v.remove(i);
        } else {
            i += 1;
        }
    }
}
```

> 口诀：**删了就不加，不删才加一。**

### 3.11 迭代器链 — filter + copied + collect

```rust
fn get_even(nums: &Vec<i32>) -> Vec<i32> {
    nums.iter()
        .filter(|&&x| x % 2 == 0)
        .copied()
        .collect()
}
```

### 3.12 `Option<(&T, &T)>` — 返回多个引用

```rust
fn get_first_and_last(v: &Vec<i32>) -> Option<(&i32, &i32)> {
    if v.is_empty() {
        return None;
    }
    Some((&v[0], &v[v.len() - 1]))
}
```

### 3.13 字符串切片 — `split_at_space`

```rust
fn split_at_space(s: &str) -> (&str, &str) {
    match s.find(char::is_whitespace) {
        Some(index) => (&s[..index], &s[index + 1..]),
        None => (s, ""),
    }
}
```

### 3.14 字符串反转 — 一行

```rust
fn reverse_string(s: &str) -> String {
    s.chars().rev().collect()
}
```

---

## 四、阶段 1 核心规则总结

| 规则                 | 说明                                                 |
| -------------------- | ---------------------------------------------------- |
| 一个值只有一个所有者 | `let s = ...` 之后，`s` 拥有这个值                   |
| 所有权转移（move）   | 赋值、传参、返回会转移所有权                         |
| 借用 `&T`            | 不可变借用，可同时存在多个                           |
| 可变借用 `&mut T`    | 可变借用，同一时刻只能有一个，且不能和不可变借用共存 |
| 切片 `&[T]` / `&str` | 不拥有数据，只是"借用"一段连续内存的视图             |
| 生命周期 `'a`        | 标注引用的有效范围，编译器用来自动检查悬垂引用       |

### `String` vs `&str` vs `&String` 速查

| 类型      | 拥有数据？ | 分配在堆？ | 何时用                         |
| --------- | ---------- | ---------- | ------------------------------ |
| `String`  | 是         | 是         | 需要修改、拥有数据             |
| `&str`    | 否（借用） | 否         | 只读访问，函数参数首选         |
| `&String` | 否（借用） | 否         | 几乎不用，直接用 `&str` 更通用 |

---

## 五、明天计划

进入阶段 2：结构体、枚举、错误处理、集合。