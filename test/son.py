import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={"width":390,"height":844},device_scale_factor=1)
        await pg.goto("http://127.0.0.1:18765/index.html",wait_until="networkidle");await pg.wait_for_timeout(1500)
        await pg.screenshot(path="test/son-mobil.png")
        a=await b.new_page(viewport={"width":1280,"height":800})
        e=[];a.on("console",lambda m:e.append(m.text) if m.type=="error" else None)
        await a.goto("http://127.0.0.1:4310/",wait_until="networkidle");await a.wait_for_timeout(1000)
        await a.screenshot(path="test/admin.png");print("admin konsol:",e[:3])
        await b.close()
asyncio.run(main())
