---
title: "Rust 学习计划"
date: "2026-07-27 08:00:00 +0800"
excerpt: "Rust 第二天学习"
tags: ["Rust", "学习路线", "编程语言"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"
---

# Rust 基础语法（Day 2）

## 一、Hello World 与环境搭建

### 1.1 第一个程序

```rust
// 作业 1：打印姓名年龄
fn main(){
    println!("陈鸽涛");
    println!("2005年 21岁");
}
```

**`println!` 是宏不是函数。** 忘记写 `!` 时的编译错误：

```
error[E0423]: expected function, found macro `println`
help: use `!` to invoke the macro
```

**知识点——宏 vs 函数：**

| 对比项   | 函数           | 宏                                   |
| -------- | -------------- | ------------------------------------ |
| 调用方式 | `func(args)`   | `macro!(args)`                       |
| 参数数量 | 固定           | 可变（如 `println!("{}", a, b, c)`） |
| 编译方式 | 运行时调用     | 编译期展开为代码                     |
| 典型例子 | `fn add(x, y)` | `println!`、`vec!`、`format!`        |

Rust 宏比 C 的 `#define` 强大得多——它是**语法层面的代码生成**，可以做模式匹配、递归展开等。

---

## 二、变量与不可变性

```rust
fn main(){
    let name = "陈鸽涛";
    const MAX_SCORE:i32 = 100;
    let mut count = 0;
    println!("Hello, {}!", name);
    println!("Max score is {}", MAX_SCORE);
    println!("Count:{}",count);
    count += 1;
    println!("Count:{}",count);
    count += 1;
    println!("Count:{}",count);
}
```

尝试修改不可变变量时的报错：

```
error[E0384]: cannot assign twice to immutable variable `name`
help: consider making this binding mutable
```

### 知识点——`let` vs `let mut` vs `const`

| 特性       | `let`              | `let mut`    | `const`                        |
| ---------- | ------------------ | ------------ | ------------------------------ |
| 可变性     | 不可变（默认）     | 可变         | 永远不可变                     |
| 类型注解   | 可省略（类型推断） | 可省略       | **必须**显式标注               |
| 作用域     | 任意作用域         | 任意作用域   | 全局/模块级                    |
| 运行时计算 | 支持               | 支持         | 不支持，必须是编译期常量表达式 |
| 命名惯例   | `snake_case`       | `snake_case` | `SCREAMING_SNAKE_CASE`         |

> Rust 默认不可变的设计哲学：编译期就能确定哪些值会变、哪些不会，从而做更精确的借用检查。这跟函数式编程的"不可变数据"理念一致。

---

## 三、基本数据类型

```rust
fn main(){
    let tup:(i32,f64,bool) = (21, 160.0, true);
    let arr = [1,2,3,4,5];
    println!("年龄：{}",tup.0);
    println!("身高：{}",tup.1);
    println!("是学生么：{}",tup.2);
    println!("数组的第3个元素：{}",arr[2]);
    println!("数组越界：{}",arr[10]);
}
```

越界访问的编译期警告：

```
error: this operation will panic at runtime
index out of bounds: the length is 5 but the index is 10
```

### 知识点

#### 标量类型（Scalar Types）

| 类型 | 示例               | 说明                                                         |
| ---- | ------------------ | ------------------------------------------------------------ |
| 整数 | `i8` `u32` `isize` | 有符号 `i` / 无符号 `u`，位宽 8/16/32/64/128，`size` 跟平台指针同宽 |
| 浮点 | `f32` `f64`        | 默认 `f64`（IEEE 754）                                       |
| 布尔 | `bool`             | `true` / `false`                                             |
| 字符 | `char`             | 4 字节，存 Unicode 标量值（不是 ASCII）                      |

#### 复合类型

**元组（Tuple）**：固定长度，每个位置类型可不同，用 `.索引` 访问。

```rust
let tup: (i32, f64, bool) = (21, 160.0, true);
println!("{}", tup.0);  // 21
// 也可解构：let (age, height, is_student) = tup;
```

**数组（Array）**：固定长度，所有元素同类型，分配在**栈**上。

```rust
let arr: [i32; 5] = [1, 2, 3, 4, 5];
let arr2 = [0; 100];  // 100 个 0
```

数组越界：Rust 在**运行时**做边界检查，越界会 **panic**（而不是像 C 那样读到脏数据）。这是安全性的体现——宁愿崩溃也不允许内存不安全操作。

> 变长数组用 `Vec<T>`（第 11 课），在堆上分配。

---

## 四、函数

```rust
// 课堂代码
fn main(){
    say_hello();
    let result = add(5, 3);
    println!("5 + 3 = {}", result);
}

fn say_hello() {
    println!("Hello, world!");
}

fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

```rust
// 作业：multiply / is_even / calculate
fn main(){
    println!("3*5 = {}", multiply(3, 5));
    println!("Is 4 even? {}", is_even(4));
    println!("Calculate (3+5)*2 = {}", calculate(3,5));
}

fn multiply(a: i32, b: i32) -> i32 {
    a * b
}
fn is_even(n: i32) -> bool {
    n % 2 == 0
}

fn calculate(a:i32,b:i32)->i32{
    (a+b)*2
}
```

### 知识点——语句 vs 表达式

这是 Rust 非常核心的概念：

| 概念                     | 特点                                | 示例                                |
| ------------------------ | ----------------------------------- | ----------------------------------- |
| **语句（Statement）**    | 执行操作，**不返回值**，以 `;` 结尾 | `let x = 5;`                        |
| **表达式（Expression）** | 计算并**返回值**，不以 `;` 结尾     | `a + b`、`if true { 1 } else { 0 }` |

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b          // 表达式，不加分号 = 返回值
    // 等价于 return a + b;
}

fn add_wrong(a: i32, b: i32) -> i32 {
    a + b;         // 加了分号 → 语句 → 返回 () → 类型不匹配！
}
```

> `return` 关键字用于**提前返回**，最后一个表达式的值是默认返回值（更符合 Rust 惯用风格）。

### 函数签名

```rust
fn 函数名(参数: 类型) -> 返回类型 { 函数体 }
```

- 参数**必须**标注类型（不支持类型推断）。
- `->` 后面是返回类型，若函数无返回值则可省略（实际返回 `()`，即 unit 类型）。

---

## 五、控制流

运行结果存档：

```
年龄为20，状态为成年
n = 10
n = 9
...
n = 1
1到100的和为5050
```

### 知识点

#### `if` 是表达式

```rust
let status = if age >= 18 {
    "成年"
} else {
    "未成年"
};  // 注意这里有分号，因为这是 let 语句
// 两个分支必须返回相同类型
```

与 C/Java 不同，Rust 中 `if` 可以有返回值。三元运算 `x ? a : b` 在 Rust 中直接用 `if` 表达即可。

#### 三种循环

| 循环    | 语法                       | 适用场景                             |
| ------- | -------------------------- | ------------------------------------ |
| `loop`  | `loop { ... }`             | 无限循环，需手动 `break`；可带返回值 |
| `while` | `while cond { ... }`       | 条件循环                             |
| `for`   | `for item in iter { ... }` | 遍历集合（最常用、最安全）           |

```rust
// loop 带返回值
let result = loop {
    counter += 1;
    if counter == 10 {
        break counter * 2;  // break 后面跟值 = loop 的返回值
    }
};  // result = 20
```

> 能用 `for` 就不要用 `while` + 手动索引——编译器会对 `for` 做更多优化，且消除了越界风险。

---

## 六、所有权（Ownership）—— Rust 最核心的概念

### 6.1 Move 语义

```rust
// Move 报错实验
// error[E0382]: borrow of moved value: `s`
// move occurs because `s` has type `String`, which does not implement the `Copy` trait
```

修复：使用 `.clone()` 做深拷贝

```rust
fn main() {
    let s = String::from("test");
    let t = s.clone();
    println!("s:{} t:{}", s, t);
}
```

### 知识点——所有权三规则

1. Rust 中每一个值都有一个**所有者（Owner）**。
2. 同一时刻**只能有一个所有者**。
3. 当所有者离开作用域，值会被**自动释放**（调用 `drop`）。

```rust
let s1 = String::from("hello");
let s2 = s1;          // s1 的所有权转移给了 s2（Move）
// println!("{}", s1); // 编译错误！s1 已经失效
```

### 栈上数据 vs 堆上数据——Move 与 Copy 的本质区别

这就是你表中"从背规则到理解栈/堆差异"的关键：

| 数据位置                                     | 特性                       | 赋值行为                         | 实现了        |
| -------------------------------------------- | -------------------------- | -------------------------------- | ------------- |
| **栈**（整数、布尔、char、元组含 Copy 类型） | 大小编译期确定，拷贝成本低 | `let b = a;` 后 `a` 仍然可用     | `Copy` trait  |
| **堆**（String、Vec 等）                     | 大小运行时确定，拷贝成本高 | `let b = a;` 后 `a` 失效（Move） | 未实现 `Copy` |

```rust
let x = 5;
let y = x;    // Copy，x 仍可用
println!("{}", x);  // OK

let s1 = String::from("hello");
let s2 = s1;   // Move，s1 失效
// println!("{}", s1);  // error[E0382]
```

**为什么堆数据不自动 Copy？**——`String` 内部是一个指针指向堆内存。如果自动 Copy 指针（浅拷贝），两个变量指向同一块堆内存，离开作用域时会发生**双重释放（Double Free）**。Rust 用 Move 语义从根本上杜绝了这个问题。

---

## 七、引用与借用（References & Borrowing）

报错存档：

```
error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable
```

### 知识点——引用规则

| 引用类型   | 写法     | 权限     |    同时存在数量    |
| ---------- | -------- | -------- | :----------------: |
| 不可变引用 | `&T`     | 只读     |       无限制       |
| 可变引用   | `&mut T` | 可读可写 | **同时只能有一个** |

**核心规则（两条）：**

1. 在任意给定时间，**要么**只能有一个可变引用，**要么**只能有任意数量的不可变引用，两者不能同时存在。
2. 引用必须始终有效（生命周期保证，见后文）。

```rust
let mut s = String::from("hello");

let r1 = &s;  // 不可变引用，OK
let r2 = &s;  // 不可变引用，OK
// let r3 = &mut s;  // 错误！已有不可变引用存在

println!("{} {}", r1, r2);  // r1, r2 最后使用位置
// 此后 r1, r2 不再使用，可以创建可变引用了

let r3 = &mut s;  // OK，因为 r1, r2 已经"失效"
```

> 这条规则在编译期杜绝了**数据竞争（Data Race）**——两个指针同时访问同一数据、其中一个是写操作。不需要 GC，不需要锁，编译期就保证了线程安全的前提条件。

---

## 八、结构体（Struct）

```rust
struct Rentangle {
    width: u32,
    height: u32,
}

fn area(r:&Rentangle) -> u32{
    r.height * r.width
}
fn main() {
    let r1 = Rentangle{
        width:10,
        height:20,
    };
    let r2 = Rentangle{
        width:10,
        height:10,
    };
    println!("{}",area(&r1));
    println!("{}",area(&r2));
}
```

### 知识点

#### 三种结构体

```rust
// 1. 具名字段结构体（最常用）
struct User {
    name: String,
    age: u32,
}

// 2. 元组结构体（字段无名称，通过索引访问）
struct Color(u8, u8, u8);
let black = Color(0, 0, 0);
println!("{}", black.0);

// 3. 单元结构体（无字段，用作标记类型）
struct AlwaysEqual;
```

#### `impl` 块——给结构体添加方法

```rust
impl Rentangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rentangle) -> bool {
        self.width > other.width && self.height > other.height
    }

    // 关联函数（没有 self，相当于静态方法）
    fn square(size: u32) -> Rentangle {
        Rentangle { width: size, height: size }
    }
}

// 调用
let r = Rentangle { width: 10, height: 20 };
r.area();              // 方法调用
Rentangle::square(5);  // 关联函数调用
```

> `&self` 是 `self: &Self` 的语法糖。`self` 的所有权形式分三种：`&self`（不可变借用）、`&mut self`（可变借用）、`self`（获取所有权，极少用）。

---

## 九、枚举与模式匹配（Enum & Pattern Matching）

```rust
enum Shape {
    Retangle { width: f64, height: f64 },
    Cricle(f64),
    Triangle(f64, f64, f64),
}

fn calculate_area(s: &Shape) -> f64 {
    match s {
        Shape::Cricle(r) =>{
            3.14*r*r
        },
        Shape::Retangle { width, height } =>{
            width * height
        },
        Shape::Triangle(a, b,c) =>{
            let p = (a + b + c) / 2.0;
            (p * (p - a) * (p - b) * (p - c)).sqrt()
        },
    }
}

fn main() {
    let s1 = Shape::Cricle(4.0);
    let s2 = Shape::Retangle { width: 10.0, height: 20.0 };
    let s3 = Shape::Triangle(3.0, 4.0, 5.0);

    println!("{}",calculate_area(&s1));
    println!("{}",calculate_area(&s2));
    println!("{}",calculate_area(&s3));

    let n :Option<i32> = Some(5);

    if let Some(5) = n {
        println!("is 5");
    }
}
```

### 知识点

#### `match` 的穷尽性

编译器强制你处理所有可能的枚举变体，否则编译报错。这是 Rust 消除空指针/未处理分支的关键机制。

#### `Option<T>`——Rust 没有 null

```rust
enum Option<T> {
    Some(T),  // 有值
    None,     // 无值
}
```

`Option` 被自动引入作用域（无需 `use`），变体 `Some` 和 `None` 也可直接使用。任何可能"没有值"的情况都用 `Option` 表达，编译期强制处理，避免了 null 引起的运行时崩溃。

#### `if let`——简洁的单分支 match

```rust
// match 写法
match n {
    Some(5) => println!("is 5"),
    _ => (),  // 什么都不做
}

// if let 写法（更简洁）
if let Some(5) = n {
    println!("is 5");
}
```

`if let` 是 `match` 的语法糖，当你只关心一个分支时使用。还可以加 `else`：

```rust
if let Some(x) = n {
    println!("值为 {}", x);
} else {
    println!("没有值");
}
```

---

## 十、错误处理

```rust
use std::io;

fn divide(f1: f64, f2: f64) -> Result<f64, String> {
    if f2 == 0.0 {
        Err("除数不能为零".to_string())
    } else {
        Ok(f1 / f2)
    }
}

fn divide_err(f1: f64, f2: f64) -> Result<f64, io::Error> {
    if f2 == 0.0 {
        Err(io::Error::new(io::ErrorKind::InvalidInput, "不能除以零"))?
    }
    Ok(f1 / f2)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let r = divide(4.0, 0.0);

    match r {
        Ok(f) => println!("{}", f),
        Err(s) => println!("{}", s),
    }

    let result = divide_err(10.0, 2.0)?;
    println!("divide_err 计算结果: {}", result);

    let _result2 = divide_err(4.0, 0.0)?;

    Ok(())
}
```

### 补做练习：`parse_and_double`（验证 `?` 理解）

```rust
fn parse_number(s: &str) -> Result<i32, String> {
    let o = s.parse::<i32>();
    match o {
        Ok(v) => Ok(v),
        Err(_) => Err("无法解析:{s}".to_string()),
    }
}

fn parse_and_double(s: &str) -> Result<i32, String> {
    let o = parse_number(s)?;
    Ok(o*2)
}

fn main() {
    match parse_and_double("10") {
        Ok(n) => println!("结果: {}", n),
        Err(e) => println!("错误: {}", e),
    }

    match parse_and_double("abc") {
        Ok(n) => println!("结果: {}", n),
        Err(e) => println!("错误: {}", e),
    }
}
```

### 知识点

#### `Result<T, E>`——可恢复错误

```rust
enum Result<T, E> {
    Ok(T),   // 成功，包含返回值
    Err(E),  // 失败，包含错误信息
}
```

#### 三种处理方式对比

| 方式                    | 语法                                      | 行为                              | 适用场景                       |
| ----------------------- | ----------------------------------------- | --------------------------------- | ------------------------------ |
| `match`                 | `match r { Ok(v) => ..., Err(e) => ... }` | 分支处理                          | 需要针对不同结果做不同逻辑     |
| `unwrap()` / `expect()` | `r.expect("msg")`                         | 成功取值，失败 **panic**          | 原型阶段、测试、确定不会失败时 |
| `?` 运算符              | `r?`                                      | 成功取值，失败**提前 return Err** | 传播错误的惯用写法             |

#### `?` 运算符展开机制

```rust
let value = some_result?;

// 等价于：
let value = match some_result {
    Ok(v) => v,
    Err(e) => return Err(e.into()),  // .into() 会把错误类型转为调用者声明的错误类型
};
```

**前提条件**：使用 `?` 的函数返回类型必须是 `Result` 或 `Option`，且错误类型要兼容。

#### `Box<dyn std::error::Error>` 的作用

在 `main` 返回 `Result<(), Box<dyn Error>>` 时，`?` 可以把任意类型的错误转为 `Box<dyn Error>`（因为所有标准错误类型都实现了 `Error` trait）。`Box<dyn Error>` 相当于"能装任何错误类型的盒子"，牺牲了一点运行时性能换取便利。

- `Box` → 堆上分配（因为 trait 对象大小编译期不确定）
- `dyn Error` → 动态分发的 Error trait 对象
- 具体原理在 Trait 章节会深入讲

---

## 十一、集合类型（一）：Vector

```rust
fn sum_vec(v: &Vec<i32>) -> i32 {
    let mut sum = 0;
    for i in v {
        sum += i;
    }
    return sum;
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

fn remove_even_to(v: &mut Vec<i32>) {
    v.retain(|&x| x % 2 != 0);
}

fn main() {
    let mut v1 = vec![10, 20, 30, 40, 50];
    let mut v2 = vec![10, 20, 30, 40, 50];
    
    for i in &v1 { print!("{} ", i); }
    println!();
    for i in &v2 { print!("{} ", i); }
    println!();
    println!("{}", sum_vec(&v1));

    remove_even(&mut v1);
    for i in &v1 { println!("{}", i); }

    remove_even_to(&mut v2);
    for i in &v2 { print!("{} ", i); }

    // 编译错误实验
    let mut v = vec![1,2,3];
    for i in &v{
        v.push(*i);  // 同时持有不可变引用和可变引用 → 编译报错
    }
}
```

报错存档：

```
error[E0502]: cannot borrow `v` as mutable because it is also borrowed as immutable
```

### 知识点

#### `Vec<T>` 基础操作

```rust
let mut v: Vec<i32> = Vec::new();  // 创建空 Vec
let v2 = vec![1, 2, 3];            // vec! 宏创建
v.push(4);                          // 追加元素
let last = v.pop();                 // 弹出最后一个元素，返回 Option<T>
let third = v[2];                   // 索引访问（越界会 panic）
let third = v.get(2);               // 返回 Option<&T>（越界返回 None）
```

#### 删除元素的三种方式及借用规则

你在代码中对 `for` 循环中同时读写 Vec 的实验，恰好验证了借用规则：**在不可变引用的生命周期内，不能同时存在可变引用**。`for i in &v` 对 `v` 创建了不可变引用，循环体内不能再 `push` 或 `remove`。

#### `remove` vs `retain`

- `remove(index)` — 删除指定索引元素，后续元素前移，O(n)。
- `retain(|&x| condition)` — 保留满足条件的元素，一次遍历完成，更高效也是 Rust 惯用风格。

---

## 十二、集合类型（二）：HashMap

```rust
fn get_age(map: &HashMap<String, i32>, name: &str) -> Option<i32> {
    for (key, value) in map {
        if key == (name) {
            return Some(*value);
        }
    }
    None
}

fn main() {
    let mut scores = HashMap::new();

    scores.insert(String::from("Tom"), 10);
    scores.insert(String::from("Mike"), 21);
    scores.insert(String::from("Hong"), 30);

    for (key, value) in &scores {
        println!("{} {}", key, value);
    }

    let m = get_age(&scores, "Mike");

    if let Some(age) = m {
        println!("存在 {}",age);
    } else {
        println!("不存在");
    }

    *scores.entry(String::from("Mike")).or_insert(0) += 10;

    for (key, value) in &scores {
        println!("{} {}", key, value);
    }
}
```

### 知识点

#### `HashMap` 基础

```rust
use std::collections::HashMap;

let mut map = HashMap::new();
map.insert(key, value);               // 插入或覆盖
let v = map.get(&key);                // 返回 Option<&V>
map.remove(&key);                     // 删除

// 遍历
for (k, v) in &map { ... }
```

#### `entry` API——HashMap 的核心技巧

```rust
*scores.entry(String::from("Mike")).or_insert(0) += 10;
```

拆解这一步：

| 步骤 | 方法/操作       | 作用                                                    |
| ---- | --------------- | ------------------------------------------------------- |
| 1    | `.entry(key)`   | 获取 `key` 对应的 `Entry` 枚举（`Occupied` / `Vacant`） |
| 2    | `.or_insert(0)` | 如果不存在就插入 `0`，返回 `&mut V`（可变引用）         |
| 3    | `*... += 10`    | 解引用后原地修改值                                      |

```rust
// entry 的三种处理方式
map.entry(key).or_insert(default);    // 不存在时插入默认值
map.entry(key).and_modify(|v| *v += 1).or_insert(1);  // 存在则修改，不存在则插入
```

> `entry` API 只做一次哈希查找，比"先 `get` 检查再 `insert`"高效且更符合 Rust 所有权模型。

#### HashMap 与所有权

```rust
map.insert(String::from("Tom"), 10);
// String 的所有权被移入 HashMap
// 此后不能再使用原来的 String 变量
```

对于实现了 `Copy` 的类型（如 `i32`），值会被拷贝而非移动。所以你的代码中 `10`、`21` 这些值插入后仍可使用。

---

## 十三、字符串深入

```rust
fn greet(name: &str) {
    println!("你好，{name}");
}

fn main() {
    let s1 = String::from("hello");
    let s2 = "World";

    greet(&s1);
    greet(s2);

    let s3 = String::from("Rust");
    let s4 = String::from("很好");

    let s5 = format!("{} {}", s3, s4);
    println!("{s5}");
    println!("{} {}", s3, s4);

    let s6 = String::from("安全地获取第一个字符。").chars().nth(0);

    if let Some(ch) = s6 {
        println!("{}", ch);
    } else {
        println!("取值失败.");
    }
}
```

### 知识点

#### `String` vs `&str`

| 类型     | 存储位置           | 可变性 | 所有权   | 用途                               |
| -------- | ------------------ | :----: | -------- | ---------------------------------- |
| `String` | 堆上分配           |  可变  | 拥有数据 | 需要修改、动态构建的字符串         |
| `&str`   | 指向已有数据的引用 | 不可变 | 借用     | 只读访问字符串数据（函数参数首选） |

```rust
let s = String::from("hello");  // String，堆上分配
let slice: &str = &s;           // &str，借用 String 的内容
let literal: &str = "hello";    // &str，字面量直接嵌入二进制
```

**函数参数选 `&str` 的好处**——调用者既可以传 `&String`（自动解引用强制转换，Deref Coercion），也可以传 `&str` 字面量，最灵活。

#### `format!` 宏——不获取所有权的拼接

```rust
let s5 = format!("{} {}", s3, s4);
println!("{} {}", s3, s4);  // s3, s4 依然可用！
```

`format!` 只借用参数，不取所有权。对比 `+` 拼接会消耗左侧 String 的所有权：

```rust
let s = s1 + &s2;  // s1 所有权被消耗，s1 不可再用
```

#### 访问字符串中的字符

```rust
// 不能直接索引：s[0] ❌（因为 UTF-8 字节不等同于字符）
s.chars().nth(0);  // ✅ 返回 Option<char>，遍历 Unicode 标量
```

Rust 不允许 `s[0]` 直接索引，因为 UTF-8 编码下一个字符可能占 1-4 个字节，`s[0]` 拿到的是字节而非完整字符。`.chars()` 和 `.bytes()` 分别按字符和字节迭代，语义明确。

---

## 十四、生命周期（Lifetime）

闭卷测试通过的代码：

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

### 知识点

#### 为什么需要生命周期标注？

考虑下面这个函数（编译不通过）：

```rust
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}
```

编译器不知道返回值借用了 `x` 还是 `y`，无法推断返回引用的有效期。**生命周期标注不会改变引用的实际存活时间**，只是告诉编译器多个引用之间的关系。

#### 生命周期语法

```rust
&'a T          // 带生命周期标注的引用
fn<'a>         // 声明生命周期参数（类似泛型声明）
```

`'a` 读作"生命周期 a"，命名惯例使用短小写字母（`'a`、`'b`、`'c`）。

#### 三条生命周期省略规则（方便记忆）

编译器在以下三种情况下可以自动推断生命周期，不需要手动标注：

1. 每个引用参数都有各自的生命周期：`fn foo(x: &T)` → `fn foo<'a>(x: &'a T)`
2. 如果只有一个输入生命周期参数，它被赋予所有输出生命周期
3. 如果有多个输入参数，但其中一个是 `&self` 或 `&mut self`，则 `self` 的生命周期赋予所有输出

**当三条规则都不满足时，必须手动标注。**

你的 `longest` 有两个输入引用、没有 `self`，不符合第 2、3 条，所以必须标注。

---

## 十五、`?` 手动展开

```rust
// 初版（有编译错误）
fn combine_manual() -> Result<i32, String> {
    let a = step1();
    match a {
        Ok(k) => k,
        Err(e) => return Err(e),
    };
    let b = step2();
    match b {
        Ok(k) => k,
        Err(e) => return Err(e),
    };
}
```

### `?` 展开的完整对应

```rust
// 使用 ? 的版本
fn combine() -> Result<i32, String> {
    let a = step1()?;
    let b = step2()?;
    Ok(a + b)
}

// 手动展开（修复后）
fn combine_manual() -> Result<i32, String> {
    let a = match step1() {
        Ok(k) => k,
        Err(e) => return Err(e),
    };
    let b = match step2() {
        Ok(k) => k,
        Err(e) => return Err(e),
    };
    Ok(a + b)
}
```

**注意点：**

- `match` 分支后不加分号（它是一个表达式）。
- `let a = match { ... };` 整个 `let` 语句最后要加分号。
- `?` 展开时还会调用 `.into()` 做错误类型转换（这个在 Trait 章节会理解得更透彻）。

---

## 十六、知识汇总

| 概念                          | 状态 | 说明                                         |
| ----------------------------- | :--: | -------------------------------------------- |
| 所有权三规则                  |  ✅   | 一个所有者、Move 语义、离开作用域自动释放    |
| Move vs Copy                  |  ✅   | 关键区别在于栈数据（Copy）vs 堆数据（Move）  |
| 引用与借用规则                |  ✅   | 同时只能有多个不可变引用 OR 一个可变引用     |
| 生命周期标注 `'a`             |  ✅   | 能写出 `longest` 函数                        |
| `?` 展开机制                  |  ✅   | 理解是 `match + return Err` 的语法糖         |
| `match` / `if let` / `Option` |  ✅   | 穷尽性检查，消除 null                        |
| `Result` 三种处理方式         |  ✅   | `match` / `expect` / `?`                     |
| `Vec` 增删查改                |  ✅   | `push` / `pop` / `get` / `remove` / `retain` |
| `HashMap` entry API           |  ✅   | 一次哈希查找完成"存在则改、不存在则插"       |
| Trait / 泛型约束              |  ❌   | 尚未触及（下一课内容）                       |
| `Box<dyn Error>` 原理         |  ⚠️   | 知道用法，Trait 对象和动态分发原理待深入     |
| `impl` 块与关联函数           |  ⚠️   | 会用，但面向对象风格的更多模式待补充         |

---

## 十七、课后练习

1. 编写一个函数 `fibonacci(n: u32) -> u64`，返回第 n 个斐波那契数（提示：用 `match` 或 `if` 处理 n=0, n=1 的基础情况）。
2. 用 `impl` 为你的 `Rentangle` 结构体添加 `area` 和 `can_hold` 方法（不用外部函数），体会 `self` 引用的用法。
3. 实现一个函数 `first_word(s: &str) -> &str`，返回字符串的第一个单词（空格分隔），并用不同输入测试生命周期是否正常工作。
4. 用 `HashMap` 实现一个简单的词频统计器：给定一段话，统计每个单词出现的次数（提示：用 `split_whitespace()` + `entry` API）。
5. （选做）阅读 `std::option::Option` 和 `std::result::Result` 的官方文档，看看它们分别有哪些常用方法（`map`、`and_then`、`unwrap_or` 等），尝试在你的代码中替换掉部分 `match`。