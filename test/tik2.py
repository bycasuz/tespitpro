import asyncio, pathlib
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); a=await b.new_page(); e=[]
        a.on("console",lambda m:e.append(m.text) if m.type=="error" else None); a.on("pageerror",lambda x:e.append(str(x)))
        await a.goto("http://127.0.0.1:4310/",wait_until="networkidle"); await a.wait_for_timeout(1200)
        btn=a.locator("#menu > *"); n=await btn.count(); print("sekme sayısı",n)
        for i in range(n):
            t=(await btn.nth(i).inner_text()).strip(); await btn.nth(i).click(); await a.wait_for_timeout(250)
            h=await a.locator("main h2, main h1").first.inner_text() if await a.locator("main h2, main h1").count() else "?"
            print(f"{t:22} -> {h}")
        print("hatalar:",e[:5])
        pg=await b.new_page(); await pg.goto(pathlib.Path("docs/index.html").resolve().as_uri())
        await pg.click('header a[href="index.html#yontem"]'); print("menü ->",pg.url[-30:])
        await b.close()
asyncio.run(main())
