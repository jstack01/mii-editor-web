import type { BlurFilter } from './types';
/** SWF specification: centered odd-sized box kernels; not a Gaussian substitute.
 * The source shadow is exactly 25 x 15, one pass. Fractional/unseen kernels fail
 * explicitly until their subpixel rules have been verified. */
export function blurKernels(filter:BlurFilter):readonly {order:readonly[number,number];values:string;divisor:number}[] {
  if(!Number.isInteger(filter.passes)||filter.passes<1)throw new Error('Invalid original blur pass count');
  for(const size of [filter.blurX,filter.blurY])if(!Number.isInteger(size)||size<1||size%2!==1)throw new Error('Unverified fractional/even original blur kernel');
  const kernels=[];
  for(let pass=0;pass<filter.passes;pass++){
    if(filter.blurX>1)kernels.push({order:[filter.blurX,1] as const,values:new Array(filter.blurX).fill('1').join(' '),divisor:filter.blurX});
    if(filter.blurY>1)kernels.push({order:[1,filter.blurY] as const,values:new Array(filter.blurY).fill('1').join(' '),divisor:filter.blurY});
  }
  return kernels;
}
