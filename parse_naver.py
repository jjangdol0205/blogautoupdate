import urllib.request
from bs4 import BeautifulSoup
import re

url = "https://blog.naver.com/PostView.naver?blogId=anytingint&logNo=224225015150"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(html, 'html.parser')
        
        # Naver blog smart editor v3 content is usually under .se-main-container
        container = soup.select_one('.se-main-container')
        if container:
            text = container.get_text('\n', strip=True)
            print(text[:2000] if len(text) > 2000 else text)
        else:
            print("Content container not found.")
except Exception as e:
    print("Error:", e)
