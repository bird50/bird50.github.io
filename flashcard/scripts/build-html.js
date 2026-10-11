import { readFileSync, writeFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const css = read('style.css');
const model = read('model.js').replace(/^export /gm, '');
const app = read('app.js').replace(/^import[^\n]*\n/, '');
const schema = JSON.stringify(JSON.parse(read('deck.schema.json'))).replace(/</g, '\\u003c');
const builtInDeck = JSON.stringify(JSON.parse(read('decks/thailand-77-provinces.deck.json'))).replace(/</g, '\\u003c');
const oxfordDecks = JSON.stringify(JSON.parse(read('decks/oxford3000-all.collection.json')).decks).replace(/</g, '\\u003c');
const js = `(function(){\n'use strict';\nconst DECK_SCHEMA = ${schema};\nconst BUILTIN_THAILAND_DECK = ${builtInDeck};\nconst BUILTIN_OXFORD_DECKS = ${oxfordDecks};\n${model}\n${app}\n})();`.replace(/<\/script/gi, '<\\/script');
const html = read('index.html')
  .replace(/<link rel="stylesheet" href="style.css">|<style id="recall-styles">[\s\S]*?<\/style>/, () => `<style id="recall-styles">${css}</style>`)
  .replace(/<script type="module" src="app.js"><\/script>|<script id="recall-app">[\s\S]*?<\/script>/, () => `<script id="recall-app">${js}</script>`);
writeFileSync(new URL('../index.html', import.meta.url), html);
console.log('Created standalone index.html');
