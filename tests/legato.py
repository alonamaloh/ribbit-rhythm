# legato player: alternates F/J, holds each note until AFTER the next one is pressed; uses real keyboard events
import asyncio, sys
from playwright.async_api import async_playwright
from pathlib import Path
GAME_URL = (Path(__file__).resolve().parent.parent / 'index.html').as_uri()
INJ = """()=>{ window.__msgs=[]; const _f=failNow; failNow=(a,e,m)=>{ const n=G.events.find(x=>x.type==='note'&&!x.judged&&x.beat>=startBeat()-1e-9); window.__msgs.push(a+' beat='+e.beat+' dt='+(tp()-evT0(e)).toFixed(3)+' keys='+[...G.keys.keys()]); _f(a,e,m);}; }"""
async def run(lvl):
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width':1100,'height':620})
        await pg.goto(GAME_URL)
        await pg.evaluate(f"openIntro({lvl}); startPlay(false)")
        await pg.evaluate(INJ)
        keys=['f','j']; k=0; held=None; releaseAt=None
        for _ in range(20000):
            st = await pg.evaluate("""()=>{ const t=tp(); const n=G.events.find(e=>e.type==='note'&&!e.judged&&e.beat>=startBeat()-1e-9);
               return {t, state:G.state, mode, n0: n? evT0(n)+0.04 : null, n1: n? evT1(n): null, nextRest: n? null:null}; }""")
            if st['mode']!='play' or st['state']=='done': break
            if st['state']!='play':
                if held: await pg.keyboard.up(held); held=None
                await pg.wait_for_timeout(5); continue
            t=st['t']
            if st['n0'] is not None and t>=st['n0']:
                nk=keys[k%2]; k+=1
                await pg.keyboard.down(nk)
                if held: await pg.wait_for_timeout(40); await pg.keyboard.up(held)   # overlap = legato
                held=nk; releaseAt=st['n1']
            elif held and releaseAt and t>=releaseAt+0.03:
                # only release on our own if a rest follows (otherwise next key-down releases it)
                isrest = await pg.evaluate("(t)=>G.events.some(e=>e.type==='rest'&&t>=evT0(e)-0.05&&t<=evT1(e))", t)
                if isrest: await pg.keyboard.up(held); held=None
            await pg.wait_for_timeout(3)
        st = await pg.evaluate("({state:G&&G.state, fails:G&&G.fails, mode, msgs: window.__msgs})")
        await b.close(); return st
async def main():
    for lvl in map(int, sys.argv[1:]): print(lvl, await run(lvl))
asyncio.run(main())
