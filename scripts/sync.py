import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict

CHECKINS_DIR = Path("checkins")
USERS_DIR = Path("users")
README_PATH = Path("README.md")


def load_checkins():
    """加载所有打卡记录"""
    checkins = []
    
    if not CHECKINS_DIR.exists():
        return checkins
    
    for file_path in sorted(CHECKINS_DIR.glob("*.json")):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                checkins.append(data)
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
    
    return checkins


def calculate_user_stats(checkins):
    """计算用户统计数据"""
    user_data = defaultdict(lambda: {
        'total_checkins': 0,
        'checkin_dates': [],
        'history': []
    })
    
    for checkin in checkins:
        date = checkin['date']
        for user in checkin['users']:
            username = user['github']
            user_data[username]['total_checkins'] += 1
            user_data[username]['checkin_dates'].append(date)
            user_data[username]['history'].append({
                'date': date,
                'content_md': user.get('content_md', user.get('content', '')),
                'assets': user.get('assets', []),
                'timestamp': user['timestamp']
            })
    
    return user_data


def calculate_streak(dates):
    """计算连续打卡天数"""
    if not dates:
        return 0, 0
    
    sorted_dates = sorted(set(dates), reverse=True)
    today = datetime.now().date()
    
    current_streak = 0
    longest_streak = 0
    temp_streak = 0
    
    prev_date = None
    for date_str in sorted_dates:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        if prev_date is None:
            temp_streak = 1
            if date == today or date == today - timedelta(days=1):
                current_streak = 1
        elif (prev_date - date).days == 1:
            temp_streak += 1
            if current_streak > 0:
                current_streak += 1
        else:
            longest_streak = max(longest_streak, temp_streak)
            temp_streak = 1
            if current_streak > 0 and (prev_date - date).days > 1:
                current_streak = 0
        
        prev_date = date
    
    longest_streak = max(longest_streak, temp_streak)
    
    return current_streak, longest_streak


def generate_user_markdown(username, user_data):
    """生成用户 Markdown 文件"""
    total = user_data['total_checkins']
    current_streak, longest_streak = calculate_streak(user_data['checkin_dates'])
    
    markdown = f"# {username}\n\n"
    markdown += "## Stats\n\n"
    markdown += f"Total Check-ins: {total}\n"
    markdown += f"Current Streak: {current_streak} days\n"
    markdown += f"Longest Streak: {longest_streak} days\n\n"
    markdown += "## History\n\n"
    
    sorted_history = sorted(user_data['history'], key=lambda x: x['date'], reverse=True)
    
    for entry in sorted_history:
        markdown += f"### {entry['date']}\n\n"
        markdown += f"{entry['content_md']}\n\n"
        
        for asset_url in entry['assets']:
            if asset_url.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp')):
                markdown += f"![学习截图]({asset_url})\n\n"
            elif asset_url.endswith(('.mp4', '.webm', '.ogg')):
                markdown += f"<video controls src=\"{asset_url}\" style=\"max-width: 100%;\"></video>\n\n"
            elif asset_url.endswith(('.mp3', '.wav', '.ogg', '.m4a')):
                markdown += f"<audio controls src=\"{asset_url}\" style=\"width: 100%;\"></audio>\n\n"
            else:
                markdown += f"[下载文件]({asset_url})\n\n"
    
    return markdown


def update_user_files(user_data):
    """更新用户文件"""
    USERS_DIR.mkdir(exist_ok=True)
    
    for username, data in user_data.items():
        markdown = generate_user_markdown(username, data)
        user_file = USERS_DIR / f"{username}.md"
        
        with open(user_file, 'w', encoding='utf-8') as f:
            f.write(markdown)
        
        print(f"Updated user file: {user_file}")


def generate_leaderboard(user_data):
    """生成排行榜"""
    leaderboard = []
    
    for username, data in user_data.items():
        current_streak, longest_streak = calculate_streak(data['checkin_dates'])
        leaderboard.append({
            'username': username,
            'total': data['total_checkins'],
            'current_streak': current_streak,
            'longest_streak': longest_streak
        })
    
    leaderboard.sort(key=lambda x: x['total'], reverse=True)
    return leaderboard


def update_readme(leaderboard, latest_checkins):
    """更新 README 文件"""
    if not README_PATH.exists():
        print("README.md not found")
        return
    
    with open(README_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    leaderboard_table = "| 用户 | 总打卡次数 | 连续打卡 |\n|------|-----------|---------|\n"
    for user in leaderboard[:10]:
        leaderboard_table += f"| [{user['username']}](users/{user['username']}.md) | {user['total']} | {user['current_streak']} |\n"
    
    latest_section = "## 最新打卡\n\n"
    if latest_checkins:
        for checkin in latest_checkins[:5]:
            latest_section += f"### {checkin['date']}\n\n"
            for user in checkin['users']:
                content = user.get('content_md', user.get('content', ''))
                latest_section += f"- **{user['github']}**: {content[:100]}...\n"
            latest_section += "\n"
    else:
        latest_section += "暂无打卡记录\n"
    
    content = content.split("## 排行榜")[0]
    content += "## 排行榜\n\n" + leaderboard_table + "\n" + latest_section
    
    with open(README_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Updated README.md")


def main():
    print("开始同步统计数据...")
    
    checkins = load_checkins()
    print(f"加载了 {len(checkins)} 个打卡记录")
    
    if not checkins:
        print("没有找到打卡记录")
        return
    
    user_data = calculate_user_stats(checkins)
    print(f"找到 {len(user_data)} 个用户")
    
    update_user_files(user_data)
    
    leaderboard = generate_leaderboard(user_data)
    print(f"生成了排行榜，共 {len(leaderboard)} 个用户")
    
    latest_checkins = sorted(checkins, key=lambda x: x['date'], reverse=True)
    update_readme(leaderboard, latest_checkins)
    
    print("同步完成！")


if __name__ == "__main__":
    main()
