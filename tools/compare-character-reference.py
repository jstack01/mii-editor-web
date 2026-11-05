#!/usr/bin/env python3
"""Compare source-aligned browser SVG output with the unmodified SWFs in Ruffle.
No fitted alignment, no pixel-parity threshold. Offline evidence requires Pillow.
Usage: python3 tools/compare-character-reference.py evidence/phase3b
"""
from pathlib import Path
import json,sys
from PIL import Image,ImageChops,ImageDraw,ImageFilter,ImageStat
out=Path(sys.argv[1]);scale=int(sys.argv[2]) if len(sys.argv)>2 else 1;suffix='@2x' if scale==2 else '';assert scale in [1,2];report=json.loads((out/'screenshots/dev-full-rendering.json').read_text());results=[]
rows=[]
for item in report['cases']:
 id=item['id'];svg=Image.open(out/f'screenshots/{id}-aligned{suffix}.png').convert('RGBA');ref=Image.open(out/f"{'reference2x' if scale==2 else 'reference'}/{id}-ruffle.png").convert('RGB')
 # Erode fully opaque vector interiors to avoid background/edge differences.
 # The source shadow is intentionally excluded here (translucent, on GUI chrome).
 mask=svg.getchannel('A').point(lambda a:255 if a==255 else 0).filter(ImageFilter.MinFilter(3 if scale==1 else 5))
 # Character occupies left preview; no GUI imagery imported into our renderer.
 roi=tuple(v*scale for v in (28,90,206,390));mask_roi=Image.new('L',mask.size);mask_roi.paste(mask.crop(roi),roi);mask=mask_roi
 white=Image.new('RGB',svg.size,'white');white.paste(svg,mask=svg.getchannel('A'))
 diff=ImageChops.difference(white,ref);stats=ImageStat.Stat(diff,mask=mask)
 results.append({'id':id,'opaqueInteriorPixels':int(ImageStat.Stat(mask).sum[0]/255),'meanAbsoluteRGBDifference':stats.mean,'roi':roi})
 crop=tuple(v*scale for v in (34,110,202,420));a=white.crop(crop);b=ref.crop(crop);d=Image.new('RGB',svg.size,'white');d.paste(Image.eval(diff,lambda p:min(255,p*6)),mask=mask);d=d.crop(crop)
 row=Image.new('RGB',(1040,360),'#edf0f0');draw=ImageDraw.Draw(row)
 for col,(im,label)in enumerate([(a,'Browser: original SVG vectors'),(b,'Original SWFs in Ruffle canvas'),(d,'RGB difference x6: opaque interiors')]):
  x=col*346+10;draw.text((x,10),f'{id} | {label}',fill='#25383b');row.paste(im.resize((168,310)),(x+70,36))
 rows.append(row)
canvas=Image.new('RGB',(1040,len(rows)*360+38),'#edf0f0')
for i,row in enumerate(rows):canvas.paste(row,(0,i*360))
ImageDraw.Draw(canvas).text((10,len(rows)*360+10),'Recovered source camera, no fitted alignment. Emulator reference; no Adobe Flash pixel-parity claim.',fill='#25383b')
canvas.save(out/f'character-comparison-ruffle{suffix}.png')
metadata={'deviceScaleFactor':scale,'sourceCamera':'AbstractGUIPage: scale .53; x=116-150*.53; y=405-.53*source globalFooting.y','bestFitRegistrationUsed':False,'mask':'Fully opaque SVG alpha, eroded 3x3, restricted to left preview ROI; excludes shadow, edges, translucent lenses and foreground File-button overlap','thresholdForParity':None,'cases':results,'note':'Descriptive interior RGB differences. Inspect full source/reference images for silhouettes, shadow and transparent accessories. Ruffle is an emulator, not Adobe Flash certification.'}
(out/f'coordinate-comparison{suffix}.json').write_text(json.dumps(metadata,indent=2)+'\n');print(json.dumps(metadata,indent=2))
