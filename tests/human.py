# "human" bot: holds long notes to the very end, then needs 90-180 ms to re-press; random jitter on every tap
import asyncio, sys
from playwright.async_api import async_playwright
from pathlib import Path
GAME_URL = (Path(__file__).resolve().parent.parent / 'index.html').as_uri()
INJ = """()=>{ window.__msgs=[]; const _f=failNow; failNow=(a,e,m)=>{ const n=G.events.find(x=>x.type==='note'&&!x.judged&&x.beat>=startBeat()-1e-9); window.__msgs.push(a+' beat='+e.beat+' dt='+(tp()-evT0(e)).toFixed(3)+' keys='+[...G.keys.keys()]); _f(a,e,m);}; }"""
async def run(lvl, seed):
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width':1100,'height':620})
        await pg.goto(GAME_URL)
        await pg.evaluate(f"openIntro({lvl}); startPlay(false)")
        await pg.evaluate(INJ)
        await pg.evaluate("""(seed)=>{ let r=seed; const rnd=()=>{r=(r*16807)%2147483647; return r/2147483647;};
          let plan=null, relAt=null;
          setInterval(()=>{ if(G.state!=='play') { plan=null; relAt=null; return; }
            const t=tp();
            if(G.keys.size && relAt!==null && t>=relAt){ release('k:Space'); relAt=null; if(plan) plan.at=Math.max(plan.at, t + 0.08 + rnd()*0.07); }
            const n=G.events.find(e=>e.type==='note'&&!e.judged&&e.beat>=startBeat()-1e-9);
            if(!n) return;
            if(!plan || plan.n!==n){ plan={n, at: evT0(n) + 0.05 + (rnd()*0.16-0.08)}; }
            if(t>=plan.at){
              if(G.keys.size){ release('k:Space'); relAt=null; plan.at = t + 0.08 + rnd()*0.07; return; } // finger must lift first
              press('k:Space'); relAt = evT1(n) + 0.03; // hold right up to the next note
            }
          }, 3); }""", seed)
        await pg.wait_for_timeout(int(sys.argv[2]) if len(sys.argv)>2 else 30000)
        st = await pg.evaluate("({state:G.state, fails:G.fails, mode, msgs:window.__msgs})")
        await b.close(); return st
async def main():
    lvl=int(sys.argv[1])
    res = await asyncio.gather(*[run(lvl, s) for s in (11,22,33,44)])
    print(lvl, res)
asyncio.run(main())
