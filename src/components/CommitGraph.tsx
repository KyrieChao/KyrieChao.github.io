"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Activity, ActivityCalendar } from "react-activity-calendar";
import { Tooltip } from "react-tooltip";

interface CommitRecord {
  hash: string;
  shortHash: string;
  date: string;
  subject: string;
}

interface CommitGraphProps {
  className?: string;
}

const repositoryUrl = "https://github.com/KyrieChao/KyrieChao.github.io";

function dateString(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function buildYearCalendar(year: number, activities: Activity[]) {
  const activityByDate = new Map(activities.map((activity) => [activity.date, activity]));
  const currentDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  if (year === new Date().getFullYear()) {
    endDate.setTime(new Date().setHours(0, 0, 0, 0));
  }

  const days: Activity[] = [];
  while (currentDate <= endDate) {
    const date = dateString(currentDate);
    days.push(activityByDate.get(date) ?? { date, count: 0, level: 0 });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
}

function longestStreak(activities: Activity[]) {
  let current = 0;
  let longest = 0;

  activities.forEach(({ count }) => {
    current = count > 0 ? current + 1 : 0;
    longest = Math.max(longest, current);
  });

  return longest;
}

const CommitGraph: React.FC<CommitGraphProps> = ({ className }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [records, setRecords] = useState<CommitRecord[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(dateString(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const [historyResponse, recordsResponse] = await Promise.all([
          fetch("/commit-history.json"),
          fetch("/commit-records.json"),
        ]);

        if (!historyResponse.ok || !recordsResponse.ok) {
          throw new Error("提交记录数据加载失败。");
        }

        const [history, commitRecords] = await Promise.all([
          historyResponse.json() as Promise<Activity[]>,
          recordsResponse.json() as Promise<CommitRecord[]>,
        ]);

        if (cancelled) return;

        const sortedActivities = history.sort((a, b) => a.date.localeCompare(b.date));
        const sortedRecords = commitRecords.sort((a, b) => b.date.localeCompare(a.date));
        const availableYears = Array.from(
          new Set(sortedActivities.map(({ date }) => Number(date.slice(0, 4)))),
        ).sort((a, b) => b - a);
        const activeYear = availableYears.includes(new Date().getFullYear())
          ? new Date().getFullYear()
          : availableYears[0];

        setActivities(sortedActivities);
        setRecords(sortedRecords);

        if (activeYear) {
          setSelectedYear(activeYear);
          const latestDate = sortedRecords.find((record) => record.date.startsWith(`${activeYear}-`))?.date;
          setSelectedDate(latestDate ?? dateString(new Date(activeYear, 0, 1)));
        }
      } catch (loadError) {
        console.error("Failed to load commit history:", loadError);
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "提交记录数据加载失败。");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  const years = useMemo(
    () => Array.from(new Set(activities.map(({ date }) => Number(date.slice(0, 4))))) .sort((a, b) => b - a),
    [activities],
  );
  const yearActivities = useMemo(
    () => buildYearCalendar(selectedYear, activities),
    [activities, selectedYear],
  );
  const selectedDayRecords = useMemo(
    () => records.filter((record) => record.date === selectedDate),
    [records, selectedDate],
  );
  const totalCommits = yearActivities.reduce((sum, activity) => sum + activity.count, 0);
  const activeDays = yearActivities.filter((activity) => activity.count > 0).length;
  const bestDay = yearActivities.reduce<Activity | null>(
    (best, activity) => activity.count > (best?.count ?? 0) ? activity : best,
    null,
  );

  function selectYear(year: number) {
    setSelectedYear(year);
    const latestDate = records.find((record) => record.date.startsWith(`${year}-`))?.date;
    setSelectedDate(latestDate ?? dateString(new Date(year, 0, 1)));
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#0b1020] p-10 text-center text-sm text-slate-400">
        正在加载提交记录…
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-rose-900/70 bg-[#0b1020] p-6 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#0b1020] p-10 text-center text-sm text-slate-400">
        暂无提交记录。
      </div>
    );
  }

  return (
    <section className={`overflow-hidden rounded-xl border border-slate-800 bg-[#0b1020] text-slate-100 shadow-2xl shadow-slate-950/10 ${className ?? ""}`}>
      <header className="border-b border-slate-800 px-7 py-7 lg:px-9">
        <p className="font-mono text-xs tracking-[0.2em] text-blue-400">GIT ACTIVITY / KYRIECHAO</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">提交记录</h1>
            <p className="mt-2 text-sm text-slate-400">按日期查看仓库提交与年度活动概况。</p>
          </div>
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-blue-500 hover:text-white"
          >
            打开 GitHub 仓库 <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <div className="grid grid-cols-2 divide-x divide-y divide-slate-800 border-b border-slate-800 lg:grid-cols-4 lg:divide-y-0">
        <StatCard label={`${selectedYear} 年提交`} value={totalCommits.toLocaleString()} />
        <StatCard label="活跃日期" value={activeDays.toLocaleString()} />
        <StatCard label="最长连续活跃" value={`${longestStreak(yearActivities)} 天`} />
        <StatCard
          label="单日最高"
          value={bestDay?.count ? `${bestDay.count} 次` : "—"}
          detail={bestDay?.count ? format(new Date(`${bestDay.date}T00:00:00`), "MM-dd") : undefined}
        />
      </div>

      <div className="p-5 sm:p-7 lg:p-9">
        <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#0e1525]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">贡献日历</h2>
              <p className="mt-1 text-xs text-slate-500">选择日期查看当日提交</p>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-slate-800 bg-[#0b1020] p-1">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => selectYear(year)}
                  aria-pressed={selectedYear === year}
                  className={`rounded px-3 py-1.5 font-mono text-xs transition-colors ${
                    selectedYear === year
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto p-5 sm:p-6">
            <div className="min-w-[1000px]">
              <ActivityCalendar
                data={yearActivities}
                theme={{
                  light: ["#172033", "#123b73", "#1555a5", "#2380e8", "#65b3ff"],
                  dark: ["#172033", "#123b73", "#1555a5", "#2380e8", "#65b3ff"],
                }}
                colorScheme="dark"
                blockSize={20}
                blockMargin={5}
                blockRadius={2}
                fontSize={13}
                showWeekdayLabels
                showTotalCount={false}
                renderBlock={(block, activity) =>
                  React.cloneElement(block, {
                    "data-tooltip-id": "activity-tooltip",
                    "data-tooltip-content": `${activity.date} · ${activity.count} 次提交`,
                    "aria-label": `${activity.date}，${activity.count} 次提交`,
                    onClick: () => setSelectedDate(activity.date),
                    style: {
                      cursor: "pointer",
                      outline: activity.date === selectedDate ? "2px solid #93c5fd" : undefined,
                      outlineOffset: "1px",
                    },
                  })
                }
                labels={{
                  legend: { less: "少", more: "多" },
                  months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
                  weekdays: ["日", "一", "二", "三", "四", "五", "六"],
                }}
              />
              <Tooltip id="activity-tooltip" className="!rounded-md !border !border-slate-700 !bg-slate-900 !text-xs !text-white" />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <section className="rounded-lg border border-slate-800 bg-[#0e1525] p-5">
            <p className="font-mono text-xs text-slate-500">SELECTED DATE</p>
            <label htmlFor="activity-date" className="sr-only">选择活动日期</label>
            <input
              id="activity-date"
              type="date"
              value={selectedDate}
              min={`${selectedYear}-01-01`}
              max={`${selectedYear}-12-31`}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="mt-3 w-full rounded-md border border-slate-700 bg-[#0b1020] px-3 py-2 text-sm text-slate-100 [color-scheme:dark]"
            />
            <p className="mt-6 text-4xl font-semibold tracking-tight text-white">
              {selectedDayRecords.length}
            </p>
            <p className="mt-1 text-sm text-slate-400">次提交</p>
          </section>

          <section className="rounded-lg border border-slate-800 bg-[#0e1525]">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-100">当日提交</h2>
              <span className="font-mono text-xs text-slate-500">{selectedDate}</span>
            </div>
            {selectedDayRecords.length > 0 ? (
              <ul className="divide-y divide-slate-800">
                {selectedDayRecords.map((record) => (
                  <li key={record.hash} className="flex items-start gap-4 px-5 py-4">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm leading-6 text-slate-200">{record.subject}</p>
                      <p className="mt-1 font-mono text-xs text-slate-500">{record.shortHash}</p>
                    </div>
                    <a
                      href={`${repositoryUrl}/commit/${record.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`查看提交 ${record.shortHash}`}
                      className="shrink-0 rounded border border-slate-700 px-2 py-1 font-mono text-xs text-blue-300 transition-colors hover:border-blue-500 hover:text-blue-200"
                    >
                      {record.shortHash} ↗
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-8 text-sm text-slate-500">所选日期没有提交记录。</p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
};

function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="min-h-24 px-5 py-5 sm:px-7">
      <p className="text-xs text-slate-500">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-mono text-2xl font-semibold tracking-tight text-white sm:text-3xl">{value}</p>
        {detail && <span className="font-mono text-xs text-slate-500">{detail}</span>}
      </div>
    </div>
  );
}

export default CommitGraph;
