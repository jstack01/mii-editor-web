import { expect, it } from 'vitest';
import bodySource from '../../../EXTRACTED-SWF/assets.swf/scripts/mii/display/controllers/MiiBody.as?raw';
import { CHARACTER_ASSETS as assets, CHARACTER_RULES as rules } from '../generated/character-assets';
import { MII_FIELDS } from '../generated/mii-schema';
import { RENDER_CASES } from '../generated/render-cases';
import { DEFAULT_MII_HEX } from '../generated/default-character';
import { MiiCharacterData } from '../model/MiiCharacterData';
import { buildCharacterScene, flattenScene } from './headScene';
import { multiply, transformPoint, transformBounds } from './geometry';
import { sizeRatios } from './bodyScene';
import { blurKernels } from './filters';
import type { SceneNode } from './types';
const model=()=>MiiCharacterData.fromHex(DEFAULT_MII_HEX);
const nodes=(m=model())=>flattenScene(buildCharacterScene(m));
const find=(ns:SceneNode[],path:string)=>ns.find((n)=>n.path===path)!;
const near=(actual:readonly number[],expected:readonly number[])=>{expect(actual.length).toBe(expected.length);actual.forEach((v,i)=>expect(v).toBeCloseTo(expected[i]!,9));};
it('recovers every MiiBody range, joint anchor and color directly from original ActionScript',()=>{
 for(const [name,range] of Object.entries(rules.body!.ranges))expect(bodySource).toContain(`${name}:Range = new Range(${range.join(',')})`);
 for(const [name,pt] of Object.entries(rules.body!.points))expect(bodySource).toContain(`${name}:Point = new Point(${pt.join(',')})`);
 for(const [name,c] of Object.entries(rules.body!.colors))expect(bodySource).toContain(`${name}:ColorTransform = new ColorTransform(${[...c.multipliers,...c.offsets].join(',')})`);
});
it('keeps original root/body layer ordering, gender frames and shadow metadata',()=>{
 const m=model(),scene=buildCharacterScene(m),ns=flattenScene(scene);
 expect(scene.roots.map((n)=>[n.name,n.depth])).toEqual([['headback',1],['body',3],['head',17]]);
 expect(find(ns,'body').children.map((n)=>[n.name,n.depth])).toEqual([['pants',1],['shadow',11],['shirt',13]]);
 expect(find(ns,'body.shadow').filters).toEqual([{kind:'blur',blurX:25,blurY:15,passes:1}]);
 expect(find(ns,'body.shadow').color.multipliers[3]).toBe(179/256);
 expect(find(ns,'body.shirt.torso').frame).toBe(1);m.setValue('gender',1);expect(find(nodes(m),'body.shirt.torso').frame).toBe(2);
});
for(const height of [0,64,127])for(const weight of [0,64,127])it(`preserves body joints, neck and footing at height ${height}, weight ${weight}`,()=>{
 const m=model();m.setValue('height',height);m.setValue('weight',weight);const scene=buildCharacterScene(m),ns=flattenScene(scene);
 const body=find(ns,'body'),shirt=find(ns,'body.shirt'),torso=find(ns,'body.shirt.torso'),pants=find(ns,'body.pants');
 const h=.4+.6*height/127,w=(.45+.55*weight/127)*(.6+.4*height/127);
 near(sizeRatios(height,weight,rules.body!),[h,w]);near([Math.hypot(...find(ns,'body.pants.foot_right').matrix.slice(0,2)),Math.hypot(...find(ns,'body.pants.foot_right').matrix.slice(2,4))],[w,w]);near([torso.matrix[0],torso.matrix[3]],[w,h]);
 for(const [parent,source,left,right,anchor]of [['shirt','torso','upperarm_left','upperarm_right',[20,-64]],['shirt','upperarm_right','lowerarm_left','lowerarm_right',[50,0]],['shirt','lowerarm_right','hand_left','hand_right',[48,-1]],['pants','torso','leg_left','leg_right',[20,3]],['pants','leg_right','foot_left','foot_right',[-2,95]]] as const){
  const pt=transformPoint(find(ns,`body.${parent}.${source}`).matrix,anchor[0],anchor[1]);
  near(find(ns,`body.${parent}.${right}`).matrix.slice(4),pt);near(find(ns,`body.${parent}.${left}`).matrix.slice(4),[-pt[0],pt[1]]);
 }
 near(transformPoint(multiply(multiply(body.matrix,shirt.matrix),torso.matrix),0,-75),[149.91019973754882,220]);
 const pb=transformBounds(pants.matrix,pants.bounds!),shadow=find(ns,'body.shadow');expect(shadow.matrix[5]).toBeCloseTo(pb.y+pb.height,9);
 near(scene.footing!,transformPoint(body.matrix,shadow.matrix[4],shadow.matrix[5]));
 expect(body.matrix.slice(0,4)).toEqual([1.7960052490234375,0,0,1.7952423095703125]);
});
it('preserves pants ID classifications at every boundary and all favorite colors',()=>{
 for(const [id,name] of [[0,'specialColor'],[31,'specialColor'],[32,'normalColor'],[63,'normalColor'],[64,'specialColor'],[95,'specialColor'],[96,'normalColor'],[191,'normalColor'],[192,'foreignColor'],[223,'foreignColor'],[224,'normalColor'],[255,'normalColor']] as const){const m=model();const bytes=m.id;bytes[0]=id;m.setHex('id',bytes.map((v)=>v.toString(16).padStart(2,'0')).join(''));expect(find(nodes(m),'body.pants').color).toEqual(rules.body!.colors[name]);}
 for(let color=0;color<12;color++){const m=model();m.setValue('favoriteColor',color);const ns=nodes(m);expect(find(ns,'body.shirt').color).toEqual(rules.palettes.favoriteColors![color]);expect(find(ns,'head.hats').color).toEqual(rules.palettes.favoriteColors![color]);}
});
it('renders every legal numeric value without missing assets, and preserves all original timelines',()=>{
 const covered=new Map<number,Set<number>>();
 const record=(m:MiiCharacterData)=>{for(const n of nodes(m)){if(n.kind==='sprite'){if(!covered.has(n.symbolId))covered.set(n.symbolId,new Set());covered.get(n.symbolId)!.add(n.frame);}expect(n.matrix.every(Number.isFinite)).toBe(true);}};
 for(const [field,definition]of Object.entries(MII_FIELDS))for(let v=definition.min;v<=definition.max;v++){const m=model();m.setValue(field,v);record(m);}
 for(let head=0;head<8;head++)for(let feature=0;feature<12;feature++){const m=model();m.setValue('headType',head);m.setValue('facialFeaturesType',feature);record(m);}
 for(let head=0;head<8;head++)for(let beard=0;beard<4;beard++){const m=model();m.setValue('headType',head);m.setValue('beardType',beard);record(m);}
 for(const asset of Object.values(assets.symbols))if(asset.kind==='sprite'){expect(asset.frames.every((frame)=>frame!==null)).toBe(true);expect([...covered.get(asset.id)??[]].sort((a,b)=>a-b),`all frames symbol ${asset.id}`).toEqual(asset.frames.map((_,i)=>i+1));}
});
it('preserves tint ownership and source multiply behavior across all palettes and frames',()=>{
 for(const [field,palette,path] of [['skinColor','skinColors','head.face'],['hairColor','hairColors','head.hairFront'],['eyebrowColor','hairColors','head.eyebrowsLeft'],['eyeColor','eyeColors','head.eyesLeft.eyeball'],['facialHairColor','hairColors','head.beard']] as const)for(let c=0;c<rules.palettes[palette]!.length;c++){const m=model();m.setValue(field,c);expect(find(nodes(m),path).color).toEqual(rules.palettes[palette]![c]);}
 for(let f=0;f<12;f++){const m=model();m.setValue('facialFeaturesType',f);expect(find(nodes(m),'head.features').blendMode).toBe(f<3?1:3);}
 for(let g=0;g<9;g++){const m=model();m.setValue('glassesType',g);m.setValue('glassesColor',4);const ns=nodes(m);expect(find(ns,'head.glasses.lenses').color).toEqual(rules.palettes.glassesColors![4]);if(m.getFrame('glassesType')<7)expect(find(ns,'head.glasses').color).toEqual(rules.palettes.glassesColors![4]);}
});
it('implements the original single-pass centered box blur without substituting a Gaussian',()=>{
 const kernels=blurKernels({kind:'blur',blurX:25,blurY:15,passes:1});expect(kernels.map((k)=>[k.order,k.divisor])).toEqual([[[25,1],25],[[1,15],15]]);expect(kernels[0]!.values.split(' ')).toHaveLength(25);
 expect(()=>blurKernels({kind:'blur',blurX:2,blurY:15,passes:1})).toThrow(/Unverified/);
});
it('uses independently packed representative fixtures consistent with the existing data model',()=>{
 for(const fixture of RENDER_CASES){const m=model();for(const [field,value]of Object.entries(fixture.changes))m.setValue(field,value);const id=m.id;id[0]=fixture.idFirstByte;m.setHex('id',id.map((v)=>v.toString(16).padStart(2,'0')).join(''));expect(m.toHex(),fixture.id).toBe(fixture.hex);expect(nodes(m).some((n)=>n.path==='body.shadow')).toBe(true);}
});

it('restores the two FFDec-promoted tiny strokes to the recorded SWF width',()=>{for(const id of [162,217]){const shape=assets.symbols[id]!;if(shape.kind!=='shape')throw Error('Missing shape');expect(shape.markup).not.toContain('ffdec:');expect(shape.markup).toContain('stroke-width="0.05"');}});
