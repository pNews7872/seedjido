# 시드 지도 안내 페이지들 (소개·사용법·개인정보처리방침) 만들기 → seedjido-repo/public
OUT = '/home/claude/seedjido-repo/public'
UPDATED = '2026년 11월 24일'

CSS = '''
:root { --bg:#eceeea; --surface:#fbfcfa; --ink:#1c2320; --muted:#5d6963; --line:#d2d9d4; --accent:#2c7356; --chip:#e3e8e4;
  --font-body:"IBM Plex Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif; color-scheme: light; }
@media (prefers-color-scheme: dark) { :root { --bg:#111513; --surface:#191f1c; --ink:#e5ebe7; --muted:#98a59e; --line:#2b3430; --accent:#57b88a; --chip:#222a26; color-scheme: dark; } }
* { box-sizing: border-box; } html, body { margin: 0; }
body { background: var(--bg); color: var(--ink); font-family: var(--font-body); font-size: 16px; line-height: 1.75; }
.top { max-width: 760px; margin: 0 auto; padding: 18px 20px 0; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.top .brand { font-weight: 700; font-size: 18px; color: var(--ink); text-decoration: none; }
.top .go { font-weight: 600; text-decoration: none; background: var(--accent); color: #fff; padding: 8px 14px; border-radius: 8px; font-size: 14px; }
article { max-width: 760px; margin: 18px auto 0; padding: 28px 28px 36px; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; }
article h1 { font-size: 28px; line-height: 1.3; margin: 0 0 6px; letter-spacing: -0.01em; }
article .lead { color: var(--muted); margin: 0 0 22px; }
article h2 { font-size: 20px; margin: 30px 0 8px; padding-top: 14px; border-top: 1px solid var(--line); }
article h3 { font-size: 17px; margin: 20px 0 4px; }
article p, article li { max-width: 68ch; } article ul, article ol { padding-left: 22px; }
article a { color: var(--accent); }
article .tip { background: var(--chip); border-radius: 10px; padding: 12px 16px; margin: 16px 0; }
article .date { color: var(--muted); font-size: 14px; margin-top: 28px; }
.adslot { max-width: 728px; margin: 24px auto 0; padding: 0 16px; text-align: center; } .adslot:empty { display: none; }
footer { max-width: 760px; margin: 26px auto 22px; padding: 0 20px; font-size: 12px; color: #888; text-align: center; line-height: 1.6; }
footer a { color: inherit; } footer nav { font-size: 13px; margin-bottom: 6px; }
@media (max-width: 640px) { article { padding: 20px 18px 28px; border-radius: 0; border-left: 0; border-right: 0; } article h1 { font-size: 24px; } }
'''

NAV = '<nav><a href="about.html">소개</a> · <a href="guide-map.html">지도 사용법</a> · <a href="guide-search.html">시드 찾기 사용법</a> · <a href="guide-loot.html">상자 내용물 보는 법</a> · <a href="privacy.html">개인정보처리방침</a></nav>'

def page(fname, title, desc, body):
    html = f'''<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — 시드 지도</title>
<meta name="description" content="{desc}">
<link rel="stylesheet" href="pages.css">
<link rel="icon" type="image/png" href="favicon.png">
<link rel="apple-touch-icon" href="favicon.png">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1296263858590364" crossorigin="anonymous"></script>
</head>
<body>
<div class="top"><a class="brand" href="./">시드 지도</a><a class="go" href="./">지도 열기</a></div>
<article>
{body}
</article>
<div class="adslot" id="adslot" aria-label="광고"></div>
<footer>
  {NAV}
  시드 지도는 Mojang Studios·Microsoft와 관계없는 비공식 팬 도구예요. Minecraft는 Mojang Synergies AB의 상표예요.<br>
  지형·구조물 계산: <a href="https://github.com/Cubitect/cubiomes">Cubiomes</a> (MIT 라이선스, © Cubitect) · <a href="https://github.com/xpple/cubiomes">xpple/cubiomes</a> (MIT 라이선스)
</footer>
</body>
</html>
'''
    open(f'{OUT}/{fname}', 'w').write(html)

open(f'{OUT}/pages.css', 'w').write(CSS)

page('about.html', '소개', '시드 지도는 마인크래프트 시드의 바이옴, 구조물, 상자 내용물까지 브라우저에서 바로 계산해 보여 주는 한국어 시드 도구예요.', f'''
<h1>시드 지도 소개</h1>
<p class="lead">마인크래프트 시드 하나에 담긴 세상을, 게임을 켜기 전에 미리 펼쳐 보는 도구예요.</p>

<h2>무엇을 할 수 있나요</h2>
<ul>
  <li><b>시드 지도:</b> 시드를 넣으면 오버월드, 네더, 엔드의 바이옴과 구조물을 지도로 보여 줘요. 마을, 사원, 고대 도시, 시련의 방, 요새, 보루 잔해, 엔드 도시까지 한눈에 볼 수 있어요.</li>
  <li><b>시드 찾기:</b> "스폰 근처에 벚나무 숲과 마을이 있는 시드"처럼 원하는 조건을 고르면, 조건에 맞는 시드를 찾아 줘요.</li>
  <li><b>상자 내용물:</b> 사막 피라미드, 난파선, 엔드 도시 같은 구조물 상자에 무엇이 들어 있는지 미리 볼 수 있어요. 상자 아이템을 조건으로 시드를 찾을 수도 있어요.</li>
  <li><b>세부 정보:</b> 동굴 입구와 동굴 종류, 협곡, 슬라임 청크, 엔드 중앙 섬의 흑요석 기둥과 드래곤 관문, 네더 차원문 연결 좌표, 즐겨찾기 같은 기능이 있어요.</li>
</ul>

<h2>누구를 위한 도구인가요</h2>
<p>새 월드를 시작할 시드를 고르는 사람, 건축하기 좋은 지형을 찾는 사람, 스피드런이나 하드코어를 준비하는 사람, 친구들과 서버를 열 시드를 고르는 사람, 영상 속 시드가 궁금한 사람 등 누구나 쓸 수 있어요. 시드나 플레이 방식에 상관없이 원하는 걸 빨리 찾게 돕는 게 목표예요.</p>

<h2>어떻게 계산하나요</h2>
<p>모든 계산은 여러분의 브라우저 안에서 이뤄져요. 서버에 시드를 보내지 않아요. 계산에는 마인크래프트 지형 생성을 재현한 공개 라이브러리 <a href="https://github.com/Cubitect/cubiomes">Cubiomes</a>와 최신 버전을 반영한 <a href="https://github.com/xpple/cubiomes">xpple의 수정판</a>을 쓰고, 그 위에 지도, 시드 찾기, 상자 계산 기능을 직접 만들었어요.</p>
<p>정확도를 높이려고 실제 월드 파일과 계산 결과를 하나하나 대조해서 고쳐 왔어요. 그래도 게임과 완전히 같다는 보장은 없으니, 중요한 시드는 게임 안에서 한 번 확인해 주세요.</p>

<h2>지금 지원하는 범위와 앞으로</h2>
<p>지금은 <b>Java 에디션 최신 버전</b>을 기준으로 계산해요. 앞으로 Bedrock 에디션과 여러 버전을 지원하고, 더 많은 구조물과 기능을 계속 채워 나갈 계획이에요. 화면도 더 쓰기 편하게 계속 다듬어요.</p>

<h2>의견 보내기</h2>
<p>틀린 계산, 불편한 점, 있었으면 하는 기능은 <a href="https://github.com/pNews7872/seedjido/issues">GitHub 이슈</a>로 알려 주세요.</p>

<p class="tip">시드 지도는 Mojang Studios·Microsoft와 관계없는 비공식 팬 도구예요.</p>
''')

page('guide-map.html', '지도 사용법', '시드 지도에서 시드를 열고, 구조물을 고르고, 좌표 이동·즐겨찾기·차원문 연결 좌표를 쓰는 방법을 정리했어요.', '''
<h1>지도 사용법</h1>
<p class="lead">시드 하나를 열어서 바이옴, 구조물, 좌표를 둘러보는 방법이에요.</p>

<h2>1. 시드 열기</h2>
<p>지도 보기 탭의 <b>시드</b> 칸에 숫자나 글자 시드를 넣으면 바로 계산을 시작해요. 글자 시드는 게임과 같은 방식으로 숫자로 바꿔서 계산해요. <b>무작위</b> 버튼을 누르면 아무 시드나 열려요. 처음 들어오면 매번 무작위 시드가 열려요.</p>
<div class="tip">게임 안에서 <code>/seed</code> 명령어로 지금 월드의 시드를 확인할 수 있어요.</div>

<h2>2. 지도 움직이기</h2>
<ul>
  <li><b>이동:</b> 마우스로 끌거나, 휴대폰에서는 한 손가락으로 밀어요.</li>
  <li><b>확대·축소:</b> 마우스 휠, 두 손가락 벌리기, 또는 오른쪽 위 + − 버튼을 써요.</li>
  <li><b>★ 버튼:</b> 스폰 지점으로 돌아가요. <b>⛶ 버튼</b>은 지도를 전체 화면으로 키워요.</li>
  <li>지도 위 격자는 512칸 간격이에요. 월드 파일(region) 하나의 크기와 같아요. 위쪽에 X 좌표, 왼쪽에 Z 좌표가 적혀 있고, 0, 0 지점은 흰 점으로 표시돼요.</li>
</ul>

<h2>3. 차원과 보기 방식</h2>
<p><b>차원</b>에서 오버월드, 네더, 엔드를 고를 수 있어요. 오버월드에서는 <b>보기</b>를 지도(평면), 지형(입체감 있는 음영), 3D 중에서 고를 수 있고, <b>바이옴 색</b>은 기본 색과 게임 지도 색 중에서 고를 수 있어요.</p>

<h2>4. 구조물 고르기</h2>
<p><b>표시할 구조물</b>에서 보고 싶은 것만 눌러 켜고 끌 수 있어요. 고른 상태는 브라우저에 저장돼서 다음에 와도 그대로예요. 아이콘이 너무 크거나 작으면 <b>아이콘 크기</b> 막대로 조절하세요.</p>
<p>구조물 아이콘을 누르면 좌표, 높이, 종류 같은 정보가 나와요. 예를 들어 마을은 평원·사막·사바나·타이가·설원 중 어떤 마을인지, 이글루는 지하실이 있는지, 엔드 도시는 배가 있는지와 배의 높이까지 알려 줘요.</p>

<h2>5. 좌표 이동과 즐겨찾기</h2>
<ul>
  <li>지도 아래 <b>즐겨찾기·이동</b> 칸에 X, Z를 넣고 이동을 누르면 그 위치로 가요.</li>
  <li>지도의 빈 곳이나 구조물을 누르면 나오는 창에서 이름을 적고 <b>★ 저장</b>을 누르면 즐겨찾기에 들어가요. 집, 농장, 차원문 같은 곳을 저장해 두세요.</li>
  <li>즐겨찾기는 시드마다 따로, 이 브라우저에 저장돼요.</li>
</ul>

<h2>6. 네더 차원문 연결 좌표</h2>
<p>오버월드에서 어느 지점을 누르면 창에 "네더에서는 X, Z"가 함께 나와요. 오버월드 좌표를 8로 나눈 값이에요. 반대로 네더에서 누르면 오버월드 좌표(×8)가 나와요. 오버월드에 저장한 즐겨찾기는 네더 지도에도 흐리게 표시돼서, 네더 쪽 차원문을 어디에 지으면 되는지 바로 보여요.</p>

<h2>7. 링크로 공유하기</h2>
<p>지도 아래 <b>지금 화면 링크 복사</b>를 누르면 시드, 차원, 위치, 확대 상태가 담긴 링크가 복사돼요. 친구에게 보내면 같은 화면이 그대로 열려요.</p>
''')

page('guide-search.html', '시드 찾기 사용법', '원하는 바이옴, 구조물, 상자 아이템이 스폰 근처에 있는 마인크래프트 시드를 찾는 방법이에요.', '''
<h1>시드 찾기 사용법</h1>
<p class="lead">원하는 것이 스폰 근처에 모여 있는 시드를 찾는 방법이에요.</p>

<h2>1. 조건 고르기</h2>
<p><b>시드 찾기</b> 탭에서 원하는 바이옴과 구조물을 눌러 골라요. 여러 개를 고르면 <b>모두</b> 만족하는 시드만 찾아요.</p>
<ul>
  <li><b>바이옴:</b> 벚나무 숲, 버섯 들판, 얼음 가시 평원, 깊은 어둠 같은 바이옴</li>
  <li><b>지상 구조물:</b> 마을, 사막 피라미드, 정글 사원, 전초기지 등. "사막 마을", "지하실 있는 이글루", "버려진 마을"처럼 세부 종류도 고를 수 있어요.</li>
  <li><b>지하·지형:</b> 고대 도시, 시련의 방, 폐광, 자수정 정동, 던전, 협곡, 슬라임 청크 2×2(슬라임 농장 자리)</li>
  <li><b>네더·엔드:</b> 요새, 보루 잔해, 엔드 도시(배 있음) 등</li>
  <li><b>상자 아이템:</b> 다이아몬드, 마법이 부여된 황금 사과, 갑옷 장식 형판처럼 상자 안에 특정 아이템이 든 구조물이 가까이 있는 시드</li>
</ul>

<h2>2. 검색 범위</h2>
<p>기본으로 스폰에서 반경 500블록 안을 찾아요. 네더 조건은 스폰 좌표를 8로 나눈 지점을, 엔드 조건은 드래곤을 처음 잡았을 때 생기는 관문의 출구를 기준으로 찾아요. 엔드 유적은 스폰에서 1280블록보다 가까이 생기지 않아서 1500블록까지 찾아요.</p>

<h2>3. 결과 보기</h2>
<p>조건에 맞는 시드가 나오면 결과 표에 각 조건까지의 거리와 좌표가 나와요. 시드를 누르면 미리보기가 나오고, <b>지도</b>를 누르면 그 시드를 지도 보기에서 열어요. <b>복사</b>로 시드를 복사해서 게임에 바로 넣으면 돼요.</p>

<h2>4. 빨리 찾는 요령</h2>
<ul>
  <li><b>드문 조건이 많을수록 오래 걸려요.</b> 버섯 들판과 얼음 가시 평원이 함께 있는 시드처럼 드문 조합은 수천, 수만 개를 확인해야 나올 수 있어요.</li>
  <li><b>"느림" 표시</b>가 붙은 조건(던전, 용암 호수, 큰 동굴 입구, 상자 아이템)은 계산이 무거워요. 다른 조건과 같이 고르면, 다른 조건을 통과한 시드에만 계산해서 훨씬 빨라요.</li>
  <li>컴퓨터에서 쓰면 휴대폰보다 몇 배 빨라요. 계산은 여러분의 브라우저에서 이뤄지거든요.</li>
</ul>
<div class="tip">찾은 시드는 게임 안에서 한 번 확인해 주세요. 지형 높이 때문에 드물게 구조물이 실제로 안 생기는 경우가 있어요.</div>
''')

page('guide-loot.html', '상자 내용물 보는 법', '마인크래프트 구조물 상자의 내용물을 미리 보고, 원하는 아이템이 든 상자가 가까운 시드를 찾는 방법이에요.', '''
<h1>상자 내용물 보는 법</h1>
<p class="lead">구조물 상자 속 아이템은 시드로 정해져요. 그래서 열어 보기 전에 미리 알 수 있어요.</p>

<h2>왜 미리 알 수 있나요</h2>
<p>마인크래프트에서 구조물 상자의 내용물은 상자가 처음 생길 때 정해지는 "내용물 시드"로 결정돼요. 이 값은 월드 시드와 상자 위치로 계산되기 때문에, 같은 시드라면 누가 열어도 같은 아이템이 나와요. 시드 지도는 이 과정을 따라 계산해요.</p>

<h2>보는 방법</h2>
<ol>
  <li>지도 보기에서 구조물 아이콘을 눌러요.</li>
  <li>창에서 <b>상자 내용물 보기</b>를 눌러요.</li>
  <li>상자마다 위치와 아이템이 나와요. 마법부여, 물약 효과, 탐험 지도가 가리키는 곳도 함께 보여 줘요.</li>
</ol>

<h2>지원하는 구조물</h2>
<ul>
  <li><b>오버월드:</b> 사막 피라미드, 정글 사원, 이글루(지하실이 있을 때), 난파선, 약탈자 전초기지, 폐허가 된 차원문, 묻힌 보물, 폐광, 버려진 캠프, 엔드 유적</li>
  <li><b>네더:</b> 네더 요새, 보루 잔해, 폐허가 된 차원문</li>
  <li><b>엔드:</b> 엔드 도시</li>
</ul>
<p>고대 도시, 시련의 방, 마을의 상자는 아직 지원하지 않아요. 조각을 이어 붙여 만드는 구조물이라 계산이 훨씬 복잡해서, 앞으로 추가할 계획이에요.</p>

<h2>원하는 아이템으로 시드 찾기</h2>
<p>시드 찾기 탭의 <b>상자 아이템</b>에서 아이템을 고르면, 스폰 근처 구조물 상자에 그 아이템이 든 시드를 찾아 줘요. 예를 들어 "마법이 부여된 황금 사과"를 고르면, 게임을 시작하자마자 그 사과를 얻을 수 있는 시드를 찾을 수 있어요.</p>

<h2>정확도</h2>
<p>실제 월드 파일과 대조해서 맞춰 왔어요. 엔드 도시와 네더 요새는 대조한 상자가 모두 일치했고, 다른 구조물도 대부분 일치해요. 엔드 유적은 일부 상자가 틀릴 수 있어요. 이미 누군가 열었거나 깬 상자는 당연히 다를 수 있어요.</p>
''')

page('privacy.html', '개인정보처리방침', '시드 지도(seedjido.com)의 개인정보처리방침이에요. 처리하는 정보, 보유 기간, 광고와 쿠키, 권리 행사 방법을 안내해요.', f"""
<h1>개인정보처리방침</h1>
<p class="lead">시드 지도(seedjido.com, 이하 "사이트")는 「개인정보 보호법」 제30조에 따라 방문자의 개인정보를 보호하고 관련 고충을 신속하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 공개합니다.</p>

<div class="tip"><b>한눈에 보기</b><br>
사이트는 회원가입이 없고 이름·이메일 같은 정보를 입력받지 않아요. 입력한 시드와 좌표는 서버로 보내지 않고 방문자의 브라우저 안에서만 계산해요. 다만 사이트를 전달하는 과정에서 접속 기록(IP 주소 등)이 남고, 광고를 게재하는 경우 광고 업체가 쿠키를 사용할 수 있어요.</div>

<p><b>목차</b></p>
<ol>
  <li><a href="#p1">개인정보의 처리 목적</a></li>
  <li><a href="#p2">처리하는 개인정보의 항목</a></li>
  <li><a href="#p3">14세 미만 아동의 개인정보 처리</a></li>
  <li><a href="#p4">개인정보의 처리 및 보유 기간</a></li>
  <li><a href="#p5">개인정보의 파기 절차 및 방법</a></li>
  <li><a href="#p6">개인정보의 제3자 제공</a></li>
  <li><a href="#p7">개인정보 처리업무의 위탁</a></li>
  <li><a href="#p8">개인정보의 국외 이전</a></li>
  <li><a href="#p9">개인정보의 안전성 확보조치</a></li>
  <li><a href="#p10">브라우저 저장소(자동 수집 장치)의 운영 및 거부</a></li>
  <li><a href="#p11">제3자가 수집해가는 행태정보(광고)</a></li>
  <li><a href="#p12">정보주체와 법정대리인의 권리·의무 및 행사방법</a></li>
  <li><a href="#p13">개인정보 보호책임자</a></li>
  <li><a href="#p14">권익침해 구제방법</a></li>
  <li><a href="#p15">개인정보처리방침의 변경</a></li>
</ol>

<h2 id="p1">1. 개인정보의 처리 목적</h2>
<p>사이트는 다음 목적으로만 개인정보를 처리하며, 목적이 바뀌는 경우 「개인정보 보호법」 제18조에 따라 필요한 조치를 합니다.</p>
<ul>
  <li><b>사이트 제공과 보안:</b> 웹페이지 전달, 비정상 접속과 공격 차단, 장애 대응</li>
  <li><b>이용 통계:</b> 개인을 알아볼 수 없는 형태의 방문 수 확인</li>
  <li><b>광고 게재:</b> 광고를 게재하는 경우, 광고 업체를 통한 광고 노출(11항 참고)</li>
</ul>

<h2 id="p2">2. 처리하는 개인정보의 항목</h2>
<p>사이트는 회원가입, 문의 양식 등 방문자가 직접 개인정보를 입력하는 기능이 없어요. 사이트 이용 과정에서 아래 정보가 자동으로 생성되어 처리될 수 있어요.</p>
<ul>
  <li><b>접속 기록:</b> IP 주소, 접속 일시, 요청한 페이지, 브라우저·운영체제 정보(User-Agent), 이전 페이지 주소(Referer)</li>
</ul>
<p>시드, 좌표, 즐겨찾기, 표시 설정은 방문자의 브라우저에만 저장되며 사이트 운영자에게 전송되지 않아요(10항 참고).</p>

<h2 id="p3">3. 14세 미만 아동의 개인정보 처리</h2>
<p>사이트는 방문자가 직접 개인정보를 입력하는 기능이 없으며, 14세 미만 아동의 개인정보를 알면서 수집하지 않아요.</p>

<h2 id="p4">4. 개인정보의 처리 및 보유 기간</h2>
<ul>
  <li><b>접속 기록:</b> 사이트 전달을 맡은 Cloudflare가 보안과 운영을 위해 처리하며, Cloudflare의 보존 정책에 따른 기간이 지나면 자동으로 삭제돼요. 운영자는 개인을 알아볼 수 없는 집계 통계만 확인해요.</li>
  <li><b>브라우저에 저장된 정보:</b> 방문자가 직접 지우기 전까지 방문자의 브라우저에만 남아 있어요.</li>
</ul>

<h2 id="p5">5. 개인정보의 파기 절차 및 방법</h2>
<p>보유 기간이 지나거나 처리 목적이 달성된 개인정보는 지체 없이 파기해요. 접속 기록은 전자 파일 형태로 처리되며, 보존 기간이 끝나면 복구할 수 없는 방법으로 자동 삭제돼요. 브라우저에 저장된 정보는 방문자가 브라우저의 사이트 데이터 삭제 기능으로 언제든 지울 수 있어요.</p>

<h2 id="p6">6. 개인정보의 제3자 제공</h2>
<p>사이트는 방문자의 개인정보를 제3자에게 제공하지 않아요. 다만 법령에 따라 수사기관 등의 적법한 요청이 있는 경우는 예외로 해요.</p>

<h2 id="p7">7. 개인정보 처리업무의 위탁</h2>
<p>사이트는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있어요.</p>
<ul>
  <li><b>수탁자:</b> Cloudflare, Inc.</li>
  <li><b>위탁 업무:</b> 웹사이트 호스팅과 전송(CDN), 보안(공격 차단), 접속 통계</li>
</ul>

<h2 id="p8">8. 개인정보의 국외 이전</h2>
<p>사이트는 위 위탁 업무를 위해 다음과 같이 개인정보를 국외로 이전해요.</p>
<ul>
  <li><b>이전받는 자:</b> Cloudflare, Inc. (연락처: <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare 개인정보처리방침</a>의 문의처)</li>
  <li><b>이전되는 국가:</b> 미국 및 Cloudflare가 서버를 운영하는 국가</li>
  <li><b>이전 항목:</b> 2항의 접속 기록</li>
  <li><b>이전 시기와 방법:</b> 사이트에 접속할 때 네트워크를 통해 전송</li>
  <li><b>이전 목적:</b> 웹사이트 전송, 보안, 접속 통계</li>
  <li><b>보유·이용 기간:</b> Cloudflare의 보존 정책에 따름</li>
  <li><b>이전을 거부하는 방법과 효과:</b> 접속 기록의 이전은 사이트를 전달하는 데 꼭 필요해서, 거부하려면 사이트를 이용하지 않아야 해요.</li>
</ul>

<h2 id="p9">9. 개인정보의 안전성 확보조치</h2>
<ul>
  <li>사이트의 모든 통신은 HTTPS로 암호화돼요.</li>
  <li>운영자가 직접 개인정보를 저장하는 서버나 데이터베이스를 운영하지 않아요.</li>
  <li>호스팅 관리 계정은 운영자만 접근할 수 있도록 관리해요.</li>
</ul>

<h2 id="p10">10. 브라우저 저장소(자동 수집 장치)의 운영 및 거부</h2>
<p>사이트는 편의 기능을 위해 방문자 브라우저의 저장소(localStorage)에 아래 정보를 저장해요. 이 정보는 운영자에게 전송되지 않으며, 사이트 자체는 쿠키를 사용하지 않아요.</p>
<ul>
  <li>지도에 표시할 구조물 선택, 보기 설정</li>
  <li>즐겨찾기한 위치, "다녀옴" 표시</li>
</ul>
<p><b>거부·삭제 방법:</b> 브라우저 설정에서 이 사이트의 데이터(쿠키 및 사이트 데이터)를 삭제하거나 저장을 차단할 수 있어요. 이 경우 선택 상태와 즐겨찾기가 저장되지 않지만, 지도와 시드 찾기는 그대로 쓸 수 있어요.</p>

<h2 id="p11">11. 제3자가 수집해가는 행태정보(광고)</h2>
<p>사이트는 운영비 마련을 위해 광고를 게재할 수 있으며, 광고를 게재하는 경우 광고 업체가 쿠키 등 자동 수집 장치로 다음 정보를 수집할 수 있어요.</p>
<ul>
  <li><b>수집장치:</b> 광고 스크립트(자바스크립트, 웹페이지)와 쿠키</li>
  <li><b>수집해가는 사업자:</b> Google LLC(Google AdSense), ㈜카카오(카카오 애드핏) 중 사이트가 실제로 사용하는 업체</li>
  <li><b>수집해가는 행태정보:</b> 웹사이트 방문 기록, 광고 클릭 기록, 브라우저·기기 정보</li>
  <li><b>수집해가는 목적:</b> 맞춤형 광고 게재, 광고 성과 측정</li>
</ul>
<p>Google을 포함한 제3자 광고 업체는 쿠키를 사용해 방문자의 이전 방문 기록을 바탕으로 광고를 게재해요. Google이 광고 쿠키를 사용하는 방식은 <a href="https://policies.google.com/technologies/ads">Google 광고 정책</a>에서 볼 수 있어요.</p>
<p><b>거부 방법</b></p>
<ul>
  <li>Google 맞춤 광고: <a href="https://myadcenter.google.com/">Google 내 광고 센터</a>에서 끌 수 있어요.</li>
  <li>기타 업체의 맞춤 광고: <a href="https://www.aboutads.info/">www.aboutads.info</a>에서 끌 수 있어요.</li>
  <li><b>크롬:</b> 오른쪽 위 ⋮ → 설정 → 개인정보 보호 및 보안 → 서드파티 쿠키 → 서드파티 쿠키 차단</li>
  <li><b>엣지:</b> 오른쪽 위 ⋯ → 설정 → 개인 정보, 검색 및 서비스 → 추적 방지를 "엄격"으로, 또는 쿠키 → 타사 쿠키 차단</li>
  <li><b>사파리(아이폰):</b> 설정 → Safari → 고급 → 모든 쿠키 차단</li>
  <li><b>삼성인터넷:</b> ≡ → 개인정보 → 스마트 추적 방지 → 엄격</li>
</ul>
<p>쿠키를 차단해도 사이트 기능은 그대로 쓸 수 있어요. 브라우저 버전에 따라 메뉴 이름이 조금 다를 수 있어요.</p>

<h2 id="p12">12. 정보주체와 법정대리인의 권리·의무 및 행사방법</h2>
<ul>
  <li>방문자는 언제든지 자신의 개인정보에 대해 열람, 정정·삭제, 처리정지를 요구할 수 있어요. 14세 미만 아동은 법정대리인이 대신 요구할 수 있어요.</li>
  <li>브라우저에 저장된 정보는 운영자가 볼 수 없으므로, 방문자가 브라우저에서 직접 확인하고 지울 수 있어요.</li>
  <li>접속 기록에 관한 요구는 13항의 연락처로 보내 주세요. 다만 운영자는 접속 기록에서 특정 개인을 알아볼 수 있는 정보를 따로 보관하지 않아, 요구하신 정보를 찾을 수 없는 경우가 있을 수 있어요. 요구를 받으면 10일 이내에 처리 결과를 알려 드려요.</li>
</ul>

<h2 id="p13">13. 개인정보 보호책임자</h2>
<p>사이트는 개인 운영자가 운영하며, 운영자가 개인정보 보호책임자로서 개인정보 처리에 관한 업무와 고충 처리를 맡아요.</p>
<ul>
  <li><b>개인정보 보호책임자:</b> 시드 지도 운영자</li>
  <li><b>연락처:</b> <a href="https://github.com/pNews7872/seedjido/issues">GitHub 이슈</a></li>
</ul>

<h2 id="p14">14. 권익침해 구제방법</h2>
<p>개인정보 침해로 인한 분쟁 해결이나 상담이 필요하면 아래 기관에 신고·상담을 신청할 수 있어요.</p>
<ol>
  <li>개인정보 분쟁조정위원회: (국번없이) 1833-6972 (<a href="https://www.kopico.go.kr">www.kopico.go.kr</a>)</li>
  <li>개인정보침해 신고센터: (국번없이) 118 (<a href="https://privacy.kisa.or.kr">privacy.kisa.or.kr</a>)</li>
  <li>경찰청: (국번없이) 182 (<a href="https://ecrm.police.go.kr">ecrm.police.go.kr</a>)</li>
</ol>

<h2 id="p15">15. 개인정보처리방침의 변경</h2>
<p>이 개인정보처리방침은 {UPDATED}부터 적용돼요. 내용이 바뀌면 이 페이지에서 변경 사항과 적용일을 알려 드려요.</p>
<p class="date">시행일: {UPDATED}</p>
""")

open(f'{OUT}/robots.txt', 'w').write('User-agent: *\nAllow: /\n\nSitemap: https://seedjido.com/sitemap.xml\n')
urls = ['', 'about.html', 'guide-map.html', 'guide-search.html', 'guide-loot.html', 'privacy.html']
open(f'{OUT}/sitemap.xml', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>https://seedjido.com/{u}</loc><lastmod>2026-11-24</lastmod></url>\n' for u in urls) + '</urlset>\n')
print('pages ok')
