from pathlib import Path
import re

root = Path("docs/subject-wise-notes")
files = sorted(root.rglob("index.html"))

print("TOTAL PAGES:", len(files))
print("=" * 100)

for p in files:
s = p.read_text(encoding="utf-8")

header = re.search(r"<header\b.*?</header>", s, re.S | re.I)
footer = re.search(r"<footer\b.*?</footer>", s, re.S | re.I)
nav = re.search(r"<nav\b.*?</nav>", s, re.S | re.I)
h1 = re.findall(r"<h1\b.*?</h1>", s, re.S | re.I)
styles = re.findall(r"<link\b[^>]*stylesheet[^>]*>", s, re.S | re.I)
links = re.findall(r"<a\b[^>]*href=[\"'][^\"']+[\"']", s, re.S | re.I)

print()
print("FILE:", p)
print("HEADER:", "YES" if header else "NO")
print("FOOTER:", "YES" if footer else "NO")
print("NAV:", "YES" if nav else "NO")
print("H1 COUNT:", len(h1))
print("STYLESHEET:", styles[0] if styles else "NONE")
print("LINK COUNT:", len(links))

if header:
    print("HEADER TEXT:", " ".join(header.group(0).split())[:300])
else:
    print("HEADER TEXT: NONE")

if footer:
    print("FOOTER TEXT:", " ".join(footer.group(0).split())[:300])
else:
    print("FOOTER TEXT: NONE")

print()
print("=" * 100)
print("AUDIT COMPLETE")
