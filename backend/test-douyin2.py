import urllib.request
import re

url = "https://www.douyin.com/video/7637850672725247205"
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html'
})

try:
    res = urllib.request.urlopen(req)
    html = res.read().decode('utf-8')
    print("HTML length:", len(html))
    
    # Check if there are any <script> tags with interesting data
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
    for i, s in enumerate(scripts):
        if "play_addr" in s or "playApi" in s or "aweme" in s or "video" in s:
            print(f"Script {i} contains keywords. Length: {len(s)}")
            if "play" in s:
                matches = re.findall(r'https?://[^"]+', s)
                urls = [m for m in matches if 'video' in m or 'v3' in m or 'play' in m]
                if urls:
                    print("Found URLs:", urls[:3])
except Exception as e:
    print("Error:", e)
