import re

with open('test.html', 'rb') as f:
    html = f.read().decode('utf-8', errors='ignore')

# Find all text inside p tags or blockquotes
matches = re.findall(r'<span class="se-fs-[^"]+">(.*?)</span>', html)
if not matches:
    matches = re.findall(r'<p[^>]*>(.*?)</p>', html)

from html import unescape
for m in matches:
    text = re.sub(r'<[^>]+>', '', unescape(m)).strip()
    if text and text != '&#8203;':
        print(text)
