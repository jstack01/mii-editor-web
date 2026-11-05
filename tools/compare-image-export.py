#!/usr/bin/env python3
"""Exact-coordinate browser/image-export Ruffle comparison; offline Pillow tool.
Usage: python3 tools/compare-file-dialog.py evidence/phase5b
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageChops,ImageStat
import json,sys
out=Path(sys.argv[1]);measurements=[]
for scale in [1,2]:
 suffix='@2x' if scale==2 else '';rows=[]
 for page in ['image-default','image-head','image-transparent']:
  a=Image.open(out/f'screenshots/{page}{suffix}.png').convert('RGB');b=Image.open(out/f"{'reference2x' if scale==2 else 'reference'}/{page}.png").convert('RGB');assert a.size==b.size==(640*scale,500*scale)
  diff=ImageChops.difference(a,b);roi=tuple(v*scale for v in (14,10,626,470));mask=Image.new('L',a.size,0);draw=ImageDraw.Draw(mask);draw.rectangle(roi,fill=255)
  # The Web version label is intentionally truthful instead of a Flash version.
  if False:draw.rectangle(tuple(v*scale for v in (480,10,627,57)),fill=0)
  measurements.append({'page':page,'deviceScaleFactor':scale,'roi':roi,'versionLabelExcluded':False,'meanAbsoluteRGBDifference':ImageStat.Stat(diff,mask=mask).mean})
  row=Image.new('RGB',(1320,372),'#edf0f0');labels=['Browser / recovered vectors','Original SWFs / Ruffle wgpu-webgl','Absolute RGB difference x5']
  for i,(im,label)in enumerate(zip([a,b,Image.eval(diff,lambda p:min(255,p*5))],labels)):
   x=i*440+6;ImageDraw.Draw(row).text((x,5),f'{page}: {label}',fill='#25383b');row.paste(im.resize((426,333)),(x,30))
  rows.append(row)
 canvas=Image.new('RGB',(1320,1144),'#edf0f0')
 for i,row in enumerate(rows):canvas.paste(row,(0,i*372))
 ImageDraw.Draw(canvas).text((6,1124),'Exact 640 x 500 source coordinates; no fitted alignment or pixel-parity threshold. Device-font/rasterization differences remain.',fill='#25383b');canvas.save(out/f'image-comparison{suffix}.png',optimize=True)
(out/'coordinate-comparison.json').write_text(json.dumps({'bestFitRegistrationUsed':False,'thresholdForParity':None,'note':'Native and 2x matching-default comparisons. Footer URL origins excluded from numeric measurements. Device-font metrics, CSS text-shadow and original bitmap vs SVG preview/shadow rasterization differ. No Adobe Flash pixel-parity claim.','measurements':measurements},indent=2)+'\n');print('Compared',len(measurements),'image-export screen pairs.')
