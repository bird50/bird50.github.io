"""Render geographic polygons (not AI-generated geography) into offline PNG cards.
Run with a Python environment containing Pillow: python scripts/create-thailand-deck.py
"""
import base64, hashlib, io, json, math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parent.parent
features = json.loads((ROOT/'data/thailand-provinces.geojson').read_text())['features']
assert len(features) == len({f['properties']['ADM1_PCODE'] for f in features}) == 77
COS = math.cos(math.radians(13))
def project(point): return (point[0]*COS, -point[1])
def polygons(f):
    geom=f['geometry']; coords=geom['coordinates']
    return [[list(map(project, ring)) for ring in poly] for poly in (coords if geom['type']=='MultiPolygon' else [coords])]
shapes=[polygons(f) for f in features]
def bounds(shape):
    points=[p for poly in shape for ring in poly for p in ring]
    return min(p[0] for p in points), min(p[1] for p in points), max(p[0] for p in points), max(p[1] for p in points)
world=bounds([poly for shape in shapes for poly in shape])
W,H=1000,880
SEA='#f0f6f8';LAND='#d7e3df';EDGE='#77918b';HIGHLIGHT='#ed7751'
fontpath='/System/Library/Fonts/Helvetica.ttc'
def font(n): return ImageFont.truetype(fontpath,n)
def render_panel(size, region, target):
    w,h=size; x0,y0,x1,y1=region
    scale=min((w-24)/(x1-x0),(h-24)/(y1-y0))
    ox=(w-(x1-x0)*scale)/2;oy=(h-(y1-y0)*scale)/2
    def xy(p):return (round(ox+(p[0]-x0)*scale),round(oy+(p[1]-y0)*scale))
    im=Image.new('RGB',size,SEA);draw=ImageDraw.Draw(im)
    for idx in [i for i in range(77) if i!=target]+[target]:
        for poly in shapes[idx]:
            draw.polygon([xy(p) for p in poly[0]],fill=HIGHLIGHT if idx==target else LAND,outline='#a94428' if idx==target else EDGE,width=2 if idx==target else 1)
            for hole in poly[1:]:draw.polygon([xy(p) for p in hole],fill=SEA,outline=EDGE)
    return im,xy
cards=[]; manifest=[]
for idx,f in enumerate(features):
    p=f['properties']; code=p['ADM1_PCODE']; name=p['ADM1_TH']; bbox=bounds(shapes[idx])
    image=Image.new('RGB',(W,H),'#ffffff');draw=ImageDraw.Draw(image)
    draw.text((35,24),'THAILAND / PROVINCE CHALLENGE',font=font(24),fill='#294b44')
    draw.rounded_rectangle((35,70,62,97),radius=6,fill=HIGHLIGHT)
    draw.text((74,72),'Which province is highlighted?',font=font(21),fill='#526c65')
    overview,xy=render_panel((495,700),world,idx);image.paste(overview,(25,120))
    # Same orientation, local geographic context; minimum span keeps tiny provinces legible.
    cx=(bbox[0]+bbox[2])/2;cy=(bbox[1]+bbox[3])/2
    span=max(bbox[2]-bbox[0],bbox[3]-bbox[1],.35)*1.7
    region=(cx-span/2,cy-span/2,cx+span/2,cy+span/2)
    detail,_=render_panel((425,425),region,idx);image.paste(detail,(550,220))
    draw.rounded_rectangle((548,218,977,647),radius=4,outline='#b0c5be',width=2)
    draw.text((550,172),'CLOSE-UP',font=font(20),fill='#526c65')
    draw.text((550,675),'Same location, enlarged',font=font(18),fill='#526c65')
    # Outline locates even the smallest highlighted provinces on the overview.
    a=xy((bbox[0],bbox[1]));b=xy((bbox[2],bbox[3]));pad=6
    draw.rectangle((25+a[0]-pad,120+a[1]-pad,25+b[0]+pad,120+b[1]+pad),outline='#bb5137',width=2)
    draw.text((450,140),'N',font=font(18),fill='#526c65');draw.line((457,192,457,165),fill='#526c65',width=2);draw.polygon([(457,156),(451,168),(463,168)],fill='#526c65')
    draw.text((35,836),'OCHA CODs / mapthai · CC BY 3.0 IGO · Adapted for learning',font=font(15),fill='#71877f')
    raw=io.BytesIO();image.save(raw,format='PNG',optimize=True);data=raw.getvalue()
    cards.append({'id':f'thailand-{code.lower()}', 'front':{'text':'จังหวัดที่ไฮไลท์สีส้มคือจังหวัดอะไร?', 'image':{'src':'data:image/png;base64,'+base64.b64encode(data).decode(),'alt':'แผนที่ประเทศไทยพร้อมขอบเขตจังหวัด ไฮไลท์จังหวัดโจทย์สีส้ม ด้านขวาเป็นภาพขยายพื้นที่เดียวกัน'}}, 'back':{'text':name}})
    manifest.append({'id':cards[-1]['id'],'province':name,'pcode':code,'image_sha256':hashlib.sha256(data).hexdigest()})
    if code in ['TH10','TH38','TH75','TH83','TH50','TH96']:
        out=ROOT/'decks/previews';out.mkdir(exist_ok=True);image.save(out/f'{code}.png')
random.Random(77).shuffle(cards)
deck={'format':'recall.deck','version':1,'id':'thailand-77-provinces-map-v1','title':'จำ 77 จังหวัดจากแผนที่ประเทศไทย','description':'77 การ์ด รวมกรุงเทพมหานคร: ทายจังหวัดสีส้มจากแผนที่และภาพขยาย • ภาพฝังในไฟล์ ใช้ออฟไลน์ได้ • ขอบเขตเพื่อการเรียนรู้จาก OCHA CODs / mapthai ผ่าน Thailand Canonical Administrative-Names Reference (CC BY 3.0 IGO / CC BY 4.0) https://github.com/DevelopedbyWill/thailand-canonical-admin-names • ดัดแปลงเป็นภาพแผนที่โดย Recall','tags':['ภูมิศาสตร์','ประเทศไทย','77 จังหวัด','แผนที่'],'cards':cards}
(ROOT/'decks/thailand-77-provinces.deck.json').write_text(json.dumps(deck,ensure_ascii=False,separators=(',',':')))
(ROOT/'decks/thailand-77-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(f'Created {len(cards)} cards, {(ROOT/"decks/thailand-77-provinces.deck.json").stat().st_size/1024/1024:.2f} MiB')
