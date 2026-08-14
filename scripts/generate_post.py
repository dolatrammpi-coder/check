import os
import glob
import json
import PyPDF2
from google import genai

API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"PDF extract error: {e}")
    return text

def process_new_pdfs():
    pdf_files = glob.glob("pdfs/*.pdf")
    if not pdf_files:
        print("No PDFs found.")
        return
    
    with open("template.html", "r", encoding="utf-8") as f:
        template_html = f.read()

    for pdf in pdf_files:
        print(f"Processing: {pdf}")
        pdf_text = extract_text_from_pdf(pdf)
        
        if not pdf_text.strip():
            print(f"Warning: No text extracted from {pdf}. It might be an image-based PDF.")
            continue
        
        prompt = f"""
        You are an expert web developer. Fill out the provided HTML template using the notification text.
        
        IMPORTANT: Your ENTIRE response MUST be a SINGLE, valid JSON object. Do NOT include any markdown formatting like ```json or any introductory text. Just the raw JSON.
        
        The JSON must have exactly these three keys:
        "file_name": "job-name-2026.html",
        "job_title": "Short Job Title",
        "html_content": "<html>...entire filled html...</html>"
        
        Notification Text:
        {pdf_text[:10000]}
        
        HTML Template:
        {template_html}
        """

        try:
            response = client.models.generate_content(
                model='gemini-3.5-flash',
                contents=prompt,
            )
            
            # Behtar cleanup
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            
            raw_text = raw_text.strip()
            
            try:
                data = json.loads(raw_text)
            except json.JSONDecodeError as e:
                print(f"JSON Parse Error: {e}")
                print(f"Raw Response snippet: {raw_text[:200]}...")
                continue
            
            file_name = data.get('file_name')
            job_title = data.get('job_title')
            html_content = data.get('html_content')
            
            if not file_name or not html_content:
                print("Error: Missing file_name or html_content in JSON.")
                continue
            
            with open(file_name, "w", encoding="utf-8") as f:
                f.write(html_content)
                
            with open("index.html", "r", encoding="utf-8") as f:
                index_content = f.read()
                
            new_link_html = f"<!-- NEW_JOB_MARKER -->\n        <li>\n          <a href=\"{file_name}\">{job_title}</a>\n        </li>"
            
            updated_index = index_content.replace("<!-- NEW_JOB_MARKER -->", new_link_html)
            
            with open("index.html", "w", encoding="utf-8") as f:
                f.write(updated_index)
                
            print(f"Success: Created {file_name}")
            os.remove(pdf)
            
        except Exception as e:
            print(f"General processing error for {pdf}: {e}")

if __name__ == "__main__":
    process_new_pdfs()
