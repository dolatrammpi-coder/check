import os
import glob
import json
import re

def process_updates():
    update_files = glob.glob("updates/*.json")
    if not update_files:
        print("No new updates found.")
        return

    for update_file in update_files:
        print(f"Processing update: {update_file}")
        try:
            with open(update_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            category = data.get('category', 'NONE')
            target_file = data.get('target_file')
            update_title = data.get('update_title')
            date_text = data.get('date_text')
            date_value = data.get('date_value')
            link_url = data.get('link_url')

            if not os.path.exists(target_file):
                print(f"Error: Target file {target_file} not found. Skipping...")
                os.remove(update_file)
                continue

            # ----------------------------------------------------
            # PART 1: TARGET VACANCY PAGE KO UPDATE KARNA
            # ----------------------------------------------------
            with open(target_file, 'r', encoding='utf-8') as f:
                html = f.read()

            # Job ka asli title nikalna (Homepage ke liye kaam aayega)
            title_match = re.search(r'<h1 class="post-title">(.*?)</h1>', html)
            job_title = title_match.group(1) if title_match else target_file.replace('.html', '').replace('-', ' ').title()

            date_marker = r'(<div[^>]*>Important Dates</div>\s*<ul>)'
            new_date_html = f'<li><span style="color:#cc0000; font-weight:bold;">[NEW]</span> {date_text}: <strong style="color:#cc0000">{date_value}</strong></li>'
            if re.search(date_marker, html):
                html = re.sub(date_marker, r'\1' + new_date_html, html, count=1)

            link_marker = r'(<h2 class="links-heading">Important Links</h2>\s*<table class="info-table">)'
            new_link_html = f'<tr><th><span style="color:#cc0000; font-weight:bold;">[NEW]</span> {update_title}</th><td><a href="{link_url}" target="_blank" rel="noopener" class="btn-click">Click Here</a></td></tr>'
            if re.search(link_marker, html):
                html = re.sub(link_marker, r'\1' + new_link_html, html, count=1)

            with open(target_file, 'w', encoding='utf-8') as f:
                f.write(html)
            
            print(f"Success: {target_file} updated!")

            # ----------------------------------------------------
            # PART 2: INDEX.HTML KO UPDATE KARNA (AGAR CATEGORY HO)
            # ----------------------------------------------------
            if category != 'NONE' and os.path.exists('index.html'):
                with open('index.html', 'r', encoding='utf-8') as f:
                    index_html = f.read()
                
                # Eg: <!-- NEW_RESULT_MARKER -->
                index_marker = f'<!-- NEW_{category}_MARKER -->'
                
                if index_marker in index_html:
                    new_index_entry = f'{index_marker}\n        <li><a href="{target_file}">{job_title}</a></li>'
                    index_html = index_html.replace(index_marker, new_index_entry)
                    
                    with open('index.html', 'w', encoding='utf-8') as f:
                        f.write(index_html)
                    print(f"Success: Homepage updated in {category} section!")
                else:
                    print(f"Warning: {index_marker} missing in index.html!")

            # Safai (Cleanup)
            os.remove(update_file)

        except Exception as e:
            print(f"Failed to process {update_file}: {e}")

if __name__ == "__main__":
    process_updates()
