param(
    [Parameter(Position = 0)]
    [string]$Type = "day",

    [Parameter(Position = 1)]
    [string]$PlanPeriod
)

$ErrorActionPreference = "Stop"

if ($args.Count -gt 0) {
    Write-Error "参数过多。用法：.\create_post.ps1 day | .\create_post.ps1 plan day|half-mon|week"
    exit 2
}

$Type = $Type.ToLowerInvariant()
if ($Type -notin @("day", "plan")) {
    Write-Error "未知类型 '$Type'。用法：.\create_post.ps1 day | .\create_post.ps1 plan day|half-mon|week"
    exit 2
}

$planTypes = @{
    "day"      = @{ Slug = "daily-plan"; Title = "日规划"; Series = "Daily Plan" }
    "half-mon" = @{ Slug = "half-month-plan"; Title = "半月规划"; Series = "Half-Month Plan" }
    "week"     = @{ Slug = "weekly-plan"; Title = "周规划"; Series = "Weekly Plan" }
}

if ($Type -eq "plan") {
    if ([string]::IsNullOrWhiteSpace($PlanPeriod)) {
        Write-Error "请指定计划周期：day、half-mon 或 week。"
        exit 2
    }

    $PlanPeriod = $PlanPeriod.ToLowerInvariant()
    if (-not $planTypes.ContainsKey($PlanPeriod)) {
        Write-Error "未知计划周期 '$PlanPeriod'。可用值：day、half-mon、week。"
        exit 2
    }
} elseif (-not [string]::IsNullOrWhiteSpace($PlanPeriod)) {
    Write-Error "日记命令不接受第二个参数。用法：.\create_post.ps1 day"
    exit 2
}

$now = Get-Date
$year = $now.ToString("yyyy")
$month = $now.ToString("MM")
$day = $now.ToString("dd")
$dateStr = $now.ToString("yyyy-MM-dd")
$timezoneOffset = $now.ToString("zzz") -replace ":", ""
$datetimeStr = "$($now.ToString('yyyy-MM-dd HH:mm:ss')) $timezoneOffset"

$targetDir = Join-Path $PSScriptRoot (Join-Path "content\posts\$year" $month)
if ($Type -eq "day") {
    $fileName = "{0}-diary.md" -f $day
    $title = $dateStr
    $content = @"
---
title: "$title"
date: "$datetimeStr"
excerpt: ""
tags: ["日志"]
categories: ["日志"]
series: "每日日志"
---
"@
} else {
    $plan = $planTypes[$PlanPeriod]
    $fileName = "{0}-{1}.md" -f $day, $plan.Slug
    $title = "$dateStr $($plan.Title)"
    $bodyHeading = switch ($PlanPeriod) {
        "day" { "## 明日目标" }
        "half-mon" { "## 本阶段目标" }
        "week" { "## 本周重点" }
    }
    $content = @"
---
title: "$title"
date: "$datetimeStr"
excerpt: ""
tags: ["规划"]
categories: ["规划"]
series: "$($plan.Series)"
---

$bodyHeading
"@
}

$targetPath = Join-Path $targetDir $fileName
if (Test-Path -LiteralPath $targetPath) {
    Write-Error "文件已存在，不会覆盖：$targetPath"
    exit 1
}

if (-not (Test-Path -LiteralPath $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($targetPath, $content, $utf8NoBom)
Write-Host "✅ 创建文件：$targetPath" -ForegroundColor Green
