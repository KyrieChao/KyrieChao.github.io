---
title: "Rust 学习计划"
date: "2026-07-28 08:00:00 +0800"
excerpt: "Rust 第三天学习"
tags: ["Rust", "学习路线", "编程语言"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"
---
# Rust 基础语法（Day 3）— Rustlings 实战练习

今天接触了 **Rustlings**——Rust 官方出品的交互式练习工具，通过修复小练习来掌握 Rust 语法，比干读书有意思多了。

---

## 1. 练习一：变量、函数与条件判断

> 对应章节：Variables（§3.1）、Functions（§3.3）、If（§3.5）

**题目：** Mary 买苹果，每个苹果 2 rustbucks。如果购买数量超过 40 个，则每个苹果降至 1 rustbuck。编写函数计算总价。

```rust
fn calculate_price_of_apples(n: i32) -> i32 {
    if n > 40 {
        n
    } else {
        n * 2
    }
}

fn main() {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn verify_test() {
        assert_eq!(calculate_price_of_apples(35), 70);
        assert_eq!(calculate_price_of_apples(40), 80);
        assert_eq!(calculate_price_of_apples(41), 41);
        assert_eq!(calculate_price_of_apples(65), 65);
    }
}
```

**关键知识点：**

| 知识点                        | 说明                                                   |
| ----------------------------- | ------------------------------------------------------ |
| `fn 函数名(参数) -> 返回类型` | Rust 函数定义语法，`->` 后跟返回值类型                 |
| `if/else` 是**表达式**        | 可以直接返回值，不需要 `return` 关键字（当然也可以用） |
| 表达式末尾不加分号            | `n` 和 `n * 2` 后面没有 `;`，表示这是返回值            |
| `i32`                         | 32 位有符号整数，Rust 默认整数类型                     |
| `#[test]`                     | 属性宏，标记测试函数                                   |
| `assert_eq!`                  | 断言宏，左右两值相等则测试通过                         |

---

## 2. 练习二：字符串、Vec、枚举与模式匹配

> 对应章节：Strings（§8.2）、Vecs（§8.1）、Move Semantics（§4.1-2）、Modules（§7）、Enums（§6）

**题目：** 实现 `transformer` 函数，输入字符串和命令的元组列表，根据命令对字符串做三种操作之一：转大写、去首尾空格、追加 N 个 "bar"。

```rust
enum Command {
    Uppercase,
    Trim,
    Append(usize),      // 枚举成员可以携带数据！
}

mod my_module {
    use super::Command;

    pub fn transformer(input: Vec<(String, Command)>) -> Vec<String> {
        let mut results = Vec::new();
        for eve in input {
            let trans = match eve.1 {
                Command::Uppercase => eve.0.to_uppercase(),
                Command::Trim      => eve.0.trim().to_string(),
                Command::Append(n) => {
                    let mut s = eve.0.clone();
                    s.push_str(&"bar".repeat(n));
                    s
                }
            };
            results.push(trans);
        }
        results
    }
}

fn main() {}

#[cfg(test)]
mod tests {
    use super::Command;
    use crate::my_module::transformer;    // 从模块中导入函数

    #[test]
    fn it_works() {
        let input = vec![
            ("hello".to_string(), Command::Uppercase),
            (" all roads lead to rome! ".to_string(), Command::Trim),
            ("foo".to_string(), Command::Append(1)),
            ("bar".to_string(), Command::Append(5)),
        ];
        let output = transformer(input);

        assert_eq!(
            output,
            [
                "HELLO",
                "all roads lead to rome!",
                "foobar",
                "barbarbarbarbarbar",
            ]
        );
    }
}
```

**关键知识点：**

| 知识点                   | 说明                                                         |
| ------------------------ | ------------------------------------------------------------ |
| `enum` 成员可携带数据    | `Append(usize)` 表示该成员包含一个 `usize` 类型的值          |
| `match` 模式匹配         | Rust 的 match 是**穷尽**的，所有枚举成员都必须处理           |
| `String` vs `&str`       | `String` 是拥有所有权的堆分配字符串，`&str` 是借用的字符串切片 |
| `to_uppercase()`         | 返回新的 `String`，原字符串不变                              |
| `trim()`                 | 返回 `&str` 切片（不拷贝数据），需要 `to_string()` 转为 `String` |
| `"bar".repeat(n)`        | 将 "bar" 重复 n 次，返回 `String`                            |
| `mod` / `pub` / `use`    | Rust 模块系统三件套——定义模块、公开函数、导入路径            |
| `clone()`                | 显式克隆数据，获得独立所有权（String 不实现 Copy）           |
| 元组 `(String, Command)` | 用 `.0`、`.1` 按索引访问元组元素                             |

> Rust 核心概念——**所有权（Ownership）**：`eve.0` 是 `String` 类型，直接使用会转移所有权。因此 `Append` 分支中用 `eve.0.clone()` 克隆了一份数据，避免所有权转移后原变量失效。

---

## 3. 练习三：HashMap 与结构体

> 对应章节：HashMaps（§8.3）、Structs（§5.1）

**题目：** 给定足球比赛结果（每行 `"队伍1,队伍2,进球1,进球2"`），构建计分表，记录每支球队的总进球数和总失球数。

```rust
use std::collections::HashMap;

#[derive(Default)]               // 自动实现 Default trait，方便构造默认值
struct TeamScores {
    goals_scored: u8,
    goals_conceded: u8,
}

fn build_scores_table(results: &str) -> HashMap<&str, TeamScores> {
    let mut scores = HashMap::<&str, TeamScores>::new();

    for line in results.lines() {
        let mut split_iterator = line.split(',');
        let team_1_name  = split_iterator.next().unwrap();
        let team_2_name  = split_iterator.next().unwrap();
        let team_1_score: u8 = split_iterator.next().unwrap().parse().unwrap();
        let team_2_score: u8 = split_iterator.next().unwrap().parse().unwrap();

        let g1 = TeamScores { goals_scored: team_1_score, goals_conceded: team_2_score };
        let g2 = TeamScores { goals_scored: team_2_score, goals_conceded: team_1_score };

        scores
            .entry(team_1_name)
            .and_modify(|m| {
                m.goals_scored   += team_1_score;
                m.goals_conceded += team_2_score;
            })
            .or_insert(g1);

        scores
            .entry(team_2_name)
            .and_modify(|m| {
                m.goals_scored   += team_2_score;
                m.goals_conceded += team_1_score;
            })
            .or_insert(g2);
    }

    scores
}

fn main() {}

#[cfg(test)]
mod tests {
    use super::*;

    const RESULTS: &str = "England,France,4,2
France,Italy,3,1
Poland,Spain,2,0
Germany,England,2,1
England,Spain,1,0";

    #[test]
    fn build_scores() {
        let scores = build_scores_table(RESULTS);
        assert!(
            ["England", "France", "Germany", "Italy", "Poland", "Spain"]
                .into_iter()
                .all(|team_name| scores.contains_key(team_name))
        );
    }

    #[test]
    fn validate_team_score_1() {
        let scores = build_scores_table(RESULTS);
        let team = scores.get("England").unwrap();
        assert_eq!(team.goals_scored, 6);
        assert_eq!(team.goals_conceded, 4);
    }

    #[test]
    fn validate_team_score_2() {
        let scores = build_scores_table(RESULTS);
        let team = scores.get("Spain").unwrap();
        assert_eq!(team.goals_scored, 0);
        assert_eq!(team.goals_conceded, 3);
    }
}
```

**关键知识点：**

| 知识点                             | 说明                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| `HashMap<K, V>`                    | 键值对集合，键（Key）唯一                                    |
| `#[derive(Default)]`               | 自动实现 `Default` trait，结构体字段取各自类型的默认值（`u8` 默认为 0） |
| `struct` 结构体                    | 自定义复合数据类型，`TeamScores { goals_scored, goals_conceded }` |
| **Entry API**                      | Rust HashMap 的招牌操作，一行搞定"存在则修改，不存在则插入"  |
| `entry().and_modify().or_insert()` | 链式调用：先找 key，找到就执行 `and_modify` 的闭包，找不到就插入 `or_insert` 的值 |
| `split(',')`                       | 按逗号切分字符串，返回迭代器                                 |
| `parse::<u8>()`                    | 将 `&str` 解析为 `u8`，返回 `Result`，这里用 `unwrap()` 简单处理 |
| `lines()`                          | 将字符串按换行符切分，返回每行的迭代器                       |
| `&str` 作为 HashMap 的 Key         | `&str` 是借用，要注意生命周期——这里 key 借用的数据（`RESULTS` 常量）在整个程序运行期间都存在，所以安全 |

**Entry API 工作流程：**

```
scores.entry(team_1_name)   // ① 查找 key，返回 Entry 枚举（Occupied 或 Vacant）
      .and_modify(|m| {     // ② 如果 Occupied（已存在），修改已有值
          m.goals_scored += ...;
      })
      .or_insert(g1);       // ③ 如果 Vacant（不存在），插入新值 g1
```

> `and_modify` 返回的还是 `Entry`，所以可以继续链式调用 `or_insert`。

---

## 4. 练习四：HashMap 与枚举作为键

> 对应章节：HashMaps（§8.3）、Enums（§6）

**题目：** 水果篮用 HashMap 表示（水果类型 → 数量）。篮中已有 Apple(4)、Mango(2)、Lychee(5)。补充缺失的水果种类（Banana、Pineapple），每种至少 1 个，总数要超过 11。**不能修改已有水果的数量。**

```rust
use std::collections::HashMap;

#[derive(Hash, PartialEq, Eq, Debug)]    // 枚举作为 HashMap Key 必须实现这些 trait
enum Fruit {
    Apple,
    Banana,
    Mango,
    Lychee,
    Pineapple,
}

fn fruit_basket(basket: &mut HashMap<Fruit, u32>) {
    let fruit_kinds = [
        Fruit::Apple,
        Fruit::Banana,
        Fruit::Mango,
        Fruit::Lychee,
        Fruit::Pineapple,
    ];

    for fruit in fruit_kinds {
        basket.entry(fruit).or_insert(1);    // 不存在就插入 1，存在则什么也不做
    }
}

fn main() {}

#[cfg(test)]
mod tests {
    use super::*;

    fn get_fruit_basket() -> HashMap<Fruit, u32> {
        let content = [(Fruit::Apple, 4), (Fruit::Mango, 2), (Fruit::Lychee, 5)];
        HashMap::from_iter(content)
    }

    #[test]
    fn test_given_fruits_are_not_modified() {
        let mut basket = get_fruit_basket();
        fruit_basket(&mut basket);
        assert_eq!(*basket.get(&Fruit::Apple).unwrap(), 4);
        assert_eq!(*basket.get(&Fruit::Mango).unwrap(), 2);
        assert_eq!(*basket.get(&Fruit::Lychee).unwrap(), 5);
    }

    #[test]
    fn at_least_five_types_of_fruits() {
        let mut basket = get_fruit_basket();
        fruit_basket(&mut basket);
        assert!(basket.len() >= 5);
    }

    #[test]
    fn greater_than_eleven_fruits() {
        let mut basket = get_fruit_basket();
        fruit_basket(&mut basket);
        let count = basket.values().sum::<u32>();
        assert!(count > 11);
    }
}
```

**关键知识点：**

| 知识点                         | 说明                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| 枚举作为 HashMap Key           | 必须实现 `Hash` + `PartialEq` + `Eq` trait（`#[derive]` 一键搞定） |
| `&mut` 可变借用                | 函数参数 `basket: &mut HashMap<Fruit, u32>` 表示借用可修改的引用 |
| `entry().or_insert(1)`         | 最简用法：key 存在就不动，不存在就插入 1                     |
| `#[derive]` 属性宏             | 自动为自定义类型实现标准 trait（`Debug`、`Clone`、`Hash`、`Default` 等） |
| `HashMap::from_iter()`         | 从迭代器构造 HashMap                                         |
| `basket.values().sum::<u32>()` | 消费 values 迭代器，求和。`::<u32>` 是 turbofish 语法指定类型 |

---

## 5. 核心知识点总结

### 5.1 `if/else` 是表达式

```rust
// Rust：if 直接返回值
let price = if n > 40 { n } else { n * 2 };

// C 语言等效写法（三目运算符）：
// int price = n > 40 ? n : n * 2;
```

### 5.2 `match` 模式匹配

```rust
match value {
    Command::Uppercase    => /* 处理逻辑 */,
    Command::Trim         => /* 处理逻辑 */,
    Command::Append(n)    => /* n 绑定到内部数据 */,
}
// match 必须穷尽所有可能（exhaustive），否则编译报错
```

### 5.3 所有权（Ownership）基础

| 类型                                            | 特性                                              |
| ----------------------------------------------- | ------------------------------------------------- |
| `i32`、`u8`、`bool`、`char` 等基本类型          | 实现了 `Copy` trait，赋值时自动复制，原变量仍可用 |
| `String`、`Vec<T>`、`HashMap<K,V>` 等堆分配类型 | 未实现 `Copy`，赋值时**转移所有权**，原变量失效   |
| `&T`（引用）                                    | **借用**，不转移所有权，原变量仍可用              |

```rust
let a = 42;
let b = a;      // a 是 i32，实现了 Copy，所以 a 仍然可用

let s1 = String::from("hello");
let s2 = s1;    // s1 所有权转移给 s2，s1 不再可用！
// println!("{}", s1);  // ❌ 编译错误：s1 已被移动
```

### 5.4 HashMap Entry API

```rust
// 模式一：存在则修改，不存在则插入
map.entry(key)
   .and_modify(|v| *v += 1)
   .or_insert(0);

// 模式二：只保证键存在（不存在就插入默认值）
map.entry(key).or_insert(default_value);

// 模式三：存在就返回可变引用，不存在就插入并返回
let v = map.entry(key).or_insert_with(|| expensive_computation());
```

### 5.5 模块系统速查

```rust
mod my_module {           // 定义模块
    pub fn public_fn() {} // pub = 公开
    fn private_fn() {}    // 默认私有
}

use crate::my_module::public_fn;  // 导入（绝对路径）
use super::SomeType;              // 导入父模块的类型
use std::collections::HashMap;    // 导入标准库类型
```

---

## 6. Rustlings 练习与《Rust Book》章节对照

| 练习            | 《Rust Book》章节 |
| --------------- | ----------------- |
| variables       | §3.1              |
| functions       | §3.3              |
| if              | §3.5              |
| primitive_types | §3.2, §4.3        |
| vecs            | §8.1              |
| move_semantics  | §4.1-2            |
| structs         | §5.1, §5.3        |
| enums           | §6, §18.3         |
| strings         | §8.2              |
| modules         | §7                |
| hashmaps        | §8.3              |
| options         | §10.1             |
| error_handling  | §9                |
| generics        | §10               |
| traits          | §10.2             |
| lifetimes       | §10.3             |
| tests           | §11.1             |
| iterators       | §13.2-4           |
| smart_pointers  | §15, §16.3        |
| threads         | §16.1-3           |
| macros          | §20.5             |
| clippy          | Appendix D        |
| conversions     | n/a               |

---

## 7. 学习进度

当前进度：已完成变量、函数、条件判断、基本类型、Vec、移动语义、结构体、枚举、字符串、模块、HashMap，**正在做 options 相关练习**。

