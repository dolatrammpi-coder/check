import os
import glob
import json
import PyPDF2
import google.generativeai as genai

# Gemini API setup
API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-pro')

def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

def process_new_pdfs():
    # pdfs/ folder me sabhi nayi pdfs dhundhega
    pdf_files = glob.glob("pdfs/*.pdf")
    
    # Aapka template HTML (Ise string format me script me rakhna hai)
    with open("template.html", "r", encoding="utf-8") as f:
        template_html = f.read()

    for pdf in pdf_files:
        print(f"Processing: {pdf}")
        pdf_text = extract_text_from_pdf(pdf)
        
        prompt = f"""
        You are an expert web developer and data entry specialist.
        Read the following government job notification text and fill out the provided HTML template.
        
        Rules:
        1. Keep the exact HTML structure and CSS classes.
        2. Replace placeholders like [POST NAME], [DATE], [AMOUNT], etc., with actual data from the PDF.
        3. If some data is missing, write "As per notification" or "Not Specified".
        4. Generate a clean URL slug for the job (e.g., upsc-principal-2026.html).
        5. Generate a short, catchy Job Title for the index page.
        
        Return ONLY a raw JSON object (no markdown formatting, no code blocks) with three keys:
        "file_name": (The HTML file name),
        "job_title": (The title for the index.html link),
        "html_content": (The complete filled HTML code)
        
        Notification Text:
        {pdf_text[:10000]} # Limiting text to avoid token limits
        
        HTML Template:
        {template_html}
        """

        response = model.generate_content(prompt)
        
        try:
            # Clean response if it contains markdown JSON blocks
            response_text = response.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(response_text)
            
            file_name = data['file_name']
            job_title = data['job_title']
            html_content = data['html_content']
            
            # 1. Naya HTML file save karein
            with open(file_name, "w", encoding="utf-8") as f:
                f.write(html_content)
                
            # 2. index.html ko update karein
            with open("index.html", "r", encoding="utf-8") as f:
                index_content = f.read()
                
            new_link_html = f"""<!-- NEW_JOB_MARKER -->
        <li>
          <a href="{file_name}">{job_title}</a>
        </li>"""
            
            updated_index = index_content.replace("<!-- NEW_JOB_MARKER -->", new_link_html)
            
            with open("index.html", "w", encoding="utf-8") as f:
                f.write(updated_index)
                
            print(f"Success: Created {file_name} and updated index.html")
            
            # PDF delete kar dein taaki agli baar dobara process na ho
            os.remove(pdf)
            
        except Exception as e:
            print(f"Error processing {pdf}: {e}")

if __name__ == "__main__":
    process_new_pdfs()
