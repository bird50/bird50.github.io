import test from 'node:test';
import assert from 'node:assert/strict';
import{parseImport,cleanDeck}from'../model.js';
const deck=()=>({format:'recall.deck',version:1,id:'test',title:'Test',cards:[{id:'a',front:{text:'Question'},back:{text:'Answer'}}]});
test('export/import preserves embedded images and text',()=>{const d=deck();d.cards[0].front={text:'',image:{src:'data:image/png;base64,aGVsbG8=',alt:'test'}};assert.deepEqual(parseImport(JSON.parse(JSON.stringify(cleanDeck(d))))[0],cleanDeck(d))});
test('reject incompatible versions, duplicate card IDs and empty sides',()=>{const d=deck();assert.throws(()=>parseImport({...d,version:2}));assert.throws(()=>parseImport({...d,cards:[...d.cards,...d.cards]}));d.cards[0].back.text=' ';assert.throws(()=>parseImport(d))});
test('reject executable image sources',()=>{for(const src of ['javascript:alert(1)','data:image/svg+xml;base64,PHN2Zz4=','http://example.com/x.png']){const d=deck();d.cards[0].front.image={src,alt:''};assert.throws(()=>parseImport(d))}});
test('validates entire collection before importing',()=>{assert.throws(()=>parseImport({format:'recall.collection',version:1,decks:[deck(),{bad:true}]}));assert.throws(()=>parseImport({format:'recall.collection',version:1,decks:[deck(),deck()]}));assert.equal(parseImport({format:'recall.collection',version:1,decks:[deck(),{...deck(),id:'second'}]}).length,2)});

test('review levels preserve legacy progress and distinguish unsure from remembered',async()=>{
 const {reviewLevel}=await import('../model.js');
 assert.equal(reviewLevel(true),'remembered');
 assert.equal(reviewLevel(false),'unremembered');
 assert.equal(reviewLevel(undefined),'unremembered');
 for(const value of ['unremembered','unsure','remembered'])assert.equal(reviewLevel(value),value);
});

test('random review includes each card once and leaves saved order untouched',async()=>{
 const {shuffleCards}=await import('../model.js');
 const cards=[{id:'a'},{id:'b'},{id:'c'},{id:'d'}];
 const shuffled=shuffleCards(cards,()=>0);
 assert.deepEqual(cards.map(c=>c.id),['a','b','c','d']);
 assert.notDeepEqual(shuffled,cards);
 assert.equal(new Set(shuffled).size,cards.length);
 assert.deepEqual([...shuffled].map(c=>c.id).sort(),cards.map(c=>c.id));
 assert.deepEqual(shuffleCards([]),[]);
 assert.deepEqual(shuffleCards([cards[0]]),[cards[0]]);
});
