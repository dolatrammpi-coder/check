import base64
import json
import os
import time
import glob
import urllib.request
import urllib.error

# Naye Gemini 3.x models jo humne list mein dekhe the
PRIMARY_MODEL = os.getenv('GEMINI_MODEL', 'gemini-3.5-flash')

# Fallback models. इनमें जो उपलब्ध होगा वही इस्तेमाल होगा।
FALLBACK_MODELS = [
    PRIMARY_MODEL,
    'gemini-flash-latest',
    'gemini-1.5-pro'
]

API = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}'

def make_request(model, key, payload):
    url = API.format(model=model, key=key)

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    with urllib.request.urlopen(req, timeout=180) as r:
        return json.load(r)

def analyze_pdf_and_generate(path, template_html):
    key = os.environ.get('GEMINI_API_KEY')

    if not key:
        raise RuntimeError('GEMINI_API_KEY is missing')

    raw = open(path, 'rb').read()

    # Website ke liye customized prompt
    prompt = f"""
    You are an expert web developer for an Indian jobs portal. Read the attached recruitment PDF carefully.
    Fill out the provided HTML template using the notification text.

    IMPORTANT: You MUST return a single, valid JSON object. Do not use Markdown representations.
    
    The JSON must have exactly these three keys:
    "file_name": "job-name-2026.html",
    "job_title": "Short Job Title",
    "html_content": "<!doctype html><html lang='hi'>...entire filled html code...</html>"

    HTML Template:
    {template_html}
    """

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "application/pdf",
                            "data": base64.b64encode(raw).decode()
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.1
        }
    }

    errors = []

    # प्रत्येक model को अधिकतम 3 बार try करेंगे।
    for model in FALLBACK_MODELS:
        for attempt in range(3):
            try:
                result = make_request(model, key, payload)

                candidates = result.get('candidates') or []
                if not candidates:
                    raise RuntimeError(f'Gemini returned no candidates for model {model}')

                content = candidates[0].get('content') or {}
                parts = content.get('parts') or []

                if not parts or 'text' not in parts[0]:
                    raise RuntimeError(f'Gemini returned no text for model {model}')

                text = parts[0]['text'].strip()
                
                # Agar Gemini phir bhi json code block de de, toh use saaf karenge
                if text.startswith('```'):
                    parts = text.split('\n', 1)
                    if len(parts) > 1:
                        text = parts[1]
                    if '```' in text:
                        text = text.rsplit('```', 1)[0]
                
                return json.loads(text)

            except urllib.error.HTTPError as e:
                detail = e.read().decode('utf-8', 'replace')

                # 503 = temporary model/server unavailability
                if e.code == 503:
                    errors.append(f'{model} attempt {attempt + 1}: HTTP 503')
                    if attempt < 2:
                        time.sleep(5 * (attempt + 1))
                    continue

                # 429 = rate limit / temporary overload
                if e.code == 429:
                    errors.append(f'{model} attempt {attempt + 1}: HTTP 429')
                    if attempt < 2:
                        time.sleep(8 * (attempt + 1))
                    continue

                errors.append(f'{model}: HTTP {e.code}: {detail}')
                break

            except (urllib.error.URLError, TimeoutError) as e:
                errors.append(f'{model} attempt {attempt + 1}: {e}')
                if attempt < 2:
                    time.sleep(5 * (attempt + 1))

            except json.JSONDecodeError as e:
                errors.append(f'{model}: Invalid JSON returned: {e}')
                break

            except Exception as e:
                errors.append(f'{model}: {e}')
                break

    raise RuntimeError('Gemini extraction failed after retries/fallbacks. ' + ' | '.join(errors))

def process_new_pdfs():
    pdf_files = glob.glob("pdfs/*.pdf")
    if not pdf_files:
        print("No PDFs found.")
        return
    
    with open("template.html", "r", encoding="utf-8") as f:
        template_html = f.read()

    for pdf in pdf_files:
        print(f"Processing: {pdf}")
        try:
            # AI se data mangwao
            data = analyze_pdf_and_generate(pdf, template_html)
            
            file_name = data.get('file_name')
            job_title = data.get('job_title')
            html_content = data.get('html_content')
            
            if not file_name or not html_content:
                print("Error: JSON missing file_name or html_content.")
                continue
                
            # HTML file create karna
            with open(file_name, "w", encoding="utf-8") as f:
                f.write(html_content)
                
            # index.html update karna
            with open("index.html", "r", encoding="utf-8") as f:
                index_content = f.read()
                
            new_link_html = f"<!-- NEW_JOB_MARKER -->\n        <li>\n          <a href=\"{file_name}\">{job_title}</a>\n        </li>"
            updated_index = index_content.replace("<!-- NEW_JOB_MARKER -->", new_link_html)
            
            with open("index.html", "w", encoding="utf-8") as f:
                f.write(updated_index)
                
            print(f"Success: Created {file_name}")
            os.remove(pdf)
            
        except Exception as e:
            print(f"Failed to process {pdf}: {e}")

if __name__ == "__main__":
    process_new_pdfs()
