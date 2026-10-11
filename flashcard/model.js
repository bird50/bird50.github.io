export const FORMAT='recall.deck';
export function validImage(src){return typeof src==='string'&&(/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(src)||/^https:\/\/[^\s]+$/.test(src));}
export function validateDeck(d){
 if(!d||d.format!==FORMAT||d.version!==1)throw Error('รูปแบบไม่ถูกต้อง: ต้องเป็น recall.deck version 1');
 if(typeof d.id!=='string'||!d.id.trim()||typeof d.title!=='string'||!d.title.trim())throw Error('สำรับต้องมี id และ title');
 if(d.description!==undefined&&typeof d.description!=='string')throw Error('description ต้องเป็นข้อความ');
 if(d.tags!==undefined&&(!Array.isArray(d.tags)||d.tags.some(t=>typeof t!=='string')))throw Error('tags ต้องเป็นรายการข้อความ');
 if(!Array.isArray(d.cards)||d.cards.length>10000)throw Error('cards ต้องเป็นรายการ ไม่เกิน 10,000 ใบ');
 const ids=new Set();for(const c of d.cards){if(!c||typeof c.id!=='string'||!c.id.trim()||ids.has(c.id))throw Error('id ของการ์ดต้องไม่ว่างและไม่ซ้ำกัน');ids.add(c.id);for(const side of ['front','back']){const s=c[side];if(!s||typeof s.text!=='string'||(!s.text.trim()&&!s.image))throw Error('แต่ละด้านต้องมีข้อความหรือรูปภาพ');if(s.image&&(!validImage(s.image.src)||typeof s.image.alt!=='string'))throw Error('รูปภาพต้องเป็น HTTPS หรือ data URL (PNG, JPEG, WebP, GIF) พร้อม alt');}}
 return d;
}
export function cleanDeck(d){validateDeck(d);return{format:FORMAT,version:1,id:d.id,title:d.title.trim(),description:d.description||'',tags:d.tags||[],cards:d.cards.map(c=>({id:c.id,front:side(c.front),back:side(c.back)}))};}
function side(s){return{text:s.text,...(s.image?{image:{src:s.image.src,alt:s.image.alt}}:{})};}
export function parseImport(value){const list=value?.format==='recall.collection'&&value.version===1?value.decks:[value];if(!Array.isArray(list))throw Error('ไม่พบสำรับ');const decks=list.map(cleanDeck);if(new Set(decks.map(d=>d.id)).size!==decks.length)throw Error('id สำรับซ้ำกันในไฟล์');return decks;}

export function reviewLevel(value){
 if(value===true||value==='remembered')return 'remembered';
 if(value==='unsure')return 'unsure';
 return 'unremembered';
}

// Fisher–Yates: visit every card once while preserving the saved deck order.
export function shuffleCards(cards,random=Math.random){
 const result=[...cards];
 for(let i=result.length-1;i>0;i--){
  const j=Math.floor(random()*(i+1));
  [result[i],result[j]]=[result[j],result[i]];
 }
 return result;
}
