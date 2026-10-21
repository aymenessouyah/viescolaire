/* Fusion trois voies : aucune règle « dernier arrivé gagne ».
 * Les objets sont fusionnés par champ, les listes d'entités par id.
 * Une suppression concurrente à une modification reste un conflit.
 */
(function(root){'use strict';
const M=Symbol('absent'),own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function clone(x){return x===M?M:JSON.parse(JSON.stringify(x));}
function stable(x){if(x===M)return '#ABSENT';if(Array.isArray(x))return '['+x.map(stable).join(',')+']';if(plain(x))return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable(x[k])).join(',')+'}';return JSON.stringify(x);}
const eq=(a,b)=>stable(a)===stable(b),pack=x=>x===M?{absent:true}:{absent:false,value:clone(x)},unpack=x=>x.absent?M:clone(x.value);
const keyed=a=>Array.isArray(a)&&a.every(x=>plain(x)&&typeof x.id==='string')&&new Set(a.map(x=>x.id)).size===a.length;
function merge(base,local,remote,choices={}){
 const conflicts=[];
 function walk(b,l,r,path){
  if(eq(l,r))return clone(l);if(eq(l,b))return clone(r);if(eq(r,b))return clone(l);
  const key=JSON.stringify(path);
  if(plain(l)&&plain(r)&&(plain(b)||b===M)){
   const out=Object.create(null),keys=new Set([...Object.keys(b===M?{}:b),...Object.keys(l),...Object.keys(r)]);
   for(const k of keys){const v=walk(b!==M&&own(b,k)?b[k]:M,own(l,k)?l[k]:M,own(r,k)?r[k]:M,path.concat(k));if(v!==M)out[k]=v;}return out;
  }
  if(keyed(l)&&keyed(r)&&(keyed(b)||b===M)){
   const bb=new Map((b===M?[]:b).map(x=>[x.id,x])),ll=new Map(l.map(x=>[x.id,x])),rr=new Map(r.map(x=>[x.id,x]));
   const ids=new Set([...r.map(x=>x.id),...l.map(x=>x.id),...bb.keys()]),out=[];
   for(const id of ids){const v=walk(bb.has(id)?bb.get(id):M,ll.has(id)?ll.get(id):M,rr.has(id)?rr.get(id):M,path.concat('@'+id));if(v!==M)out.push(v);}return out;
  }
  if(['notions','tags'].includes(path[path.length-1])&&[l,r].every(a=>Array.isArray(a)&&a.every(x=>typeof x==='string'))&&(b===M||(Array.isArray(b)&&b.every(x=>typeof x==='string')))){
   const bs=new Set(b===M?[]:b),ls=new Set(l),rs=new Set(r),all=new Set([...rs,...ls,...bs]);return [...all].filter(id=>{const bv=bs.has(id),lv=ls.has(id),rv=rs.has(id);return lv===rv?lv:lv===bv?rv:lv;});
  }
  if(choices[key]==='local')return clone(l);if(choices[key]==='remote')return clone(r);
  conflicts.push({key,path,base:pack(b),local:pack(l),remote:pack(r)});return clone(l);
 }
 return{value:walk(base===undefined?M:base,local===undefined?M:local,remote===undefined?M:remote,[]),conflicts};
}
const api={merge,equal:eq,clone,stable};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.STI_MERGE=api;
})(typeof window!=='undefined'?window:globalThis);
