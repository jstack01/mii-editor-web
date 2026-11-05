#!/usr/bin/env python3
"""Compare edited browser UI with exactly the same binary fixtures in Ruffle.
Usage: python3 tools/compare-edited-gui.py evidence/phase4b (offline Pillow).
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageChops,ImageStat
import json,sys
out=Path(sys.argv[1]);cases=json.loads((out/'edited-cases.json').read_text());stats=[]
for scale in [1,2]:
 suffix='@2x' if scale==2 else '';rows=[]
 for fixture in cases:
  name=fixture['id'];a=Image.open(out/f'screenshots/{name}-edited{suffix}.png').convert('RGB');b=Image.open(out/f"{'reference2x' if scale==2 else 'reference'}/{name}-gui.png").convert('RGB');assert a.size==b.size==(640*scale,500*scale)
  diff=ImageChops.difference(a,b);roi=tuple(v*scale for v in (14,10,626,470));stats.append({'screen':name,'deviceScaleFactor':scale,'meanAbsoluteRGBDifference':ImageStat.Stat(diff.crop(roi)).mean,'roi':roi})
  row=Image.new('RGB',(990,282),'#edf0f0');draw=ImageDraw.Draw(row)
  for i,(im,label)in enumerate([(a,'Browser / same edited Mii'),(b,'Unmodified originals in Ruffle'),(Image.eval(diff,lambda p:min(255,p*5)),'Difference x5')]):
   x=i*330+5;draw.text((x,5),f'{name}: {label}',fill='#25383b');row.paste(im.resize((320,250)),(x,28))
  rows.append(row)
 canvas=Image.new('RGB',(990,len(rows)*282+30),'#edf0f0')
 for i,row in enumerate(rows):canvas.paste(row,(0,i*282))
 ImageDraw.Draw(canvas).text((5,len(rows)*282+8),'Source coordinates, matching original binary data. No image fitting or pixel-parity claim.',fill='#25383b');canvas.save(out/f'edited-comparison{suffix}.png',optimize=True)
(out/'coordinate-comparison.json').write_text(json.dumps({'sameBinaryFixtures':True,'bestFitRegistrationUsed':False,'thresholdForParity':None,'note':'Footer URL origin differs; excluded from quantitative ROI. Includes source-grid/font/stroke/antialiasing differences. Ruffle is an emulator, not Adobe Flash certification.','cases':stats},indent=2)+'\n')
print('Compared',len(stats),'edited screen pairs.')
