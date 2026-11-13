import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w,h in [(1440,900),(390,844)]:
            pg = await b.new_page(viewport={"width":w,"height":h})
            hatalar=[]; pg.on("console", lambda m: hatalar.append(m.text) if m.type=="error" else None)
            await pg.goto("http://127.0.0.1:18765/index.html", wait_until="networkidle")
            await pg.wait_for_timeout(3200)
            await pg.screenshot(path=f"test/ana-{w}.png", full_page=True)
            tasma = await pg.evaluate("document.documentElement.scrollWidth - innerWidth")
            print(w, "taşma:", tasma, "konsol:", hatalar[:3])
        await b.close()
asyncio.run(main())

