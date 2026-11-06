// blog.cpp
// 源码放在 src/scripts，编译产物放到项目根目录：
//   g++ -std=c++17 -O2 -o blog src/scripts/blog.cpp
//   cl /std:c++17 /EHsc /utf-8 /Fe:blog.exe src/scripts/blog.cpp
//
// 用法：
//   blog day               创建今天的日记
//   blog plan day          创建日规划
//   blog plan half-mon     创建半月规划
//   blog plan week         创建周规划
//   blog img               把 staging_area 里的图片归档到今天的 public/images/YYYY/MM/DD/
//   blog img 2026-11-5     归档到指定日期
//   blog img 11-5          归档到今年的 11 月 5 日
//   blog img 5             归档到本月的 5 日

#include <algorithm>
#include <cctype>
#include <clocale>
#include <cstdio>
#include <cstdlib>
#include <ctime>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <map>
#include <string>
#include <vector>

#if defined(_WIN32)
#include <windows.h>
#define timegm _mkgmtime
#endif

namespace fs = std::filesystem;

static const char* kUsage =
    "用法：blog day | blog plan day|half-mon|week | blog img [YYYY-M-D|M-D|D]\n";

static std::string to_lower(std::string s) {
    std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    return s;
}

static std::string format_time(const char* fmt, const std::tm& tm) {
    char buf[128];
    std::strftime(buf, sizeof(buf), fmt, &tm);
    return buf;
}

// 部分 MinGW 构建里 std::to_string 缺失，用 snprintf 代替
static std::string int_to_string(int value) {
    char buf[16];
    std::snprintf(buf, sizeof(buf), "%d", value);
    return buf;
}

static std::string pad2(int value) {
    char buf[8];
    std::snprintf(buf, sizeof(buf), "%02d", value);
    return buf;
}

static bool parse_uint(const std::string& s, int& out) {
    if (s.empty()) return false;
    for (char c : s) {
        if (std::isdigit(static_cast<unsigned char>(c)) == 0) return false;
    }
    out = std::atoi(s.c_str());
    return true;
}

// 解析 2026-11-5 / 11-5 / 5，缺省的年月用当前日期补齐
static bool parse_img_date(const std::string& arg, int curYear, int curMonth,
                           int& year, int& month, int& day) {
    std::vector<std::string> parts;
    std::string current;
    for (char c : arg) {
        if (c == '-') {
            parts.push_back(current);
            current.clear();
        } else {
            current += c;
        }
    }
    parts.push_back(current);

    if (parts.size() > 3) return false;

    int values[3] = {0, 0, 0};
    for (size_t i = 0; i < parts.size(); ++i) {
        if (!parse_uint(parts[i], values[i])) return false;
    }

    if (parts.size() == 3) {
        year = values[0];
        month = values[1];
        day = values[2];
    } else if (parts.size() == 2) {
        year = curYear;
        month = values[0];
        day = values[1];
    } else {
        year = curYear;
        month = curMonth;
        day = values[0];
    }

    if (year < 1970 || year > 9999) return false;
    if (month < 1 || month > 12) return false;

    static const int kDaysInMonth[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    int max_day = kDaysInMonth[month - 1];
    bool leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
    if (month == 2 && leap) max_day = 29;
    if (day < 1 || day > max_day) return false;

    return true;
}

// 获取可执行文件所在目录（对应 PowerShell 的 $PSScriptRoot）
static fs::path executable_dir(const char* argv0) {
#if defined(_WIN32)
    wchar_t buf[MAX_PATH];
    DWORD n = GetModuleFileNameW(nullptr, buf, MAX_PATH);
    if (n > 0 && n < MAX_PATH) {
        return fs::path(buf).parent_path().lexically_normal();
    }
#elif defined(__linux__)
    std::error_code ec;
    fs::path p = fs::read_symlink("/proc/self/exe", ec);
    if (!ec) return p.parent_path().lexically_normal();
#endif
    return fs::absolute(argv0).parent_path().lexically_normal();
}

// ---------- 图片归档 ----------

static bool is_image_file(const fs::path& p) {
    static const char* kExts[] = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"};
    std::string ext = to_lower(p.extension().string());
    for (const char* e : kExts) {
        if (ext == e) return true;
    }
    return false;
}

static std::string strip_leading_zeros(const std::string& s) {
    size_t k = s.find_first_not_of('0');
    return k == std::string::npos ? "0" : s.substr(k);
}

// 数字段按数值比较，保证 2.jpg 排在 10.jpg 前面
static bool natural_less(const std::string& a, const std::string& b) {
    size_t i = 0;
    size_t j = 0;
    while (i < a.size() && j < b.size()) {
        bool digit_a = std::isdigit(static_cast<unsigned char>(a[i])) != 0;
        bool digit_b = std::isdigit(static_cast<unsigned char>(b[j])) != 0;
        if (digit_a && digit_b) {
            size_t end_a = i;
            while (end_a < a.size() && std::isdigit(static_cast<unsigned char>(a[end_a]))) ++end_a;
            size_t end_b = j;
            while (end_b < b.size() && std::isdigit(static_cast<unsigned char>(b[end_b]))) ++end_b;

            std::string num_a = strip_leading_zeros(a.substr(i, end_a - i));
            std::string num_b = strip_leading_zeros(b.substr(j, end_b - j));
            if (num_a.size() != num_b.size()) return num_a.size() < num_b.size();
            if (num_a != num_b) return num_a < num_b;

            i = end_a;
            j = end_b;
            continue;
        }

        if (a[i] != b[j]) return a[i] < b[j];
        ++i;
        ++j;
    }
    if (i == a.size() && j == b.size()) return false;
    return i == a.size();
}

// 目标目录里已有的最大序号，新文件从它之后接着编号
static int highest_index(const fs::path& dir) {
    int max = 0;
    std::error_code ec;
    for (const auto& entry : fs::directory_iterator(dir, ec)) {
        if (!entry.is_regular_file()) continue;
        std::string stem = entry.path().stem().string();
        if (stem.empty()) continue;
        bool all_digits = std::all_of(stem.begin(), stem.end(), [](unsigned char c) { return std::isdigit(c) != 0; });
        if (!all_digits) continue;
        max = std::max(max, std::atoi(stem.c_str()));
    }
    return max;
}

static bool move_file(const fs::path& from, const fs::path& to) {
    std::error_code ec;
    fs::rename(from, to, ec);
    if (!ec) return true;

    // 暂存区和目标不在同一个盘符时 rename 会失败，退化为复制后删除
    fs::copy_file(from, to, fs::copy_options::overwrite_existing, ec);
    if (ec) return false;
    fs::remove(from, ec);
    return !ec;
}

static int organize_images(const fs::path& root, const std::string& year, const std::string& month, const std::string& day) {
    fs::path staging = root / "public" / "images" / "staging_area";
    fs::path targetDir = root / "public" / "images" / year / month / day;
    std::string urlDir = "/images/" + year + "/" + month + "/" + day;

    std::error_code ec;
    fs::create_directories(staging, ec);
    if (ec) {
        std::cerr << "创建暂存目录失败：" << staging.string() << " (" << ec.message() << ")\n";
        return 1;
    }

    std::vector<fs::path> sources;
    for (const auto& entry : fs::directory_iterator(staging, ec)) {
        if (entry.is_regular_file() && is_image_file(entry.path())) {
            sources.push_back(entry.path());
        }
    }
    if (sources.empty()) {
        std::cout << "暂存目录里没有图片：" << staging.string() << "\n";
        return 0;
    }

    std::sort(sources.begin(), sources.end(), [](const fs::path& a, const fs::path& b) {
        return natural_less(a.filename().string(), b.filename().string());
    });

    fs::create_directories(targetDir, ec);
    if (ec) {
        std::cerr << "创建目录失败：" << targetDir.string() << " (" << ec.message() << ")\n";
        return 1;
    }

    int index = highest_index(targetDir);
    std::vector<std::string> refs;

    for (const auto& source : sources) {
        std::string ext = to_lower(source.extension().string());
        std::string name;
        do {
            name = int_to_string(++index) + ext;
        } while (fs::exists(targetDir / name));

        fs::path to = targetDir / name;
        if (!move_file(source, to)) {
            std::cerr << "移动失败：" << source.string() << " -> " << to.string() << "\n";
            return 1;
        }
        std::cout << "→ " << urlDir << "/" << name << "  (" << source.filename().string() << ")\n";
        refs.push_back("![图](" + urlDir + "/" + name + ")");
    }

    std::cout << "\n共 " << sources.size() << " 张 -> " << targetDir.string() << "\n\n";
    std::cout << "可直接粘贴进文章的引用：\n\n";
    for (const auto& ref : refs) {
        std::cout << ref << "\n";
    }
    return 0;
}

int main(int argc, char* argv[]) {
#if defined(_WIN32)
    SetConsoleOutputCP(CP_UTF8);
#endif
    // 保证日期格式不受系统区域设置影响
    std::setlocale(LC_TIME, "C");

    std::string type = "day";
    std::string arg2;

    if (argc >= 2) type = argv[1];
    if (argc >= 3) arg2 = argv[2];

    if (argc > 3) {
        std::cerr << "参数过多。" << kUsage;
        return 2;
    }

    type = to_lower(type);
    if (type != "day" && type != "plan" && type != "img") {
        std::cerr << "未知类型 '" << type << "'。" << kUsage;
        return 2;
    }

    struct PlanInfo {
        std::string slug;
        std::string title;
        std::string series;
    };

    const std::map<std::string, PlanInfo> planTypes = {
        {"day", {"daily-plan", "日规划", "Daily Plan"}},
        {"half-mon", {"half-month-plan", "半月规划", "Half-Month Plan"}},
        {"week", {"weekly-plan", "周规划", "Weekly Plan"}},
    };

    if (type == "plan") {
        if (arg2.empty()) {
            std::cerr << "请指定计划周期：day、half-mon 或 week。\n";
            return 2;
        }
        arg2 = to_lower(arg2);
        if (planTypes.find(arg2) == planTypes.end()) {
            std::cerr << "未知计划周期 '" << arg2 << "'。可用值：day、half-mon、week。\n";
            return 2;
        }
    } else if (type == "day" && !arg2.empty()) {
        std::cerr << "'day' 命令不接受第二个参数。" << kUsage;
        return 2;
    }

    // 当前时间
    std::time_t now_t = std::time(nullptr);
    std::tm local_tm = *std::localtime(&now_t);

    std::string year = format_time("%Y", local_tm);
    std::string month = format_time("%m", local_tm);
    std::string day = format_time("%d", local_tm);
    std::string dateStr = format_time("%Y-%m-%d", local_tm);
    std::string timeStr = format_time("%Y-%m-%d %H:%M:%S", local_tm);

    // 时区偏移，形如 +0800（对应 PowerShell 的 zzz 去掉冒号）
    int offset_sec = static_cast<int>(timegm(&local_tm) - now_t);
    int off_h = offset_sec / 3600;
    int off_m = std::abs(offset_sec % 3600) / 60;
    char sign = offset_sec >= 0 ? '+' : '-';
    char tz[8];
    std::snprintf(tz, sizeof(tz), "%c%02d%02d", sign, std::abs(off_h), off_m);
    std::string datetimeStr = timeStr + " " + tz;

    // 可执行文件必须放在项目根目录，否则下面所有相对路径都会写错地方
    fs::path root = executable_dir(argv[0]);
    if (!fs::exists(root / "package.json")) {
        std::cerr << "未在 " << root.string() << " 找到 package.json，请把可执行文件放到项目根目录。\n";
        return 1;
    }

    if (type == "img") {
        if (!arg2.empty()) {
            int targetYear = 0;
            int targetMonth = 0;
            int targetDay = 0;
            if (!parse_img_date(arg2, std::atoi(year.c_str()), std::atoi(month.c_str()),
                                targetYear, targetMonth, targetDay)) {
                std::cerr << "无法识别的日期 '" << arg2
                          << "'。可用格式：2026-11-5、11-5 或 5\n";
                return 2;
            }
            year = int_to_string(targetYear);
            month = pad2(targetMonth);
            day = pad2(targetDay);
        }
        return organize_images(root, year, month, day);
    }

    fs::path targetDir = root / "content" / "posts" / year / month;

    std::string fileName;
    std::string title;
    std::string content;

    if (type == "day") {
        fileName = day + "-diary.md";
        title = dateStr;
        content =
            "---\n"
            "title: \"" +
            title + "\"\n"
                    "date: \"" +
            datetimeStr + "\"\n"
                          "excerpt: \"\"\n"
                          "tags: [\"日志\"]\n"
                          "categories: [\"日志\"]\n"
                          "series: \"每日日志\"\n"
                          "---\n";
    } else {
        const PlanInfo& plan = planTypes.at(arg2);
        fileName = day + "-" + plan.slug + ".md";
        title = dateStr + " " + plan.title;

        std::string bodyHeading;
        if (arg2 == "day")
            bodyHeading = "## 明日目标";
        else if (arg2 == "half-mon")
            bodyHeading = "## 本阶段目标";
        else
            bodyHeading = "## 本周重点";

        content =
            "---\n"
            "title: \"" +
            title + "\"\n"
                    "date: \"" +
            datetimeStr + "\"\n"
                          "excerpt: \"\"\n"
                          "tags: [\"规划\"]\n"
                          "categories: [\"规划\"]\n"
                          "series: \"" +
            plan.series + "\"\n"
                          "---\n"
                          "\n" +
            bodyHeading + "\n";
    }

    fs::path targetPath = targetDir / fileName;

    std::error_code ec;
    if (fs::exists(targetPath, ec)) {
        std::cerr << "文件已存在，不会覆盖：" << targetPath.string() << "\n";
        return 1;
    }

    if (!fs::exists(targetDir, ec)) {
        fs::create_directories(targetDir, ec);
        if (ec) {
            std::cerr << "创建目录失败：" << targetDir.string() << " (" << ec.message() << ")\n";
            return 1;
        }
    }

    // 二进制方式写入，内容本身是 UTF-8，不写 BOM
    std::ofstream ofs(targetPath, std::ios::binary);
    if (!ofs) {
        std::cerr << "无法写入文件：" << targetPath.string() << "\n";
        return 1;
    }
    ofs.write(content.data(), static_cast<std::streamsize>(content.size()));
    ofs.close();

    if (!ofs) {
        std::cerr << "写入失败：" << targetPath.string() << "\n";
        return 1;
    }

    std::cout << "✅ 创建文件：" << targetPath.string() << "\n";
    return 0;
}
