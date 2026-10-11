"""Convert the user-supplied CSV into four Recall decks, preserving source content."""
import csv, json, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
source=ROOT/'data/oxford3000/source.csv'
rows=list(csv.DictReader(source.open(encoding='utf-8-sig',newline='')))
levels=['A1','A2','B1','B2']
required=['ลำดับ','คำศัพท์','ชนิดคำ','ระดับ CEFR','คำแปลไทย','ประโยคตัวอย่าง','คำแปลประโยค']
assert len({r['ลำดับ'] for r in rows})==len(rows), 'Duplicate row identifiers'
for row in rows:
    assert None not in row and all(row.get(k,'').strip() for k in required), 'Missing or malformed fields'
    assert all(level in levels for level in row['ระดับ CEFR'].split('/')), 'Unexpected CEFR label'
decks=[]
for level in levels:
    cards=[]
    for row in rows:
        if level not in row['ระดับ CEFR'].split('/'):continue
        back=f"{row['คำแปลไทย']}\n\nตัวอย่าง: {row['ประโยคตัวอย่าง']}\n{row['คำแปลประโยค']}"
        if '/' in row['ระดับ CEFR']:
            back+=f"\n\nระดับในต้นฉบับ: {row['ระดับ CEFR']} (ต้นฉบับไม่ได้แยกความหมายและชนิดคำตามระดับ)"
        cards.append({'id':f"oxford3000-{level.lower()}-row-{row['ลำดับ']}",'front':{'text':f"{row['คำศัพท์']}\n({row['ชนิดคำ']})"},'back':{'text':back}})
    deck={'format':'recall.deck','version':1,'id':f'oxford3000-{level.lower()}-user-v1','title':f'Oxford 3000 · {level}','description':f"{len(cards)} การ์ดจากไฟล์ oxford3000.csv ที่ผู้ใช้ให้มา • คำแปลไทยและประโยคตัวอย่างตามต้นฉบับ • คำหลายระดับอยู่ทุกระดับที่ระบุ ไม่ได้ตรวจรับรองการจัดระดับหรือคำแปลโดย Oxford",'tags':['ภาษาอังกฤษ','Oxford 3000',level],'cards':cards}
    decks.append(deck)
    (ROOT/f'decks/oxford3000-{level.lower()}.deck.json').write_text(json.dumps(deck,ensure_ascii=False,indent=2))
collection={'format':'recall.collection','version':1,'decks':decks}
(ROOT/'decks/oxford3000-all.collection.json').write_text(json.dumps(collection,ensure_ascii=False,indent=2))
report={'source':'oxford3000.csv (user supplied)','sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'source_rows':len(rows),'unique_headwords':len({r['คำศัพท์'] for r in rows}),'multiple_level_rows':sum('/' in r['ระดับ CEFR'] for r in rows),'cards_per_level':{l:len(d['cards']) for l,d in zip(levels,decks)},'total_cards':sum(len(d['cards']) for d in decks),'policy':'Include each source row in every explicitly listed level; preserve translations, examples and part-of-speech labels without inferring sense-to-level mappings.'}
(ROOT/'data/oxford3000/conversion-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
