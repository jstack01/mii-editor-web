#!/usr/bin/env python3
"""Source-coordinate GUI comparison with original SWFs in Ruffle. Requires Pillow.
Usage: python3 tools/compare-gui-reference.py evidence/phase4a
No fitted alignment or parity threshold; dynamic device text/footer differ.
"""
from pathlib import Path
import json,sys
from PIL import Image,ImageChops,ImageDraw,ImageStat
out=Path(sys.argv[1]);screens=['basic','size','face','face2','hair','eyebrows','eyes','nose','lips','accessories','accessories2','accessories3','accessories4'];reports=[]
for scale in [1,2]:
 suffix='@2x' if scale==2 else '';rows=[]
 for screen in screens:
  a=Image.open(out/f'screenshots/{screen}{suffix}.png').convert('RGB');b=Image.open(out/f"{'reference2x' if scale==2 else 'reference'}/{screen}-gui.png").convert('RGB');assert a.size==b.size==(640*scale,500*scale)
  diff=ImageChops.difference(a,b);roi=(14*scale,10*scale,626*scale,470*scale);stats=ImageStat.Stat(diff.crop(roi));reports.append({'screen':screen,'deviceScaleFactor':scale,'roi':roi,'meanAbsoluteRGBDifference':stats.mean,'note':'Includes panel/font/rasterization differences; footer excluded because URL sharing is intentionally deferred.'})
  row=Image.new('RGB',(990,284),'#edf0f0');draw=ImageDraw.Draw(row)
  for i,(im,title)in enumerate([(a,'Browser SVG'),(b,'Original SWFs / Ruffle canvas'),(Image.eval(diff,lambda p:min(255,p*5)),'Absolute RGB difference x5')]):
   x=i*330+5;draw.text((x,5),f'{screen}: {title}',fill='#25383b');row.paste(im.resize((320,250)),(x,28))
  rows.append(row)
 canvas=Image.new('RGB',(990,len(rows)*284+30),'#edf0f0')
 for i,row in enumerate(rows):canvas.paste(row,(0,i*284))
 ImageDraw.Draw(canvas).text((5,len(rows)*284+8),'Exact 640 x 500 source coordinates; no image-fit alignment; no pixel-perfect Adobe Flash claim.',fill='#25383b');canvas.save(out/f'gui-comparison{suffix}.png')
(out/'coordinate-comparison.json').write_text(json.dumps({'bestFitAlignmentUsed':False,'thresholdForParity':None,'cases':reports,'knownDifferences':['Nine-slice panel/border geometry differs from both tested Ruffle renderers; original Flash execution unavailable.','Editable device fonts use browser Arial/sans-serif. Static labels use original glyph paths.','Footer shows actual serialized character data; sharing deferred.','Browser/emulator antialiasing, gradients, hairline strokes and rounding.']},indent=2)+'\n')
print('Compared',len(reports),'native/2x screen pairs.')
