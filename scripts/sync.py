import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict
import re

CHECKINS_DIR = Path("checkins")
USERS_DIR = Path("users")
README_PATH = Path("README.md")
DASHBOARD_JSON_PATH = Path("dashboard.json")

CATEGORIES = ['AI', 'Frontend', 'English', 'Math', 'Reading']

def load_checkins():
    """加载所有打卡记录 (递归查找)"""
    checkins = []
    
    if not CHECKINS_DIR.exists():
        return checkins
    
    # Recursively find all json files
    for file_path in CHECKINS_DIR.rglob("*.json"):
        # Ignore example.json or non-date files
        if file_path.name == "example.json":
            continue
            
        # Optional: Check if filename matches YYYY-MM-DD.json pattern
        if not re.match(r'\d{4}-\d{2}-\d{2}\.json', file_path.name):
            continue

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
        'history': [],
        'categories': defaultdict(int)
    })
    
    for checkin in checkins:
        date = checkin['date']
        for user in checkin['users']:
            username = user['github']
            category = user.get('category', 'Uncategorized')
            
            user_data[username]['total_checkins'] += 1
            user_data[username]['categories'][category] += 1
            user_data[username]['checkin_dates'].append(date)
            user_data[username]['history'].append({
                'date': date,
                'category': category,
                'title': user.get('title', ''),
                'content_md': user.get('content_md', user.get('content', '')),
                'assets': user.get('assets', []),
                'tags': user.get('tags', []),
                'timestamp': user.get('timestamp', '')
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
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            continue
            
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
    markdown += f"- **Total Check-ins**: {total}\n"
    markdown += f"- **Current Streak**: {current_streak} days\n"
    markdown += f"- **Longest Streak**: {longest_streak} days\n\n"
    
    markdown += "### Category Breakdown\n\n"
    for cat, count in user_data['categories'].items():
        markdown += f"- **{cat}**: {count}\n"
    markdown += "\n"

    markdown += "## History\n\n"
    
    sorted_history = sorted(user_data['history'], key=lambda x: x['date'], reverse=True)
    
    for entry in sorted_history:
        title_str = f" - {entry['title']}" if entry.get('title') else ""
        time_str = ""
        if entry.get('timestamp'):
            try:
                dt = datetime.fromisoformat(entry['timestamp'].replace('Z', '+00:00'))
                time_str = f" [{dt.strftime('%H:%M')}]"
            except ValueError:
                pass
                
        markdown += f"### {entry['date']} ({entry['category']}){time_str}{title_str}\n\n"
        if entry.get('tags'):
            tags_str = ", ".join([f"`{t}`" for t in entry['tags']])
            markdown += f"Tags: {tags_str}\n\n"
            
        markdown += f"{entry['content_md']}\n\n"
        
        # Removed the loop that appends assets at the end, 
        # because the rich text editor already embeds them in content_md
        
        markdown += "---\n\n"
    
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
        row = {
            'username': username,
            'total': data['total_checkins'],
            'currentStreak': current_streak,
            'longestStreak': longest_streak
        }
        # Add stats for each known category
        for cat in CATEGORIES:
            row[cat] = data['categories'].get(cat, 0)
            
        leaderboard.append(row)
    
    leaderboard.sort(key=lambda x: x['total'], reverse=True)
    return leaderboard


def update_readme(leaderboard, latest_checkins):
    """更新 README 文件"""
    if not README_PATH.exists():
        print("README.md not found")
        return
    
    with open(README_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    header = "| User | " + " | ".join(CATEGORIES) + " | Total |\n"
    separator = "|---" * (len(CATEGORIES) + 2) + "|\n"
    
    leaderboard_table = header + separator
    
    for user in leaderboard[:10]:
        row = f"| [{user['username']}](users/{user['username']}.md) | "
        for cat in CATEGORIES:
            row += f"{user.get(cat, 0)} | "
        row += f"{user['total']} |\n"
        leaderboard_table += row
    
    latest_section = "## 📅 实时动态 (Latest Check-ins)\n\n"
    if latest_checkins:
        for checkin in latest_checkins[:5]:
            latest_section += f"### {checkin['date']}\n\n"
            for user in checkin['users']:
                raw_content = user.get('content_md', user.get('content', ''))
                # Remove HTML tags for clean text in README
                clean_content = re.sub(r'<[^>]+>', '', raw_content).strip()
                # Truncate to 100 chars
                display_content = clean_content[:100] + ('...' if len(clean_content) > 100 else '')
                
                cat = user.get('category', 'General')
                title = user.get('title', '')
                title_display = f"**{title}** - " if title else ""
                
                time_str = ""
                if user.get('timestamp'):
                    try:
                        dt = datetime.fromisoformat(user['timestamp'].replace('Z', '+00:00'))
                        time_str = f" `{dt.strftime('%H:%M')}`"
                    except ValueError:
                        pass
                
                latest_section += f"- **{user['github']}** ({cat}){time_str}: {title_display}{display_content}\n"
            latest_section += "\n"
    else:
        latest_section += "No recent check-ins\n"
    
    if "## 🏆 残酷排行榜" in content:
        pre_content = content.split("## 🏆 残酷排行榜")[0]
        new_content = pre_content + "## 🏆 残酷排行榜 (Leaderboard)\n\n" + leaderboard_table + "\n" + latest_section
    elif "## Leaderboard" in content:
        pre_content = content.split("## Leaderboard")[0]
        new_content = pre_content + "## 🏆 残酷排行榜 (Leaderboard)\n\n" + leaderboard_table + "\n" + latest_section
    else:
        # Fallback if no header found, append to end or replace old sections
        new_content = content + "\n\n## 🏆 残酷排行榜 (Leaderboard)\n\n" + leaderboard_table + "\n" + latest_section

    with open(README_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Updated README.md")


def generate_dashboard_json(user_data, leaderboard, latest_checkins):
    """生成 Dashboard JSON 数据"""
    dashboard_data = {
        "leaderboard": leaderboard,
        "latestCheckins": [],
        "users": {},
        "generatedAt": datetime.now().isoformat()
    }
    
    # Process latest checkins
    # Flatten the list of all checkins from all files
    all_entries = []
    for checkin in latest_checkins:
        for user in checkin['users']:
            all_entries.append({
                "date": checkin['date'],
                "username": user['github'],
                "title": user.get('title', ''),
                "category": user.get('category', 'General'),
                "content_md": user.get('content_md', user.get('content', '')),
                "tags": user.get('tags', []),
                "timestamp": user.get('timestamp', '')
            })
            
    # Sort all entries by timestamp if available, else by date
    # Assuming timestamp is ISO string
    all_entries.sort(key=lambda x: x.get('timestamp', x['date']), reverse=True)

    dashboard_data["latestCheckins"] = all_entries[:20]
            
    # Process user stats
    for username, data in user_data.items():
        current_streak, longest_streak = calculate_streak(data['checkin_dates'])
        dashboard_data["users"][username] = {
            "username": username,
            "totalCheckins": data['total_checkins'],
            "currentStreak": current_streak,
            "longestStreak": longest_streak,
            "categories": data['categories']
        }
        
    with open(DASHBOARD_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(dashboard_data, f, ensure_ascii=False, indent=2)
        
    print(f"Generated {DASHBOARD_JSON_PATH}")


def main():
    print("Syncing statistics...")
    
    checkins = load_checkins()
    print(f"Loaded {len(checkins)} check-in records")
    
    if not checkins:
        print("No check-ins found")
        generate_dashboard_json({}, [], [])
        return
    
    user_data = calculate_user_stats(checkins)
    print(f"Found {len(user_data)} users")
    
    update_user_files(user_data)
    
    leaderboard = generate_leaderboard(user_data)
    print(f"Generated leaderboard with {len(leaderboard)} users")
    
    latest_checkins = sorted(checkins, key=lambda x: x['date'], reverse=True)
    update_readme(leaderboard, latest_checkins)
    generate_dashboard_json(user_data, leaderboard, latest_checkins)
    
    print("Sync complete!")


if __name__ == "__main__":
    main()
