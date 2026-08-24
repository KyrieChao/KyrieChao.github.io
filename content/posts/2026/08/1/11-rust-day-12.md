---
title: "Rust 学习计划"
date: "2026-08-11 08:00:00 +0800"
excerpt: "Rust 第12天学习 — 阶段 2：枚举、Result、Option、自定义错误、文件 I/O"
tags: ["Rust", "学习路线", "编程语言"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"

---

# Rust Day12 — 阶段 2：枚举、Result、Option、错误处理

---

## 一、枚举 + `match` — `Shape` 与 `Operation`

### 1.1 Shape 枚举 — 多态计算面积

```rust
use std::f64::consts::PI;

enum Shape {
    Circle(f64),             // 半径
    Rectangle(f64, f64),     // 宽, 高
    Triangle(f64, f64, f64), // 三边
}

impl Shape {
    fn area(&self) -> f64 {
        match &self {
            Shape::Circle(r) => PI * r * r,
            Shape::Rectangle(w, h) => w * h,
            Shape::Triangle(a, b, c) => {
                let p = (a + b + c) / 2.0;
                ((p * (p - a) * (p - b) * (p - c)) as f64).sqrt()
            }
        }
    }
}
```

> 海伦公式：`S = √(p(p-a)(p-b)(p-c))`，`p` 是半周长。每种 Shape 携带的数据不同，`match` 编译期保证每一种都被处理。

### 1.2 Operation 枚举 — 带错误的 execute

```rust
enum Operation {
    Add(f64, f64),
    Sub(f64, f64),
    Mul(f64, f64),
    Div(f64, f64),
}

impl Operation {
    fn execute(&self) -> Result<f64, String> {
        match &self {
            Operation::Add(a, b) => Ok(a + b),
            Operation::Sub(a, b) => Ok(a - b),
            Operation::Mul(a, b) => Ok(a * b),
            Operation::Div(a, b) => {
                if b.eq(&0.0) {
                    return Err("除数不能为零".to_string());
                }
                Ok(a / b)
            }
        }
    }
}
```

> 浮点数比较用 `b.eq(&0.0)` 而不是 `b == 0.0`——`f64` 未实现 `Eq`，`==` 会触发 clippy 警告。

---

## 二、`?` 链式调用 — `calculate("a/b")`

### 2.1 底层函数

```rust
fn parse_float(s: &str) -> Result<f64, String> {
    s.parse::<f64>().map_err(|_| format!("'{}' 不是数字", s))
}

fn safe_divide(a: f64, b: f64) -> Result<f64, String> {
    if b.eq(&0.0) {
        return Err("除数不能为零".to_string());
    }
    Ok(a / b)
}
```

### 2.2 组合

```rust
fn calculate(expr: &str) -> Result<f64, String> {
    let mut s = expr.trim().split("/");
    let a = parse_float(s.next().ok_or("格式错误：缺少被除数")?)?;
    let b = parse_float(s.next().ok_or("格式错误：缺少除数")?)?;
    safe_divide(a, b)
}
```

**双层 `?` 拆解：**

```rust
s.next().ok_or("格式错误")?      // ?₁：Option → Result，None 时短路
parse_float(...)?                // ?₂：Result → Result，Err 时短路
```

> `ok_or` 把 `Option` 转成 `Result`，然后外层 `?` 传播错误；内层 `?` 传播 parse 失败。两次串成一条短路链。

---

## 三、Option 组合子

```rust
fn find_in_vec(v: &Vec<i32>, target: i32) -> Option<usize> {
    v.iter().position(|&x| x == target)
}

fn double_if_even(n: Option<i32>) -> Option<i32> {
    n.filter(|&x| x % 2 == 0)   // 不是偶数 → None
     .map(|x| x * 2)             // 是偶数 → 翻倍
}

fn get_or_zero(n: Option<i32>) -> i32 {
    n.unwrap_or(0)
}
```

| 方法           | 作用                       |
| -------------- | -------------------------- |
| `position()`   | 找第一个满足条件的索引     |
| `filter()`     | `Some` 中值不满足 → `None` |
| `map()`        | 只碰 `Some` 里的值         |
| `unwrap_or(d)` | `None` 给默认值，不 panic  |

---

## 四、文件 I/O + 错误处理

### 4.1 match 守卫 `ErrorKind`

```rust
use std::fs;
use std::io::ErrorKind;

fn read_file(path: &str) {
    match fs::read_to_string(path) {
        Ok(con) => println!("{con}"),
        Err(e) if e.kind() == ErrorKind::NotFound => println!("文件不存在: {}", path),
        Err(e) => println!("读取失败: {}: {}", path, e),
    }
}
```

> `Err(e) if e.kind() == ...` — match 守卫，只在模式匹配 + 条件都满足时命中。

### 4.2 文件复制

```rust
fn copy_file(src: &str, dst: &str) -> Result<u64, io::Error> {
    let content = fs::read(src)?;    // 读
    let len = content.len() as u64;
    fs::write(dst, content)?;         // 写
    Ok(len)
}
```

> `fs::read` 和 `fs::write` 适合小文件场景——一次性读入/写出，简单直接。

---

## 五、自定义错误类型

### 5.1 定义 + 实现 trait

```rust
use std::error::Error;
use std::fmt;

#[derive(Debug)]
enum MyError {
    NotFound,
    InvalidInput(String),
}

impl fmt::Display for MyError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            MyError::NotFound => write!(f, "文件未找到"),
            MyError::InvalidInput(msg) => write!(f, "无效输入: {}", msg),
        }
    }
}

impl Error for MyError {}  // 空体——继承 Debug + Display 即可
```

> 自定义错误三步：① 定义枚举 ② `impl Display` ③ `impl Error`（通常空体）。`#[derive(Debug)]` 是必须的。

### 5.2 io 错误 → 自定义错误映射

```rust
fn read_config(path: &str) -> Result<String, MyError> {
    match fs::read_to_string(path) {
        Ok(c) => Ok(c),
        Err(e) if e.kind() == ErrorKind::NotFound => Err(MyError::NotFound),
        Err(e) => Err(MyError::InvalidInput(e.to_string())),
    }
}
```

> 关键是**错误类型转换**——把标准库的 `io::Error` 映射为自己的 `MyError`，让调用方只关心自己定义的错误类型。

---

## 六、`for` + `?` — 批量操作遇错即停

```rust
fn sum_numbers(inputs: Vec<&str>) -> Result<i32, String> {
    let mut sum = 0;
    for i in inputs {
        sum += parse_number(i)?;  // 任何一个失败 → 整个函数返回 Err
    }
    Ok(sum)
}
```

> `?` 不只是用在 `match` 或 `if let` 里——`for` 循环里同样好用。这是 Rust "遇错即停"模式的常见写法。

---

## 七、`while let` — 遍历嵌套 Option

```rust
let maybe_nums = vec![Some(1), None, Some(3)];

let mut iter = maybe_nums.into_iter();
while let Some(x) = iter.next() {
    println!("{:?}", x);  // Some(1), None, Some(3) 逐个打印
}
```

> 替代写法：`maybe_nums.into_iter().flatten()` — 自动过滤 `None`，只保留 `Some` 里的值。

---

## 八、本日小结

| 知识点                      | 说明                               |
| --------------------------- | ---------------------------------- |
| `enum` + `match`            | 携带不同数据的枚举，编译期穷尽检查 |
| `impl` 枚举方法             | `impl Shape { fn area(&self) }`    |
| `?` 双层短路                | `ok_or(...)?` + `parse(...)?`      |
| `Option::filter().map()`    | 组合子链式处理                     |
| `unwrap_or()`               | None 给默认值，不 panic            |
| `Err(e) if e.kind() == ...` | match 守卫                         |
| 自定义错误                  | `impl Display` + `impl Error`      |
| io 错误映射                 | 标准库错误 → 自定义错误类型        |
| `for` + `?`                 | 批量遇错即停                       |
| `while let`                 | 遍历嵌套 Option                    |

**明天：** 阶段 2 收尾，进入阶段 3。

