---
title: "Python 数据分析入门：Pandas 实战"
date: "2026-03-11"
description: "使用 Python 的 Pandas 库进行数据清洗和分析的快速入门指南，包含代码示例。"
tags: ["Python", "Data Science", "Pandas"]
categories: ["数据科学"]
---

# Python 数据分析入门：Pandas 实战

Pandas 是 Python 中最流行的数据分析库。它提供了名为 DataFrame 的强大数据结构，让数据操作变得异常简单。

## 安装

```bash
pip install pandas numpy
```

## 基础操作

### 1. 创建 DataFrame

```python
import pandas as pd
import numpy as np

data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'David'],
    'Age': [24, 27, 22, 32],
    'City': ['New York', 'Los Angeles', 'Chicago', 'Houston']
}

df = pd.DataFrame(data)
print(df)
```

输出结果：
```text
      Name  Age         City
0    Alice   24     New York
1      Bob   27  Los Angeles
2  Charlie   22      Chicago
3    David   32      Houston
```

### 2. 数据筛选

我们可以轻松筛选出满足条件的数据：

```python
# 筛选年龄大于 25 的人
older_than_25 = df[df['Age'] > 25]

print(older_than_25)
```

### 3. 数据统计

Pandas 提供了丰富的统计方法：

```python
print(f"平均年龄: {df['Age'].mean()}")
print(f"最大年龄: {df['Age'].max()}")
```

## 进阶技巧：分组与聚合

```python
# 按城市分组并计算平均年龄（示例数据量太小，仅作演示）
grouped = df.groupby('City')['Age'].mean()
```

## 结语

Pandas 的功能远不止于此。配合 Matplotlib 或 Seaborn，你还可以轻松画出精美的图表。

> **提示**: 在处理大型数据集时，注意内存的使用情况。
