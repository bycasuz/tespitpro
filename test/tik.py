import asyncio, pathlib
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page()
        await pg.goto(pathlib.Path("docs/index.html").resolve().as_uri())
        links=await pg.eval_on_selector_all("header a, nav a, footer a","els=>els.map(e=>e.getAttribute('href'))")
        print("linkler:",sorted(set(links))[:30])
        for h in ["./#yontem","bahcelievler-su-kacagi-tespiti.html","su-kacagi-rehberi.html","./"]:
            try:
                await pg.goto(pathlib.Path("docs/index.html").resolve().as_uri())
                await pg.click(f'a[href="{h}"] >> nth=0',timeout=3000); await pg.wait_for_timeout(500)
                print(h,"->",pg.url[-60:], "| başlık:", (await pg.title())[:40])
            except Exception as e: print(h,"HATA",str(e)[:80])
        a=await b.new_page(); await a.goto("http://127.0.0.1:4310/")
        sek=await a.eval_on_selector_all("#menu button, #menu a","els=>els.map(e=>e.textContent.trim())"); print("panel sekmeleri:",sek)
        for t in sek[1:4]:
            await a.click(f'#menu >> text="{t}"'); await a.wait_for_timeout(300)
            print(t,"->",(await a.inner_text("main"))[:60].replace("\n"," | "))
        await b.close()
asyncio.run(main())
