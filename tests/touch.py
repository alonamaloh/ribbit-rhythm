import asyncio
from playwright.async_api import async_playwright
from pathlib import Path
GAME_URL = (Path(__file__).resolve().parent.parent / 'index.html').as_uri()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True, device_scale_factor=3)
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(GAME_URL); await pg.wait_for_timeout(300)
        # tap pad 1 on the map, then Play
        box = await pg.evaluate("(()=>{const r=document.querySelector('#pondmap .pad').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2];})()")
        await pg.touchscreen.tap(box[0], box[1]); await pg.wait_for_timeout(900)
        print('after pad tap mode=', await pg.evaluate("mode"))
        bp = await pg.evaluate("(()=>{const r=document.getElementById('btnPlay').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2];})()")
        await pg.touchscreen.tap(bp[0], bp[1]); await pg.wait_for_timeout(300)
        print('after play tap mode=', await pg.evaluate("mode"), 'state', await pg.evaluate("G.state"))
        await pg.wait_for_function("beatAt(tp())>=-0.05", timeout=10000)
        await pg.touchscreen.tap(600, 300); await pg.wait_for_timeout(100)
        print('judged first note:', await pg.evaluate("G.events[0].judged"), 'log:', await pg.evaluate("G.log.slice(0,3)"))
        print(errs); await b.close()
asyncio.run(main())

async def duet():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width':1180,'height':820}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(GAME_URL)
        await pg.evaluate("openIntro(11)"); await pg.wait_for_timeout(200)
        bp = await pg.evaluate("(()=>{const r=document.getElementById('btnPlay').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2];})()")
        await pg.touchscreen.tap(*bp)
        await pg.wait_for_function("beatAt(tp())>=-0.03", timeout=10000)
        r = await pg.evaluate("(()=>{const r=document.getElementById('tapR').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2];})()")
        await pg.touchscreen.tap(*r)
        await pg.wait_for_function("beatAt(tp())>=0.97", timeout=10000)
        l = await pg.evaluate("(()=>{const r=document.getElementById('tapL').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2];})()")
        await pg.touchscreen.tap(*l)
        await pg.wait_for_timeout(50)
        print('duet judged:', await pg.evaluate("G.events.slice(0,4).map(e=>e.part+':'+e.type+':'+e.judged)"), 'fails', await pg.evaluate("G.fails"))
        print(errs); await b.close()
asyncio.run(duet())
