'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {Activity, ActivityCalendar} from 'react-activity-calendar';
import {useTheme} from 'next-themes';
import {Tooltip} from 'react-tooltip';

interface CommitGraphProps {
    className?: string;
}

const CommitGraph: React.FC<CommitGraphProps> = ({className}) => {
    const [fullData, setFullData] = useState<Activity[]>([]);
    const [years, setYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const {theme} = useTheme();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/commit-history.json')
            .then(res => res.json())
            .then((history: Activity[]) => {
                // Ensure sorted
                const sorted = history.sort((a, b) => a.date.localeCompare(b.date));
                setFullData(sorted);

                // Extract years
                const uniqueYears = Array.from(new Set(sorted.map(item => parseInt(item.date.split('-')[0]))));
                uniqueYears.sort((a, b) => b - a); // Descending
                setYears(uniqueYears);

                // If current year not in history (e.g. new year, no commits yet), add it?
                // Or just select the latest available year
                if (uniqueYears.length > 0 && !uniqueYears.includes(selectedYear)) {
                    setSelectedYear(uniqueYears[0]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load commit history:', err);
                setLoading(false);
            });
    }, []);

    const currentYearData = useMemo(() => {
        const startStr = `${selectedYear}-01-01`;
        const endStr = `${selectedYear}-12-31`;
        const today = new Date().toISOString().split('T')[0];

        // Determine the effective end date for rendering
        // If selected year is current year, end at today
        // Otherwise end at Dec 31
        const effectiveEndDate = selectedYear === new Date().getFullYear() ? today : endStr;

        // Generate all dates in range
        const dates = [];
        const currentDate = new Date(startStr);
        const stopDate = new Date(effectiveEndDate);

        while (currentDate <= stopDate) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Create a map for quick lookup
        const dataMap = new Map(fullData.map(item => [item.date, item]));

        // Map all dates to activity objects
        return dates.map(date => {
            const existing = dataMap.get(date);
            if (existing) return existing;
            return {date, count: 0, level: 0 as 0 | 1 | 2 | 3 | 4};
        });
    }, [fullData, selectedYear]);

    if (loading) return <div className="p-4 text-center">正在加载贡献数据...</div>;
    if (!fullData.length) return <div className="p-4 text-center">暂无贡献数据。</div>;

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold">提交活跃度</h2>
                <div className="flex flex-wrap gap-2">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                selectedYear === year
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto pb-4">
                <div className="min-w-[800px]">
                    <ActivityCalendar
                        data={currentYearData}
                        theme={{
                            light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                            dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                        }}
                        colorScheme={theme === 'dark' ? 'dark' : 'light'}
                        blockSize={12}
                        blockMargin={4}
                        fontSize={12}
                        showWeekdayLabels
                        renderBlock={(block, activity) => (
                            React.cloneElement(block, {
                                'data-tooltip-id': 'activity-tooltip',
                                'data-tooltip-content': `${activity.date}：${activity.count} 次提交`,
                            })
                        )}
                        labels={{
                            legend: {
                                less: '少',
                                more: '多',
                            },
                            months: [
                                '1月', '2月', '3月', '4月', '5月', '6月',
                                '7月', '8月', '9月', '10月', '11月', '12月'
                            ],
                            totalCount: '{{year}} 年共 {{count}} 次提交',
                            weekdays: [
                                '日', '一', '二', '三', '四', '五', '六'
                            ]
                        }}
                    />
                    <Tooltip id="activity-tooltip"/>
                </div>
            </div>
        </div>
    );
};

export default CommitGraph;
