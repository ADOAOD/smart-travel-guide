import urllib.request

url = "https://www.douyin.com/video/7637850672725247205"
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html'
})

try:
    res = urllib.request.urlopen(req)
    html = res.read().decode('utf-8')
    print(html[:1000])
except Exception as e:
    print("Error:", e)
