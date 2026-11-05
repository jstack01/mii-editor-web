#!/usr/bin/env python3
"""Coordinate-aligned screenshot comparison. No best-fit registration or parity claim.
Usage: python3 tools/compare-head-reference.py [project/evidence/phase3a]
Requires Pillow for this offline evidence tool, not for the application.
"""
from pathlib import Path
import json,sys
from PIL import Image,ImageChops,ImageFilter,ImageStat,ImageDraw
out=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[1]/'evidence/phase3a'
svg=Image.open(out/'screenshots/default-head-native.png').convert('RGB')
original=Image.open(out/'reference/original-ruffle-head.png').convert('RGB')
assert svg.size==(300,280),svg.size
roi=(70,30,231,230);offset=(-34,130)
a=svg.crop(roi);b=original.crop(tuple(roi[i]+offset[i%2] for i in range(4)))
mask=Image.eval(a.convert('L'),lambda p:255 if p<249 else 0).filter(ImageFilter.MinFilter(5))
diff=ImageChops.difference(a,b);stats=ImageStat.Stat(diff,mask=mask)
masked=Image.new('RGB',a.size,'white');masked.paste(Image.eval(diff,lambda p:min(255,p*6)),mask=mask)
compare=Image.new('RGB',(1062,486),'#edf0f0');draw=ImageDraw.Draw(compare)
for idx,(image,label)in enumerate([(a,'SVG: original-vector proof'),(b,'Unmodified SWF: Ruffle canvas'),(masked,'RGB difference x6 (interior only)')]):
 x=idx*354+16;draw.text((x,12),label,fill='#25383b');compare.paste(image.resize((322,400),Image.Resampling.NEAREST),(x,36))
draw.text((724,444),'White = excluded; dark = close match',fill='#25383b')
draw.text((16,468),'Aligned from recovered source coordinates; emulator comparison is not Adobe Flash pixel-parity certification.',fill='#25383b')
compare.save(out/'head-comparison-ruffle.png')
comparison={'sourceRoi':roi,'originalGuiOffset':offset,'bestFitImageRegistrationUsed':False,'mask':'SVG luminance <249, eroded by 5x5 minimum filter','maskedPixelCount':int(ImageStat.Stat(mask).sum[0]/255),'meanAbsoluteRGBDifference':stats.mean,'thresholdForParity':None,'note':'Descriptive emulator comparison only; inspect original screenshots and unmasked regions separately.'}
(out/'coordinate-comparison.json').write_text(json.dumps(comparison,indent=2)+'\n')
print(json.dumps(comparison))
