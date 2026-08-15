import os
import glob
import json
import re
import google.generativeai as genai

# Gemini Setup
genai.configure(api_key=os.environ.get("AIzaSyD_QPvPpdXa5_NSWhY6qMSrcSkzgydnk2A"))
model = genai.GenerativeModel('gemini-2.5-flash')

def get_ai_title(category, url):
    prompt = f"For a government job portal, generate a short, professional title (under 30 chars) for a link. Category: {category}, URL: {url}. Just return the title text, nothing else."
    response = model.generate_content(prompt)
    return response.text.strip()

def process_updates():
    update_files = glob.glob("updates/*.json")
    if not update_files: return

    for update_file in update_files:
        try:
            with open(update_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            cat = data.get('category', 'NONE') # RESULT, ADMIT_CARD, ANSWER_KEY
            target = data.get('target_file')
            url = data.get('link_url')
            
            # AI se chhota title banwana
            display_title = get_ai_title(cat, url)

            # 1. Vacancy Page Update
            if os.path.exists(target):
                with open(target, 'r', encoding='utf-8') as f: html = f.read()
                
                # Links table me nayi row add karna
                marker = r'(<h2 class="links-heading">Important Links</h2>\s*<table class="info-table">)'
                new_row = f'<tr><th>{display_title}</th><td><a href="{url}" target="_blank" rel="noopener" class="btn-click">Click Here</a></td></tr>'
                html = re.sub(marker, r'\1' + new_row, html, count=1)
                
                with open(target, 'w', encoding='utf-8') as f: f.write(html)

            # 2. Homepage (index.html) Update
            if cat != 'NONE' and os.path.exists('index.html'):
                with open('index.html', 'r', encoding='utf-8') as f: index = f.read()
                
                # Job Title nikalna
                job_name = target.replace('.html', '').replace('-', ' ').title()
                
                marker = f'<!-- NEW_{cat}_MARKER -->'
                new_entry = f'{marker}\n        <li><a href="{target}">{job_name} - {display_title}</a></li>'
                index = index.replace(marker, new_entry)
                
                with open('index.html', 'w', encoding='utf-8') as f: f.write(index)

            os.remove(update_file)
            print(f"Update successful for {target}")

        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    process_updates()
