---
title: "Rust 学习计划"
date: "2026-07-28 08:00:00 +0800"
excerpt: "Rust 第4天学习"
tags: ["Rust", "学习路线", "编程语言"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"
---



# Rust Day4 — Option 与 Result

## 一、Rustlings 练习

```rust
// 根据当前时间返回冰箱里剩余的冰淇淋勺数
// 22:00 之前 -> 5 勺，22:00 之后 -> 0 勺（被吃光了）
// 如果 hour_of_day > 23（非法时间），返回 None
fn maybe_ice_cream(hour_of_day: u16) -> Option<u16> {
    match hour_of_day {
        hour if hour < 22 => Some(5),
        hour if hour >= 22 && hour < 24 => Some(0),
        _ => None,
    }
}

fn main() {
    // You can optionally experiment here.
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn raw_value() {
        // 用 unwrap() 取出 Option 里包裹的值
        let ice_creams = maybe_ice_cream(12).unwrap();

        assert_eq!(ice_creams, 5); // Don't change this line.
    }

    #[test]
    fn check_ice_cream() {
        assert_eq!(maybe_ice_cream(0), Some(5));
        assert_eq!(maybe_ice_cream(9), Some(5));
        assert_eq!(maybe_ice_cream(18), Some(5));
        assert_eq!(maybe_ice_cream(22), Some(0));
        assert_eq!(maybe_ice_cream(23), Some(0));
        assert_eq!(maybe_ice_cream(24), None);
        assert_eq!(maybe_ice_cream(25), None);
    }
}
```

> 今天就做了一道 Rustlings 题。Options 概念学完了，但练习题还没做完。

---

## 二、自定义练习：模拟用户查询

### 2.1 User 结构体与查找

```rust
struct User {
    id: u32,
    name: String,
    age: Option<u32>,      // 年龄可能未填写
    email: Option<String>, // 邮箱可能未填写
}

fn find_user_by_id(id: u32) -> Option<User> {
    // 模拟数据库查询——查不到返回 None
    if id == 1 {
        Some(User {
            id: 1,
            name: "Alice".to_string(),
            age: Some(25),
            email: Some("alice@example.com".to_string()),
        })
    } else if id == 2 {
        Some(User {
            id: 2,
            name: "Bob".to_string(),
            age: None,
            email: None,
        })
    } else {
        None
    }
}
```

> 这里 `age` 和 `email` 都用 `Option<T>` 表示"可有可无"的字段——这正是 Rust 没有 `null` 的替代方案。

### 2.2 从邮箱提取域名 — `and_then` + `split`

```rust
fn get_user_email_domain(user: &User) -> Option<String> {
    // 从 email 里提取 @ 后面的部分
    // 例如 "alice@example.com" -> "example.com"
    // 如果 email 是 None，返回 None
    user.email
        .as_ref()                                       // Option<&String>（借用，不转移所有权）
        .and_then(|email| email.split("@").nth(1).map(|o| o.to_string()))
}
```

**链式调用拆解：**

1. `user.email.as_ref()` → 得到 `Option<&String>`，避免把 `email` 移出 `user`
2. `and_then(...)` → 如果 `None`，短路返回 `None`；否则用闭包处理内部值
3. `split("@").nth(1)` → 按 `@` 分割，取第 2 段（索引 1），返回 `Option<&str>`
4. `.map(|o| o.to_string())` → 将 `&str` 转为 `String`

### 2.3 年龄段判断 — `match` + 守卫

```rust
fn get_user_age_group(user: &User) -> String {
    match user.age {
        Some(age) if age < 18           => String::from("未成年"),
        Some(age) if age >= 18 && age < 60 => String::from("成年人"),
        Some(_)                         => String::from("老年人"),  // age >= 60
        None                            => String::from("未知"),
    }
}
```

> **改进点：** 去掉了原版冗余的 `Some(_) | None` 分支——三条 `Some` 守卫已经覆盖了所有年龄值，`None` 单独兜底即可。

### 2.4 调用层 — `if let` 解包

```rust
fn main() {
    let user1 = find_user_by_id(1);
    let user2 = find_user_by_id(2);
    let user3 = find_user_by_id(99);

    // 打印 user1 的邮箱域名
    if let Some(u) = &user1 {
        println!("邮箱域名: {:?}", get_user_email_domain(u));
    }

    // 打印各用户的年龄段
    if let Some(u) = &user1 {
        println!("user1 年龄段: {}", get_user_age_group(u));
    }
    if let Some(u) = &user2 {
        println!("user2 年龄段: {}", get_user_age_group(u));
    }
    if let Some(u) = &user3 {
        println!("user3 年龄段: {}", get_user_age_group(u));
    } else {
        println!("user3 未找到");
    }
}
```

> `if let Some(u) = &user` 的 `&` 是借用的关键——`find_user_by_id` 返回 `Option<User>`，所有权还在 `user1` 身上，用 `&` 借用来匹配就不会把值移走。

---

## 三、Option 转 Result — 配置读取

### 3.1 核心函数

```rust
fn get_config_value(key: &str) -> Option<String> {
    // 模拟从配置里读取键值对
    let config = vec![("name", "Alice"), ("age", "25"), ("email", "")];

    config
        .iter()
        .find(|(k, _)| *k == key)   // 找到第一个匹配的元组，返回 Option<&&(&str, &str)>
        .map(|(_, v)| v.to_string())  // 取出值并转为 String
}

fn parse_age(s: &str) -> Result<u32, String> {
    s.parse().map_err(|_| format!("'{}' 不是有效年龄", s))
}
```

### 3.2 `get_user_age` — `?` + 组合子版

```rust
fn get_user_age() -> Result<u32, String> {
    // 1. 获取 age 配置，若为 None -> Err
    // 2. 若为空字符串 -> Err
    // 3. 否则调用 parse_age 解析
    //
    // 要求：尽量用 ? 和组合子，减少 match 嵌套

    let age_str = get_config_value("age").ok_or("缺少 age 配置")?;

    if age_str.is_empty() {
        return Err(String::from("age 不能为空"));
    }

    parse_age(&age_str)
}
```

**改进说明（对比原版）：**

| 原版 `if let`      | 改进版 `ok_or` + `?`                            |
| ------------------ | ----------------------------------------------- |
| 4 行 + 嵌套 else   | 1 行，链式语义                                  |
| 手动处理 None 分支 | `ok_or` 把 `Option` 转成 `Result`，`?` 自动短路 |

> `ok_or` 的用法：`Option → Result`，`None` 时变成你指定的 `Err`。配上 `?`，None 时直接 return Err，Some 时自动 unwrap。

### 3.3 调用

```rust
fn main() {
    match get_user_age() {
        Ok(age) => println!("用户年龄: {}", age),
        Err(e)  => println!("错误: {}", e),
    }
}
```

---

## 四、`?` 运算符链式调用 — 数据库查询模拟

```rust
struct Database;
struct Connection;

fn connect_db() -> Option<Database>     { Some(Database) }
fn get_conn(db: &Database) -> Option<Connection> { Some(Connection) }
fn query_user(conn: &Connection, id: u32) -> Option<String> { Some("Alice".to_string()) }

fn get_username(user_id: u32) -> Option<String> {
    let db = connect_db()?;
    let conn = get_conn(&db)?;
    let user = query_user(&conn, user_id)?;
    Some(user.to_uppercase())
}
```

> 注释掉的那一大段 `if db.is_none()` + `unwrap()` 就是这四个 `?` 的**手动展开版**。`?` 的本质：遇到 `None` 就提前 return，本质是语法糖，但相比手动判断可读性提升巨大。

---

## 五、本日小结

| 知识点                 | 掌握程度 | 说明                               |
| ---------------------- | -------- | ---------------------------------- |
| `Option<T>` 概念       | 已学完   | 替代 null，表达"值可有可无"        |
| `unwrap()`             | 会用     | 测试或已知 Some 时取值，panic 风险 |
| `if let Some(x) = ...` | 会用     | 只关心 Some 分支时的简洁写法       |
| `match` + 守卫         | 会用     | 配合 `if` 条件做精细匹配           |
| `.as_ref()`            | 会用     | 借用 Option 内部值，不转移所有权   |
| `.and_then()`          | 会用     | Option 链式处理，None 自动短路     |
| `ok_or()` + `?`        | 会用     | Option → Result 转换               |
| `?` 运算符             | 会用     | 链式调用，自动传播 None/Err        |
| `Result<T, E>`         | 初识     | 配合 Option 做错误处理             |

**明天目标：** Options 剩余练习题收尾，推进到 lifetimes。