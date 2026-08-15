import os
import glob
import json
import re

def process_updates():
    update_files = glob.glob("updates/*.json")
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
            
            if os.path.exists(target):
                with open(target, 'r', encoding='utf-8') as f: html = f.read()
                
                # ---------------------------------------------
                # 1. DATE UPDATE (Duplicate check ke sath)
                # ---------------------------------------------
                if date_text and date_value and date_text not in html:
                    # Yeh regex "Important Dates" ki heading dhundhkar uske baad aane wali list (<ul>) pakad lega
                    date_marker = r'(Important Dates.*?</[^>]+>\s*<ul[^>]*>)'
                    new_date_row = f'<li><span style="color:#cc0000; font-weight:bold;">[NEW]</span> {date_text}: <strong style="color:#cc0000">{date_value}</strong></li>'
                    
                    if re.search(date_marker, html, re.IGNORECASE):
                        html = re.sub(date_marker, r'\g<1>\n        ' + new_date_row, html, count=1, flags=re.IGNORECASE)
                    else:
                        print("Warning: Important Dates section nahi mila HTML mein.")

                # ---------------------------------------------
                # 2. LINK UPDATE (Duplicate check ke sath)
                # ---------------------------------------------
                if url and f'href="{url}"' not in html:
                    link_marker = r'(Important Links.*?</[^>]+>\s*<table[^>]*>)'
                    new_link_row = f'<tr><th><span style="color:#cc0000; font-weight:bold;">[NEW]</span> {title}</th><td><a href="{url}" target="_blank" rel="noopener" class="btn-click">Click Here</a></td></tr>'
                    
                    if re.search(link_marker, html, re.IGNORECASE):
                        html = re.sub(link_marker, r'\g<1>\n        ' + new_link_row, html, count=1, flags=re.IGNORECASE)
                    else:
                        # Fallback agar 'table' seedha div mein nahi mili
                        fallback_marker = r'(<h2 class="links-heading">Important Links</h2>\s*<table class="info-table">)'
                        html = re.sub(fallback_marker, r'\1\n        ' + new_link_row, html, count=1)
                        
                with open(target, 'w', encoding='utf-8') as f: f.write(html)

            # ---------------------------------------------
            # 3. HOMEPAGE UPDATE (Duplicate check ke sath)
            # ---------------------------------------------
            if cat != 'NONE' and os.path.exists('index.html'):
                with open('index.html', 'r', encoding='utf-8') as f: index = f.read()
                
                job_name = target.replace('.html', '').replace('-', ' ').title()
                
                # Check agar yahi Target File + Title pehle se hai kya
                if f'{target}">{job_name} - {title}' not in index:
                    marker = f'<!-- NEW_{cat}_MARKER -->'
                    new_entry = f'{marker}\n        <li><a href="{target}">{job_name} - {title}</a></li>'
                    index = index.replace(marker, new_entry)
                    with open('index.html', 'w', encoding='utf-8') as f: f.write(index)

            os.remove(update_file)
            print(f"Success: {target} fully updated!")
            
        except Exception as e:
            print(f"Failed to process {update_file}: {e}")

if __name__ == "__main__":
    process_updates()
