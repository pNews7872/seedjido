# 시드 지도 공개용 파일 만들기: template2.html → index.html + style.css + app.js + seed.wasm
import re, shutil, os
SRC = '/home/claude/seedweb'; OUT = '/home/claude/seedjido-repo/public'
os.makedirs(OUT, exist_ok=True)   # 다른 페이지(소개·안내 글 등)는 건드리지 않고 이 네 파일만 새로 씀
s = open(f'{SRC}/template2.html').read()
cur = open(f'{SRC}/biome-seed-finder.html').read()
colors = re.search(r'const COLORS = (\[.*?\]);\n', cur).group(1)

css = re.search(r'<style>\n?(.*?)</style>', s, re.S).group(1)
js = re.search(r'<script>\n?(.*?)</script>', s, re.S).group(1)
js = js.replace('const WASM_B64 = "__WASM__";\n', '')
js = js.replace('__COLORS__', colors)
old = 'const ready = WebAssembly.compile(b64ToBytes(WASM_B64)).then('
assert old in js
js = js.replace(old, '// 계산 엔진은 seed.wasm 파일에서 불러옴\nconst ready = fetch("seed.wasm").then(r => { if (!r.ok) throw new Error("seed.wasm " + r.status); return r.arrayBuffer(); }).then(b => WebAssembly.compile(b)).then(')

html = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="style.css">', s, count=1, flags=re.S)
html = re.sub(r'<script>.*?</script>', '<script src="app.js"></script>', html, count=1, flags=re.S)
html = re.sub(r'<title>.*?</title>', '<title>시드 지도 — 마인크래프트 자바 시드 지도·시드 찾기</title>\n<meta name="description" content="마인크래프트 자바 에디션 시드 지도와 시드 찾기. 바이옴, 구조물, 상자 내용물, 엔드 도시와 배, 네더 화석까지 한국어로 보여줘요.">', html, count=1, flags=re.S)
foot = '''<div class="adslot" id="adslot" aria-label="광고"></div>
<footer class="sitefoot">
  <nav class="footnav"><a href="about.html">소개</a> · <a href="guide-map.html">지도 사용법</a> · <a href="guide-search.html">시드 찾기 사용법</a> · <a href="guide-loot.html">상자 내용물 보는 법</a> · <a href="privacy.html">개인정보처리방침</a></nav>
  시드 지도는 Mojang Studios·Microsoft와 관계없는 비공식 팬 도구예요. Minecraft는 Mojang Synergies AB의 상표예요.<br>
  지형·구조물 계산: <a href="https://github.com/Cubitect/cubiomes">Cubiomes</a> (MIT 라이선스, © Cubitect) · <a href="https://github.com/xpple/cubiomes">xpple/cubiomes</a> (MIT 라이선스)
</footer>
'''
html = html.replace('<script src="app.js"></script>', foot + '<script src="app.js"></script>')
# 구글 애드센스 사이트 확인·광고 코드
html = html.replace('</head>', '<link rel="icon" type="image/png" href="favicon.png">\n<link rel="apple-touch-icon" href="favicon.png">\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1296263858590364" crossorigin="anonymous"></script>\n</head>', 1)
css += '\n.sitefoot { max-width: 1400px; margin: 28px auto 18px; padding: 0 16px; font-size: 12px; line-height: 1.6; color: #888; text-align: center; }\n.sitefoot a { color: inherit; }\n.footnav { margin-bottom: 6px; font-size: 13px; }\n.adslot { max-width: 728px; margin: 24px auto 0; padding: 0 16px; text-align: center; }\n.adslot:empty { display: none; }\n'

open(f'{OUT}/index.html', 'w').write(html)
open(f'{OUT}/style.css', 'w').write(css)
# 고대 도시 조립기 + 조각 데이터 (지그소)
jg = open(f'{SRC}/jigsaw/jigsaw.mjs').read().replace('export ', '')
js += '\n' + jg + '\nconst AC_DATA = ' + open(f'{SRC}/jigsaw/ancient_city.json').read() + ';\n'
open(f'{OUT}/app.js', 'w').write(js)
# 마을·시련의 방 조각 데이터는 필요할 때 받아옴
import json as _j
os.makedirs(f'{OUT}/jigsaw', exist_ok=True)
_t = _j.load(open(f'{SRC}/jigsaw/trial_chambers.json')); _t['A'] = _j.load(open('/tmp/mcm/mcmeta/data/minecraft/worldgen/structure/trial_chambers.json'))['pool_aliases'] if os.path.exists('/tmp/mcm/mcmeta') else _j.load(open(f'{SRC}/jigsaw/trial_aliases.json'))
_j.dump(_t['A'], open(f'{SRC}/jigsaw/trial_aliases.json', 'w'))
open(f'{OUT}/jigsaw/trial_chambers.json', 'w').write(_j.dumps(_t, separators=(',', ':')))
shutil.copy(f'{SRC}/jigsaw/village.json', f'{OUT}/jigsaw/village.json')
for _n in ['ancient_city', 'trial_chambers', 'village', 'bastion', 'end_city']: shutil.copy(f'{SRC}/jigsaw/{_n}_tops.json', f'{OUT}/jigsaw/{_n}_tops.json')
for _n in ['bastion', 'end_city']: shutil.copy(f'{SRC}/jigsaw/{_n}.json', f'{OUT}/jigsaw/{_n}.json')
shutil.copy(f'{SRC}/seed3.wasm', f'{OUT}/seed.wasm')
for f in ['index.html','style.css','app.js','seed.wasm']: print(f, os.path.getsize(f'{OUT}/{f}'))
