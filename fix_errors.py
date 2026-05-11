import json
import asyncio

async def test():
    import urllib.request
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/api/v1/users/signup", data=b'{"email":"test5@test","password":"password123","username":"test5"}', headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as resp:
            print(resp.read())
    except Exception as e:
        print(e.read())

asyncio.run(test())
