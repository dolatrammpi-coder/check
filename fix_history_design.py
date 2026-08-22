from pathlib import Path

root = Path("docs/subject-wise-notes/history")
count = 0

for f in root.rglob("index.html"):
s = f.read_text(encoding="utf-8")
old = s

if "<header>" in s:
    s = s.replace("<header>", '<header class="site-header">')

if "<main>" in s:
    s = s.replace("<main>", '<main class="container">')

if "<footer>" in s:
    s = s.replace("<footer>", '<footer class="site-footer">')

if s != old:
    f.write_text(s, encoding="utf-8")
    count += 1

print("PAGES_UPDATED=", count)
