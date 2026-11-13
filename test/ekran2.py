import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width":390,"height":844}, device_scale_factor=2)
        await pg.goto("http://127.0.0.1:18765/index.html", wait_until="networkidle"); await pg.wait_for_timeout(3000)
        await pg.screenshot(path="test/mobil-ust.png")
        await pg.evaluate("document.querySelector('#galeri').scrollIntoView()"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path="test/mobil-galeri.png")
        pg2 = await b.new_page(viewport={"width":1440,"height":900})
        await pg2.goto("http://127.0.0.1:18765/sirinevler-su-kacagi-tespiti.html", wait_until="networkidle"); await pg2.wait_for_timeout(3000)
        await pg2.screenshot(path="test/sirinevler-ust.png")
        await b.close()
asyncio.run(main())
