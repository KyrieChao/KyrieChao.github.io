---
title: "数学笔记：傅里叶变换基础"
date: "2026-03-12"
description: "这篇笔记主要用来测试 KaTeX 数学公式的渲染效果，包含傅里叶变换的基本定义。"
tags: ["Math", "LaTeX", "Signal Processing"]
categories: ["学术笔记"]
---

# 傅里叶变换基础

本文主要测试博客对 LaTeX 数学公式的支持情况。

## 欧拉公式

首先回顾一下著名的欧拉公式：

$$
e^{ix} = \cos x + i\sin x
$$

这个公式被费曼称为"数学中最卓越的公式"。

## 傅里叶变换定义

对于一个连续时间信号 $x(t)$，其傅里叶变换 $X(\omega)$ 定义为：

$$
X(\omega) = \int_{-\infty}^{\infty} x(t) e^{-j\omega t} dt
$$

逆变换定义为：

$$
x(t) = \frac{1}{2\pi} \int_{-\infty}^{\infty} X(\omega) e^{j\omega t} d\omega
$$

### 离散傅里叶变换 (DFT)

在计算机处理中，我们使用离散形式。对于长度为 $N$ 的序列 $x[n]$：

$$
X[k] = \sum_{n=0}^{N-1} x[n] e^{-j\frac{2\pi}{N}kn}, \quad k = 0, 1, \dots, N-1
$$

## 矩阵运算示例

$$
A = \begin{pmatrix}
a & b \\
c & d
\end{pmatrix}, \quad
A^{-1} = \frac{1}{ad-bc} \begin{pmatrix}
d & -b \\
-c & a
\end{pmatrix}
$$

## 总结

如果上面的公式都能正常显示，说明我们的 KaTeX 配置非常成功！🎉
