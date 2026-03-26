---
title: "Java 零基础入门：从 Hello World 到核心语法"
date: "2026-03-11"
description: "真正从零开始学 Java：从 System.out.println 讲起，逐步掌握。"
tags: ["Java", "零基础", "入门教程"]
categories: ["技术教程"]
series: "Java 从入门到实践"
---

Hello 我来继续介绍

## 1.运算符（Operators）
Java 提供了丰富的运算符来处理变量和值。掌握它们是编写逻辑代码的基础。

### 1.1 算术运算符

用于基本数学运算：

| 运算符 | 说明       | 示例            |
|--------|------------|-----------------|
| `+`    | 加法       | `5 + 3 → 8`     |
| `-`    | 减法       | `5 - 3 → 2`     |
| `*`    | 乘法       | `5 * 3 → 15`    |
| `/`    | 除法       | `5 / 2 → 2`（整数除法！） |
| `%`    | 取余（模） | `5 % 2 → 1`     |
| `++`   | 自增 1     | `x++` 或 `++x`  |
| `--`   | 自减 1     | `x--` 或 `--x`  |

> 💡 注意：
> - 整数相除结果仍是整数（小数部分直接丢弃）。
> - `++x`（先加后用） vs `x++`（先用后加）：

```java
int a = 5;
int b = a++;  // b = 5, a = 6
int c = ++a;  // a = 7, c = 7
```

---

### 1.2 赋值运算符

将右边的值赋给左边的变量：

| 运算符 | 等价写法        | 说明         |
|--------|----------------|--------------|
| `=`    | `x = 5`        | 基本赋值      |
| `+=`   | `x = x + 5`    | 加后赋值      |
| `-=`   | `x = x - 5`    | 减后赋值      |
| `*=`   | `x = x * 5`    | 乘后赋值      |
| `/=`   | `x = x / 5`    | 除后赋值      |
| `%=`   | `x = x % 5`    | 取余后赋值    |

```java
int count = 10;
count += 3;  // 相当于 count = count + 3 → 13
```

---

### 1.3 比较运算符

用于比较两个值，**结果总是 `boolean`（true/false）**：

| 运算符 | 含义     | 示例             |
|--------|----------|------------------|
| `==`   | 等于     | `5 == 5 → true`  |
| `!=`   | 不等于   | `5 != 3 → true`  |
| `>`    | 大于     | `5 > 3 → true`   |
| `<`    | 小于     | `5 < 3 → false`  |
| `>=`   | 大于等于 | `5 >= 5 → true`  |
| `<=`   | 小于等于 | `5 <= 3 → false` |

> ⚠️ **重要区别：`==` 对基本类型 vs 引用类型**
>
> - **基本类型**：比较的是**值**
>   ```java
>   int a = 100;
>   int b = 100;
>   System.out.println(a == b); // true
>   ```
> - **引用类型（如 String）**：比较的是**内存地址**（是否同一个对象）
>   ```java
>   String s1 = new String("hello");
>   String s2 = new String("hello");
>   System.out.println(s1 == s2);      // false（不同对象）
>   System.out.println(s1.equals(s2)); // true（内容相同）
>   ```
> ✅ **记住：比较字符串内容请用 `.equals()`，不是 `==`！**

---

### 1.4 逻辑运算符

用于组合多个布尔表达式：

| 运算符    | 名称       | 特性                 | 示例                    |
|--------|------------|--------------------|-------------------------|
| `&&`   | 逻辑与     | **短路**：左为 false 则不计算右边 | `(x > 0) && (y < 10)`   |
| `\|\|` | 逻辑或     | **短路**：左为 true 则不计算右边  | `(x == null) || x.isEmpty()`  |
| `!`    | 逻辑非     | 取反                 | `!(age < 18)`           |

> 💡 **短路特性实战：避免空指针**
>
> ```java
> String str = null;
> // 如果 str 是 null，str.length() 会抛异常！
> // 但用 && 可以安全判断：
> if (str != null && str.length() > 0) {
>     System.out.println("非空字符串");
> }
> // 因为 str != null 为 false，右边根本不会执行！
> ```

---

### 1.5 位运算符（简要了解）

操作二进制位，常用于底层开发或性能优化（初学者知道即可）：

| 运算符 | 说明       | 示例（假设 a=5(101), b=3(011)） |
|--------|------------|----------------------------------|
| `&`    | 按位与     | `a & b → 1`（001）              |
| `\|`   | 按位或     | `a \| b → 7`（111）             |
| `^`    | 按位异或   | `a ^ b → 6`（110）              |
| `~`    | 按位取反   | `~a → -6`（补码表示）           |
| `<<`   | 左移       | `a << 1 → 10`（相当于 ×2）      |
| `>>`   | 右移（带符号）| `a >> 1 → 2`（相当于 ÷2）     |
| `>>>`  | 无符号右移 | 忽略符号位，高位补 0            |

> 📌 初学可跳过，面试或系统编程时再深入。

---

### 1.6 三元运算符（条件运算符）

简洁的 `if-else` 写法：

```java
// 语法：条件 ? 表达式1 : 表达式2
String result = (score >= 60) ? "及格" : "不及格";
```

> 💡 **示例：判断奇偶数**
>
> ```java
> int num = 7;
> String parity = (num % 2 == 0) ? "偶数" : "奇数";
> System.out.println(num + " 是 " + parity); // 7 是 奇数
> ```

> ✅ 优点：代码简短  
> ❌ 缺点：嵌套多层会难读（建议只用于简单判断）

---


好的！以下是 **“流程控制（Control Flow）”** 的完整 Markdown 内容，从 **第 2 节开始编号**（即 `## 2. 流程控制`），风格与你第一篇完全一致：零基础友好、代码清晰、带实用提示和常见坑点。

你可以直接复制粘贴到你的第二篇教程中。

---

## 2. 流程控制（Control Flow）

程序默认从上到下逐行执行。但现实中的逻辑往往需要**根据条件跳过某些代码**，或**重复执行一段操作**——这就是流程控制的作用。

Java 提供了三种主要的流程控制结构：**条件判断**（if / switch）、**循环**（for / while / do-while）。

---

### 2.1 条件语句：`if` / `else if` / `else`

根据布尔表达式的真假决定是否执行某段代码。

```java
int age = 20;

if (age < 13) {
    System.out.println("儿童");
} else if (age < 18) {
    System.out.println("青少年");
} else {
    System.out.println("成年人");
}
// 输出：成年人
```

> ✅ **最佳实践**：
> - 条件尽量简单，复杂逻辑可提取为变量提高可读性：
>   ```java
>   boolean isTeenager = age >= 13 && age < 18;
>   if (isTeenager) {
>       System.out.println("青少年");
>   }
>   ```
> - 避免深层嵌套，尽早 `return` 或使用卫语句（guard clause）。

---

### 2.2 多分支选择：`switch`

当需要根据**一个变量的多个可能值**做不同处理时，用 `switch` 更清晰。

#### 传统写法（适用于所有 Java 版本）
```java
char grade = 'B';

switch (grade) {
    case 'A':
        System.out.println("优秀");
        break;  // 必须加！否则会“穿透”到下一个 case
    case 'B':
        System.out.println("良好");
        break;
    case 'C':
        System.out.println("及格");
        break;
    default:
        System.out.println("未知等级");
}
// 输出：良好
```

> ⚠️ **注意**：
> - `case` 后只能是**常量**（字面量或 `final` 变量）。
> - 忘记写 `break` 会导致 **fall-through（穿透）**，通常是个 bug！

#### Java 14+ 新语法（更安全简洁，可选了解）
```java
// 使用 -> 代替 break，自动跳出
switch (grade) {
    case 'A' -> System.out.println("优秀");
    case 'B' -> System.out.println("良好");
    case 'C' -> System.out.println("及格");
    default -> System.out.println("未知等级");
}
```

> 💡 **支持的类型**：`byte`/`short`/`int`/`char`、`String`、枚举（`enum`）  
> （不支持 `long`、`float`、`double`、`boolean`）

---

### 2.3 循环语句

#### 2.3.1 `for` 循环（已知循环次数时首选）

```java
// 打印 1 到 5
for (int i = 1; i <= 5; i++) {
    System.out.println("第 " + i + " 次");
}
```

- **初始化**：`int i = 1`（只执行一次）
- **条件判断**：`i <= 5`（每次循环前检查）
- **更新操作**：`i++`（每次循环后执行）

> 💡 小技巧：想倒序？`for (int i = 5; i >= 1; i--)`

#### 2.3.2 增强 `for` 循环（遍历数组或集合）

```java
int[] numbers = {10, 20, 30};

for (int num : numbers) {
    System.out.println(num);
}
// 输出：10 20 30
```

> ✅ 优点：代码简洁，不易出错  
> ❌ 缺点：无法获取索引，不能修改原数组元素（但可读）

#### 2.3.3 `while` 循环（条件为真时重复）

```java
int count = 3;
while (count > 0) {
    System.out.println("倒计时：" + count);
    count--;
}
// 输出：倒计时：3 → 2 → 1
```

> ⚠️ **小心死循环**！确保循环体内有改变条件的语句。

#### 2.3.4 `do-while` 循环（至少执行一次）

```java
import java.util.Scanner;

Scanner sc = new Scanner(System.in);
int input;

do {
    System.out.print("请输入一个正数: ");
    input = sc.nextInt();
} while (input <= 0);

System.out.println("你输入的是: " + input);
```

> ✅ 适用场景：菜单选择、用户输入验证等需要**先执行再判断**的情况。

---

### 2.4 控制循环：`break` 与 `continue`

- `break`：**立即退出整个循环**
- `continue`：**跳过本次循环剩余代码，进入下一次**

```java
for (int i = 1; i <= 5; i++) {
    if (i == 3) {
        continue;  // 跳过 i=3
    }
    if (i == 5) {
        break;     // 到 i=5 时退出循环
    }
    System.out.println(i);
}
// 输出：1 2 4
```

> 💡 **标签（label）跳转**（高级用法，了解即可）：
> ```java
> outer: for (int i = 0; i < 3; i++) {
>     for (int j = 0; j < 3; j++) {
>         if (i == 1 && j == 1) {
>             break outer; // 跳出外层循环
>         }
>         System.out.println(i + "," + j);
>     }
> }
> ```

---

### 2.5 常见误区与调试技巧

| 问题 | 错误示例 | 正确做法                    |
|------|--------|-------------------------|
| 忘记大括号 | `if (x > 0) System.out.println("正"); x++;` | 虽然一行不会错但是加了更清楚 `{}`     |
| `==` 比较字符串 | `if (str == "hello")` | 用 `str.equals("hello")` |
| 数组越界 | `for (int i=0; i<=arr.length; i++)` | 条件应为 `i < arr.length`   |
| 死循环 | `while (true) { ... }`（无退出条件） | 确保有 `break` 或条件变化       |

> 🔍 **调试建议**：在循环中打印变量值，观察变化过程。

---