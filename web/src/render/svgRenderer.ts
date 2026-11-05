import { blurKernels } from './filters';
import { CHARACTER_ASSETS } from '../generated/character-assets';
import { concatenateColors, IDENTITY_COLOR, colorMatrix, isIdentityColor } from './color';
import { IDENTITY, matrixAttribute, multiply, transformPoint } from './geometry';
import type { AssetCatalog, ColorTransform, HeadScene, Matrix, SceneNode } from './types';

const SVG='http://www.w3.org/2000/svg';
let sequence=0;
function svgElement<K extends keyof SVGElementTagNameMap>(name:K,attrs:Record<string,string|number>={}):SVGElementTagNameMap[K] {
  const element=document.createElementNS(SVG,name);
  for(const [key,value]of Object.entries(attrs)) element.setAttribute(key,String(value));
  return element;
}
export function renderHeadSvg(scene:HeadScene,options:{diagnostics?:boolean;catalog?:AssetCatalog}={}):SVGSVGElement {
  const catalog=options.catalog??CHARACTER_ASSETS;const prefix=`mii-${++sequence}-`;let effect=0;
  const root=svgElement('svg',{viewBox:`${scene.viewBox.x} ${scene.viewBox.y} ${scene.viewBox.width} ${scene.viewBox.height}`,role:'img','aria-label':scene.mode==='full'?'Mii character rendered from original Flash vectors':'Mii head rendered from original Flash vectors','color-interpolation':'sRGB','data-renderer':'original-vectors'});
  const title=svgElement('title');title.textContent=scene.mode==='full'?'Complete Mii character · original vector renderer':'Mii head · original vector renderer';root.append(title);
  const defs=svgElement('defs');root.append(defs);const defined=new Set<number>();
  const diagnostics:{node:SceneNode;world:Matrix}[]=[];
  const defineShape=(id:number)=>{
    if(defined.has(id))return;
    const shape=catalog.symbols[id];if(!shape||shape.kind!=='shape')throw new Error(`Missing original vector shape ${id}.`);
    const parsed=new DOMParser().parseFromString(`<svg xmlns="${SVG}">${shape.markup.replaceAll('__MII__',prefix)}</svg>`,'image/svg+xml');
    if(parsed.querySelector('parsererror'))throw new Error(`Invalid extracted SVG shape ${id}.`);
    const definition=svgElement('g',{id:`${prefix}shape-${id}`,'data-source-shape':id});
    for(const child of Array.from(parsed.documentElement.childNodes))definition.append(document.importNode(child,true));
    defs.append(definition);defined.add(id);
  };
  const applyColor=(group:SVGGElement,node:SceneNode,color:ColorTransform)=>{
    if(isIdentityColor(color)||!node.bounds)return;
    const b=node.bounds;const id=`${prefix}color-${++effect}`;
    const filter=svgElement('filter',{id,filterUnits:'userSpaceOnUse',x:b.x-1,y:b.y-1,width:b.width+2,height:b.height+2,'color-interpolation-filters':'sRGB'});
    filter.append(svgElement('feColorMatrix',{type:'matrix',values:colorMatrix(color).join(' ')}));defs.append(filter);group.setAttribute('filter',`url(#${id})`);
  };
  const maskGeometry=(clip:SVGClipPathElement,node:SceneNode,parentMatrix:Matrix):void=>{
    const current=multiply(parentMatrix,node.matrix);
    if(node.kind==='sprite'){for(const child of node.children)maskGeometry(clip,child,current);return;}
    defineShape(node.symbolId);
    const definition=defs.querySelector(`[id="${prefix}shape-${node.symbolId}"]`)!;
    // SVG clipPath does not reliably accept nested <g>/<use> in all engines.
    // Flatten original filled paths into clipPath user space without recentering.
    const visit=(element:Element,matrix:Matrix)=>{
      const transform=(element as SVGGraphicsElement).transform?.baseVal.consolidate()?.matrix;
      const own:Matrix=transform?[transform.a,transform.b,transform.c,transform.d,transform.e,transform.f]:IDENTITY;
      const next=multiply(matrix,own);
      if(element.localName==='defs')return;
      if(element.localName==='path'){
        const stroke=element.getAttribute('stroke');
        if(stroke&&stroke!=='none')throw new Error('Stroke-only masks require explicit outline conversion.');
        const path=svgElement('path',{d:element.getAttribute('d')??'',transform:matrixAttribute(next),'clip-rule':element.getAttribute('fill-rule')??'nonzero'});
        clip.append(path);
      }else for(const child of Array.from(element.children))visit(child,next);
    };
    for(const child of Array.from(definition.children))visit(child,current);
  };
  const render=(node:SceneNode,parentWorld:Matrix,parentColor:ColorTransform,forMask=false):SVGGElement=>{
    const world=multiply(parentWorld,node.matrix);const color=concatenateColors(parentColor,node.color);
    const group=svgElement('g',{transform:matrixAttribute(node.matrix),'data-instance-path':node.path,'data-symbol-id':node.symbolId,'data-frame':node.frame,'data-depth':node.depth,'data-blank':String(node.bounds===null)});
    if(!node.visible){group.setAttribute('display','none');return group;}
    if(node.blendMode===3&&!forMask)group.style.mixBlendMode='multiply';
    else if(node.blendMode!==1&&node.blendMode!==2&&!forMask)throw new Error(`Unsupported blend mode ${node.blendMode} at ${node.path}.`);
    if(node.kind==='shape'){
      defineShape(node.symbolId);group.append(svgElement('use',{href:`#${prefix}shape-${node.symbolId}`}));
      if(!forMask)applyColor(group,node,color);
    } else {
      const masks:{depth:number;end:number;id:string}[]=[];
      for(const child of node.children){
        if(child.clipDepth!==null){
          const id=`${prefix}clip-${++effect}`;const clip=svgElement('clipPath',{id,clipPathUnits:'userSpaceOnUse'});
          maskGeometry(clip,child,IDENTITY);defs.append(clip);masks.push({depth:child.depth,end:child.clipDepth,id});continue;
        }
        let rendered:SVGElement=render(child,world,color,forMask);
        for(const mask of masks.filter((m)=>child.depth>m.depth&&child.depth<=m.end)){
          const wrapper=svgElement('g',{'clip-path':`url(#${mask.id})`});wrapper.append(rendered);rendered=wrapper;
        }
        group.append(rendered);
      }
    }
    if(!forMask&&node.filters?.length&&node.bounds){
      const marginX=node.filters.reduce((sum,f)=>sum+f.blurX*f.passes,0)+2;
      const marginY=node.filters.reduce((sum,f)=>sum+f.blurY*f.passes,0)+2;
      const b=node.bounds;const id=`${prefix}blur-${++effect}`;
      const filter=svgElement('filter',{id,filterUnits:'userSpaceOnUse',x:b.x-marginX,y:b.y-marginY,width:b.width+2*marginX,height:b.height+2*marginY,'color-interpolation-filters':'sRGB','data-original-blur':node.filters.map((f)=>`${f.blurX}x${f.blurY}/${f.passes}`).join(',')});
      for(const f of node.filters)for(const kernel of blurKernels(f))filter.append(svgElement('feConvolveMatrix',{order:kernel.order.join(' '),kernelMatrix:kernel.values,divisor:kernel.divisor,edgeMode:'none',preserveAlpha:'false',kernelUnitLength:'1 1'}));
      defs.append(filter);
      // An outer wrapper keeps original local filter coordinates independent of
      // the node placement and preserves the source filter's alpha multiplier.
      const wrapper=svgElement('g',{filter:`url(#${id})`});
      for(const element of Array.from(group.childNodes))wrapper.append(element);
      group.append(wrapper);
    }
    if(!forMask&&node.name)diagnostics.push({node,world});
    return group;
  };
  const artwork=svgElement('g',{'data-artwork':scene.mode==='full'?'character':'head'});artwork.style.isolation='isolate';
  for(const node of scene.roots)artwork.append(render(node,IDENTITY,IDENTITY_COLOR));root.append(artwork);
  // Vite eliminates this branch and diagnostic artwork in production builds.
  if(import.meta.env.DEV&&options.diagnostics){
    const overlay=svgElement('g',{'data-diagnostics':'alignment','pointer-events':'none'});
    overlay.append(svgElement('path',{d:`M0 0H${scene.sourceStage.width} M0 0V${scene.sourceStage.height}`,stroke:'#aa3344','stroke-width':1,fill:'none'}));
    const origin=svgElement('text',{x:4,y:12,fill:'#aa3344','font-size':8});origin.textContent='source origin (0,0)';overlay.append(origin);
    for(const {node,world}of diagnostics){
      const g=svgElement('g',{transform:matrixAttribute(world),'data-diagnostic-part':node.path});
      if(node.bounds){const b=node.bounds;g.append(svgElement('rect',{...b,fill:'none',stroke:'#237ca3','stroke-width':0.65,'vector-effect':'non-scaling-stroke','stroke-dasharray':'3 2'}));}
      g.append(svgElement('path',{d:'M-3 0H3 M0-3V3',stroke:node.bounds?'#c12e4a':'#777','stroke-width':0.8,'vector-effect':'non-scaling-stroke'}));
      overlay.append(g);
      if(node.path==='head'||node.path==='headback'||(node.bounds&&node.path.split('.').length===2)){
        const [x,y]=transformPoint(world,0,0);const text=svgElement('text',{x:x+4,y:y-4,fill:'#194a62','font-size':6.5});text.textContent=node.path;overlay.append(text);
      }
    }
    root.append(overlay);
  }
  return root;
}
