import os
import glob
import json
import re
from datetime import datetime

def process_updates():
    update_files = glob.glob("updates/*.json")
    
    # Aaj ki date nikal rahe hain (Eg: 2026-08-15)
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Smart NEW Tag (Jisme date save hogi)
    new_badge = f'<span class="smart-new-tag" data-date="{today}" style="color:#cc0000; font-weight:bold;">[NEW]</span>'

    for update_file in update_files:
        try:
            with open(update_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            cat = data.get('category', 'NONE')
            target = data.get('target_file')
            title = data.get('update_title') 
            url = data.get('link_url')
            date_text = data.get('date_text')
            date_value = data.get('date_value')
            
            # Default fallback name
            job_name = target.replace('.html', '').replace('-', ' ').title()
            
            if os.path.exists(target):
                with open(target, 'r', encoding='utf-8') as f: 
                    html = f.read()
                
                # Asli naam (Original Title) vacancy page se nikalna
                h_match = re.search(r'<h[1-2][^>]*>(.*?)</h[1-2]>', html, re.IGNORECASE)
                if h_match:
                    job_name = re.sub(r'<[^>]+>', '', h_match.group(1)).strip()
                
                # 1. DATE UPDATE
                if date_text and date_value and date_text not in html:
                    date_marker = r'(Important Dates.*?</[^>]+>\s*<ul[^>]*>)'
                    new_date_row = f'<li>{new_badge} {date_text}: <strong style="color:#cc0000">{date_value}</strong></li>'
                    if re.search(date_marker, html, re.IGNORECASE):
                        html = re.sub(date_marker, r'\g<1>\n        ' + new_date_row, html, count=1, flags=re.IGNORECASE)

                # 2. LINK UPDATE
                if url and f'href="{url}"' not in html:
                    link_marker = r'(Important Links.*?</[^>]+>\s*<table[^>]*>)'
                    new_link_row = f'<tr><th>{new_badge} {title}</th><td><a href="{url}" target="_blank" rel="noopener" class="btn-click">Click Here</a></td></tr>'
                    if re.search(link_marker, html, re.IGNORECASE):
                        html = re.sub(link_marker, r'\g<1>\n        ' + new_link_row, html, count=1, flags=re.IGNORECASE)
                        
                with open(target, 'w', encoding='utf-8') as f: 
                    f.write(html)

            # 3. HOMEPAGE UPDATE
            if cat != 'NONE' and os.path.exists('index.html'):
                with open('index.html', 'r', encoding='utf-8') as f: 
                    index = f.read()
                
                # Check for duplicates
                if f'{target}">{job_name} - {title}' not in index:
                    marker = f'<!-- NEW_{cat}_MARKER -->'
                    # Homepage par bhi smart new tag laga rahe hain
                    new_entry = f'{marker}\n        <li><a href="{target}">{new_badge} {job_name} - {title}</a></li>'
                    index = index.replace(marker, new_entry)
                    with open('index.html', 'w', encoding='utf-8') as f: 
                        f.write(index)

            os.remove(update_file)
            print(f"Success: {target} fully updated!")
            
        except Exception as e:
            print(f"Failed to process {update_file}: {e}")

if __name__ == "__main__":
    process_updates()
