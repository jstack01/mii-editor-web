export type Matrix = readonly [number, number, number, number, number, number];
export interface Rect { x: number; y: number; width: number; height: number }
export interface ColorTransform { multipliers: readonly [number, number, number, number]; offsets: readonly [number, number, number, number] }
export interface BlurFilter {kind:'blur';blurX:number;blurY:number;passes:number}
export interface Placement {
  depth: number; matrix: Matrix; color: ColorTransform; name: string | null;
  symbolId: number; clipDepth: number | null; blendMode: number; visible: boolean; filters?: readonly BlurFilter[];
}
export interface ShapeAsset { kind: 'shape'; id: number; bounds: Rect; markup: string; sourcePath: string; sourceSha256: string }
export interface SpriteAsset { kind: 'sprite'; id: number; className: string | null; frames: readonly (readonly Placement[] | null)[] }
export type CharacterAsset = ShapeAsset | SpriteAsset;
export interface AssetCatalog { sourceHashes: Record<string, string>; roots: readonly Placement[]; symbols: Readonly<Record<string, CharacterAsset>> }
export interface BodyRules {ranges:Readonly<Record<string,readonly[number,number]>>;points:Readonly<Record<string,readonly[number,number]>>;colors:Readonly<Record<string,ColorTransform>>;baseNeckY:number}
export interface RenderRules {
  ranges: Readonly<Record<string, readonly [number, number]>>;
  palettes: Readonly<Record<string, readonly ColorTransform[]>>;
  body?: BodyRules; faceShapeOffsets: readonly number[]; baseHeadY: number; nativeWidth: number; nativeHeight: number;
}
export interface SceneNode extends Placement {
  path: string; frame: number; kind: 'shape' | 'sprite'; children: SceneNode[]; bounds: Rect | null;
}
export interface HeadScene { roots: SceneNode[]; sourceStage: Rect; viewBox: Rect; mode?:'head'|'full'; footing?:readonly[number,number] }
