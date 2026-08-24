---
title: "Rust 学习计划"
date: "2026-08-12 08:00:00 +0800"
excerpt: "Rust 第13天学习 — 阶段 3：集合、迭代器与 Todo CLI"
tags: ["Rust", "学习路线", "编程语言"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"

---

# Rust Day13 — 阶段 3：集合、迭代器与 Todo CLI

---

## 一、自定义栈 — `MyStack`（封装 Vec）

```rust
struct MyStack {
    vec: Vec<i32>,
}

impl MyStack {
    fn new() -> Self {
        MyStack { vec: Vec::new() }
    }
    fn push(&mut self, val: i32) {
        self.vec.push(val);
    }
    fn pop(&mut self) -> Option<i32> {
        self.vec.pop()
    }
    fn peek(&self) -> Option<&i32> {
        self.vec.last()    // last() 返回 Option<&T>，不移动所有权
    }
    fn is_empty(&self) -> bool {
        self.vec.is_empty()
    }
}
```

| 方法       | 返回类型       | 说明                                  |
| ---------- | -------------- | ------------------------------------- |
| `push`     | `()`           | 入栈，直接委托 `Vec::push`            |
| `pop`      | `Option<i32>`  | 出栈，`Vec::pop` 本身就是 `Option<T>` |
| `peek`     | `Option<&i32>` | 看一眼栈顶，不拿走，`Vec::last()`     |
| `is_empty` | `bool`         | 直接用 `Vec::is_empty()`              |

> `peek()` 返回 `Option<&i32>` 而不是 `Option<i32>`——只是借看一眼，不拿走值。如果用 `pop()` 就拿走了。

---

## 二、HashMap — entry API

### 2.1 字符频率统计

```rust
use std::collections::HashMap;

fn char_frequency(s: &str) -> HashMap<char, i32> {
    let mut hash = HashMap::new();
    for c in s.chars() {
        *hash.entry(c).or_insert(0) += 1;
    }
    hash
}
```

**entry API 拆解：**

```rust
hash.entry(c)       // 找到键 c 所在的槽位
    .or_insert(0)   // 如果不存在 → 插入 0 并返回 &mut i32；如果存在 → 返回 &mut i32
// * ... += 1       // 无论哪种情况，解引用后 +1
```

> `entry()` + `or_insert()` 是 HashMap 里最常用的模式——代替了"先 get 判空，再 insert"的两步操作。

### 2.2 单词频率统计（借用 key）

```rust
fn word_frequency(text: &str) -> HashMap<&str, i32> {
    let mut hash = HashMap::new();
    for word in text.split_whitespace() {
        *hash.entry(word).or_insert(0) += 1;
    }
    hash
}
```

> 返回 `HashMap<&str, i32>` 而不是 `HashMap<String, i32>`——key 是从 `text` 借来的切片引用，避免每个单词都分配新 String。

### 2.3 找 value 最大的 key

```rust
fn max_value_key(map: &HashMap<String, i32>) -> Option<&String> {
    map.iter()
       .max_by_key(|&(_, v)| v)  // 按 value 找最大
       .map(|(k, _)| k)           // 只取 key
}
```

| 步骤 | 方法            | 说明                                        |
| ---- | --------------- | ------------------------------------------- |
| 1    | `.iter()`       | 迭代 `(&K, &V)` 键值对                      |
| 2    | `.max_by_key()` | 按指定字段找最大值，返回 `Option<(&K, &V)>` |
| 3    | `.map()`        | 解构只取 key                                |

---

## 三、HashSet — 交集

### 3.1 初版（双层 for）

```rust
fn intersection(a: &Vec<i32>, b: &Vec<i32>) -> Vec<i32> {
    let mut set = HashSet::new();
    for i in b {
        for k in a {
            if i == k { set.insert(*k); }
        }
    }
    set.into_iter().collect()
}
```

### 3.2 改进版（集合运算）

```rust
fn intersection(a: &Vec<i32>, b: &Vec<i32>) -> Vec<i32> {
    let set_b: HashSet<_> = b.iter().copied().collect();
    a.iter()
     .filter(|x| set_b.contains(x))  // 只在 b 中存在的才保留
     .copied()
     .collect::<HashSet<_>>()         // 收集到 HashSet 自动去重
     .into_iter()
     .collect()
}
```

> 改进版 O(n+m) vs 初版 O(n×m)。`HashSet::contains` 是 O(1) 的。

---

## 四、迭代器组合技

### 4.1 filter + map + collect

```rust
let nums = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let result: Vec<i32> = nums
    .iter()
    .filter(|&x| x % 2 != 0)  // 取奇数: 1,3,5,7,9
    .map(|&x| x * 2)           // 翻倍: 2,6,10,14,18
    .collect();
```

### 4.2 flatten — 拍平嵌套

```rust
let nested = vec![vec![1, 2], vec![3, 4], vec![5, 6]];
let flat: Vec<i32> = nested.into_iter().flatten().collect();
// [1, 2, 3, 4, 5, 6]
```

> `flatten()` 把 `Vec<Vec<T>>` 变成 `Vec<T>`，等价于 `flat_map(|v| v)`。

### 4.3 sort + dedup — 排序后去重

```rust
fn sort_and_dedup(v: &mut Vec<i32>) {
    v.sort();      // 先排序（dedup 只删相邻重复）
    v.dedup();     // 删除相邻重复
}
```

> `dedup()` 只删除**相邻的**重复元素，所以必须先 `sort()` 让相同元素相邻。

### 4.4 partition — 分组

```rust
fn partition(v: &Vec<i32>) -> (Vec<i32>, Vec<i32>) {
    v.iter().partition(|&x| x % 2 == 0)  // (偶数, 奇数)
}
```

> `partition` 根据谓词把迭代器分成两个 Vec，一次遍历完成。

---

## 五、文件排序 — `sort_lines_in_file`

```rust
use std::fs;

fn sort_lines_in_file(path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let s = fs::read_to_string(path)?;
    let mut vec: Vec<String> = s.lines().map(String::from).collect();

    vec.sort();
    let new_content = vec.join("\n");

    // 保留末尾换行
    let new_content = if !vec.is_empty() {
        format!("{}\n", new_content)
    } else {
        new_content
    };
    fs::write(path, new_content)?;
    Ok(())
}
```

**关键步骤：**

1. `s.lines()` — 按行分割，返回 `&str` 切片
2. `.map(String::from)` — 把 `&str` 转成拥有所有权的 `String`（不然 `s` 被 drop 后切片悬垂）
3. `vec.sort()` — 排序后 `join`
4. `Box<dyn Error>` — 返回"任意类型错误"，比写死具体类型灵活

---

## 六、Todo CLI — 综合小项目

> 用 serde 持久化到 JSON，支持命令行增删查改。

### 6.1 数据结构

```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Task {
    id: usize,
    content: String,
    done: bool,
}

const FILE_PATH: &str = "tasks.json";
```

### 6.2 持久化层

```rust
fn load_tasks() -> Vec<Task> {
    let content = match fs::read_to_string(FILE_PATH) {
        Ok(data) => data,
        Err(_) => return Vec::new(),  // 文件不存在 → 空列表
    };
    serde_json::from_str(&content).unwrap_or_default()
}

fn save_tasks(tasks: &Vec<Task>) {
    let json = serde_json::to_string_pretty(tasks).expect("序列化失败");
    fs::write(FILE_PATH, json).expect("写入失败");
}
```

> `unwrap_or_default()` 在反序列化失败时返回空 Vec，容错启动。

### 6.3 业务逻辑

```rust
fn next_id(tasks: &Vec<Task>) -> usize {
    tasks.iter().map(|t| t.id).max().unwrap_or(0) + 1
}

fn add_task(tasks: &mut Vec<Task>, content: String) {
    tasks.push(Task { id: next_id(tasks), content, done: false });
}

fn list_tasks(tasks: &Vec<Task>) {
    for task in tasks {
        let status = if task.done { "[✓]" } else { "[ ]" };
        println!("{} {} {}", status, task.id, task.content);
    }
}

fn done_task(tasks: &mut Vec<Task>, id: usize) -> Result<(), String> {
    if let Some(task) = tasks.iter_mut().find(|t| t.id == id) {
        task.done = true;
        Ok(())
    } else {
        Err(format!("任务 {} 不存在", id))
    }
}

fn clear_done(tasks: &mut Vec<Task>) {
    tasks.retain(|t| !t.done);  // 保留未完成的
}
```

### 6.4 命令行解析

```rust
#[derive(Debug)]
enum Command {
    Add(String),
    List,
    Done(usize),
    Clear,
}

fn parse_args(args: Vec<String>) -> Result<Command, String> {
    if args.len() < 2 {
        return Err("用法: todo_cli [add <内容> | list | done <id> | clear]".to_string());
    }
    match args[1].as_str() {
        "add"  => Ok(Command::Add(args.get(2).ok_or("需要提供任务内容")?.clone())),
        "list" => Ok(Command::List),
        "done" => {
            let id = args.get(2).ok_or("需要提供任务 ID")?.parse()
                         .map_err(|_| "ID 不是有效整数")?;
            Ok(Command::Done(id))
        }
        "clear" => Ok(Command::Clear),
        _       => Err("未知命令".to_string()),
    }
}
```

### 6.5 main 组装

```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    let command = parse_args(args)?;

    let mut tasks = load_tasks();
    match command {
        Command::Add(content) => { add_task(&mut tasks, content); save_tasks(&tasks); }
        Command::List         => list_tasks(&tasks),
        Command::Done(id)     => { done_task(&mut tasks, id)?; save_tasks(&tasks); }
        Command::Clear        => { clear_done(&mut tasks); save_tasks(&tasks); }
    }
    Ok(())
}
```

**用法：**

```bash
cargo run add "买牛奶"
cargo run list          # [ ] 1 买牛奶
cargo run done 1
cargo run clear
```

---

## 七、本日小结

| 知识点                         | 说明                                       |
| ------------------------------ | ------------------------------------------ |
| 封装 Vec 为自定义类型          | `MyStack` 四方法，`peek` 返回引用的意义    |
| `HashMap::entry().or_insert()` | 一次操作完成"查+插"，返回 `&mut V`         |
| `&str` 作为 HashMap key        | 从原字符串借用，避免多分配 String          |
| `max_by_key`                   | 按指定字段找最大，返回 `Option<(&K, &V)>`  |
| `HashSet` 交集                 | `contains()` O(1)，比双层 for O(n²) 快得多 |
| `flatten`                      | `Vec<Vec<T>>` → `Vec<T>`                   |
| `sort` + `dedup`               | 先排序再删相邻重复（顺序不能反）           |
| `partition`                    | 谓词分组，一次遍历返回两个 Vec             |
| `Box<dyn Error>`               | 返回"任意错误类型"，适合顶层函数           |
| serde JSON 持久化              | `Serialize` + `Deserialize` derive         |
| `env::args()`                  | 命令行参数解析                             |
| CLI 架构                       | parse → load → 业务 → save                 |

**明天：** 继续阶段 3，Maybe 开始阶段 4（泛型/trait/lifetime 综合）。