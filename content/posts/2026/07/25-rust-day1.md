---
title: "Rust 学习计划：3 个月从语法入门到 CLI 实战"
date: "2026-07-25 08:00:00 +0800"
excerpt: "制定一份清晰、可执行的 Rust 学习路线，涵盖基础语法、所有权机制、异步编程及实际项目练手，目标是在 3 个月内产出至少两个可用的命令行工具。"
tags: ["Rust", "学习路线", "编程语言", "所有权", "异步编程", "CLI"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"
---

# Rust 入门（Day 1）

## 一、Rust 概述

Rust 是一门专注于**安全、并发和性能**的现代系统编程语言。它由 Mozilla 员工 Graydon Hoare 于 2006 年作为个人项目启动，2015 年 5 月发布 1.0 稳定版，目前由 Rust 基金会管理。

### 核心特性

| 特性              | 说明                                                         |
|-----------------| ------------------------------------------------------------ |
| **内存安全**        | 通过所有权（Ownership）、借用（Borrowing）、生命周期（Lifetime）机制，在编译期消除悬垂指针、双重释放、数据竞争等问题，无需垃圾回收器（GC） |
| **零成本抽象**       | 高级语法糖（迭代器、闭包、泛型等）编译后性能等同于手写底层代码 |
| **并发安全**        | `Send` 和 `Sync` trait 在编译期检查并发安全性，避免数据竞争  |
| **模式匹配**        | `match` 表达式和 `if let` 等模式匹配机制，强制处理所有可能情况 |
| **强类型系统**       | 代数数据类型（enum 可携带数据）、Trait（类似接口但更强）、泛型等 |
| **无需运行时**       | 无 GC、无解释器，运行时极小，可嵌入 C 程序，也可用于裸机开发 |

### 适用场景

- 系统编程（操作系统、驱动、嵌入式）
- WebAssembly 前端
- 网络服务、CLI 工具
- 区块链、数据库等对性能/安全性要求高的领域

---

## 二、环境安装

### 2.1 核心工具链三件套

| 工具       | 作用                                                         |
| ---------- | ------------------------------------------------------------ |
| **rustup** | Rust 工具链管理器，用于安装、更新、切换 Rust 版本（stable / beta / nightly） |
| **rustc**  | Rust 编译器，将 `.rs` 源码编译为可执行文件                   |
| **cargo**  | Rust 的包管理器和构建系统，负责依赖管理、编译、测试、发布等  |

### 2.2 Linux / macOS 安装

```shell
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

默认安装即可，rustup 会自动配置 PATH。

### 2.3 Windows 安装

访问 https://rust-lang.org/tools/install/ 下载安装包。

Windows 下可能需要 Visual Studio Build Tools（MSVC 工具链）。如果不希望安装 VS，可自定义安装选择 MinGW 工具链（略繁琐）。

### 2.4 验证安装

```shell
rustc --version
```

```shell
cargo --version
```

### 2.5 更新与卸载

```shell
# 更新 Rust 工具链到最新稳定版
rustup update

# 卸载整个 Rust 工具链
rustup self uninstall
```

> 后续示例以 Linux 环境为准。

---

## 三、第一个程序：Hello World

### 3.1 手动创建

```shell
mkdir hello_world
cd hello_world
```

新建 `main.rs`：

```rust
fn main() {
    println!("Hello World");
}
```

**代码解析：**

- `fn main()` — 程序的入口函数。每个 Rust 可执行程序必须有 `main` 函数。
- `println!` — 这是一个**宏（Macro）**，不是普通函数。宏名后带 `!` 是 Rust 的命名约定。`println!` 会将文本输出到标准输出并自动换行。
- `"Hello World"` — 字符串字面量，类型是 `&str`（字符串切片，后面会详细讲）。
- 每行语句以 `;` 结尾。

### 3.2 编译运行

```shell
rustc main.rs
./main
```

输出：

```
Hello World
```

`rustc` 直接编译单个文件，适合简单场景。正式项目使用 Cargo 管理。

---

## 四、Hello Cargo

### 4.1 创建 Cargo 项目

```shell
cargo new hello_cargo
cd hello_cargo
```

生成的文件结构：

```
hello_cargo/
├── src/
│   └── main.rs          # 程序入口
├── Cargo.toml            # 项目元数据和依赖配置
└── .gitignore            # Git 忽略规则（自动生成）
```

### 4.2 Cargo.toml 结构

```toml
[package]
name = "hello_cargo"
version = "0.1.0"
edition = "2024"

[dependencies]
```

| 字段             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| `[package]`      | 包元数据段                                                   |
| `name`           | 包名（创建时指定）                                           |
| `version`        | 版本号，遵循语义化版本（SemVer）                             |
| `edition`        | Rust 版本代号（2015 / 2018 / 2021 / 2024），影响语言某些特性的默认行为 |
| `[dependencies]` | 项目依赖列表，每行一个 crate 名称和版本约束                  |

### 4.3 Cargo 常用命令

```shell
# 编译项目（debug 模式，未优化，包含调试信息）
cargo build

# 编译并运行
cargo run

# 仅检查代码能否通过编译（不生成可执行文件，速度更快）
cargo check

# 编译为 release 模式（优化过，适合发布）
cargo build --release
```

| 命令                    | 生成可执行文件 | 速度 | 适用场景           |
| ----------------------- | :------------: | :--: | ------------------ |
| `cargo build`           |       是       |  慢  | 需要运行调试       |
| `cargo run`             |       是       |  慢  | 编译后立即运行     |
| `cargo check`           |       否       |  快  | 开发中反复检查语法 |
| `cargo build --release` |       是       | 最慢 | 正式发布           |

编译产物位于 `target/` 目录：

- debug 模式：`target/debug/`
- release 模式：`target/release/`

### 4.4 Cargo.lock

首次 `cargo build` 会生成 `Cargo.lock`，记录依赖的**精确版本号**（包括间接依赖），确保同一项目在不同机器上编译结果一致。

- 你永远不需要手动编辑这个文件，Cargo 会自动管理。
- 对于可执行程序，建议将 `Cargo.lock` 纳入版本控制（Git）；对于库项目则无需提交。

---

## 五、猜数字游戏

本节通过一个完整示例，逐步引入 Rust 的核心概念。

### 5.1 处理用户输入

```rust
use std::io;                          // 将 io 模块引入当前作用域

fn main() {
    println!("Guess the number!");
    println!("Please input your guess.");

    let mut guess = String::new();    // 创建可变 String 变量，初始为空

    io::stdin()                        // 获取标准输入句柄
        .read_line(&mut guess)         // 读取一行到 guess，&mut 表示可变引用
        .expect("Failed to read line"); // 如果读取失败则崩溃并打印此信息

    println!("You guessed: {guess}");  // {} 是占位符，会替换为变量值
}
```

**知识点梳理：**

#### `use` 语句

将模块/类型引入当前作用域，避免写完整路径。类似于 Python 的 `from ... import`。

```rust
use std::io;            // 现在可以直接写 io::stdin()
// 如果不写 use，则需要写 std::io::stdin()
```

本次用到 `std::io` 标准库中的输入/输出功能。

#### `let` 与可变性（Mutability）

```rust
let x = 5;          // 不可变绑定（默认）
let mut y = 5;      // 可变绑定，允许修改
```

Rust 中变量**默认不可变**。这是安全性设计的重要一环——你不需要担心某个值在你不注意时被修改。需要修改时必须显式声明 `mut`。

#### `String::new()` — 关联函数

`String` 是标准库提供的**可增长、UTF-8 编码**的字符串类型。`::new` 中的 `new` 是 `String` 类型的**关联函数（Associated Function）**——类似于其他语言中的"静态方法"，它不作用于某个实例，而是作用于类型本身。`new` 是 Rust 中创建新实例的惯用命名，这里用于创建一个空字符串。

#### `&mut guess` — 可变引用

```rust
read_line(&mut guess)
```

- `&` 表示**引用（Reference）**，允许函数访问数据而不获取所有权（Ownership）。
- `&mut` 表示**可变引用**，被引用方可以修改所指向的数据。
- `read_line` 需要可变引用，因为它要向 `guess` 中追加用户输入的内容。

> 所有权和引用是 Rust 最核心的安全机制，后续课程会详细展开。

#### `Result` 枚举与 `expect`

```rust
io::stdin().read_line(&mut guess).expect("Failed to read line");
```

`read_line` 的返回类型是 `Result<usize, Error>`，这是一个**枚举（Enum）**，有两个变体：

```rust
enum Result<T, E> {
    Ok(T),    // 成功时包含返回值（这里是读取的字节数）
    Err(E),   // 失败时包含错误信息
}
```

`expect` 方法：

- 如果 `Result` 是 `Ok`，返回其中的值。
- 如果 `Result` 是 `Err`，程序**崩溃**并打印你传入的错误信息。

> 实际项目中更常用 `?` 运算符或 `match` 来优雅地处理错误，而不是直接 `expect`。后续课程会讲。

#### `println!` 占位符

```rust
println!("You guessed: {guess}");
```

`{}` 是占位符（与 C 的 `printf` 不同，Rust 无需指定 `%d`、`%s` 等格式），会自动根据类型格式化。多个值用逗号分隔：

```rust
println!("x = {}, y = {}", x, y);
```

---

### 5.2 生成秘密数字

Rust 标准库不包含随机数功能，需要引入第三方 crate：`rand`。

**步骤 1：添加依赖**

编辑 `Cargo.toml`：

```toml
[dependencies]
rand = "0.8.5"
```

`"0.8.5"` 是语义化版本约束，表示 `>= 0.8.5 且 < 0.9.0` 的版本均兼容。你也可以写 `"0.8"` 或使用更精确的约束如 `"^0.8.5"`。

当你下次执行 `cargo build` 时，Cargo 会自动：

1. 从 [crates.io](https://crates.io) 下载 `rand` 及其所有依赖。
2. 编译所有依赖。
3. 更新 `Cargo.lock` 锁定精确版本。

**步骤 2：使用 rand**

```rust
use std::io;
use rand::Rng;                        // 引入 Rng trait（包含 gen_range 等方法）

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);
    // thread_rng()：获取当前线程的随机数生成器
    // gen_range(1..=100)：生成 1 到 100（闭区间，含100）之间的随机数

    println!("The secret number is: {secret_number}");

    println!("Please input your guess.");

    let mut guess = String::new();

    io::stdin()
        .read_line(&mut guess)
        .expect("Failed to read line");

    println!("You guessed: {guess}");
}
```

**知识点：**

- `rand::thread_rng()` — 返回当前线程的**线程局部**随机数生成器，使用 CSPRNG（密码安全伪随机数生成器）。
- `gen_range(1..=100)` — `1..=100` 是**闭区间**范围（含 100），对应的半开区间写法是 `1..101`。
- `Rng` 是一个 **trait**（类似其他语言中的接口），`gen_range` 方法定义在 `Rng` trait 中，必须先 `use rand::Rng` 才能调用。

> Cargo.lock 确保任何人拉取你的项目后运行 `cargo build` 都会得到完全相同的依赖版本，从 `Cargo.toml` 的宽松版本号回到 `Cargo.lock` 的精确版本号。这个机制保证了可重现构建（Reproducible Build）。

---

### 5.3 比较数字

```rust
use std::cmp::Ordering;               // 引入 Ordering 枚举
use std::io;
use rand::Rng;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    println!("The secret number is: {secret_number}");
    println!("Please input your guess.");

    let mut guess = String::new();

    io::stdin()
        .read_line(&mut guess)
        .expect("Failed to read line");

    let guess: u32 = guess            // shadowing：新建同名变量，类型从 String 转为 u32
        .trim()                        // 去除首尾空白字符（包括换行符 \n）
        .parse()                       // 将字符串解析为指定类型（由 : u32 类型注解决定）
        .expect("Please type a number!");

    println!("You guessed: {guess}");

    match guess.cmp(&secret_number) {  // cmp 返回 Ordering 枚举值
        Ordering::Less => println!("Too small!"),
        Ordering::Greater => println!("Too big!"),
        Ordering::Equal => println!("You win!"),
    }
}
```

#### 你初次尝试编译会遇到的类型错误

```
error[E0308]: mismatched types
  expected reference `&String`
     found reference `&{integer}`
```

`guess`（String）和 `secret_number`（i32 / u32 等整数类型）类型不同，Rust 不允许直接比较。所以我们需要做类型转换。

#### 遮蔽（Shadowing）

```rust
let mut guess = String::new();    // 第一次声明：String 类型
// ... 读取输入 ...
let guess: u32 = guess            // 第二次声明：u32 类型，遮蔽了前面的 guess
    .trim()
    .parse()
    .expect("Please type a number!");
```

遮蔽让你可以**重用变量名**，同时改变其类型和可变性。这与 `mut` 不同：

| 特性           | `mut`    | 遮蔽                             |
| -------------- | -------- | -------------------------------- |
| 能否改变类型   | 否       | 是                               |
| 赋值后是否可变 | 是       | 取决于新声明的 `let` / `let mut` |
| 旧值           | 直接修改 | 旧值被"隐藏"，底层数据可能仍存在 |

> 遮蔽是 Rust 的惯用写法，尤其适合类型转换场景——与其发明 `guess_str` 这样的变量名，不如直接用 `let` 覆盖。

#### `trim()` 与 `parse()`

- `trim()` — 返回 `&str`，去除字符串首尾的空白字符（空格、制表符、换行符等）。这里用来去掉用户按回车时产生的 `\n`。
- `parse()` — 返回 `Result<T, ParseIntError>`。目标类型 `T` 由左侧的**类型注解** `: u32` 决定（Rust 的类型推断是双向的）。

#### `match` 表达式

```rust
match guess.cmp(&secret_number) {
    Ordering::Less => println!("Too small!"),
    Ordering::Greater => println!("Too big!"),
    Ordering::Equal => println!("You win!"),
}
```

`match` 由**分支（Arm）** 组成，每个分支：`模式 => 表达式`。

**关键特性：**

- **穷尽性（Exhaustiveness）**：必须覆盖所有可能的分支，否则编译报错。这里 `Ordering` 恰好有 `Less`、`Greater`、`Equal` 三个变体，全部处理了。
- `cmp` 是值的比较方法，返回 `Ordering` 枚举：

```rust
enum Ordering {
    Less,
    Equal,
    Greater,
}
```

---

### 5.4 循环与退出

```rust
use std::cmp::Ordering;
use std::io;
use rand::Rng;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    println!("The secret number is: {secret_number}");

    loop {                               // 无限循环
        println!("Please input your guess.");

        let mut guess = String::new();

        io::stdin()
            .read_line(&mut guess)
            .expect("Failed to read line");

        let guess: u32 = guess.trim().parse().expect("Please type a number!");

        println!("You guessed: {guess}");

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You win!");
                break;                    // 猜对后跳出循环
            }
        }
    }
}
```

**`loop` 循环：**

- `loop` 创建无限循环，等价于 `while true`，但 Rust 编译器知道 `loop` 至少会执行一次。
- 可使用 `break` 退出循环，`continue` 跳到下一次迭代。
- `loop` 可以带返回值（将值放在 `break` 后面），这是 Rust 独有的特性：

```rust
let result = loop {
    // ...
    break 42;         // loop 的返回值
};
```

---

### 5.5 处理无效输入

当前的程序，如果用户输入非数字（如 "abc"），`parse().expect()` 会导致程序崩溃。我们希望忽略无效输入，让用户继续猜：

```rust
// 将原来的
let guess: u32 = guess.trim().parse().expect("Please type a number!");

// 改为 match 处理 Result
let guess: u32 = match guess.trim().parse() {
    Ok(num) => num,      // 解析成功，将数值绑定到 num，作为 match 表达式的值
    Err(_) => continue,  // 解析失败，忽略本次输入，进入下一次循环
};
```

**知识点：**

- 这里用 `match` 优雅地处理了 `Result` 的两种可能，替代了粗暴的 `expect` 崩溃。
- `Err(_)` 中的 `_` 是**通配符**，表示"匹配任意错误值，但我不关心它的内容"。
- `continue` 跳回循环开头，让用户重新输入。

---

### 5.6 完整代码

```rust
use std::cmp::Ordering;
use std::io;
use rand::Rng;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    loop {
        println!("Please input your guess.");

        let mut guess = String::new();

        io::stdin()
            .read_line(&mut guess)
            .expect("Failed to read line");

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => continue,
        };

        println!("You guessed: {guess}");

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You win!");
                break;
            }
        }
    }
}
```

（正式发布时可将打印 `secret_number` 那行删除，否则游戏就没有意义了。）

---

## 六、本节知识点汇总

| 概念                          | 简要说明                                  |
| ----------------------------- | ----------------------------------------- |
| `rustup` / `rustc` / `cargo`  | 工具链管理器 / 编译器 / 包管理器+构建系统 |
| `fn main()`                   | 程序入口                                  |
| `println!`                    | 宏（带 `!`），格式化输出并换行            |
| `let` / `let mut`             | 变量绑定，默认不可变                      |
| `use`                         | 将模块/类型引入作用域                     |
| `String` / `&str`             | 可增长字符串 / 字符串切片                 |
| `String::new()`               | 关联函数（静态方法），创建空字符串        |
| `&mut guess`                  | 可变引用，被引用方可以修改数据            |
| `Result<T, E>`                | 枚举：`Ok(T)` 成功 / `Err(E)` 失败        |
| `expect(msg)`                 | `Result` 的方法，成功取值、失败崩溃       |
| `match`                       | 模式匹配，穷尽性检查                      |
| 遮蔽（Shadowing）             | 用 `let` 重新声明同名变量，可改变类型     |
| `trim()`                      | 去除首尾空白                              |
| `parse()`                     | 字符串解析为目标类型，返回 `Result`       |
| `loop` / `break` / `continue` | 无限循环 / 退出 / 下一次迭代              |
| `Cargo.toml` / `Cargo.lock`   | 项目配置 / 依赖精确版本锁定               |
| `edition`                     | Rust 语言版本代号（2015/2018/2021/2024）  |
| Crate                         | Rust 的包单元（库/可执行文件）            |
| Trait                         | 定义共享行为的接口，如 `Rng`              |

---

## 七、课后练习

1. 修改猜数字游戏的数字范围为 `1..=1000`，观察程序行为变化。
2. 试着把 `println!("You guessed: {guess}");` 中的 `{guess}` 改为 `{}`，将 `guess` 作为第二个参数传入，体会位置参数写法。
3. 在循环中加入一个计数器，记录用户猜了几次才猜中，并在猜中后打印出来。
4. 尝试用 `cargo build --release` 编译项目，比较 `target/debug/` 和 `target/release/` 中可执行文件的大小差异。
5. （选做）查看 `cargo doc --open` 命令的效果——它会为你的项目及其依赖生成 HTML 文档并在浏览器中打开。