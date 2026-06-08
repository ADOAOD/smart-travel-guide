import urllib.request
import re
import urllib.parse
import json

url = "https://v.douyin.com/g4QhixcaU70/"
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
})

try:
    res = urllib.request.urlopen(req)
    long_url = res.geturl()
    print("Long URL:", long_url)
    
    html = res.read().decode('utf-8')
    m = re.search(r'<script id="RENDER_DATA" type="application/json">(.*?)</script>', html)
    if m:
        data_str = urllib.parse.unquote(m.group(1))
        print("Found RENDER_DATA, parsing...")
        data = json.loads(data_str)
        
        def find_play_addr(obj):
            if isinstance(obj, list):
                for item in obj:
                    res = find_play_addr(item)
                    if res: return res
            elif isinstance(obj, dict):
                if 'play_addr' in obj and 'url_list' in obj['play_addr'] and len(obj['play_addr']['url_list']) > 0:
                    return obj['play_addr']['url_list'][0]
                if 'playApi' in obj and isinstance(obj['playApi'], str):
                    return obj['playApi']
                for key, val in obj.items():
                    res = find_play_addr(val)
                    if res: return res
            return None

        video_url = find_play_addr(data)
        print("Extracted Video URL:", video_url)
    else:
        print("RENDER_DATA not found in HTML.")
except Exception as e:
    print("Error:", e)
