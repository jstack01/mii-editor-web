import {editWiiValue} from '../compatibility/wiiProfile';
import type {MiiCharacterData} from '../model/MiiCharacterData';
import {pageFor} from './guiScene';
import {colorField,screenFor,type Screen} from './screens';
export const OPTIONS:Readonly<Record<string,readonly string[]>>={eyebrow:['X','Y','Size','Rotation'],eye:['X','Y','Size','Rotation'],nose:['Y','Size'],mouth:['Y','Size'],glasses:['Y','Size'],mustache:['Y','Size'],mole:['X','Y','Size']};
/** UI page state is deliberately separate from the selected binary attribute. */
export class EditorSession {
 screen:Screen=screenFor('basic');page=0;
 constructor(readonly model:MiiCharacterData){}
 navigate(id:string):void {this.screen=screenFor(id);this.page=pageFor(this.model,this.screen);}
 turnPage(delta:number):void {this.page=Math.max(0,Math.min(this.screen.pages-1,this.page+delta));}
 selectItem(index:number):void {if(!Number.isInteger(index)||index<0||index>=this.screen.count)throw Error('Invalid original tile');const field=`${this.screen.prop}Type`;editWiiValue(this.model,field,this.model.frameToValue(field,this.page*this.screen.count+index+1));}
 selectColor(index:number):void {const max=this.screen.palette==='favorite'?12:this.screen.palette==='skin'||this.screen.palette==='eye'||this.screen.palette==='glasses'?6:this.screen.palette==='mouth'?3:8;if(!this.screen.palette||!Number.isInteger(index)||index<0||index>=max)throw Error('Invalid original color');editWiiValue(this.model,colorField(this.screen),index);}
 adjust(name:string):void {const match=/^option_(X|Y|Size|Rotation)_([01])$/.exec(name);if(!match||!OPTIONS[this.screen.prop]?.includes(match[1]!))throw Error('Unsupported original option');const field=this.screen.prop+match[1];editWiiValue(this.model,field,Number(this.model.getValue(field))+(match[2]==='1'?1:-1));}
 toggle(field:'gender'|'mingles'|'hairPart'):void {editWiiValue(this.model,field,this.model.getValue(field)?0:1);}
}
