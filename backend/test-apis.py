import urllib.request
import json

urls = [
    "https://tenapi.cn/v2/douyin?url=https://v.douyin.com/g4QhixcaU70/",
    "https://api.pearktrue.cn/api/douyin/?url=https://v.douyin.com/g4QhixcaU70/"
]

for u in urls:
    print("Testing:", u)
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=5)
        data = json.loads(res.read().decode('utf-8'))
        print("Success:", str(data)[:200])
    except Exception as e:
        print("Failed:", e)
