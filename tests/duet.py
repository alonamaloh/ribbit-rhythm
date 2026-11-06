# duet bot: each hand plays its own line with jitter + lift delay (one key per hand)
import asyncio, sys
from playwright.async_api import async_playwright
from pathlib import Path
GAME_URL = (Path(__file__).resolve().parent.parent / 'index.html').as_uri()
async def run(lvl, seed, ms):
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width':1100,'height':620})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(GAME_URL)
        await pg.evaluate(f"openIntro({lvl}); startPlay(false)")
        await pg.evaluate("""(seed)=>{ window.__msgs=[]; const _f=failNow; failNow=(a,e,m)=>{ window.__msgs.push(a+' part='+e.part+' beat='+e.beat+' dt='+(tp()-evT0(e)).toFixed(3)); _f(a,e,m); };
          let r=seed; const rnd=()=>{r=(r*16807)%2147483647; return r/2147483647;};
          const KEY=['k:KeyJ','k:KeyF']; const plan=[null,null], relAt=[null,null];
          setInterval(()=>{ if(G.state!=='play'){ plan[0]=plan[1]=null; return; }
            const t=tp();
            for(let p=0;p<2;p++){
              const held=G.keys.has(KEY[p]);
              if(held && relAt[p]!==null && t>=relAt[p]){ release(KEY[p]); relAt[p]=null; if(plan[p]) plan[p].at=Math.max(plan[p].at,t+0.08+rnd()*0.07); }
              const n=G.events.find(e=>e.part===p&&e.type==='note'&&!e.judged&&e.beat>=startBeat()-1e-9);
              if(!n) continue;
              if(!plan[p]||plan[p].n!==n) plan[p]={n, at: evT0(n)+0.03+(rnd()*0.16-0.08)};
              if(t>=plan[p].at){
                if(G.keys.has(KEY[p])){ release(KEY[p]); relAt[p]=null; plan[p].at=t+0.08+rnd()*0.07; continue; }
                press(KEY[p], p); relAt[p]= n.dur>=2 ? evT1(n)-0.05 : evT0(n)+0.15;
              }
            }
          }, 3); }""", seed)
        await pg.wait_for_timeout(ms)
        st = await pg.evaluate("({state:G.state, fails:G.fails, mode, msgs:window.__msgs})")
        await b.close(); return st, errs
async def main():
    lvl=int(sys.argv[1]); ms=int(sys.argv[2])
    for r in await asyncio.gather(*[run(lvl, s, ms) for s in (1,2,3)]): print(lvl, r)
asyncio.run(main())
