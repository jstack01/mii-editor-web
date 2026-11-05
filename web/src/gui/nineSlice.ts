import type {Matrix,Rect} from '../render/types';
const SVG='http://www.w3.org/2000/svg';let sequence=0;
export function nineSlicePatches(bounds:Rect,grid:Rect,m:Matrix):{clip:Rect;matrix:Matrix}[]{
 if(m[1]!==0||m[2]!==0||m[0]<=0||m[3]<=0)throw Error('Unverified rotated/reflected GUI scale grid');
 const axis=(lo:number,hi:number,a:number,b:number,scale:number)=>{const source=[lo,a,b,hi],left=a-lo,right=hi-b,cap=Math.min(1,(hi-lo)*scale/(left+right));const target=[lo*scale,lo*scale+left*cap,hi*scale-right*cap,hi*scale];return {source,target};};
 const x=axis(bounds.x,bounds.x+bounds.width,grid.x,grid.x+grid.width,m[0]);const y=axis(bounds.y,bounds.y+bounds.height,grid.y,grid.y+grid.height,m[3]);
 const patches=[];
 for(let j=0;j<3;j++)for(let i=0;i<3;i++){
  const w=x.source[i+1]!-x.source[i]!,h=y.source[j+1]!-y.source[j]!;if(w<=0||h<=0)continue;
  const sx=(x.target[i+1]!-x.target[i]!)/w,sy=(y.target[j+1]!-y.target[j]!)/h;
  if(sx<0||sy<0)throw Error('GUI scale grid collapses');
  patches.push({clip:{x:x.source[i]!,y:y.source[j]!,width:w,height:h},matrix:[sx,0,0,sy,x.target[i]!-sx*x.source[i]!,y.target[j]!-sy*y.source[j]!] as Matrix});
 }
 return patches;
}
export function applyNineSlice(root:SVGSVGElement,group:SVGGElement,bounds:Rect,grid:Rect,matrix:Matrix):void {
 if(matrix[0]===1&&matrix[3]===1)return;
 const defs=root.querySelector('defs')!,content=Array.from(group.childNodes);group.replaceChildren();group.setAttribute('transform',`translate(${matrix[4]} ${matrix[5]})`);group.dataset.scaleGrid='original';
 // Half a target pixel of overlap prevents alpha seams at internal patch edges;
 // original path geometry and outer silhouette are unchanged.
 for(const patch of nineSlicePatches(bounds,grid,matrix)){
  if(patch.matrix[0]===0||patch.matrix[3]===0)continue;
  const id=`gui-grid-${++sequence}`,clip=document.createElementNS(SVG,'clipPath');clip.id=id;clip.setAttribute('clipPathUnits','userSpaceOnUse');const rect=document.createElementNS(SVG,'rect');for(const [k,v]of Object.entries({x:patch.clip.x-.5/patch.matrix[0],y:patch.clip.y-.5/patch.matrix[3],width:patch.clip.width+1/patch.matrix[0],height:patch.clip.height+1/patch.matrix[3]}))rect.setAttribute(k,String(v));rect.setAttribute('shape-rendering','crispEdges');clip.append(rect);defs.append(clip);
  const transformed=document.createElementNS(SVG,'g');transformed.setAttribute('transform',`matrix(${patch.matrix.join(' ')})`);const cropped=document.createElementNS(SVG,'g');cropped.setAttribute('clip-path',`url(#${id})`);content.forEach((c)=>cropped.append(c.cloneNode(true)));transformed.append(cropped);group.append(transformed);
 }
}
