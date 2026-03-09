---
title: "Java 零基础入门：从 Hello World 到核心语法"
date: "2026-03-09"
description: "真正从零开始学 Java：从 System.out.println 讲起，逐步掌握。"
tags: ["Java", "零基础", "入门教程"]
categories: ["技术教程"]
series: "Java 从入门到实践"
---

欢迎来到 Java 学习笔记的第一篇！在本系列中，我们将从零开始，一步步掌握 Java 的核心语法。<br/>
不跳过任何基础，从最简单的 `System.out.println` 讲起，带你真正理解输开发中必备的知识。

## 1. 环境准备
首先，确保你已经安装了 Java 8 或更高版本。

```bash
java --version
# java 17.0.16 2025-07-15 LTS
```

## 2. 创建项目

使用 `javac` 编译你的第一个 Java 程序：

用JetBrains IDEA创建一个Java项目(first-demo)，并创建一个名为`Main.java`的文件。

```
first-demo/
├── src
│    └── Main.java           # 入口类
└── out/                     # 编译输出（自动创建）
```
## 3. 编写代码
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
```

## 4. 编译与运行
- 可以点击JetBrains IDEA的Current File 打印台即可出现Hello, Java!

- 也可以使用命令行编译和运行：
```bash
# 编译
javac src/Main.java -d out

# 运行
java -cp out Main
```
## 5. 运行结果
```
Hello, Java!
```

## 6. 数据类型与变量

Java 是**强类型语言**，每个变量必须先声明类型。数据类型分为**基本类型**（8种）和**引用类型**（数组、类、接口等）。

### 6.1 完整示例

```java
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // 整数类型（从小到大）
        byte score = 90;               //  8 bit  -128 ~ 127
        short height = 170;            // 16 bit -32768 ~ 32767
        int age = 25;                  // 32 bit  ±21 亿（最常用）
        long population = 1_000_000L;  // 64 bit  ±9×10¹⁸

        // 浮点类型
        float weight = 68.5f;          // 32 bit，必须加 f
        double price = 19.99;          // 64 bit（默认，精度更高）

        // 字符与布尔
        char grade = 'A';              // 16 bit，单引号，存一个字符
        boolean isStudent = true;      // true 或 false

        // 引用类型
        String name = "Alice";         // 字符串，双引号，final class
        int[] arr = {1, 2, 3, 4, 5};   // 数组，引用类型

        // 特殊表示法
        int bin = 0b1010;              // 二进制（0b 开头）
        int hex = 0xFF;                // 十六进制（0x 开头）
        double pi = 3.141_592_653;     // 下划线分隔，提升可读性
        String emoji = "\uD83D\uDE04"; // Unicode 表情 😄
        char chinese = '中';           // 支持中文

        // var 类型推断（Java 10+）
        var message = "Hello";         // 编译器推断为 String

        // 打印输出
        System.out.println("Score: " + score);
        System.out.println("Height: " + height);
        System.out.println("Age: " + age);
        System.out.println("Population: " + population);
        System.out.println("Weight: " + weight);
        System.out.println("Price: " + price);
        System.out.println("Grade: " + grade);
        System.out.println("Is Student: " + isStudent);
        System.out.println("Name: " + name);
        System.out.println("Array: " + Arrays.toString(arr)); // 注意这里
        System.out.println("Binary 0b1010 = " + bin);
        System.out.println("Hex 0xFF = " + hex);
        System.out.println("Pi = " + pi);
        System.out.println("Emoji: " + emoji);
        System.out.println("Chinese: " + chinese);
        System.out.println("Var: " + message);
    }
}
```

### 6.2 关键点总结

| 类型        | 大小     | 范围/说明          | 注意            |
| :-------- | :----- | :------------- | :------------ |
| `byte`    | 8 bit  | -128 ~ 127     | 文件流、节省内存      |
| `short`   | 16 bit | -32768 ~ 32767 | 很少用           |
| `int`     | 32 bit | ±21亿           | 整数默认类型        |
| `long`    | 64 bit | 很大             | 赋值加 `L`       |
| `float`   | 32 bit | 6~7位精度         | 赋值加 `f`       |
| `double`  | 64 bit | 15~16位精度       | 浮点默认类型        |
| `char`    | 16 bit | 0 ~ 65535      | 单引号，存 Unicode |
| `boolean` | 1 bit  | true/false     | 不能转整数         |

### 6.3 常见坑
```java
// ❌ 错误：整数默认是 int，超出范围要加 L
long big = 3000000000;     // 编译错误！30亿超过 int 范围
long big = 3000000000L;    // ✅ 正确

// ❌ 错误：浮点默认是 double，不能直接赋给 float
float f = 3.14;            // 编译错误！
float f = 3.14f;           // ✅ 正确

// ❌ 错误：char 用双引号
char c = "A";              // 编译错误！String 不能赋给 char
char c = 'A';              // ✅ 正确

// ⚠️ 注意：数组直接打印是地址
System.out.println(arr);   // [I@6d06d69c（地址）
System.out.println(Arrays.toString(arr)); // [1, 2, 3, 4, 5] ✅
```

## 7. 类型转换
### 7.1 自动转换（小 → 大）
```java
byte b = 10;
int i = b;          // ✅ 自动转，没问题
double d = i;       // ✅ 自动转，没问题
```
### 7.2 强制转换（大 → 小）
```java
double d = 3.99;
int i = (int) d;    // ✅ 强制转，i = 3（小数直接丢掉！）

int big = 130;
byte small = (byte) big;  // ⚠️ 溢出！结果是 -126
```
### 7.3 字符串与其他类型互转
```java
// 任意类型 → String
String s1 = String.valueOf(123);    // "123"
String s2 = 123 + "";               // "123"（偷懒写法）

// String → 数字
int num = Integer.parseInt("123");           // 123
double d = Double.parseDouble("3.14");       // 3.14

// 注意：格式不对会抛异常
int error = Integer.parseInt("abc");         // ❌ NumberFormatException
```

## 8. 常量与命名规范
```java
// 常量：final 修饰，全大写，单词间下划线分隔
final double PI = 3.14159;
final int MAX_SIZE = 100;

// 变量命名：小驼峰
int studentAge = 20;
String userName = "Tom";

// 类名：大驼峰（Main, StudentInfo）
// 方法名：小驼峰（getName, printInfo）
// 包名：全小写（com.example.demo）
```