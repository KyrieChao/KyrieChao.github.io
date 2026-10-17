---
title: "2026-10-17 日志 重返Blog"
date: "2026-10-17 18:27:06 +0800"
excerpt: "今天重构了plan.chaokyrie 和Blog"
tags: ["日志","Linux","培训","C语言"]
categories: ["日志"]
series: "每日日志"
---

## 日常

今天重构了两个项目 `Plan`和`Blog` 几乎一天没听课、但是我感觉我学过一点的原因 重新拾起并不难。

今天学`Thread`了、现在的进度线程学起来还是很简单的。

周末不休息 我打算回去了 今天几乎什么都没做。


**完成 P1：C 语言练习**
```C
/*
  给定一个非负整数 numRows，生成「杨辉三角」的前 numRows 行。
  在「杨辉三角」中，每个数是它左上方和右上方的数的和。
*/

int** generate(int numRows, int* returnSize, int** returnColumnSizes) {
    *returnSize = numRows;
    if (numRows == 0) {
        *returnColumnSizes = NULL;
        return NULL;
    }

    int** res = malloc(sizeof(int*) * numRows);
    *returnColumnSizes = malloc(sizeof(int) * numRows);

    for (int i = 0; i < numRows; i++) {
        int cols = i + 1;

        (*returnColumnSizes)[i] = cols;
        res[i] = malloc(sizeof(int) * cols);

        res[i][0] = 1;
        res[i][cols - 1] = 1;

        for (int j = 1; j < i; j++) {
            res[i][j] =
                res[i - 1][j - 1] + res[i - 1][j];
        }
    }

    return res;
}
```
> 这里我的思维是对的 但是就是写不出来、我第一个想出来的是递归，第二个才是循环。
> 我应该先把最简单的想出来，后面再补高效的方法。

我发现我对已知的东西会出现蔑视、傲慢 但是傲慢真的无从得知。

如果我对我已经会知识重复 学习/观看的话 我会感觉浪费，所以这里很矛盾 该也不是不该也不是。

**P0、P2没做。**
明日的规划先不做、明天上就业课尽量做晚。




**ChatGPT:**
## 日常

今天重构了两个项目：`Plan` 和 `Blog`，几乎一整天都在处理自己的项目，没怎么听课。

我发现，之前接触过的东西，重新拾起来并没有想象中那么困难。至少对目前接触过的部分来说，重新理解和修改代码的成本还在可接受的范围内。

不过，这也让我想到一个问题：重新拾起不难，不代表自己已经真正掌握。能看懂之前写的代码，和不看参考独立实现，还是两回事。

今天学习了 `Thread`，目前感觉线程部分学起来比较简单。后面还需要通过代码验证自己是否真的理解，而不只是听懂了老师的讲解。

原本今天计划复习 Linux 系统编程，并进行 C 语言练习和嵌入式巩固。实际完成的主要是两个项目的重构，以及一道力扣题。

**P1：C 语言练习——杨辉三角**

```C
/*
  给定一个非负整数 numRows，生成「杨辉三角」的前 numRows 行。
  在「杨辉三角」中，每个数是它左上方和右上方的数的和。
*/

int** generate(int numRows, int* returnSize, int** returnColumnSizes) {
    *returnSize = numRows;
    if (numRows == 0) {
        *returnColumnSizes = NULL;
        return NULL;
    }

    int** res = malloc(sizeof(int*) * numRows);
    *returnColumnSizes = malloc(sizeof(int) * numRows);

    for (int i = 0; i < numRows; i++) {
        int cols = i + 1;

        (*returnColumnSizes)[i] = cols;
        res[i] = malloc(sizeof(int) * cols);

        res[i][0] = 1;
        res[i][cols - 1] = 1;

        for (int j = 1; j < i; j++) {
            res[i][j] =
                res[i - 1][j - 1] + res[i - 1][j];
        }
    }

    return res;
}
```

这道题的思路并不复杂：每一行的首尾都是 `1`，中间元素由上一行相邻的两个元素相加得到。

我先想到的是递归，之后才想到循环。虽然最后的算法思路是正确的，但从思路转化成完整代码时仍然不够熟练。

这让我意识到，算法思路正确，并不意味着自己已经具备熟练的实现能力。循环边界、数组访问、内存分配和特殊输入，都需要在实际编码中逐一处理。

以后遇到类似的问题，我应该先写出最直接、容易验证的正确解，再考虑有没有更好的实现，而不是一开始就追求复杂或高效的方案。

## 关于学习

我发现自己面对已经学过的知识时，有时会觉得重复学习是在浪费时间。

这可能是合理的效率判断，也可能是高估了自己的掌握程度。我暂时不能确定是哪一种。

但我可以换一种检验方式：当我认为自己已经掌握某个知识点时，先尝试闭卷复述、独立编码或解决一道相关问题。如果能完成，就继续往前；如果不能，就回头补足缺口。

与其反复判断自己是不是傲慢，不如让实际表现来检验自己的判断。

## 今日复盘

- **完成：** 重构 Plan 和 Blog；完成一道杨辉三角题；学习 Thread。
- **未完成：** Linux 系统编程复习、嵌入式巩固。
- **主要偏差：** 今天把大量时间投入了项目重构，原定学习任务没有完成。
- **需要改进：** 做项目前先明确当天最重要的学习任务，避免临时投入挤占原定安排。

明天有就业课，学习时间需要根据课程安排调整。即使不能执行完整的学习计划，也应该提前确定当天最重要的一项任务，并在结束后简单复盘。


跟ChatGPT比对之后我就是个小菜鸡，我也会持续学习md文档编写、Git操作与词语运用的。

