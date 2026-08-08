# ==================================================
# 自动创建每日日记和 Rust 学习笔记（Windows 版）
# 用法：右键点击文件 -> “使用 PowerShell 运行”
#       或在 PowerShell 中执行：.\create_post.ps1
# ==================================================

# ---------- 1. 获取当前日期 ----------
$year = (Get-Date).Year
$month = (Get-Date).Month.ToString("00")
$day = (Get-Date).Day.ToString("00")
$dateStr = Get-Date -Format "yyyy-MM-dd"
$datetimeStr = "$dateStr $datetimeStr +0800"   # 固定时间 08:00 东八区

# 目标目录
$targetDir = "content\posts\$year\$month"

# ---------- 2. 确保目录存在 ----------
if (-not (Test-Path $targetDir)) {
    Write-Host "目录 $targetDir 不存在，正在创建..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

# ---------- 3. 定义文件路径 ----------
$diaryFile = Join-Path $targetDir "$day-diary.md"
$rustFilePrefix = Join-Path $targetDir "$day-rust-day-"

# ---------- 4. 创建日记文件（若不存在） ----------
if (Test-Path $diaryFile) {
    Write-Host "📝 日记文件已存在：$diaryFile" -ForegroundColor Cyan
} else {
    $diaryContent = @"
---
title: "$dateStr"
date: "$datetimeStr"
excerpt: ""
tags: ["Rust", "C语言", "培训", "日志"]
categories: ["日志"]
series: "每日日志"
---

## 技术

### C 语言

### Rust

## 思考

## 明日计划

## 思考
"@
    # 以 UTF-8 无 BOM 格式保存
    $Utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($diaryFile, $diaryContent, $Utf8NoBom)
    Write-Host "✅ 创建日记：$diaryFile" -ForegroundColor Green
}

# ---------- 5. 计算下一个 Rust 笔记编号 ----------
$maxNum = 0
$files = Get-ChildItem -Path $targetDir -Filter "*-rust-day-*.md" -File
foreach ($file in $files) {
    if ($file.Name -match '-rust-day-(\d+)\.md$') {
        $num = [int]$Matches[1]
        if ($num -gt $maxNum) { $maxNum = $num }
    }
}
$nextNum = $maxNum + 1
$rustFile = "$rustFilePrefix$nextNum.md"

# ---------- 6. 创建 Rust 笔记文件（若不存在） ----------
if (Test-Path $rustFile) {
    Write-Host "📝 Rust 笔记已存在：$rustFile" -ForegroundColor Cyan
} else {
    $rustContent = @"
---
title: "Rust 学习计划"
date: "$datetimeStr"
excerpt: ""
tags: ["Rust", "学习路线", "编程语言"]
categories: ["学习规划", "技术成长"]
series: "Rust Plan"
---
"@
    [System.IO.File]::WriteAllText($rustFile, $rustContent, $Utf8NoBom)
    Write-Host "✅ 创建 Rust 笔记：$rustFile" -ForegroundColor Green
}

Write-Host "🎉 完成！" -ForegroundColor Magenta