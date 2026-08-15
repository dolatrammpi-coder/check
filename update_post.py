import os
import glob
import json
import re

def process_updates():
    # Updates folder me se saari .json files uthayega
    update_files = glob.glob("updates/*.json")
    if not update_files:
        print("No new updates found.")
        return

    for update_file in update_files:
        print(f"Processing update: {update_file}")
        try:
            with open(update_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            target_file = data.get('target_file')
            update_title = data.get('update_title')
            date_text = data.get('date_text')
            date_value = data.get('date_value')
            link_url = data.get('link_url')

            if not os.path.exists(target_file):
                print(f"Error: Target file {target_file} not found. Skipping...")
                os.remove(update_file)
                continue

            with open(target_file, 'r', encoding='utf-8') as f:
                html = f.read()

            # 1. Important Dates me inject karna (Sabse upar)
            date_marker = r'(<div[^>]*>Important Dates</div>\s*<ul>)'
            new_date_html = f'<li><span style="color:#cc0000; font-weight:bold;">[NEW]</span> {date_text}: <strong style="color:#cc0000">{date_value}</strong></li>'
            
            if re.search(date_marker, html):
                html = re.sub(date_marker, r'\1' + new_date_html, html, count=1)
            else:
                print("Warning: Important Dates section not found.")

            # 2. Important Links me inject karna (Sabse upar)
            link_marker = r'(<h2 class="links-heading">Important Links</h2>\s*<table class="info-table">)'
            new_link_html = f'<tr><th><span style="color:#cc0000; font-weight:bold;">[NEW]</span> {update_title}</th><td><a href="{link_url}" target="_blank" rel="noopener" class="btn-click">Click Here</a></td></tr>'
            
            if re.search(link_marker, html):
                html = re.sub(link_marker, r'\1' + new_link_html, html, count=1)
            else:
                print("Warning: Important Links section not found.")

            # Page ko nayi updates ke sath wapas save karna
            with open(target_file, 'w', encoding='utf-8') as f:
                f.write(html)
            
            print(f"Success: {target_file} has been updated!")
            
            # JSON file delete kar dena taaki baar baar update na ho
            os.remove(update_file)

        except Exception as e:
            print(f"Failed to process {update_file}: {e}")

if __name__ == "__main__":
    process_updates()
