from pathlib import Path
import json,argparse
parser=argparse.ArgumentParser(description='Generate renderer cases independently from the original recovered bit schema.');parser.add_argument('--project-root',type=Path,default=Path(__file__).resolve().parents[1]);args=parser.parse_args();root=args.project_root.resolve();out=root
s=json.loads((root/'evidence/phase2/schema.json').read_text());default=json.loads((root/'evidence/default-character.json').read_text())['hex']
hat_manifest=json.loads((root/'evidence/manifests/assets.json').read_text())['symbols']['344']['timeline']['frames']
hat_frame=next(f['frame'] for f in hat_manifest if f['displayList']);hat_value=s['valueToFrameLookup']['hairType'].index(hat_frame-1)
cases=[
 ('default','Original default',{},128),
 ('feminine','Feminine / tinted lenses',dict(gender=1,headType=3,skinColor=2,hairType=20,hairColor=6,hairPart=1,eyebrowType=18,eyebrowColor=6,eyeType=31,eyeColor=4,noseType=8,mouthType=9,mouthColor=2,glassesType=6,glassesColor=3,favoriteColor=7,height=84,weight=46,facialFeaturesType=3),128),
 ('compact','Minimum size / dark skin',dict(height=0,weight=0,headType=7,skinColor=5,hairType=70,hairColor=4,hairPart=1,eyebrowType=23,eyeType=47,eyeColor=5,noseType=11,mouthType=22,glassesType=8,glassesColor=5,beardType=3,mustacheType=2,facialHairColor=7,moleType=1,facialFeaturesType=11,favoriteColor=11),128),
 ('maximum','Maximum size / gold pants',dict(height=127,weight=127,gender=1,headType=2,skinColor=1,hairType=15,hairColor=7,eyeType=17,eyeColor=2,noseType=5,mouthType=14,mouthColor=1,favoriteColor=2,facialFeaturesType=6),0),
 ('accessories','Facial hair / mole / glasses',dict(headType=6,skinColor=4,hairType=48,hairPart=1,hairColor=2,eyebrowType=21,eyebrowColor=2,eyeType=42,eyeColor=3,noseType=7,mouthType=13,mouthColor=2,glassesType=4,glassesColor=4,mustacheType=1,beardType=2,facialHairColor=3,moleType=1,moleX=12,moleY=24,moleSize=8,favoriteColor=8,height=30,weight=110,facialFeaturesType=9),128),
 ('foreign','Short / wide / blue pants',dict(gender=1,height=0,weight=127,headType=4,skinColor=3,hairType=66,eyeType=10,noseType=10,mouthType=7,favoriteColor=5,facialFeaturesType=4),192),
 ('spacing','Tall / thin / layer thresholds',dict(height=127,weight=0,headType=1,eyeX=12,eyeY=0,eyeRotation=7,eyeSize=7,eyebrowX=12,eyebrowY=18,eyebrowSize=8,eyebrowRotation=11,hairType=45,noseSize=8,mouthSize=8,favoriteColor=4,moleType=1,moleX=16,moleY=30),224),
 ('hat','Original hat / favorite color',dict(headType=5,hairType=hat_value,hairColor=5,favoriteColor=6,skinColor=1,eyeType=36,noseType=3,mouthType=20,facialFeaturesType=2,gender=1,height=100,weight=90),64)
]
items=[]
for id,label,changes,first_id in cases:
 b=bytearray.fromhex(default);words=[int.from_bytes(b[i:i+2],'big') for i in range(0,74,2)]
 for name,value in changes.items():
  f=s['fields'][name];v=max(f['min'],min(f['max'],value));mask=((1<<f['width'])-1)<<f['shift'];words[f['word']]=(words[f['word']]&~mask)|(v<<f['shift'])
 b=bytearray().join(w.to_bytes(2,'big') for w in words);b[24]=first_id
 items.append(dict(id=id,label=label,hex=b.hex(),changes=changes,idFirstByte=first_id))
text="// Renderer comparison cases derived independently from the original bit schema.\nexport const RENDER_CASES = "+json.dumps(items,indent=2)+" as const;\n"
(out/'web/src/generated/render-cases.ts').write_text(text)
(out/'web/src/generated/render-cases.json').write_text(json.dumps(items,indent=2)+'\n')
print('Reference cases',len(items),'hat frame',hat_frame,'packed hair value',hat_value)
