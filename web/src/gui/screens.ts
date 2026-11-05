export const SCREENS = [
 {id:'basic',name:'General',frame:2,prop:'',count:0,pages:1,palette:'favorite',editable:true},
 {id:'size',name:'Body size',frame:3,prop:'',count:0,pages:1,palette:'',editable:false},
 {id:'face',name:'Head',frame:4,prop:'head',count:8,pages:1,palette:'skin',editable:true},
 {id:'face2',name:'Facial features',frame:5,prop:'facialFeatures',count:12,pages:1,palette:'skin',editable:false},
 {id:'hair',name:'Hair',frame:6,prop:'hair',count:12,pages:6,palette:'hair',editable:false},
 {id:'eyebrows',name:'Eyebrows',frame:7,prop:'eyebrow',count:12,pages:2,palette:'hair',editable:false},
 {id:'eyes',name:'Eyes',frame:8,prop:'eye',count:12,pages:4,palette:'eye',editable:false},
 {id:'nose',name:'Nose',frame:9,prop:'nose',count:12,pages:1,palette:'',editable:false},
 {id:'lips',name:'Mouth',frame:10,prop:'mouth',count:12,pages:2,palette:'mouth',editable:false},
 {id:'accessories',name:'Glasses',frame:11,prop:'glasses',count:9,pages:1,palette:'glasses',editable:false},
 {id:'accessories2',name:'Mustache',frame:12,prop:'mustache',count:4,pages:1,palette:'hair',editable:false},
 {id:'accessories3',name:'Mole',frame:13,prop:'mole',count:2,pages:1,palette:'',editable:false},
 {id:'accessories4',name:'Beard',frame:14,prop:'beard',count:4,pages:1,palette:'hair',editable:false},
] as const;
export type Screen = typeof SCREENS[number];
export function screenFor(id:string):Screen {const screen=SCREENS.find((s)=>s.id===id);if(!screen)throw Error(`Unknown original screen ${id}`);return screen;}
