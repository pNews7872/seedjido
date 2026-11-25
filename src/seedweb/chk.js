
const WASM_B64 = "__WASM__";
const COLORS = [];
COLORS[186] = "c9cac2";
// 엔드: 섬이 있는 곳은 엔드 돌 색, 작은 섬 지대는 거의 빈 공간이라 어둡게
COLORS[9] = "d9d29e"; COLORS[41] = "c4bc86"; COLORS[42] = "e0d9a8"; COLORS[43] = "a8a074"; COLORS[40] = "b9b088"; COLORS[-2] = "120f1a";
const BIOMES = [
  {id:-1, name:"바다 (모든 종류)", en:"", g:"묶음", y:256, color:"2a4fb0"},
  {id:-2, name:"악지 (모든 종류)", en:"", g:"묶음", y:256, color:"d25f12"},
  {id:186, name:"창백한 정원", en:"pale_garden", g:"희귀", y:256},
  {id:184, name:"맹그로브 늪", en:"mangrove_swamp", g:"희귀", y:256},
  {id:185, name:"벚나무 숲", en:"cherry_grove", g:"희귀", y:256},
  {id:14, name:"버섯 들판", en:"mushroom_fields", g:"희귀", y:256},
  {id:140, name:"얼음 가시 평원", en:"ice_spikes", g:"희귀", y:256},
  {id:165, name:"침식된 악지", en:"eroded_badlands", g:"희귀", y:256},
  {id:168, name:"대나무 정글", en:"bamboo_jungle", g:"희귀", y:256},
  {id:129, name:"해바라기 평원", en:"sunflower_plains", g:"희귀", y:256},
  {id:132, name:"꽃 숲", en:"flower_forest", g:"희귀", y:256},
  {id:188, name:"얼룩진 숲 (단풍)", en:"dappled_forest", g:"희귀", y:256},
  {id:1, name:"평원", en:"plains", g:"평원·숲", y:256},
  {id:4, name:"숲", en:"forest", g:"평원·숲", y:256},
  {id:27, name:"자작나무 숲", en:"birch_forest", g:"평원·숲", y:256},
  {id:155, name:"원시 자작나무 숲", en:"old_growth_birch_forest", g:"평원·숲", y:256},
  {id:29, name:"어두운 숲", en:"dark_forest", g:"평원·숲", y:256},
  {id:177, name:"목초지", en:"meadow", g:"평원·숲", y:256},
  {id:6, name:"늪", en:"swamp", g:"평원·숲", y:256},
  {id:7, name:"강", en:"river", g:"평원·숲", y:256},
  {id:2, name:"사막", en:"desert", g:"따뜻한 곳", y:256},
  {id:35, name:"사바나", en:"savanna", g:"따뜻한 곳", y:256},
  {id:36, name:"사바나 고원", en:"savanna_plateau", g:"따뜻한 곳", y:256},
  {id:163, name:"바람이 세찬 사바나", en:"windswept_savanna", g:"따뜻한 곳", y:256},
  {id:21, name:"정글", en:"jungle", g:"따뜻한 곳", y:256},
  {id:23, name:"듬성듬성한 정글", en:"sparse_jungle", g:"따뜻한 곳", y:256},
  {id:37, name:"악지", en:"badlands", g:"따뜻한 곳", y:256},
  {id:38, name:"나무가 우거진 악지", en:"wooded_badlands", g:"따뜻한 곳", y:256},
  {id:5, name:"타이가", en:"taiga", g:"추운 곳", y:256},
  {id:30, name:"눈 덮인 타이가", en:"snowy_taiga", g:"추운 곳", y:256},
  {id:32, name:"원시 소나무 타이가", en:"old_growth_pine_taiga", g:"추운 곳", y:256},
  {id:160, name:"원시 가문비나무 타이가", en:"old_growth_spruce_taiga", g:"추운 곳", y:256},
  {id:12, name:"눈 덮인 평원", en:"snowy_plains", g:"추운 곳", y:256},
  {id:11, name:"얼어붙은 강", en:"frozen_river", g:"추운 곳", y:256},
  {id:26, name:"눈 덮인 해변", en:"snowy_beach", g:"추운 곳", y:256},
  {id:3, name:"바람이 세찬 언덕", en:"windswept_hills", g:"산", y:256},
  {id:131, name:"바람이 세찬 자갈 언덕", en:"windswept_gravelly_hills", g:"산", y:256},
  {id:34, name:"바람이 세찬 숲", en:"windswept_forest", g:"산", y:256},
  {id:178, name:"수림", en:"grove", g:"산", y:256},
  {id:179, name:"눈 덮인 비탈", en:"snowy_slopes", g:"산", y:256},
  {id:180, name:"뾰족한 봉우리", en:"jagged_peaks", g:"산", y:256},
  {id:181, name:"얼어붙은 봉우리", en:"frozen_peaks", g:"산", y:256},
  {id:182, name:"바위 봉우리", en:"stony_peaks", g:"산", y:256},
  {id:16, name:"해변", en:"beach", g:"물가·바다", y:256},
  {id:25, name:"돌 해안", en:"stony_shore", g:"물가·바다", y:256},
  {id:0, name:"바다", en:"ocean", g:"물가·바다", y:256},
  {id:24, name:"깊은 바다", en:"deep_ocean", g:"물가·바다", y:256},
  {id:44, name:"따뜻한 바다", en:"warm_ocean", g:"물가·바다", y:256},
  {id:45, name:"미지근한 바다", en:"lukewarm_ocean", g:"물가·바다", y:256},
  {id:48, name:"깊고 미지근한 바다", en:"deep_lukewarm_ocean", g:"물가·바다", y:256},
  {id:46, name:"차가운 바다", en:"cold_ocean", g:"물가·바다", y:256},
  {id:49, name:"깊고 차가운 바다", en:"deep_cold_ocean", g:"물가·바다", y:256},
  {id:10, name:"얼어붙은 바다", en:"frozen_ocean", g:"물가·바다", y:256},
  {id:50, name:"깊고 얼어붙은 바다", en:"deep_frozen_ocean", g:"물가·바다", y:256},
  {id:175, name:"무성한 동굴", en:"lush_caves", g:"땅속", y:0, under:true},
  {id:174, name:"점적석 동굴", en:"dripstone_caves", g:"땅속", y:0, under:true},
  {id:183, name:"깊은 어둠", en:"deep_dark", g:"땅속", y:-40, under:true},
  {id:187, name:"유황 동굴", en:"sulfur_caves", g:"땅속", y:0, under:true},
];
const NAME = {}; for (const b of BIOMES) if (b.id >= 0) NAME[b.id] = b.name;
Object.assign(NAME, { [-2]: "허공", 8: "네더 황무지", 170: "영혼 모래 골짜기", 171: "진홍빛 숲", 172: "뒤틀린 숲", 173: "현무암 삼각주", 9: "디 엔드", 40: "작은 엔드 섬", 41: "엔드 중지대", 42: "엔드 고지대", 43: "엔드 불모지" });
const colorOf = b => "#" + (b.color || COLORS[b.id] || "888888");
const STRUCTS = [
  {id:5,  name:"마을", ic:"마", c:"#b7791f"},
  {id:13, name:"고대 도시", ic:"고", c:"#1f3b57"},
  {id:25, name:"시련의 방", ic:"시", c:"#b8642c"},
  {id:27, name:"엔드 유적", ic:"엔", c:"#6b3fa0"},
  {id:9,  name:"삼림 대저택", ic:"저", c:"#5a3a22"},
  {id:8,  name:"바다 신전", ic:"신", c:"#1b8a8f"},
  {id:7,  name:"난파선", ic:"난", c:"#7a5b3a"},
  {id:6,  name:"바다 유적", ic:"유", c:"#3d7a6a"},
  {id:14, name:"묻힌 보물", ic:"보", c:"#c49a12"},
  {id:2,  name:"정글 사원", ic:"정", c:"#4c7a1e"},
  {id:1,  name:"사막 피라미드", ic:"피", c:"#c9a347"},
  {id:3,  name:"마녀 오두막", ic:"오", c:"#4a5a3a"},
  {id:4,  name:"이글루", ic:"이", c:"#8fb3c9"},
  {id:10, name:"약탈자 전초기지", ic:"약", c:"#5b5f66"},
  {id:11, name:"폐허가 된 차원문", ic:"차", c:"#7b3fbf"},
  {id:24, name:"길의 잔해", ic:"길", c:"#9a6b4f"},
  {id:26, name:"버려진 캠프", ic:"캠", c:"#c0562a"},
  // 지도 전용 (시드 찾기 조건에는 안 들어감)
  {id:200, name:"동굴 입구", map:true},
  {id:201, name:"던전", map:true},
  {id:202, name:"지하 용암 호수", map:true},
  {id:203, name:"지표 용암 호수", map:true},
  {id:210, name:"생성기 (확인됨)", map:true, anyDim:true, scan:true},
  {id:211, name:"드러난 용암 (확인됨)", map:true, anyDim:true, scan:true},
  {id:212, name:"땅속 용암 (확인됨)", map:true, anyDim:true, scan:true},
  {id:15, name:"폐광", map:true},
  {id:17, name:"자수정 정동", map:true},
  {id:100, name:"스포너 (동굴 거미)", map:true},
  {id:101, name:"스포너 (좀벌레)", map:true},
  {id:18, name:"네더 요새", dim:-1, map:true},
  {id:19, name:"보루 잔해", dim:-1, map:true},
  {id:12, name:"폐허가 된 차원문", dim:-1, map:true},
  {id:20, name:"네더 화석", dim:-1, map:true},
  {id:102, name:"스포너 (블레이즈)", dim:-1, map:true},
  {id:21, name:"엔드 도시", dim:1, map:true},
  {id:121, name:"엔드 도시 (엔드 배)", dim:1, map:true},
  {id:22, name:"엔드 관문", dim:1, map:true},
];
for (const s of STRUCTS) s.dim = s.dim || 0;
const SEARCH_STRUCTS = STRUCTS.filter(s => !s.map);
const SMALL_ST = new Set([17, 100, 20, 15, 22, 200, 201, 202, 203, 210, 211, 212]); // 아주 촘촘한 것은 항상 작게
const GLOBAL_ST = new Set([27, 101]); // 월드 전체를 한 번에 계산하는 것 (엔드 유적 128개)
const SNAME = {}; const SBY = {}; for (const s of STRUCTS) { SNAME[s.id] = s.name; SBY[s.id] = s; }
// 구조물 아이콘: 16×16 도트. 각 구조물의 대표 특징(종, 차원문 틀, 열쇠 등)을 단순하게 새로 그림
const PIX_PAL = {"k": "#17181b", "w": "#f4f4f4", "y": "#f2c230", "Y": "#b07d12", "o": "#e07b28", "O": "#a24d14", "b": "#8a5a2c", "B": "#4e2f15", "g": "#5fae3c", "G": "#2e6a28", "t": "#35d0c0", "T": "#11615f", "p": "#a35ae0", "P": "#4b1c7a", "s": "#9a9a9a", "S": "#5c5c5c", "d": "#3b3f47", "D": "#24272d", "c": "#9fe8ff", "n": "#ecd796", "N": "#c9a55a", "r": "#d63a3a", "R": "#8e1f1f", "m": "#6f8f4c", "i": "#eef6fa", "I": "#b3c9d6", "v": "#63b8a6", "V": "#2c6e64", "e": "#d9d6a4", "E": "#97946a", "l": "#3fd69c", "x": "#0d0d12", "q": "#4fa08b", "Q": "#2b6656", "u": "#4fd3f2", "L": "#5dffb0", "j": "#1d8f5c", "h": "#b86a43", "H": "#7f4428", "z": "#c8b39a", "Z": "#8f8172", "a": "#3a8fd6", "f": "#7a4a2a", "F": "#4a2a16", "1": "#5a2428", "2": "#33151a", "3": "#2b2731", "4": "#45404d", "5": "#b38ab3", "6": "#7d5a82", "7": "#e8e2f0", "8": "#c9a24a", "9": "#3e2a6b", "0": "#d49df2", "!": "#8c5bd1", "@": "#f4f0e0", "#": "#bdb59a", "$": "#6b6b6b", "%": "#2a3a4a", "^": "#c23b3b", "&": "#f0c23a", "*": "#ff9d2e", "(": "#a0a0a8", ")": "#55565c", "-": "#1a1a20", "+": "#2e8b8b", "Ж": "#4f8a3a", "ж": "#2f5a22", "Ч": "#e6e6e0", "ч": "#a8a8a0", "Ш": "#ff6a1a", "ш": "#ffb347", "Щ": "#c2410c", "α": "#cfe3ef", "β": "#8aa1ae", "γ": "#4f6470", "δ": "#c23b3b", "ε": "#7b7b84", "ζ": "#e9d7ff", "η": "#c79bf2", "θ": "#9a5fe0", "ι": "#6a3aa8", "κ": "#3e2170", "λ": "#7a7a7a", "μ": "#5e5e5e", "ν": "#8f8f8f", "ξ": "#4f7d3a", "ο": "#6f9c4a", "π": "#b8b8b8", "ρ": "#8e8e8e", "σ": "#d6d6d6", "τ": "#5a5a5a", "υ": "#fff27a", "φ": "#f6c22a", "χ": "#e48a14", "ψ": "#a85a0c", "ω": "#3a1f0a", "Α": "#3b1519", "Β": "#5a2026", "Γ": "#7a2c31", "Δ": "#2a0e12", "Ε": "#2b2731", "Ζ": "#3a3542", "Η": "#4a4453", "Θ": "#f2c230", "Ι": "#ff7a1a", "Κ": "#14101c", "Λ": "#3b2466", "Μ": "#8a4ad6", "Ν": "#f6d23a", "Ξ": "#b07d12", "Ο": "#efe6cf", "Π": "#cfc3a4", "Ρ": "#a99a78", "Σ": "#9d9cb4", "Τ": "#6f6e8c", "Υ": "#c9c8dc", "Φ": "#4b4a66", "Χ": "#232323", "Ψ": "#3a3a3a", "Ω": "#161616", "ϐ": "#b06ce0", "ϑ": "#e7c6ff", "ϒ": "#2a8f3a", "ϓ": "#5fb043", "ϔ": "#7a5232", "ϕ": "#5a3a22", "ϖ": "#ff6a00", "ϗ": "#ffb03a", "Ϙ": "#c8420a", "ϙ": "#3a3a42", "Ϛ": "#2a2a30", "ϛ": "#4c4c55", "Ϝ": "#4f7c3a", "ϝ": "#3c6a2c", "Ϟ": "#6fa04f", "ϟ": "#26401d", "Ϡ": "#e4e4e4", "ϡ": "#c4c4c4", "Ϣ": "#9a9a9a", "ϣ": "#8b8b8b", "Ϥ": "#6b6b6b", "ϥ": "#a3a3a3"};
const PIX = {"5": ["................", ".......kk.......", "......kYYk......", ".....kyyyyk.....", "....kyyyyyyk....", "....kywyyyyk....", "....kywyyyyk....", "....kyyyyyyk....", "...kyyyyyyyyk...", "...kyyyyyyyyk...", "..kyyyyyyyyyyk..", "..kYYYYYYYYYYk..", "...kkkkkkkkkk...", ".......kYk......", "........k.......", "................"], "13": ["................", "................", "kkkkkkkkkkkkkkkk", "kswswswswswswswk", "kwkkkkkkkkkkkksk", "kskDDDDDDDDDDkwk", "kwkDDTDDDDDDDksk", "kskDDDDDDDTDDkwk", "kwkDDDDDDDDDDksk", "kskkkkkkkkkkkkwk", "kswswswswswswswk", "kkkkkkkkkkkkkkkk", ".k..k..k..k..k..", "kck.kck.kck.kck.", "kuukuuukuuukuuuk", "kkkkkkkkkkkkkkkk"], "25": ["................", "................", "...kkkk.........", "..kooook........", ".kooyyook.......", ".kok..kokkkkkkk.", ".kyk..koooooooyk", ".kok..kokkkkokok", ".koOkkOok..kokok", "..kOooOk...kkkk.", "...kkkk.........", "................", "................", "................", "................", "................"], "27": ["..kkkkkkkkkkk...", "..keLEeLEeLEk...", "kkkEjEEjEEjEkkk.", "keExxxxxxxxxEek.", "kLjxxcxxxxxxjLk.", "kEExxxxxxcxxEEk.", "keExxxxxxxxxEek.", "kLjxxxxxxxxxjLk.", "kEExcxxxxxxxEEk.", "keExxxxxcxxxEek.", "kLjxxxxxxxcxjLk.", "kEExxxxxxxxxEEk.", "kkkEjEEjEEjEkkk.", "..keLEeLEeLEk...", "..kkkkkkkkkkk...", "................"], "9": ["................", "................", "......kkkkkkkkk.", ".....kBBBBBBBBBk", ".....kkkkkkkkkkk", "......kbcbbbcbk.", "......kSSSSSSSk.", "kkkkkkkkkkkkkkkk", "kBBBBBBBBBBBBBBk", "kkkkkkkkkkkkkkkk", "kbcbbcbbcbbcbbck", "kSSSSSSSSSSSSSSk", "kbbbbbbkkbbbbbbk", "kbbbbbbkkbbbbbbk", "kSSSSSSSSSSSSSSk", "kkkkkkkkkkkkkkkk"], "8": ["................", "................", ".......kk.......", "......kwwk......", ".....kvVVvk.....", "....kkkkkkkk....", "...kwvvVVvvwk...", "...kkkkkkkkkk...", "..kwvVvvvvVvwk..", "..kkkkkkkkkkkk..", ".kwvvVvvvvVvvwk.", ".kvVvvvVVvvvVvk.", ".kkkkkkkkkkkkkk.", "................", "................", "................"], "7": [".....B..........", ".....B..........", ".....B....B.....", "..BBBBBBBBBBBB..", ".....B....B.....", ".....B....B.....", "..BBBBBB..B.....", ".k...B....B.....", "kfk..B....B.kk..", "kffkkBkkkkBkffkk", "kfffffffffffffkf", ".kfFfffffffffffk", "..kfffFffffffkfk", "...kfffffFfffkk.", "....kfffffffkfk.", ".....kFFFFFk.k.."], "6": ["................", "................", "....kkk.........", "....ksk.........", "...kssk......kk.", "...kSsk.....kgk.", "...ksSk.....kgk.", "...kssk..kk.kgk.", "...ksskkkssk.kgk", "...kSsksSssk.kGk", "...ksskssSsk.kgk", "..kssssssssskkgk", "..kmssSssmsssskk", ".kmmsssssssmmmsk", ".kkkkkkkkkkkkkkk", "................"], "14": ["................", "................", "..kkkkkkkkkkkk..", ".kbbbbbbbbbbbbk.", ".kbBBBBBBBBBBbk.", ".kbbbbbbbbbbbbk.", ".kSbbbbbbbbbbSk.", ".kkkkkyyyykkkkk.", ".kSbbbyYYybbbSk.", ".kbbbbyyyybbbbk.", ".kbbbbbkkbbbbbk.", ".kbbbbbbbbbbbbk.", ".kBBBBBBBBBBBBk.", ".kSBBBBBBBBBBSk.", ".kkkkkkkkkkkkkk.", "................"], "2": ["................", "................", "...kkkkkkkkkk...", "...ksgssgsSsk...", "...kGsSssssGk...", "...kGssgsssGk...", "...ksssSsgssk...", "kkkkkkkkkkkkkkkk", "kssgsSssssssgssk", "kGsssgsssSssssGk", "kGssssxxxxsSssGk", "kGsSgsxxxxssgsGk", "kGssssxxxxssssGk", "kssgssxxxxSsssgk", "kGssssxxxxssgsGk", "kkkkkkkkkkkkkkkk"], "1": ["................", ".kkk........kkk.", "kknkk......kknkk", "knnnk......knnnk", "koook..kk..koook", "konok.knNk.konok", "koookknnnNkkoook", "knonknnnnNNknonk", "knnnkkkkkkkknnnk", "knonknonnonknonk", "knnnknnkknnknnnk", "knonknkxxknknonk", "knnnknkxxknknnnk", "knNnknkxxknknNnk", "knNNknkxxknknNNk", "kkkkkkkkkkkkkkkk"], "3": ["................", "................", ".kkkkkkkkkkkkkk.", "kBBBBBBBBBBBBBBk", "kkkkkkkkkkkkkkkk", "..kbbbbbbbbbbk..", "..kbkkkbbbkkbk..", "..kbkpkbbbkxbk..", "..kbkkkbbbkxbk..", "..kbbbbbbbkxbk..", "..kkkkkkkkkkkk..", "...kbk....kbk...", "...kbk....kbk...", "qqqkbkqqqqkbkqqq", "QqqQqqqQqqqQqqqQ", "QQQQQQQQQQQQQQQQ"], "4": ["................", "................", ".....kkkkkk.....", "...kkiiiiiikk...", "..kiiIiiiiiIik..", ".kiiiiiiiiiiiik.", ".kiIiiiiIiiiiik.", "kiiiiiiiiiiiIiik", "kiiiIiiiiiiiiiik", "kiiiiiiiikkkkiik", "kiIiiiiikiiiikIk", "kiiiiiiikIccIkik", "kiiiiIiikIccIkik", "kkkkkkkkkkkkkkkk", "................", "................"], "10": [".....kkkkkk.....", "...kkBBBBBBkk...", "..kBBBBBBBBBBk..", "..kkkkkkkkkkkk..", "..kBkbkbbkbkBk..", "..kBnnnnnnnnBk..", "..kkkkkkkkkkkk..", "....kBbBBbBk....", "....kBbBBbBk....", "....kSbBBbSk....", "....kBbBBbBk....", ".kk.kBbBBbBk.kk.", ".kBkkkkkkkkkkBk.", ".kBsSssSssSssBk.", ".kBssSssssSssBk.", ".kkkkkkkkkkkkkk."], "11": ["................", "....kkkkk.......", "...kxxPxxkkk....", "...kxkkkkPxk....", "...kxkpppkxk....", "...kPkpPpkxk....", "...kxkpppk.k....", "...kxkppPk......", "...kxkpppkkk....", "...kxkpPpkxk....", "...kPkkkkkxk....", "...kxxxPxxxk....", "...kkkkkkkkk....", "................", "................", "................"], "24": ["................", "................", ".kkkkk..........", ".khhHk..........", ".kHhhk...kkkkkk.", ".khhHk...khHhhk.", ".kHhhk...khhhHk.", ".khhHk...kHaahk.", ".kHhhkk..khayhk.", ".khhHhk..khhhHk.", "kkkkkkkkkkkkkkkk", "kzZzzzZzzzzZzzZk", "kZzzZzzzZzzzzZzk", "kzzZzzzZzzZzzzzk", "kkkkkkkkkkkkkkkk", "................"], "26": ["................", "................", "......kkkk......", ".....kwwwIk.....", "....kwwwwwIk....", "...kwwwwwwwIk...", "..kwwwkkkkwwIk..", ".kwwwkxxxxkwwIk.", ".kwwkzxxxxzkwIk.", "kwwwkzxxxxzkwwIk", "kwwwkzxxxxzkwwIk", "kkkkkzxxxxzkkkkk", "....kkkkkkkk....", "....kbSSSSbk....", "....kbbkbbbk....", "....kkkkkkkk...."], "spawn": ["................", ".....kkkkkk.....", "...kkγγααγγkk...", "..kkγααδδααγkk..", "..kγβααδδααβγk..", ".kγααααδδααααγk.", ".kγααααδδααααγk.", ".kγααααδδααααγk.", ".kγααααεεααααγk.", ".kγααααεεααααγk.", ".kγααααεεααααγk.", "..kγβααεεααβγk..", "..kkγααεεααγkk..", "...kkγγγγγγkk...", ".....kkkkkk.....", "................"], "15": ["................", "kkkkkkkkkkkkkkkk", "kbbbbbbbbbbbbbbk", "kBBBBBBBBBBBBBBk", "kkkkkkkkkkkkkkkk", ".kbBk......kbBk.", ".kbBkxxxxxxkbBk.", ".kbBkxxxxxxkbBk.", ".kbBkxsxxsxkbBk.", ".kbBkbsbbsbkbBk.", ".kbBkxsxxsxkbBk.", ".kbBkbsbbsbkbBk.", ".kbBkxsxxsxkbBk.", "kbBkbbsbbsbbkbBk", "kbBkxxsxxsxxkbBk", "kkkkkkkkkkkkkkkk"], "17": ["................", ".......kk.......", "......kζηk......", "......kζηk..k...", "..k...kηθk.kζk..", ".kζk..kηθk.kηk..", ".kηk.kζηθkkηθk..", ".kηθkkζηθkηθk...", "..kηθkζηθkθk....", "..kηθkηθιkθk....", "...kθkηθιkιk....", "...kθιηθιιk.....", "..kιιθιθιιιk....", ".kκκκκκκκκκκk...", "..kkkkkkkkkk....", "................"], "18": [".....kk.kk.kk...", ".....kΓkΓkΓk....", ".....kΓΒΓΒΓk....", ".....kΒΓΒΓΒk....", ".....kΓΒkΒΓk....", "kkkkkkΒkΔkΒkkkkk", "kΓΒΓΒkΓkΔkΓkΒΓΒk", "kkkkkkΒΓΒΓΒkkkkk", ".kΓk..kΒΓΒk..kΓk", ".kΒk..kΓΒΓk..kΒk", ".kΓkkkkΒΓΒkkkkΓk", ".kΒkΔΔkΓΒΓkΔΔkΒk", ".kΓkΔΔkΒΓΒkΔΔkΓk", ".kΒk..kΓΒΓk..kΒk", ".kΓk..kΒΓΒk..kΓk", ".kkk..kkkkk..kkk"], "19": ["kkkk........kkkk", "ΖΗΖΕkkkkkkkkΕΗΕΖ", "ΖΕΕΕΕΖΕΖΗΖΕΕΗΗΗΕ", "ΕΕΗΕΕΗΕΗΖΗΕΕΕΕΕΕ", "ΖΗΕΖΖΖΗΖΖΗΖΕΖΗΕΖ", "ΕΕΖΕΗΗΕΗΕΖΕΕΖΕΕΕ", "ΖΘΘΞΘΘΞΘΘΞΘΘΞΘΘΖ", "ΕΕΗΖΕΕΖΗΗΗΖΕΖΕΖΖ", "ΖΕΕΗΖΕbbbbΕΖΕΗΕΖ", "ΗΕΗΕΖΕbΘΘbΖΕΕΕΕΕ", "ΕΕΖΕΙϗΙΙϗΙΙϗΖΕΕΖ", "ΕΖΕΕϗΙΙϗΙΙϗΙΗΕΕΖ", "ΕΕΖΖΙΙϗΙΙϗΙΙΖΖΕΗ", "ΖΕΖΕΙϗΙΙϗΙΙϗΕΖΕΖ", "ΖΖΕΕΕΕΖΕΖΕΗΗΗΕΕΖ", "ΗΖΕΕΖΕΕΗΕΕΕΕΕΕΕΕ"], "20": ["................", ".......kk.......", "..kkkkkΟΟkkkkk..", ".kΟΟΟΟkΟΟkΟΟΟΟk.", ".kΟkkkkΠΟkkkkΟk.", "kΟk..kkΟΟkk..kΟk", "kΟk.kΟΟkΟΟΟk.kΟk", "kΟkkΟkkΠΟkkΟkkΟk", "kΠkΟk.kΟΟk.kΟkΠk", "kΠkΟkkkΟΠkkkΟkΠk", ".kkΠkΟΟΟΟΟΟkΠkk.", "..kΠkΠkkkkΠkΠk..", "...kkΠk.kΠkkk...", "....kΠk.kΠk.....", ".....kk..kk.....", "................"], "21": ["....kkkkkkkk....", "...k55555555k...", "..k5555555555k..", "..kkkkkkkkkkkk..", ".....k5665k.....", ".....k6xx6k.....", "...kkk5665kkk...", "..k5555555555k..", "..kkkkk66kkkkk..", ".....k5665k.....", ".....k5xx5k.....", ".....k5665k.....", ".....k6556k.....", ".....k5xx5k.....", ".....k5665k.....", ".....kkkkkk....."], "121": ["......kkkk......", ".....kΥΣΣΥk.....", "....kΥΣkkΣΥk....", "...kΥΣk..kΣΥk...", "...kΣΣk..kΣΣk...", "..kΥΣΤk..kΤΣΥk..", "..kΣΣΤk..kΤΣΣk..", ".kΥΣΤΣk..kΣΤΣΥk.", ".kΣΣΤΣk..kΣΤΣΣk.", ".kΣΤΣΤk..kΤΣΤΣk.", "kΥΣΤΣΦk..kΦΣΤΣΥk", "kΣΤΣΦk....kΦΣΤΣk", "kΣΣΦk......kΦΣΣk", "kΤΦk........kΦΤk", ".kk..........kk.", "................"], "22": [".......ϐϑ.......", ".......ϐϑ.......", "......kϐϑk......", "....kkΧΨΧΩkk....", "...kΨΧΩΧΨΧΩΨk...", "...kΧΩΨΧΩΨΧΩk...", "....kkk--kkk....", "......k-+k......", "......k+-k......", "....kkk--kkk....", "...kΩΧΨΩΧΨΩΧk...", "...kΨΩΧΨΩΧΨΩk...", "....kkΧΨΩΧkk....", "......kϐϑk......", ".......ϐϑ.......", ".......ϐϑ......."], "100": ["kkkkkkkkkkkkk...", "k$$$$$$$$$$$k...", "k$-)-)-)-)-$k...", "k$-)-)-)-)-$k...", "k$-)-)-)-)-$k...", "k$$$$$$$$$$$k...", "k$-)-)-)-)-$k...", "k$-)-)-kkkkkkkkk", "k$-)-)-k%%%%%%%k", "k$$$$$$k%^%%%^%k", "k$-)-)-k%%^%^%%k", "k$$$$$$k%%%%%%%k", "kkkkkkkk%^^%^^%k", ".......k%%%%%%%k", ".......k-%-%-%-k", ".......kkkkkkkkk"], "101": ["kkkkkkkkkkkkk...", "k$$$$$$$$$$$k...", "k$-)-)-)-)-$k...", "k$-)-)-)-)-$k...", "k$-)-)-)-)-$k...", "k$$$$$$$$$$$k...", "k$-)-)-)-)-$k...", "k$-)-)-)-)-$k...", "k$-)-)-)-)-$k.kk", "k$$$kk$kk$kkkk.k", "k$-kσσkσσkσσkσk.", "k$kπσπρπσπρπσπσk", "kkkτπτρτπτρτπσxk", "..kπρπρπρπρπρπσk", "...kτkkτkkτkkτk.", "....k..k..k..k.."], "102": ["kkkkkkkkkkkkk...", "k$$$$$$$$$$$k...", "k$-)-)-)-)-$k...", "k$-)-)-)-)-$k...", "k$-)-)-)-)-$k...", "k$$$$$$$$$$$k...", "k$-)-)-)-)-$k...", "k$-)-)-kkkkkkkkk", "k$-)-)-kφυφφφυφk", "k$$$$$$kυφφυφφυk", "k$-)-)-kφωωφωωφk", "k$$$$$$kχφφφφφχk", "kkkkkkkkφφωωωφφk", ".......kχφχφχφχk", ".......kψχψχψχψk", ".......kkkkkkkkk"], "12": ["kΞΝΝΚΚΚΚΚΚΚΚΚk..", "kΝΝΞΚΚΚΚΚΚΚΚΚk..", "kΝΞΝΚΚΚΚΚΚΚΚΚkkk", "kΚΚΚkkkkkkΛΛΛΚΚΚ", "kΚΚΚk....kΛΛΛΚΚΚ", "kΚΚΚk..kkkΛΛΛΚΚΚ", "kΛΛΛk.kpΜppΜpΚΚΚ", "kΛΛΛk.kΜpΜΜpΜΚΚΚ", "kΛΛΛk.kpΜppΜpΚΚΚ", "kΚΚΚk.kpΜppΜpΛΛΛ", "kΚΚΚk.kΜpΜΜpΜΛΛΛ", "kΚΚΚkkkpΜppΜpΛΛΛ", "kΚΚΚΚΚΚkkkΚΚΚΚΚΚ", "kΚΚΚΚΚΚk.kΚΚΚΚΚΚ", "kΚΚΚΚΚΚk.kΚΚΚΚΚΚ", ".kkkkkk...kkkkkk"], "200": ["................", "................", "................", "................", "................", "kkkkkkkkkkkkkkkk", "ϓϒϓϒϓϒϓϒϓϒϓϒϓϒϓϒ", "ϔϕϔϔϔϕkkkϔϔϕϔϔϔϕ", "ϣϤϥϣϣkxxxkϣϤϥϣϣϤ", "ϤϣϣϥkxxxxxkϣϣϤϥϣ", "ϣϥϤϣkxxxxxkϥϣϣϤϣ", "ϥϣϣϤϣkxxxkϣϤϥϣϣϥ", "ϣϤϣϣϥϣkkkϣϣϣϤϣϥϣ", "ϤϣϥϣϣϤϣϥϣϣϤϣϣϥϣϤ", "kkkkkkkkkkkkkkkk", "................"], "201_1": ["kkkkkkkkkkkkk...", "kλλξλλολοξμλk...", "kνξξλλμξλλξλk...", "kμνλμλλμμλοοk...", "kομομλλμμομμk...", "kμνλξοξνομνμk...", "kμνλξλξλομμλk...", "kμονοξνkkkkkkkkk", "kλμμνονkϟϟϟϟϟϟϟk", "kοξμλμλkϝϝϝϝϝϝϝk", "kλολμλμkϜϜϜϜϜϜϜk", "kλνμλλμkϟ-ϜϜϜ-ϟk", "kkkkkkkkϜϜϜϝϜϜϜk", ".......kϜϝϟϟϟϝϜk", ".......kϜϜϜϜϜϜϜk", ".......kkkkkkkkk"], "201_0": ["kkkkkkkkkkkkk...", "kλλξλλολοξμλk...", "kνξξλλμξλλξλk...", "kμνλμλλμμλοοk...", "kομομλλμμομμk...", "kμνλξοξνομνμk...", "kμνλξλξλομμλk...", "kμονοξνkkkkkkkkk", "kλμμνονkϠϠϠϠϠϠϠk", "kοξμλμλkϡϠϠϠϠϠϡk", "kλολμλμkϠ--Ϡ--Ϡk", "kλνμλλμkϠ--Ϡ--Ϡk", "kkkkkkkkϡϠϠ-ϠϠϡk", ".......kϠ-Ϡ-Ϡ-Ϡk", ".......kϡϠϡϠϡϠϡk", ".......kkkkkkkkk"], "201_3": ["kkkkkkkkkkkkk...", "kλλξλλολοξμλk...", "kνξξλλμξλλξλk...", "kμνλμλλμμλοοk...", "kομομλλμμομμk...", "kμνλξοξνομνμk...", "kμνλξλξλομμλk...", "kμονοξνkkkkkkkkk", "kλμμνονk-------k", "kοξμλμλk-^---^-k", "kλολμλμk--^-^--k", "kλνμλλμk-------k", "kkkkkkkk-^^-^^-k", ".......k-------k", ".......k)-)-)-)k", ".......kkkkkkkkk"], "201": ["kkkkkkkkkkkkk...", "kλλξλλολοξμλk...", "kνξξλλμξλλξλk...", "kμνλμλλμμλοοk...", "kομομλλμμομμk...", "kμνλξοξνομνμk...", "kμνλξλξλομμλk...", "kμονοξνkkkkkkkkk", "kλμμνονkϟϟϟϟϟϟϟk", "kοξμλμλkϝϝϝϝϝϝϝk", "kλολμλμkϜϜϜϜϜϜϜk", "kλνμλλμkϟ-ϜϜϜ-ϟk", "kkkkkkkkϜϜϜϝϜϜϜk", ".......kϜϝϟϟϟϝϜk", ".......kϜϜϜϜϜϜϜk", ".......kkkkkkkkk"], "202": ["kkkkkkkkkkkkkkkk", "ϙϚϚϙϙϛϙϙϙϙϚϛϙϛϙϙ", "ϙϙϙϙϛϚϙϛϙϙϙϙϙϛϙϙ", "ϙϙϙϙϙϙϚϚϙϙϙϙϙϛϚϙ", "ϚϛϙϙϚϙϚϚϙϙϙϙϚϙϚϚ", "ϚϛϚϙϛϛϙϙϚϙϚϛϙϙϛϚ", "ϛϙϙxxxxxxxxxxϚϙϚ", "ϛϙϙxxxxxxxxxxϙϚϚ", "ϙϙϚϖϖϗϖϖϖϗϖϖϖϙϙϛ", "ϙϙϙϘϘϘϘϘϘϘϘϘϘϙϙϙ", "ϛϙϙϛϚϙϙϛϚϙϛϙϙϙϛϛ", "ϚϛϚϚϛϛϙϙϛϙϙϛϚϙϙϛ", "ϚϙϙϙϚϙϚϙϙϚϚϙϚϛϚϚ", "ϚϙϙϙϛϙϚϚϚϛϚϙϚϚϚϚ", "ϛϚϙϛϚϚϙϙϙϙϙϚϛϚϙϛ", "kkkkkkkkkkkkkkkk"], "203": ["................", "................", "................", "kkkk........kkkk", "ϒϓϒϓk......kϒϓϒϓ", "ϔϔϔϔkkkkkkkkϔϔϔϔ", "ϔϔϔϔϖϖϗϖϖϗϖϖϔϔϔϔ", "ϕϔϔϔϖϖϖϖϖϖϖϖϔϔϔϔ", "ϤϣϤϣϔϘϘϘϘϘϘϔϣϥϣϣ", "ϥϤϣϤϤϤϤϣϥϥϤϣϥϥϤϣ", "ϤϥϥϤϥϤϤϣϤϤϥϥϥϤϤϣ", "ϣϥϤϥϤϣϣϥϣϤϥϣϤϣϤϥ", "ϥϥϣϤϥϥϤϤϤϣϤϤϤϥϤϤ", "ϣϥϥϤϥϤϤϤϤϣϤϤϤϤϣϤ", "ϣϣϥϥϤϣϤϣϣϤϣϤϥϥϤϣ", "kkkkkkkkkkkkkkkk"], "19_0": ["kkkk........kkkk", "ΗΖΗΗkkkkkkkkΕΕΗΖ", "ΕΗΗΕΖΗΖΕΗΕΗΕΖΖΗΕ", "ΕΕΖΗΗΖΖΕΕΕΕΕΗΖΕΕ", "ΕΕΕΗΕΖΕΖΖΗΕΖΕΖΖΕ", "ΗΖΕΖΕΕΕΖΕΖΕΖΕΖΖΗ", "ΖΘΘΞΘΘΞΘΘΞΘΘΞΘΘΕ", "ΕΖΗΗΗΕΕΕΕΕΗΖΖΕΕΖ", "ΕΖΕΖΕΖΕΕΖΖΖΕΕΗΗΕ", "ΖΕΗΖΗΖxxxxΕΕΕΗΗΕ", "ΕΖΖΗΖΕxxxxΖΕΖΖΖΗ", "ΖkkkΗΕxxxxΕΕkkkΖ", "ΖbΘbΖΕxxxxΖΗbΘbΕ", "ΕbbbΖΕxxxxΕΖbbbΕ", "ΕΖΖΕΖΖxxxxΖΕΖΖΗΖ", "ΖΖΕΕΗΕxxxxΕΕΖΕΖΕ"], "19_1": ["kkkk........kkkk", "ΗΕΗΕkkkkkkkkΗΖΕΕ", "ΖΕΕΖΕΕΖΕΕΕΗΖΖΕΕΕ", "ΗΕΖΗΕΖΖΕΕΗΖΗΕΖΖΗ", "ΖΖΖΕΖΖΖΗΖΕΖΕΕΕΖΗ", "ΗΖΗΕΕΕΕΖΕΕΗΖΗΖΕΕ", "ΗΘΘΞΘΘΞΘΘΞΘΘΞΘΘΕ", "ΕΗΖΕΕΕΗΗΖΕΗΕΖΕΖΗ", "ΖΕΖΕΕΕΗΕΕΕΖΕΕΖΕΗ", "ΖΕΖΕΖΗΗΗΗΗΗΖΕΕΕΕ", "ΕΕΕΖΕΗbbbbΗΕΖΕΖΖ", "ΕΖΗΖΖΗbkbkΗΗΕΕΕΖ", "ΕΗΕΕΖbbOObbΕΗΖΕΖ", "ΕΖΕΖΖbOσσObΗΖΕΗΕ", "ΖΕΖΕΕΗbbbbΗΕΕΕΕΗ", "ΖΕΕΕΖΗΗΕΗΕΕΖΕΕΖΕ"], "19_2": ["kkkk........kkkk", "ΖΗΖΕkkkkkkkkΕΗΕΖ", "ΖΕΕΕΕΖΕΖΗΖΕΕΗΗΗΕ", "ΕΕΗΕΕΗΕΗΖΗΕΕΕΕΕΕ", "ΖΗΕΖΖΖΗΖΖΗΖΕΖΗΕΖ", "ΕΕΖΕΗΗΕΗΕΖΕΕΖΕΕΕ", "ΖΘΘΞΘΘΞΘΘΞΘΘΞΘΘΖ", "ΕΕΗΖΕΕΖΗΗΗΖΕΖΕΖΖ", "ΖΕΕΗΖΕbbbbΕΖΕΗΕΖ", "ΗΕΗΕΖΕbΘΘbΖΕΕΕΕΕ", "ΕΕΖΕΙϗΙΙϗΙΙϗΖΕΕΖ", "ΕΖΕΕϗΙΙϗΙΙϗΙΗΕΕΖ", "ΕΕΖΖΙΙϗΙΙϗΙΙΖΖΕΗ", "ΖΕΖΕΙϗΙΙϗΙΙϗΕΖΕΖ", "ΖΖΕΕΕΕΖΕΖΕΗΗΗΕΕΖ", "ΗΖΕΕΖΕΕΗΕΕΕΕΕΕΕΕ"], "19_3": ["kkkk........kkkk", "ΖΖΕΗkkkkkkkkΗΕΕΖ", "ΕΕΕΗΖΗΖΕΕΖΖΖΕΕΕΕ", "ΕΕΗΗΗΕΖΖΕΖΖΖΕΕΕΖ", "ΗΖΕΕΗΖΖΖΖΗΕΖΖΕΕΖ", "ΗΕΕΕΗΕΕΕΕΕΗΖΕΕΖΕ", "ΕΘΘΞΘΘΞΘΘΞΘΘΞΘΘΕ", "ΖΖΖΖΗΗΖΕΖΗΕΕΖΕΖΕ", "ΗΕΕΕΕΕΕΕΖΕΗΕΖΕΕΗ", "ΕΕΗΕΖΕΗΖΕΕΕΖΕΗΕΕ", "ΖΖΖΖΖΖΖΖΖΖΖΖΖΖΖΖ", "ΗΕΕΕΗkkkkkkΗΕΖΕΕ", "ΖΕΕΕΕk....kΕΗΕΖΖ", "ΕΖΖΗΕk....kΕΗΖΗΖ", "ΗΖΕΕΗk....kΕΕΕΕΗ", "ΖΗΕΗΗk....kΗΗΕΖΖ"], "200_big": ["................", "................", "kkkkkkkkkkkkkkkk", "ϓϒϓϒkkkkkkkkϓϒϓϒ", "ϔϕϔkxxxxxxxxkϔϕϔ", "ϣϥkxxxxxxxxxxkϣϤ", "ϤkxxxxxxxxxxxxkϤ", "ϣkxxxxxxxxxxxxkϥ", "kxxϤxxxxxxxxϤxxk", "kxxkxxxxxxxxkxxk", "kxxxxxxxxxxxxxxk", "ϣkxxxxxxxxxxxxkϣ", "ϤϣkxxxxxxxxxxkϣϤ", "ϣϥϣkkkkkkkkkkϣϥϣ", "kkkkkkkkkkkkkkkk", "................"]};
const ICONS = {}, ICON_URL = {};
for (const s of [...STRUCTS, { id: "spawn" }, { id: "201_0" }, { id: "201_1" }, { id: "201_3" }, { id: "200_big" }, { id: "19_0" }, { id: "19_1" }, { id: "19_2" }, { id: "19_3" }]) {
  if (s.id === 210) PIX[210] = PIX["201_1"]; if (s.id === 211) PIX[211] = PIX[203]; if (s.id === 212) PIX[212] = PIX[202];
  const cv = document.createElement("canvas"); cv.width = 16; cv.height = 16; const c = cv.getContext("2d");
  (PIX[s.id] || []).forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== ".") { c.fillStyle = PIX_PAL[ch]; c.fillRect(x, y, 1, 1); } }));
  ICON_URL[s.id] = cv.toDataURL();
  // 지도용: 바깥에 반투명 흰 테두리 1칸 (18×18)
  const mv = document.createElement("canvas"); mv.width = 18; mv.height = 18; const m = mv.getContext("2d");
  const rows = PIX[s.id] || [], on = (x, y) => y >= 0 && y < 16 && x >= 0 && x < 16 && rows[y] && rows[y][x] !== ".";
  m.fillStyle = "rgba(255,255,255,0.72)";
  for (let y = -1; y <= 16; y++) for (let x = -1; x <= 16; x++) {
    if (on(x, y)) continue;
    let n = false; for (let dy = -1; dy <= 1 && !n; dy++) for (let dx = -1; dx <= 1; dx++) if (on(x + dx, y + dy)) { n = true; break; }
    if (n) m.fillRect(x + 1, y + 1, 1, 1);
  }
  m.drawImage(cv, 1, 1);
  ICONS[s.id] = mv;
}
const iconTag = (st, px) => `<img alt="" width="${px}" height="${px}" style="display:block;flex:none;image-rendering:pixelated" src="${ICON_URL[st]}">`;
/* ---------------- wasm + workers ---------------- */
function b64ToBytes(s) { const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
const anyStub = new Proxy({}, { get: () => () => 0 });
const imports = { wasi_snapshot_preview1: anyStub, env: anyStub };
let wasmModule, mainEx;
const ready = WebAssembly.compile(b64ToBytes(WASM_B64)).then(async m => {
  wasmModule = m; mainEx = (await WebAssembly.instantiate(m, imports)).exports;
});

const workerSrc = `
let ex, MC, running = false, cfg, cursor = 0n;
const anyStub = new Proxy({}, { get: () => () => 0 });
const I32 = () => new Int32Array(ex.memory.buffer);
onmessage = async (ev) => {
  const d = ev.data;
  if (d.type === "init") {
    ex = (await WebAssembly.instantiate(d.module, { wasi_snapshot_preview1: anyStub, env: anyStub })).exports;
    MC = ex.mc_wd(); postMessage({ type: "ready" });
  } else if (d.type === "run") {
    cfg = d.cfg; cursor = BigInt(cfg.start) + BigInt(d.index);
    const m = I32(); const ip = ex.ids_ptr() >> 2, yp = ex.ys_ptr() >> 2, sp = ex.sids_ptr() >> 2;
    cfg.ids.forEach((v, i) => { m[ip + i] = v; m[yp + i] = cfg.ys[i]; });
    cfg.sids.forEach((v, i) => { m[sp + i] = v; });
    running = true; loop();
  } else if (d.type === "stop") { running = false; }
  else if (d.type === "tile" && d.cave !== undefined) {
    // 동굴 단면: 0 돌 / 1 동굴 / 2 지표 위. 동굴 칸은 그 높이의 바이옴까지
    ex.set_seed_dim(d.lo, d.hi, MC, 0);
    const step = d.s / 4, y = d.cave;
    ex.cave_slice(d.tx * 16 * d.s, d.tz * 16 * d.s, 64, 64, step, y);
    const c = new Int32Array(ex.memory.buffer, ex.cave_ptr(), 4096).slice();
    const ids = new Int32Array(4096);
    for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) {
      const k = j * 64 + i, v = c[k];
      if (v === 0) ids[k] = y < 0 ? -11 : -10;
      else if (v === 2) ids[k] = y < 63 ? -12 : -13;
      else if (v === 4) ids[k] = -14;
      else if (v === 5) ids[k] = -15;
      else ids[k] = 5000 + ex.biome_at(d.tx * 64 * d.s + i * d.s + 2, d.tz * 64 * d.s + j * d.s + 2, y);
    }
    postMessage({ type: "tile", key: d.key, ids }, [ids.buffer]);
  }
  else if (d.type === "tile") {
    ex.set_seed_dim(d.lo, d.hi, MC, d.dim);
    const p = ex.gen_area(d.s, d.tx * 64, d.tz * 64, 64, 64, d.dim === -1 ? 16 : 64);
    const ids = p ? new Int32Array(ex.memory.buffer, p, 64 * 64).slice() : new Int32Array(64 * 64).fill(-1);
    postMessage({ type: "tile", key: d.key, ids }, [ids.buffer]);
  } else if (d.type === "structs") {
    ex.set_seed_dim(d.lo, d.hi, MC, d.dim);
    const out = {};
    for (const st of d.types) {
      const n = ex.structs_rect(st, d.x0, d.z0, d.x1, d.z1, 4096);
      if (n < 0) { out[st] = null; continue; }
      const r = ex.rect_ptr() >> 2; out[st] = Array.from(I32().slice(r, r + n * 4));
    }
    postMessage({ type: "structs", req: d.req, tx: d.tx, tz: d.tz, out });
  } else if (d.type === "near") {
    ex.set_seed(d.lo, d.hi, MC); ex.spawn_xz();
    let o = ex.out_ptr() >> 2; const sx = I32()[o + 80], sz = I32()[o + 81];
    const sp = ex.sids_ptr() >> 2; const m = I32(); d.types.forEach((v, i) => m[sp + i] = v);
    ex.nearest(0, d.R, 32, sx, sz, 0, d.types.length);
    o = ex.out_ptr() >> 2; const mm = I32();
    postMessage({ type: "near", req: d.req, spawn: [sx, sz], out: Array.from(mm.slice(o, o + d.types.length * 3)) });
  } else if (d.type === "entr") {
    // 동굴 입구: 256칸 타일 하나를 4칸 간격으로 훑고, 붙어 있는 칸끼리 묶어서 하나의 입구로
    ex.set_seed_dim(d.lo, d.hi, MC, 0);
    ex.cave_entrances(d.tx * 64, d.tz * 64, 64, 64, 1);
    const a = new Int32Array(ex.memory.buffer, ex.cave_ptr(), 4096).slice();
    const seen = new Uint8Array(4096), out = [];
    for (let k = 0; k < 4096; k++) {
      if (!a[k] || seen[k]) continue;
      const st = [k]; seen[k] = 1; let n = 0, best = k, bd = 0;
      while (st.length) {
        const q = st.pop(); n++; const dep = a[q] >> 16; if (dep > bd) { bd = dep; best = q; }
        const qi = q % 64, qj = (q / 64) | 0;
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          const ni = qi + di, nj = qj + dj; if (ni < 0 || nj < 0 || ni > 63 || nj > 63) continue;
          const nk = nj * 64 + ni; if (a[nk] && !seen[nk]) { seen[nk] = 1; st.push(nk); }
        }
      }
      if (!((n >= 3 && bd >= 12) || bd >= 20)) continue; // 얕거나 아주 작은 건 그냥 움푹 팬 곳일 가능성이 커서 뺌
      const bi = best % 64, bj = (best / 64) | 0, top = (a[best] & 0xffff) - 64;
      out.push(d.tx * 256 + bi * 4 + 2, top + bd, d.tz * 256 + bj * 4 + 2, Math.min(255, bd) | (Math.min(4095, n) << 8));
    }
    postMessage({ type: "entr", req: d.req, tx: d.tx, tz: d.tz, out });
  } else if (d.type === "feat") {
    // 던전·용암 호수: 256칸 타일 하나
    ex.set_seed_dim(d.lo, d.hi, MC, 0);
    const n = ex.features_tile(d.tx, d.tz);
    const out = Array.from(new Int32Array(ex.memory.buffer, ex.feat_ptr(), n * 4));
    postMessage({ type: "feat", req: d.req, tx: d.tx, tz: d.tz, out });
  } else if (d.type === "near2") {
    // 지도 전용 구조물: 중심에서 R 안의 사각형을 훑어 가장 가까운 것
    ex.set_seed_dim(d.lo, d.hi, MC, d.dim);
    const rows = [];
    for (const st of d.types) {
      const n = ex.structs_rect(st, d.cx - d.R, d.cz - d.R, d.cx + d.R, d.cz + d.R, 4096);
      if (n <= 0) continue;
      const r = ex.rect_ptr() >> 2, m = I32(); let best = null;
      for (let i = 0; i < n; i++) { const x = m[r + i*4], z = m[r + i*4 + 2], dd = Math.hypot(x - d.cx, z - d.cz); if (dd <= d.R && (!best || dd < best.dist)) best = { id: st, x, z, dist: Math.round(dd) }; }
      if (best) rows.push(best);
    }
    postMessage({ type: "near2", req: d.req, rows });
  }
};
const rnd = new Uint32Array(2);
function loop() {
  if (!running) return;
  const n = cfg.ids.length, ns = cfg.sids.length; let checked = 0;
  const t0 = performance.now();
  while (performance.now() - t0 < 120) {
    let lo, hi;
    if (cfg.mode === "random") { crypto.getRandomValues(rnd); lo = rnd[0]; hi = rnd[1]; }
    else { const s = BigInt.asUintN(64, cursor); lo = Number(s & 0xffffffffn); hi = Number(s >> 32n); cursor += BigInt(cfg.stride); }
    checked++;
    if (ex.test_seed(lo, hi, MC, n, cfg.R, cfg.step, cfg.cx, cfg.cz, cfg.spawn, cfg.fast, ns)) {
      ex.nearest(n, cfg.R, Math.max(8, cfg.step >> 1), cfg.cx, cfg.cz, cfg.spawn, ns);
      const o = ex.out_ptr() >> 2; const m = I32();
      postMessage({ type: "hit", lo, hi, out: Array.from(m.slice(o, o + (n + ns) * 3)), center: [m[o + 80], m[o + 81]] });
    }
  }
  postMessage({ type: "progress", checked });
  setTimeout(loop, 0);
}`;
const workerURL = URL.createObjectURL(new Blob([workerSrc], { type: "text/javascript" }));

const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString("ko-KR");
const seedStr = (lo, hi) => BigInt.asIntN(64, (BigInt(hi >>> 0) << 32n) | BigInt(lo >>> 0)).toString();
function parseSeed(text) {
  const t = String(text).trim();
  if (/^-?\d+$/.test(t)) { try { const b = BigInt(t); if (b >= -(2n ** 63n) && b < 2n ** 63n) return BigInt.asUintN(64, b); } catch (e) {} }
  if (!t) return 0n;
  let h = 0; for (let i = 0; i < t.length; i++) h = (Math.imul(31, h) + t.charCodeAt(i)) | 0; // Java String.hashCode
  return BigInt.asUintN(64, BigInt(h));
}
const split = u => [Number(u & 0xffffffffn), Number(u >> 32n)];

/* ---------------- tabs ---------------- */
function showTab(which) {
  const map = which === "map";
  $("tabSearch").setAttribute("aria-selected", map ? "false" : "true");
  $("tabMap").setAttribute("aria-selected", map ? "true" : "false");
  $("viewSearch").hidden = map; $("viewMap").hidden = !map;
  if (map) { if (!mapState.loaded) openMapSeed($("mapSeed").value); else resizeMap(); }
}
$("tabSearch").addEventListener("click", () => showTab("search"));
$("tabMap").addEventListener("click", () => showTab("map"));

/* ---------------- search: chips ---------------- */
let selected = [186, 184], selS = [];
function renderChips() {
  const el = $("chips"); el.innerHTML = ""; let lastG = "";
  for (const b of BIOMES) {
    if (b.g !== lastG) { lastG = b.g; const h = document.createElement("div"); h.className = "grp"; h.textContent = b.g; el.appendChild(h); }
    const c = document.createElement("button"); c.type = "button"; c.className = "chip"; c.title = b.en || "";
    c.setAttribute("aria-pressed", selected.includes(b.id) ? "true" : "false");
    c.innerHTML = `<span class="sw" style="background:${colorOf(b)}"></span>${b.name}`;
    c.addEventListener("click", () => { if (running) return; if (selected.includes(b.id)) selected = selected.filter(x => x !== b.id); else if (selected.length < 8) selected.push(b.id); renderChips(); });
    el.appendChild(c);
  }
  const s = $("schips"); s.innerHTML = "";
  for (const st of SEARCH_STRUCTS) {
    const c = document.createElement("button"); c.type = "button"; c.className = "chip";
    c.setAttribute("aria-pressed", selS.includes(st.id) ? "true" : "false");
    c.innerHTML = `${iconTag(st.id, 16)}${st.name}`;
    c.addEventListener("click", () => { if (running) return; if (selS.includes(st.id)) selS = selS.filter(x => x !== st.id); else if (selS.length < 8) selS.push(st.id); renderChips(); });
    s.appendChild(c);
  }
  $("bCount").textContent = `${selected.length}/8`; $("sCount").textContent = `${selS.length}/8`;
}
renderChips();
$("bNone").addEventListener("click", () => { if (running) return; selected = []; renderChips(); });
$("sNone").addEventListener("click", () => { if (running) return; selS = []; renderChips(); });

/* ---------------- search: run ---------------- */
let running = false, workers = [], results = [], cols = [], checkedTotal = 0, t0 = 0, target = 10, selIndex = -1;
function setState(on, text) { $("state").classList.toggle("on", on); $("stateText").textContent = text; }
function colDefs(bids, sids) { return [...bids.map(id => ({ kind: "b", ...BIOMES.find(b => b.id === id) })), ...sids.map(id => ({ kind: "s", ...SBY[id] }))]; }
function colSwatch(c) { return c.kind === "s" ? iconTag(c.id, 16) : `<span class="sw" style="background:${colorOf(c)}"></span>`; }

function renderTable() {
  const t = $("results");
  if (!results.length) { t.innerHTML = `<tr><td class="empty">아직 찾은 시드가 없어요. 조건을 고르고 검색을 시작하세요.</td></tr>`; return; }
  const sorted = results.map((r, i) => ({ r, i })).sort((a, b) => a.r.worst - b.r.worst);
  const hc = results[results.length - 1].cols;
  let h = `<thead><tr><th>시드</th><th>기준점</th>${hc.map(c => `<th>${c.name}</th>`).join("")}<th>가장 먼 거리</th><th></th></tr></thead><tbody>`;
  for (const { r, i } of sorted) {
    h += `<tr class="row${i === selIndex ? " sel" : ""}" data-i="${i}"><td><span class="seed">${r.seed}</span>${r.example ? '<span class="tag">예시</span>' : ""}</td><td class="num">${r.spawn ? "스폰 " : ""}(${r.center[0]}, ${r.center[1]})</td>`;
    r.pts.forEach(p => { h += `<td class="num">${p.d < 0 ? "-" : `${fmt(p.d)}칸 <span class="sub">(${p.x}, ${p.z})</span>`}</td>`; });
    h += `<td class="num">${fmt(r.worst)}칸</td><td><button class="mini" type="button" data-copy="${r.seed}">복사</button> <button class="mini" type="button" data-map="${i}">지도</button></td></tr>`;
  }
  t.innerHTML = h + "</tbody>";
}
$("results").addEventListener("click", (e) => {
  const c = e.target.closest("[data-copy]");
  if (c) { e.stopPropagation(); navigator.clipboard.writeText(c.dataset.copy).then(() => { c.textContent = "복사됨"; setTimeout(() => c.textContent = "복사", 1200); }).catch(() => { c.textContent = "직접 복사"; }); return; }
  const mp = e.target.closest("[data-map]");
  if (mp) { e.stopPropagation(); const r = results[+mp.dataset.map]; $("mapSeed").value = r.seed; showTab("map"); openMapSeed(r.seed); return; }
  const row = e.target.closest("tr.row");
  if (row) { selIndex = +row.dataset.i; renderTable(); drawPreview(results[selIndex]); }
});
$("pvOpen").addEventListener("click", () => { const r = results[selIndex]; if (!r) return; $("mapSeed").value = r.seed; showTab("map"); openMapSeed(r.seed); });

function addResult(lo, hi, out, cfg, example, center, cdefs) {
  const pts = cdefs.map((c, k) => ({ x: out[k*3], z: out[k*3+1], d: out[k*3+2] }));
  const r = { lo, hi, seed: seedStr(lo, hi), pts, worst: Math.max(0, ...pts.map(p => p.d)), cfg, cols: cdefs, example: !!example, center: center || [cfg.cx, cfg.cz], spawn: !!cfg.spawn };
  results.push(r);
  $("found").textContent = fmt(results.filter(x => !x.example).length);
  if (selIndex < 0 || results[selIndex].example) { selIndex = results.length - 1; drawPreview(r); }
  renderTable();
}

function drawPreview(r) {
  if (!r || !mainEx) return;
  const cv = $("preview"), ctx = cv.getContext("2d"), N = cv.width;
  const R = r.cfg.R; const [cx, cz] = r.center; const span = R * 2.3; const per = span / N;
  mainEx.set_seed(r.lo, r.hi, mainEx.mc_wd());
  const img = ctx.createImageData(N, N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const b = mainEx.biome_at(Math.round(cx - span / 2 + i * per), Math.round(cz - span / 2 + j * per), 256);
    const hex = COLORS[b] || "888888"; const k = (j * N + i) * 4;
    img.data[k] = parseInt(hex.slice(0, 2), 16); img.data[k+1] = parseInt(hex.slice(2, 4), 16); img.data[k+2] = parseInt(hex.slice(4, 6), 16); img.data[k+3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const toPx = (x, z) => [(x - (cx - span / 2)) / per, (z - (cz - span / 2)) / per];
  ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.arc(N / 2, N / 2, R / per, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.moveTo(N/2 - 6, N/2); ctx.lineTo(N/2 + 6, N/2); ctx.moveTo(N/2, N/2 - 6); ctx.lineTo(N/2, N/2 + 6); ctx.stroke();
  r.pts.forEach((p, k) => {
    if (p.d < 0) return; const [px, py] = toPx(p.x, p.z); const c = r.cols[k];
    ctx.lineWidth = 2; ctx.strokeStyle = "#111";
    if (c.kind === "s") { ctx.imageSmoothingEnabled = false; ctx.drawImage(ICONS[c.id], Math.round(px - 9), Math.round(py - 9), 18, 18); }
    else { ctx.fillStyle = colorOf(c); ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  });
  $("pvTitle").textContent = `미리보기 · 시드 ${r.seed}`;
  $("cbLink").href = `https://www.chunkbase.com/apps/seed-map#seed=${r.seed}`;
  $("legend").innerHTML = r.cols.map((c, k) => `<div>${colSwatch(c)}${c.name}: ${r.pts[k].d < 0 ? "-" : `${fmt(r.pts[k].d)}칸, (${r.pts[k].x}, ${r.pts[k].z})`}</div>`).join("")
    + `<div style="color:var(--muted)">범위: 가로세로 약 ${fmt(Math.round(span))}칸</div>`;
}

async function start() {
  if (!selected.length && !selS.length) { setState(false, "바이옴이나 구조물을 하나 이상 골라 주세요."); return; }
  await ready;
  const cdefs = colDefs(selected, selS);
  const bcols = cdefs.filter(c => c.kind === "b");
  const cfg = {
    ids: bcols.map(c => c.id), ys: bcols.map(c => c.y), sids: selS.slice(),
    R: Math.max(64, Math.min(5000, +$("radius").value || 500)), step: +$("step").value,
    cx: Math.round(+$("cx").value || 0), cz: Math.round(+$("cz").value || 0),
    spawn: $("center").value === "spawn" ? 1 : 0, fast: $("fast").checked ? 1500 : 0,
    mode: $("mode").value, start: Math.max(0, Math.floor(+$("start").value || 0)),
  };
  target = Math.max(1, Math.min(200, +$("target").value || 10));
  const nW = Math.max(1, Math.min(32, +$("threads").value || 4)); cfg.stride = nW;
  results = []; selIndex = -1; checkedTotal = 0; t0 = performance.now();
  $("checked").textContent = "0"; $("found").textContent = "0"; $("rate").textContent = "0"; renderTable();
  running = true; $("go").disabled = true; $("stop").disabled = false;
  setState(true, "검색 중…");
  workers = [];
  for (let i = 0; i < nW; i++) {
    const w = new Worker(workerURL); workers.push(w);
    w.onmessage = (ev) => {
      const d = ev.data;
      if (d.type === "ready") w.postMessage({ type: "run", cfg, index: i });
      else if (d.type === "progress") {
        checkedTotal += d.checked; $("checked").textContent = fmt(checkedTotal);
        $("rate").textContent = fmt(Math.round(checkedTotal / Math.max((performance.now() - t0) / 1000, .001)));
      } else if (d.type === "hit" && running) {
        addResult(d.lo, d.hi, d.out, cfg, false, d.center, cdefs);
        if (results.length >= target) stop("찾을 개수를 채워서 멈췄어요.");
      }
    };
    w.postMessage({ type: "init", module: wasmModule });
  }
}
function stop(msg) {
  running = false; workers.forEach(w => { w.postMessage({ type: "stop" }); w.terminate(); }); workers = [];
  $("go").disabled = false; $("stop").disabled = true;
  setState(false, msg || "멈췄어요.");
  if (results.length && $("mode").value === "small") {
    const last = results.reduce((m, r) => { const s = BigInt(r.seed); return s > m ? s : m; }, 0n);
    if (last >= 0n) $("start").value = (last + 1n).toString();
  }
}
$("center").addEventListener("change", () => { const on = $("center").value === "coord"; $("cx").disabled = !on; $("cz").disabled = !on; });
$("go").addEventListener("click", start);
$("stop").addEventListener("click", () => stop());

/* ---------------- map ---------------- */
// 축소했을 때 계산량이 큰(흔한) 구조물은 숨김: 블록/픽셀이 이 값보다 크면 표시 안 함
const MAXBPP = { 210: 16, 211: 16, 212: 8, 201: 2, 202: 2, 203: 4, 200: 3, 15: 8, 17: 2, 100: 4, 101: 1e9, 18: 32, 19: 32, 12: 16, 20: 2, 102: 16, 21: 32, 121: 64, 22: 16, 6: 12, 7: 12, 14: 6, 11: 12, 24: 24, 26: 24, 3: 32, 4: 32, 1: 32, 2: 32, 10: 32, 5: 48, 25: 48, 13: 64, 8: 128, 9: 256, 27: 1e9 };
const STILE = 2048;

// 다녀온 구조물: 시드별로 브라우저에 저장 (저장이 막혀 있으면 이번 방문 동안만 기억)
const VISITED = {};
function visitedSet() {
  const k = mapState.seed; if (VISITED[k]) return VISITED[k];
  let arr = []; try { arr = JSON.parse(localStorage.getItem("visited:" + k) || "[]"); } catch (e) {}
  return (VISITED[k] = new Set(arr));
}
function setVisited(key, on) {
  const s = visitedSet(); if (on) s.add(key); else s.delete(key);
  try { localStorage.setItem("visited:" + mapState.seed, JSON.stringify([...s])); } catch (e) {}
}
const mapState = { loaded: false, lo: 0, hi: 0, seed: "", cx: 0, cz: 0, bpp: 4, spawn: [0, 0], show: new Set([5, 13, 25, 27, 9, 8, 7, 2, 1, 10, 18, 19, 12, 102, 21, 121, 22]), dim: 0, globals: {}, cave: false, caveY: 0, req: 0, tiles: new Map(), queue: [], inflight: 0, gen: 0, sc: new Map(), squeue: [], sinflight: 0, strongholds: null };
const big = $("bigmap"), bctx = big.getContext("2d");
let mapWorkers = [], mapReady, hoverEx = null;
function ensureMapWorkers() {
  if (mapReady) return mapReady;
  mapReady = ready.then(async () => {
    hoverEx = (await WebAssembly.instantiate(wasmModule, imports)).exports;
    await Promise.all(Array.from({ length: Math.max(2, Math.min(6, (navigator.hardwareConcurrency || 4) - 1)) }, () => new Promise(res => {
      const w = new Worker(workerURL); w.busy = 0;
      w.onmessage = (ev) => onMapMsg(w, ev.data, res);
      w.postMessage({ type: "init", module: wasmModule }); mapWorkers.push(w);
    })));
  });
  return mapReady;
}
function onMapMsg(w, d, res) {
  if (d.type === "ready") { res(); return; }
  if (d.type === "tile") {
    w.busy--; mapState.inflight--;
    const t = mapState.tiles.get(d.key); if (!t) { pump(); return; }
    const cv = document.createElement("canvas"); cv.width = 64; cv.height = 64;
    const c2 = cv.getContext("2d"); const img = c2.createImageData(64, 64);
    for (let i = 0; i < 4096; i++) { const hex = tileColor(d.ids[i]); img.data[i*4] = parseInt(hex.slice(0,2),16); img.data[i*4+1] = parseInt(hex.slice(2,4),16); img.data[i*4+2] = parseInt(hex.slice(4,6),16); img.data[i*4+3] = 255; }
    c2.putImageData(img, 0, 0); t.canvas = cv; t.state = 2;
    scheduleDraw(); pump();
  } else if (d.type === "structs") {
    w.busy--; mapState.sinflight--;
    if (d.req === mapState.req) {
      for (const st in d.out) {
        if (GLOBAL_ST.has(+st)) { mapState.globals[st] = d.out[st] || []; continue; }
        mapState.sc.set(`${st}:${d.tx}:${d.tz}`, d.out[st] || []);
      }
      scheduleDraw();
    }
    pump();
  } else if (d.type === "feat") {
    w.busy--; mapState.sinflight--;
    if (d.req === mapState.req) { mapState.sc.set(`f:${d.tx}:${d.tz}`, d.out); scheduleDraw(); }
    pump();
  } else if (d.type === "entr") {
    w.busy--; mapState.sinflight--;
    if (d.req === mapState.req) { mapState.sc.set(`e:${d.tx}:${d.tz}`, d.out); scheduleDraw(); }
    pump();
  } else if (d.type === "near") {
    if (d.req !== mapState.req) return;
    const ids = SEARCH_STRUCTS.map(s => s.id);
    mapState.nearRows = ids.map((id, k) => ({ id, x: d.out[k*3], z: d.out[k*3+1], dist: d.out[k*3+2] })).filter(r => r.dist >= 0);
    renderNear();
  } else if (d.type === "near2") {
    if (d.req !== mapState.req) return;
    mapState.nearRows = (mapState.nearRows || []).concat(d.rows); if (--mapState.near2left <= 0) mapState.near2done = true;
    renderNear();
  }
}
const CAVE_COL = { [-15]: "3d7fd6", [-14]: "e8641e", [-10]: "4a4950", [-11]: "34333a", [-12]: "2d5a96", [-13]: "a9c6dc", 175: "7fd451", 174: "c4884e", 183: "1f8f9e", 187: "e0cf45" };
function tileColor(id) {
  if (id >= 5000) return CAVE_COL[id - 5000] || "ece6d6"; // 일반 동굴은 밝은 베이지
  if (id <= -10) return CAVE_COL[id];
  return COLORS[id] || "222222";
}
function scaleFor(bpp) { return bpp <= 4 ? 4 : bpp <= 16 ? 16 : bpp <= 64 ? 64 : 256; }
function tileKey(s, tx, tz) { return `${mapState.gen}:${caveOn() && s <= 16 ? 'c' + mapState.caveY : 'b'}:${s}:${tx}:${tz}`; }
function caveOn() { return mapState.cave && mapState.dim === 0; }
function pump() {
  const cap = mapWorkers.length * 2;
  while (mapState.queue.length && mapState.inflight + mapState.sinflight < cap) {
    const job = mapState.queue.shift(); const t = mapState.tiles.get(job.key);
    if (!t || t.state !== 0) continue;
    const w = mapWorkers.reduce((a, b) => (a.busy <= b.busy ? a : b));
    t.state = 1; w.busy++; mapState.inflight++;
    w.postMessage({ type: "tile", key: job.key, s: job.s, tx: job.tx, tz: job.tz, lo: mapState.lo, hi: mapState.hi, dim: mapState.dim, cave: job.cave });
  }
  while (mapState.squeue.length && mapState.inflight + mapState.sinflight < cap) {
    const job = mapState.squeue.shift();
    if (job.feat) {
      if (mapState.sc.has(`f:${job.tx}:${job.tz}`)) continue;
      mapState.sc.set(`f:${job.tx}:${job.tz}`, null);
      const w = mapWorkers.reduce((a, b) => (a.busy <= b.busy ? a : b)); w.busy++; mapState.sinflight++;
      w.postMessage({ type: "feat", req: mapState.req, lo: mapState.lo, hi: mapState.hi, tx: job.tx, tz: job.tz });
      continue;
    }
    if (job.entr) {
      if (mapState.sc.has(`e:${job.tx}:${job.tz}`)) continue;
      mapState.sc.set(`e:${job.tx}:${job.tz}`, null);
      const w = mapWorkers.reduce((a, b) => (a.busy <= b.busy ? a : b)); w.busy++; mapState.sinflight++;
      w.postMessage({ type: "entr", req: mapState.req, lo: mapState.lo, hi: mapState.hi, tx: job.tx, tz: job.tz });
      continue;
    }
    const glob = job.global;
    const types = glob ? job.types : job.types.filter(st => !mapState.sc.has(`${st}:${job.tx}:${job.tz}`));
    if (!types.length) continue;
    if (!glob) types.forEach(st => mapState.sc.set(`${st}:${job.tx}:${job.tz}`, null));
    const w = mapWorkers.reduce((a, b) => (a.busy <= b.busy ? a : b)); w.busy++; mapState.sinflight++;
    w.postMessage({ type: "structs", req: mapState.req, lo: mapState.lo, hi: mapState.hi, dim: mapState.dim, types, tx: job.tx, tz: job.tz,
      x0: glob ? -1e8 : job.tx * STILE, z0: glob ? -1e8 : job.tz * STILE, x1: glob ? 1e8 : job.tx * STILE + STILE - 1, z1: glob ? 1e8 : job.tz * STILE + STILE - 1 });
  }
}
function resizeMap() {
  const r = $("stage").getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
  big.width = Math.max(1, Math.round(r.width * dpr)); big.height = Math.max(1, Math.round(r.height * dpr)); big.dpr = dpr;
  scheduleDraw();
}
window.addEventListener("resize", () => { if (!$("viewMap").hidden) resizeMap(); });
let drawPending = false;
function scheduleDraw() { if (drawPending) return; drawPending = true; requestAnimationFrame(() => { drawPending = false; drawMap(); }); }
function viewRect() { const W = big.width / (big.dpr || 1), H = big.height / (big.dpr || 1); const b = mapState.bpp; return { x0: mapState.cx - W / 2 * b, z0: mapState.cz - H / 2 * b, x1: mapState.cx + W / 2 * b, z1: mapState.cz + H / 2 * b, W, H }; }
function wantStructs(v) {
  const inDim = st => SBY[st] && SBY[st].dim === mapState.dim;
  const visibleTypes = [...mapState.show].filter(st => st !== 200 && inDim(st) && !GLOBAL_ST.has(st) && mapState.bpp <= (MAXBPP[st] || 64));
  if (mapState.show.has(200) && mapState.dim === 0 && mapState.bpp <= MAXBPP[200]) {
    const ex0 = Math.floor(v.x0 / 256), ex1 = Math.floor(v.x1 / 256), ez0 = Math.floor(v.z0 / 256), ez1 = Math.floor(v.z1 / 256), ej = [];
    for (let tz = ez0; tz <= ez1; tz++) for (let tx = ex0; tx <= ex1; tx++) if (!mapState.sc.has(`e:${tx}:${tz}`)) ej.push({ entr: true, types: [200], tx, tz, d: Math.hypot((tx + .5) * 256 - mapState.cx, (tz + .5) * 256 - mapState.cz) });
    ej.sort((a, b) => a.d - b.d); mapState.squeue = mapState.squeue.filter(j => !j.entr || j.keep).concat(ej);
  }
  if ((mapState.show.has(201) || mapState.show.has(202) || mapState.show.has(203)) && mapState.dim === 0 && mapState.bpp <= ((mapState.show.has(203) && !mapState.show.has(201) && !mapState.show.has(202)) ? 4 : 2)) {
    const ex0 = Math.floor(v.x0 / 256), ex1 = Math.floor(v.x1 / 256), ez0 = Math.floor(v.z0 / 256), ez1 = Math.floor(v.z1 / 256), fj = [];
    for (let tz = ez0; tz <= ez1; tz++) for (let tx = ex0; tx <= ex1; tx++) if (!mapState.sc.has(`f:${tx}:${tz}`)) fj.push({ feat: true, types: [201], tx, tz, d: Math.hypot((tx + .5) * 256 - mapState.cx, (tz + .5) * 256 - mapState.cz) });
    fj.sort((a, b) => a.d - b.d); mapState.squeue = mapState.squeue.filter(j => !j.feat || j.keep).concat(fj);
  }
  for (const st of mapState.show) if (GLOBAL_ST.has(st) && inDim(st) && !mapState.sc.has("g" + st)) { mapState.sc.set("g" + st, 1); mapState.squeue.unshift({ types: [st], tx: 0, tz: 0, global: true }); }
  if (!visibleTypes.length) return;
  const tx0 = Math.floor(v.x0 / STILE), tx1 = Math.floor(v.x1 / STILE), tz0 = Math.floor(v.z0 / STILE), tz1 = Math.floor(v.z1 / STILE);
  if ((tx1 - tx0 + 1) * (tz1 - tz0 + 1) > 600) return;
  const jobs = [];
  for (let tz = tz0 - 1; tz <= tz1 + 1; tz++) for (let tx = tx0 - 1; tx <= tx1 + 1; tx++) {
    const types = visibleTypes.filter(st => !mapState.sc.has(`${st}:${tx}:${tz}`));
    if (types.length) jobs.push({ types, tx, tz, d: Math.hypot((tx + .5) * STILE - mapState.cx, (tz + .5) * STILE - mapState.cz) });
  }
  if (jobs.length) { jobs.sort((a, b) => a.d - b.d); mapState.squeue = jobs.concat(mapState.squeue.filter(j => j.global || j.keep)); }
}
function drawMap() {
  if (!mapState.loaded) return;
  const dpr = big.dpr || 1; bctx.setTransform(dpr, 0, 0, dpr, 0, 0); bctx.imageSmoothingEnabled = false;
  const v = viewRect(); const b = mapState.bpp; const s = scaleFor(b); const tb = 64 * s;
  bctx.fillStyle = "#0b0f0d"; bctx.fillRect(0, 0, v.W, v.H);
  const tx0 = Math.floor(v.x0 / tb), tx1 = Math.floor(v.x1 / tb), tz0 = Math.floor(v.z0 / tb), tz1 = Math.floor(v.z1 / tb);
  const want = [];
  for (let tz = tz0; tz <= tz1; tz++) for (let tx = tx0; tx <= tx1; tx++) {
    const key = tileKey(s, tx, tz); let t = mapState.tiles.get(key);
    const sx = (tx * tb - v.x0) / b, sy = (tz * tb - v.z0) / b, sw = tb / b;
    if (!t) { t = { state: 0 }; mapState.tiles.set(key, t); want.push({ key, s, tx, tz, cave: caveOn() && s <= 16 ? mapState.caveY : undefined, d: Math.hypot((tx + .5) * tb - mapState.cx, (tz + .5) * tb - mapState.cz) }); }
    if (t.state === 2) bctx.drawImage(t.canvas, sx, sy, sw + 0.5, sw + 0.5);
    else drawFallback(tx * tb, tz * tb, tb, v, b, s);
  }
  if (want.length) { want.sort((a, c) => a.d - c.d); const keys = new Set(want.map(w => w.key)); mapState.queue = want.concat(mapState.queue.filter(j => !keys.has(j.key))); }
  wantStructs(v); pump();
  if (mapState.tiles.size > 3000) { for (const [k, t] of mapState.tiles) { if (t.state === 2 && mapState.tiles.size > 2000) mapState.tiles.delete(k); } }
  bctx.strokeStyle = "rgba(255,255,255,.18)"; bctx.lineWidth = 1;
  const ox = (0 - v.x0) / b, oz = (0 - v.z0) / b;
  bctx.beginPath(); bctx.moveTo(ox, 0); bctx.lineTo(ox, v.H); bctx.moveTo(0, oz); bctx.lineTo(v.W, oz); bctx.stroke();
  // 월드 파일로 불러온 범위 (점선)
  { const sc = mapState.scan && mapState.scan[mapState.dim];
    if (sc && sc.regions.length) {
      bctx.save(); bctx.setLineDash([4, 4]); bctx.strokeStyle = "rgba(47,158,85,.9)"; bctx.lineWidth = 1.5;
      for (const [rx, rz] of sc.regions) { const px = (rx * 512 - v.x0) / b, pz = (rz * 512 - v.z0) / b; if (px > v.W || pz > v.H || px + 512 / b < 0 || pz + 512 / b < 0) continue; bctx.strokeRect(px, pz, 512 / b, 512 / b); }
      bctx.restore();
    } }
  // grid lines: chunk (16 blocks) when zoomed in, region (512 blocks) otherwise
  const gridLines = (step, style) => {
    bctx.beginPath();
    for (let x = Math.ceil(v.x0 / step) * step; x <= v.x1; x += step) { const p = Math.round((x - v.x0) / b) + 0.5; bctx.moveTo(p, 0); bctx.lineTo(p, v.H); }
    for (let z = Math.ceil(v.z0 / step) * step; z <= v.z1; z += step) { const p = Math.round((z - v.z0) / b) + 0.5; bctx.moveTo(0, p); bctx.lineTo(v.W, p); }
    bctx.strokeStyle = style; bctx.lineWidth = 1; bctx.stroke();
  };
  const cpx = 16 / b, rpx = 512 / b;
  if (cpx >= 10) gridLines(16, `rgba(255,255,255,${Math.min(0.32, 0.12 + (cpx - 10) / 14 * 0.2)})`);
  else if (rpx >= 20) gridLines(512, "rgba(255,255,255,0.28)");
  // structures (cached per 2048-block tile, so panning never makes them blink)
  mapState.hits = [];
  const bigSize = b <= 8 ? 32 : 16;
  const sx0 = Math.floor(v.x0 / STILE) - 1, sx1 = Math.floor(v.x1 / STILE) + 1, sz0 = Math.floor(v.z0 / STILE) - 1, sz1 = Math.floor(v.z1 / STILE) + 1;
  const hidden = []; const visited = visitedSet();
  for (const st of mapState.show) {
    const img = ICONS[st]; const name = SNAME[st];
    if (!SBY[st] || (SBY[st].dim !== mapState.dim && !SBY[st].anyDim)) continue;
    const size = SMALL_ST.has(st) ? 16 : bigSize;
    const put = (x, y, z, flag) => {
      const px = (x - v.x0) / b, py = (z - v.z0) / b;
      if (px < -20 || py < -20 || px > v.W + 20 || py > v.H + 20) return;
      const vis = visited.has(`${st}:${x}:${z}`);
      const im = st === 201 ? ICONS["201_" + ([0, 1, 1, 3][(flag >> 4) & 3])] : st === 210 ? ICONS[MOB_ICON[flag] || 210]
        : st === 19 ? ICONS["19_" + (flag & 3)] : st === 200 && ((flag >> 8) >= 10 || (flag & 255) >= 40) ? ICONS["200_big"] : img;
      { const S = size * 18 / 16; bctx.globalAlpha = vis ? 0.35 : 1; bctx.drawImage(im, Math.round(px - S / 2), Math.round(py - S / 2), S, S); bctx.globalAlpha = 1; }
      mapState.hits.push({ px, py, r: size / 2 + 2, label: `${name} (${x}, ${z})${vis ? " · 다녀옴" : ""}`, st, x, y, z, flag });
    };
    if (st >= 210 && st <= 212) {
      const sc = mapState.scan && mapState.scan[mapState.dim]; if (!sc) continue;
      if (b > MAXBPP[st]) { hidden.push(name); continue; }
      const arr = st === 210 ? sc.spawners : st === 211 ? sc.lavaSky : sc.lavaIn;
      for (const e of arr) if (e[0] >= v.x0 - 40 && e[0] <= v.x1 + 40 && e[2] >= v.z0 - 40 && e[2] <= v.z1 + 40) put(e[0], e[1], e[2], e[3]);
      continue;
    }
    if (st === 201 || st === 202 || st === 203) {
      if (b > MAXBPP[st]) { hidden.push(name); continue; }
      for (let tz = Math.floor(v.z0 / 256) - 1; tz <= Math.floor(v.z1 / 256) + 1; tz++) for (let tx = Math.floor(v.x0 / 256) - 1; tx <= Math.floor(v.x1 / 256) + 1; tx++) {
        const a = mapState.sc.get(`f:${tx}:${tz}`); if (!a) continue;
        for (let i = 0; i < a.length; i += 4) { const kind = a[i + 3] & 15; if (kind === st - 200) put(a[i], a[i + 1], a[i + 2], a[i + 3]); }
      }
      continue;
    }
    if (st === 200) {
      if (b > MAXBPP[200]) { hidden.push(name); continue; }
      for (let tz = Math.floor(v.z0 / 256) - 1; tz <= Math.floor(v.z1 / 256) + 1; tz++) for (let tx = Math.floor(v.x0 / 256) - 1; tx <= Math.floor(v.x1 / 256) + 1; tx++) {
        const a = mapState.sc.get(`e:${tx}:${tz}`); if (!a) continue;
        for (let i = 0; i < a.length; i += 4) put(a[i], a[i + 1], a[i + 2], a[i + 3]);
      }
      continue;
    }
    if (GLOBAL_ST.has(st)) { const a = mapState.globals[st] || []; for (let i = 0; i < a.length; i += 4) put(a[i], a[i + 1], a[i + 2], a[i + 3]); continue; }
    if (b > (MAXBPP[st] || 64)) { hidden.push(name); continue; }
    for (let tz = sz0; tz <= sz1; tz++) for (let tx = sx0; tx <= sx1; tx++) {
      const arr = mapState.sc.get(`${st}:${tx}:${tz}`); if (!arr) continue;
      for (let i = 0; i < arr.length; i += 4) put(arr[i], arr[i + 1], arr[i + 2], arr[i + 3]);
    }
  }
  $("hiddenNote").textContent = hidden.length ? `더 확대하면 보여요: ${hidden.join(", ")}` : "";
  $("caveHint").style.color = caveOn() && s > 16 ? "var(--warn, #b45309)" : "";
  if (caveOn() && s > 16) $("caveHint").textContent = "동굴 단면은 더 확대해야 보여요 (축척 1:16까지).";
  else $("caveHint").textContent = "선택한 높이(Y)에서 땅을 가로로 자른 모습이에요. 밝은 곳이 동굴이고, 초록은 무성한 동굴, 갈색은 점적석 동굴, 청록은 깊은 어둠, 노랑은 유황 동굴, 주황은 용암, 파랑은 물이 찬 동굴이에요. 협곡·옛날식 동굴과 대수층(물·용암 채우기)까지 계산해요.";
  // spawn
  if (mapState.dim === 0) {
    const spx = (mapState.spawn[0] - v.x0) / b, spy = (mapState.spawn[1] - v.z0) / b, S = (b <= 8 ? 32 : 24) * 18 / 16;
    bctx.drawImage(ICONS.spawn, Math.round(spx - S / 2), Math.round(spy - S / 2), S, S);
    mapState.hits.push({ px: spx, py: spy, r: S / 2, label: `스폰 (${mapState.spawn[0]}, ${mapState.spawn[1]})` });
  }
  const nice = [16, 32, 64, 128, 256, 512, 1000, 2000, 5000, 10000, 20000, 50000]; let len = nice[0];
  for (const n of nice) if (n / b <= 140) len = n;
  bctx.fillStyle = "rgba(12,16,14,.78)"; bctx.fillRect(v.W - len / b - 22, v.H - 30, len / b + 12, 20);
  bctx.fillStyle = "#e8eee9"; bctx.fillRect(v.W - len / b - 16, v.H - 16, len / b, 3);
  bctx.font = "11px " + getComputedStyle(document.body).fontFamily; bctx.textAlign = "right"; bctx.fillText(`${fmt(len)}칸`, v.W - 16, v.H - 21);
}
function drawFallback(wx, wz, tb, v, b, s) {
  for (const cs of [16, 64, 256]) {
    if (cs <= s) continue; if (caveOn() && s <= 16 && cs > 16) break; const ctb = 64 * cs;
    const t = mapState.tiles.get(tileKey(cs, Math.floor(wx / ctb), Math.floor(wz / ctb)));
    if (t && t.state === 2) {
      const ox = (wx - Math.floor(wx / ctb) * ctb) / cs, oz = (wz - Math.floor(wz / ctb) * ctb) / cs, w = tb / cs;
      bctx.drawImage(t.canvas, ox, oz, w, w, (wx - v.x0) / b, (wz - v.z0) / b, tb / b + 0.5, tb / b + 0.5); return;
    }
  }
}
const DIM_NAME = { 0: "오버월드", "-1": "네더", 1: "엔드" };
function resetDimCaches() {
  mapState.gen++; mapState.req++;
  mapState.tiles.clear(); mapState.queue = []; mapState.sc.clear(); mapState.squeue = []; mapState.globals = {};
  mapState.nearRows = []; mapState.near2done = false;
}
// 지금 차원의 중심 기준으로 가까운 구조물 목록을 다시 계산
function requestNear() {
  const d = mapState.dim, w = mapWorkers[mapWorkers.length - 1];
  const extra = STRUCTS.filter(s => s.dim === d && s.map && !GLOBAL_ST.has(s.id) && s.id < 200).map(s => s.id);
  const c = d === 0 ? mapState.spawn : d === -1 ? [Math.round(mapState.spawn[0] / 8), Math.round(mapState.spawn[1] / 8)] : [0, 0];
  mapState.nearCenter = c;
  $("nearTitle").textContent = d === 0 ? "스폰에서 가까운 구조물" : d === -1 ? "스폰 아래(÷8)에서 가까운 구조물" : "중앙 섬(0, 0)에서 가까운 구조물";
  $("nearList").innerHTML = `<span class="hint">계산 중…</span>`;
  if (d === 0) w.postMessage({ type: "near", req: mapState.req, lo: mapState.lo, hi: mapState.hi, R: 6000, types: SEARCH_STRUCTS.map(s => s.id) });
  const R = d === 1 ? 3000 : 1500, small = extra.filter(st => st === 22), rest = extra.filter(st => st !== 22);
  mapState.near2left = (rest.length ? 1 : 0) + (small.length ? 1 : 0);
  if (rest.length) w.postMessage({ type: "near2", req: mapState.req, lo: mapState.lo, hi: mapState.hi, dim: d, cx: c[0], cz: c[1], R, types: rest });
  if (small.length) w.postMessage({ type: "near2", req: mapState.req, lo: mapState.lo, hi: mapState.hi, dim: d, cx: c[0], cz: c[1], R: 1500, types: small });
  if (!mapState.near2left) mapState.near2done = true;
}
async function openMapSeed(text) {
  closePop();
  await ensureMapWorkers();
  const u = parseSeed(text); const [lo, hi] = split(u);
  mapState.lo = lo; mapState.hi = hi; mapState.seed = seedStr(lo, hi);
  resetDimCaches();
  hoverEx.set_seed(lo, hi, hoverEx.mc_wd()); hoverEx.spawn_xz();
  const o = hoverEx.out_ptr() >> 2; const m = new Int32Array(hoverEx.memory.buffer);
  mapState.spawn = [m[o + 80], m[o + 81]];
  if (mapState.dim !== 0) hoverEx.set_seed_dim(lo, hi, hoverEx.mc_wd(), mapState.dim);
  const home = homeOf(mapState.dim); mapState.cx = home[0]; mapState.cz = home[1]; mapState.bpp = mapState.dim === 1 ? 8 : 4; mapState.loaded = true;
  const isNum = /^-?\d+$/.test(String(text).trim());
  $("mapMsg").textContent = isNum ? "끌어서 이동하고, 휠이나 두 손가락, +/− 버튼으로 확대·축소하세요. 구조물을 누르면 좌표와 정보가 나와요." : `글자 시드 "${String(text).trim()}"을(를) 숫자 시드 ${mapState.seed}로 바꿨어요.`;
  $("mapInfo").innerHTML = `<dt>시드</dt><dd>${mapState.seed}</dd><dt>스폰</dt><dd>${mapState.spawn[0]}, ${mapState.spawn[1]} (근사)</dd>`;
  requestNear();
  loadScan();
  resizeMap();
}
function homeOf(d) { return d === 0 ? mapState.spawn : d === -1 ? [Math.round(mapState.spawn[0] / 8), Math.round(mapState.spawn[1] / 8)] : [0, 0]; }
function setDim(d) {
  if (d === mapState.dim) return;
  closePop();
  const prev = mapState.dim;
  // 오버월드 ↔ 네더는 좌표를 8배로 맞춰서 같은 곳을 보여 줌
  if (prev === 0 && d === -1) { mapState.cx /= 8; mapState.cz /= 8; }
  else if (prev === -1 && d === 0) { mapState.cx *= 8; mapState.cz *= 8; }
  else { const h = homeOf(d); mapState.cx = h[0]; mapState.cz = h[1]; mapState.bpp = d === 1 ? 8 : 4; }
  mapState.dim = d;
  document.querySelectorAll("#dimSeg button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.dim === d ? "true" : "false"));
  $("caveBox").hidden = d !== 0;
  scanSummary();
  renderMapChips();
  if (!mapState.loaded) return;
  resetDimCaches();
  hoverEx.set_seed_dim(mapState.lo, mapState.hi, hoverEx.mc_wd(), d);
  requestNear();
  scheduleDraw();
}
document.querySelectorAll("#dimSeg button").forEach(b => b.addEventListener("click", () => setDim(+b.dataset.dim)));
function renderNear() {
  const visited = visitedSet(), c = mapState.nearCenter || [0, 0];
  const rows = (mapState.nearRows || []).filter(r => SBY[r.id] && SBY[r.id].dim === mapState.dim).sort((a, b) => a.dist - b.dist);
  const R = mapState.dim === 0 ? "6,000" : mapState.dim === 1 ? "3,000" : "1,500";
  $("nearList").innerHTML = rows.length ? rows.map(r => `<button type="button" data-x="${r.x}" data-z="${r.z}"${visited.has(`${r.id}:${r.x}:${r.z}`) ? ' style="opacity:.45"' : ''}>${iconTag(r.id, 16)}<span>${SBY[r.id].name} <span class="d">(${r.x}, ${r.z})</span></span><span class="d">${fmt(r.dist)}칸</span></button>`).join("") + (mapState.near2done ? "" : `<span class="hint">더 계산 중…</span>`) : `<span class="hint">${mapState.near2done ? `${R}칸 안에 없어요.` : "계산 중…"}</span>`;
}
$("nearList").addEventListener("click", (e) => { const bt = e.target.closest("button[data-x]"); if (!bt) return; mapState.cx = +bt.dataset.x; mapState.cz = +bt.dataset.z; mapState.bpp = Math.min(mapState.bpp, 2); scheduleDraw(); });
function renderMapChips() {
  const el = $("mchips"); el.innerHTML = "";
  for (const st of STRUCTS.filter(s => s.dim === mapState.dim || s.anyDim)) {
    const c = document.createElement("button"); c.type = "button"; c.className = "chip";
    c.setAttribute("aria-pressed", mapState.show.has(st.id) ? "true" : "false");
    c.innerHTML = `${iconTag(st.id, 16)}${st.name}`;
    c.addEventListener("click", () => { if (mapState.show.has(st.id)) mapState.show.delete(st.id); else mapState.show.add(st.id); renderMapChips(); scheduleDraw(); });
    el.appendChild(c);
  }
}
renderMapChips();
$("mAll").addEventListener("click", () => { for (const st of STRUCTS) if (st.dim === mapState.dim || st.anyDim) mapState.show.add(st.id); renderMapChips(); scheduleDraw(); });
$("mNone").addEventListener("click", () => { for (const st of STRUCTS) if (st.dim === mapState.dim || st.anyDim) mapState.show.delete(st.id); renderMapChips(); scheduleDraw(); });
$("mapGo").addEventListener("click", () => openMapSeed($("mapSeed").value));
/* ---------------- 월드 파일(.mca) 읽기 ---------------- */
const scanSrc = "// \uc6d4\ub4dc region(.mca) \ud30c\uc77c \uc77d\uae30: \uc0dd\uc131\uae30(\ubab9 \uc885\ub958), \ud558\ub298\uc5d0 \ub4dc\ub7ec\ub09c \uc6a9\uc554 \uc6d0\ucc9c, \ub545\uc18d \uc6a9\uc554 \uc6d0\ucc9c\uc744 \ubf51\uc74c\nconst td = new TextDecoder();\nasync function inflate(bytes, kind) {\n  const fmt = kind === 1 ? \"gzip\" : \"deflate\";\n  const ds = new DecompressionStream(fmt);\n  const out = new Response(new Blob([bytes]).stream().pipeThrough(ds));\n  return new Uint8Array(await out.arrayBuffer());\n}\n// \ucd5c\uc18c NBT \ud30c\uc11c: \uae34 \ubc30\uc5f4\uc740 \ubcf5\uc0ac\ud558\uc9c0 \uc54a\uace0 \uc704\uce58\ub9cc \uae30\uc5b5\nfunction parseNBT(u8) {\n  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); let p = 0;\n  const str = () => { const n = dv.getUint16(p); p += 2; const s = td.decode(u8.subarray(p, p + n)); p += n; return s; };\n  function payload(t) {\n    switch (t) {\n      case 1: return dv.getInt8(p++);\n      case 2: { const v = dv.getInt16(p); p += 2; return v; }\n      case 3: { const v = dv.getInt32(p); p += 4; return v; }\n      case 4: { p += 8; return 0; }\n      case 5: { const v = dv.getFloat32(p); p += 4; return v; }\n      case 6: { const v = dv.getFloat64(p); p += 8; return v; }\n      case 7: { const n = dv.getInt32(p); p += 4; p += n; return null; }\n      case 8: return str();\n      case 9: { const et = dv.getUint8(p++); const n = dv.getInt32(p); p += 4; const a = new Array(Math.max(0, n)); for (let i = 0; i < n; i++) a[i] = payload(et); return a; }\n      case 10: { const o = {}; for (;;) { const tt = dv.getUint8(p++); if (tt === 0) break; const k = str(); o[k] = payload(tt); } return o; }\n      case 11: { const n = dv.getInt32(p); p += 4; const a = new Int32Array(n); for (let i = 0; i < n; i++) a[i] = dv.getInt32(p + i * 4); p += n * 4; return a; }\n      case 12: { const n = dv.getInt32(p); p += 4; const r = { dv, off: p, n }; p += n * 8; return r; }\n    }\n    throw new Error(\"bad tag \" + t);\n  }\n  const t = dv.getUint8(p++); str(); return payload(t);\n}\n// \ubb36\uc778 \uc815\uc218 \ubc30\uc5f4(long \ubc30\uc5f4, \uce78\uc774 long \uacbd\uacc4\ub97c \ub118\uc9c0 \uc54a\ub294 1.16+ \ubc29\uc2dd)\uc5d0\uc11c i\ubc88\uc9f8 \uac12\nfunction packed(la, bits, i) {\n  const vpl = Math.floor(64 / bits), li = Math.floor(i / vpl), off = (i % vpl) * bits;\n  const hi = la.dv.getUint32(la.off + li * 8), lo = la.dv.getUint32(la.off + li * 8 + 4), mask = bits >= 32 ? 0xffffffff : (1 << bits) - 1;\n  if (off + bits <= 32) return (lo >>> off) & mask;\n  if (off >= 32) return (hi >>> (off - 32)) & mask;\n  return ((lo >>> off) | (hi << (32 - off))) & mask;\n}\nfunction scanChunk(root, dim, out) {\n  const lvl = root.Level || root; // \uc61b \ud615\uc2dd \ub300\ube44\n  const cx = lvl.xPos, cz = lvl.zPos; if (cx === undefined) return;\n  const status = lvl.Status || \"\"; if (status && !/full|features|light|spawn|heightmaps/.test(status)) return;\n  out.chunks++; out.cl.push(cx, cz);\n  const minX = cx * 16, minZ = cz * 16;\n  for (const be of (lvl.block_entities || [])) {\n    if (be.id === \"minecraft:mob_spawner\") {\n      const sd = be.SpawnData && (be.SpawnData.entity || be.SpawnData); const mob = sd && sd.id ? String(sd.id).replace(\"minecraft:\", \"\") : \"?\";\n      out.spawners.push([be.x, be.y, be.z, mob]);\n    }\n  }\n  // \ud558\ub298\uc5d0 \ub4dc\ub7ec\ub0ac\ub294\uc9c0: MOTION_BLOCKING \ub192\uc774\ub9f5 (\uc6a9\uc554\ub3c4 \ub9c9\ub294 \ube14\ub85d\uc774\ub77c \ub9e8 \uc704\uac00 \uc6a9\uc554\uc774\uba74 \ub192\uc774 = \uc6a9\uc554y+1)\n  const hm = lvl.Heightmaps && (lvl.Heightmaps.MOTION_BLOCKING || lvl.Heightmaps.WORLD_SURFACE);\n  const minY = dim === 0 ? -64 : 0, hbits = dim === 0 ? 9 : 8;\n  for (const sec of (lvl.sections || [])) {\n    const bs = sec.block_states; if (!bs || !bs.palette) continue;\n    const pal = bs.palette, lavaIdx = [];\n    // 26.x \ud314\ub808\ud2b8\ub294 \ubb38\uc790\uc5f4 \"minecraft:stone\"(\uae30\ubcf8 \uc0c1\ud0dc), {\"\": \u2026}, {id, properties} \uac00 \uc11e\uc77c \uc218 \uc788\uc74c. \uc608\uc804\uc740 {Name, Properties}\n    pal.forEach((e, i) => { const nm = typeof e === \"string\" ? e : (e.Name || e.id || e[\"\"]), pr = typeof e === \"string\" ? null : (e.Properties || e.properties); if (nm === \"minecraft:lava\" && (!pr || String(pr.level) === \"0\")) lavaIdx.push(i); });\n    if (!lavaIdx.length) continue;\n    const sy = sec.Y * 16;\n    if (pal.length === 1 || !bs.data) { // \uc139\uc158 \uc804\uccb4\uac00 \uc6a9\uc554\n      for (let k = 0; k < 4096; k++) add(k);\n      continue;\n    }\n    const bits = Math.max(4, Math.ceil(Math.log2(pal.length))), set = new Set(lavaIdx);\n    for (let k = 0; k < 4096; k++) if (set.has(packed(bs.data, bits, k))) add(k);\n    function add(k) {\n      const x = k & 15, z = (k >> 4) & 15, y = sy + (k >> 8);\n      let top = null; if (hm) top = packed(hm, hbits, z * 16 + x) + minY - 1;\n      const exposed = top !== null && top === y;\n      if (y <= (dim === 0 ? -54 : 32)) return; // \uae4a\uc740 \uacf3 \uc6a9\uc554 \ubc14\ub2e4(\ub300\uc218\uce35)\u00b7\ub124\ub354 \uc6a9\uc554 \ubc14\ub2e4\ub294 \uc81c\uc678\n      (exposed ? out.lavaSky : out.lavaIn).push(minX + x, y, minZ + z);\n    }\n  }\n}\n// \uc774\uc5b4\uc9c4 \uc6a9\uc554 \uc6d0\ucc9c\ub07c\ub9ac \ubb36\uc5b4\uc11c \ub369\uc5b4\ub9ac \ud558\ub098\ub85c\nfunction cluster(flat, minN) {\n  const n = flat.length / 3, key = new Map(), par = new Int32Array(n);\n  for (let i = 0; i < n; i++) { par[i] = i; key.set(flat[i*3] + \",\" + flat[i*3+1] + \",\" + flat[i*3+2], i); }\n  const f = a => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };\n  for (let i = 0; i < n; i++) {\n    const x = flat[i*3], y = flat[i*3+1], z = flat[i*3+2];\n    for (const [dx, dy, dz] of [[1,0,0],[0,0,1],[0,1,0],[1,0,1],[1,0,-1]]) {\n      const j = key.get((x+dx) + \",\" + (y+dy) + \",\" + (z+dz)); if (j !== undefined) { const a = f(i), b = f(j); if (a !== b) par[a] = b; }\n    }\n  }\n  const g = new Map();\n  for (let i = 0; i < n; i++) { const r = f(i); let c = g.get(r); if (!c) g.set(r, c = { n: 0, sx: 0, sz: 0, top: -999 }); c.n++; c.sx += flat[i*3]; c.sz += flat[i*3+2]; c.top = Math.max(c.top, flat[i*3+1]); }\n  const res = []; for (const c of g.values()) if (c.n >= minN) res.push([Math.round(c.sx / c.n), c.top, Math.round(c.sz / c.n), c.n]);\n  return res;\n}\nonmessage = async (ev) => {\n  const { files, dim } = ev.data;\n  const out = { chunks: 0, cl: [], spawners: [], lavaSky: [], lavaIn: [], regions: [], errors: 0 };\n  let done = 0;\n  for (const file of files) {\n    const m = /r\\.(-?\\d+)\\.(-?\\d+)\\.mca$/.exec(file.name); if (!m) { done++; continue; }\n    out.regions.push([+m[1], +m[2]]);\n    const buf = new Uint8Array(await file.arrayBuffer()); if (buf.length < 8192) { done++; continue; }\n    const dv = new DataView(buf.buffer);\n    for (let i = 0; i < 1024; i++) {\n      const loc = dv.getUint32(i * 4), off = (loc >>> 8) * 4096; if (!off) continue;\n      try {\n        const len = dv.getUint32(off), kind = buf[off + 4];\n        if (kind !== 1 && kind !== 2) { out.errors++; continue; } // LZ4\u00b7\uc678\ubd80 \ud30c\uc77c\uc740 \uac74\ub108\ub700\n        const raw = await inflate(buf.subarray(off + 5, off + 4 + len), kind);\n        scanChunk(parseNBT(raw), dim, out);\n      } catch (e) { out.errors++; }\n    }\n    done++; postMessage({ type: \"progress\", done, total: files.length, chunks: out.chunks });\n  }\n  const sky = cluster(out.lavaSky, 1), under = cluster(out.lavaIn, 1);\n  postMessage({ type: \"done\", dim, chunks: out.chunks, cl: out.cl, regions: out.regions, errors: out.errors, spawners: out.spawners,\n    lavaSky: sky, lavaIn: under.filter(c => c[3] >= 12) });\n};\n";
const scanURL = URL.createObjectURL(new Blob([scanSrc], { type: "text/javascript" }));
function scanKey(dim) { return `scan:${mapState.seed}:${dim}`; }
function loadScan() {
  mapState.scan = {};
  for (const d of [0, -1, 1]) { try { const t = localStorage.getItem(scanKey(d)); if (t) mapState.scan[d] = JSON.parse(t); } catch (e) {} }
  scanSummary();
}
function saveScan(d) { try { localStorage.setItem(scanKey(d), JSON.stringify(mapState.scan[d])); } catch (e) {} }
function scanSummary(extra) {
  const sc = mapState.scan && mapState.scan[mapState.dim];
  $("scanDimName").textContent = DIM_NAME[mapState.dim];
  if (!sc) { $("scanMsg").textContent = extra || ""; return; }
  const by = {}; for (const s of sc.spawners) by[s[3]] = (by[s[3]] || 0) + 1;
  const list = Object.entries(by).sort((a, b) => b[1] - a[1]).map(([m, n]) => `${MOB_KO[m] || m} ${n}`).join(", ");
  $("scanMsg").textContent = `불러온 청크 ${fmt(sc.chunks)}개 · 생성기 ${sc.spawners.length}개${list ? " (" + list + ")" : ""} · 드러난 용암 ${sc.lavaSky.length}곳 · 땅속 용암 ${sc.lavaIn.length}곳` + (extra ? "\n" + extra : "");
}
async function runScan(fileList) {
  const files = [...fileList].filter(f => /r\.-?\d+\.-?\d+\.mca$/.test(f.name));
  if (!files.length) { $("scanMsg").textContent = "r.X.Z.mca 파일을 찾지 못했어요. 월드 폴더 안의 region 폴더를 골라 주세요."; return; }
  if (!mapState.loaded) await openMapSeed($("mapSeed").value);
  const dim = mapState.dim, nw = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1));
  const parts = Array.from({ length: nw }, () => []); files.forEach((f, i) => parts[i % nw].push(f));
  let done = 0; const res = { chunks: 0, cl: [], spawners: [], lavaSky: [], lavaIn: [], regions: [], errors: 0 };
  $("scanMsg").textContent = `읽는 중… 0 / ${files.length}`;
  await Promise.all(parts.filter(p => p.length).map(p => new Promise(ok => {
    const w = new Worker(scanURL);
    w.onmessage = (ev) => {
      const d = ev.data;
      if (d.type === "progress") { done++; $("scanMsg").textContent = `읽는 중… ${done} / ${files.length}`; }
      else if (d.type === "done") { res.chunks += d.chunks; res.cl.push(...d.cl); res.errors += d.errors; res.spawners.push(...d.spawners); res.lavaSky.push(...d.lavaSky); res.lavaIn.push(...d.lavaIn); res.regions.push(...d.regions); w.terminate(); ok(); }
    };
    w.onerror = () => { w.terminate(); ok(); };
    w.postMessage({ files: p, dim });
  })));
  const prev = mapState.scan[dim];
  if (prev) { // 같은 차원에 더 불러오면 합치기 (같은 region은 새 결과로)
    const keep = (e) => !res.regions.some(([rx, rz]) => Math.floor(e[0] / 512) === rx && Math.floor(e[2] / 512) === rz);
    res.spawners.push(...prev.spawners.filter(keep)); res.lavaSky.push(...prev.lavaSky.filter(keep)); res.lavaIn.push(...prev.lavaIn.filter(keep));
    for (const r of prev.regions) if (!res.regions.some(q => q[0] === r[0] && q[1] === r[1])) res.regions.push(r);
    for (let i = 0; i < (prev.cl || []).length; i += 2) if (!res.regions.some(([rx, rz]) => Math.floor(prev.cl[i] / 32) === rx && Math.floor(prev.cl[i + 1] / 32) === rz)) res.cl.push(prev.cl[i], prev.cl[i + 1]);
    res.chunks = res.cl.length / 2;
  }
  mapState.scan[dim] = res; saveScan(dim);
  for (const id of [210, 211]) mapState.show.add(id);
  renderMapChips(); scheduleDraw();
  scanSummary(res.errors ? `읽지 못한 청크 ${res.errors}개(다른 압축 방식 등)는 건너뛰었어요.` : "");
}
// 불러온 범위 안에서 계산 예측(던전·용암 호수)과 실제를 맞대어 보기
async function compareScan() {
  const sc = mapState.scan && mapState.scan[0];
  if (mapState.dim !== 0 || !sc) { scanSummary("오버월드 region 파일을 먼저 불러와 주세요."); return; }
  const tiles = []; for (const [rx, rz] of sc.regions) for (let a = 0; a < 2; a++) for (let c = 0; c < 2; c++) tiles.push([rx * 2 + a, rz * 2 + c]);
  for (const [tx, tz] of tiles) if (!mapState.sc.has(`f:${tx}:${tz}`)) mapState.squeue.unshift({ feat: true, keep: true, types: [201], tx, tz, d: 0 });
  pump();
  for (;;) {
    const left = tiles.filter(([tx, tz]) => !mapState.sc.get(`f:${tx}:${tz}`)).length;
    scanSummary(`계산 중… 남은 구역 ${left} / ${tiles.length}`);
    if (!left) break; await new Promise(r => setTimeout(r, 400)); pump();
  }
  const pred = { 1: [], 2: [], 3: [] }, loaded = new Set();
  for (let i = 0; i < (sc.cl || []).length; i += 2) loaded.add(sc.cl[i] + "," + sc.cl[i + 1]);
  for (const [tx, tz] of tiles) { const a = mapState.sc.get(`f:${tx}:${tz}`); for (let i = 0; i < a.length; i += 4) { const k = a[i + 3] & 15; if (pred[k] && loaded.has((a[i] >> 4) + "," + (a[i + 2] >> 4))) pred[k].push([a[i], a[i + 1], a[i + 2], a[i + 3]]); } }
  const dun = sc.spawners.filter(s => s[3] === "zombie" || s[3] === "skeleton" || s[3] === "spider");
  const MOBS = ["skeleton", "zombie", "zombie", "spider"];
  let dm = 0, mm = 0;
  for (const p of pred[1]) { const a = dun.find(s => s[0] === p[0] && s[2] === p[2] && Math.abs(s[1] - p[1]) <= 1); if (a) { dm++; if (MOBS[(p[3] >> 4) & 3] === a[3]) mm++; } }
  const inBox = (c, p, y0, y1) => c[0] >= p[0] - 1 && c[0] <= p[0] + 16 && c[2] >= p[2] - 1 && c[2] <= p[2] + 16 && c[1] >= y0 && c[1] <= y1;
  const sm = pred[3].filter(p => sc.lavaSky.some(c => inBox(c, p, p[1] - 6, p[1] + 1))).length;
  const um = pred[2].filter(p => sc.lavaIn.some(c => inBox(c, p, p[1] - 6, p[1] + 1)) || sc.lavaSky.some(c => inBox(c, p, p[1] - 6, p[1] + 1))).length;
  const pct = (a, b) => b ? `${Math.round(a / b * 100)}%` : "-";
  scanSummary(`[계산 vs 실제] 던전: 실제 ${dun.length}개 중 계산이 맞힌 것 ${dm}개(${pct(dm, dun.length)}), 계산 ${pred[1].length}개 중 실제 있음 ${pct(dm, pred[1].length)}, 몹 종류 일치 ${mm}/${dm}\n지표 용암 호수: 계산 ${pred[3].length}곳 중 실제 있음 ${sm}곳(${pct(sm, pred[3].length)})\n지하 용암 호수: 계산 ${pred[2].length}곳 중 실제 있음 ${um}곳(${pct(um, pred[2].length)})`);
}
$("scanCmp").addEventListener("click", compareScan);
$("scanFiles").addEventListener("change", (e) => runScan(e.target.files));
$("scanDir").addEventListener("change", (e) => runScan(e.target.files));
$("scanClear").addEventListener("click", () => { if (!mapState.scan) return; delete mapState.scan[mapState.dim]; try { localStorage.removeItem(scanKey(mapState.dim)); } catch (e) {} scheduleDraw(); scanSummary(); });
let caveTimer = 0;
// 기다리던 타일 요청을 버리고, 아직 안 만든 타일 자리도 지워서 다음 그리기 때 새로 요청되게
function dropQueue() { for (const j of mapState.queue) { const t = mapState.tiles.get(j.key); if (t && t.state === 0) mapState.tiles.delete(j.key); } mapState.queue = []; }
function setCaveY(y, fromNum) {
  y = Math.max(-64, Math.min(319, Math.round(+y || 0)));
  if (!fromNum) $("caveYn").value = y; $("caveY").value = Math.min(200, y);
  mapState.caveY = y; clearTimeout(caveTimer);
  caveTimer = setTimeout(() => { if (caveOn()) { dropQueue(); scheduleDraw(); } }, 120);
}
$("caveOn").addEventListener("change", (e) => { mapState.cave = e.target.checked; dropQueue(); scheduleDraw(); });
$("caveY").addEventListener("input", (e) => setCaveY(e.target.value));
$("caveYn").addEventListener("change", (e) => setCaveY(e.target.value, true));
$("mapSeed").addEventListener("keydown", (e) => { if (e.key === "Enter") openMapSeed($("mapSeed").value); });
const clampB = x => Math.max(0.25, Math.min(512, x));
function zoomAt(f, px, py) {
  closePop();
  const v = viewRect(); const wx = v.x0 + px * mapState.bpp, wz = v.z0 + py * mapState.bpp;
  const nb = clampB(mapState.bpp * f);
  mapState.cx = wx - (px - v.W / 2) * nb; mapState.cz = wz - (py - v.H / 2) * nb; mapState.bpp = nb;
  scheduleDraw();
}
big.addEventListener("wheel", (e) => { e.preventDefault(); closePop(); const r = big.getBoundingClientRect(); zoomAt(e.deltaY > 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
$("zin").addEventListener("click", () => { const v = viewRect(); zoomAt(0.5, v.W / 2, v.H / 2); });
$("zout").addEventListener("click", () => { const v = viewRect(); zoomAt(2, v.W / 2, v.H / 2); });
$("zhome").addEventListener("click", () => { const h = homeOf(mapState.dim); mapState.cx = h[0]; mapState.cz = h[1]; mapState.bpp = mapState.dim === 1 ? 8 : 4; scheduleDraw(); });

// 손가락/마우스 조작: 손가락 수가 바뀔 때마다 기준점을 다시 잡아서, 확대 뒤 손을 떼도 지도가 튀지 않게 함
const pointers = new Map(); let gesture = null;
function reanchor() {
  const pts = [...pointers.values()]; const r = big.getBoundingClientRect();
  if (pts.length === 1) gesture = { type: "pan", x: pts[0].x, y: pts[0].y, cx: mapState.cx, cz: mapState.cz, moved: 0 };
  else if (pts.length >= 2) {
    const [a, c] = pts; const mx = (a.x + c.x) / 2 - r.left, my = (a.y + c.y) / 2 - r.top; const v = viewRect();
    gesture = { type: "pinch", d0: Math.max(1, Math.hypot(a.x - c.x, a.y - c.y)), bpp: mapState.bpp, wx: v.x0 + mx * mapState.bpp, wz: v.z0 + my * mapState.bpp };
  } else gesture = null;
}
big.addEventListener("pointerdown", (e) => { closePop(); big.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); reanchor(); big.classList.add("drag"); });
big.addEventListener("pointermove", (e) => {
  const r = big.getBoundingClientRect(); const px = e.clientX - r.left, py = e.clientY - r.top;
  if (pointers.has(e.pointerId)) {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.values()];
    if (gesture && gesture.type === "pinch" && pts.length >= 2) {
      const [a, c] = pts; const d = Math.max(1, Math.hypot(a.x - c.x, a.y - c.y));
      const mx = (a.x + c.x) / 2 - r.left, my = (a.y + c.y) / 2 - r.top; const v = viewRect();
      const nb = clampB(gesture.bpp * gesture.d0 / d); mapState.bpp = nb;
      mapState.cx = gesture.wx - (mx - v.W / 2) * nb; mapState.cz = gesture.wz - (my - v.H / 2) * nb; scheduleDraw();
    } else if (gesture && gesture.type === "pan") {
      gesture.moved = Math.max(gesture.moved, Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y));
      mapState.cx = gesture.cx - (e.clientX - gesture.x) * mapState.bpp; mapState.cz = gesture.cz - (e.clientY - gesture.y) * mapState.bpp; scheduleDraw();
    }
  }
  if (e.pointerType === "mouse") showInfoAt(px, py, !pointers.size);
});
function findHit(px, py) {
  let best = null, bd = 1e9;
  for (const h of mapState.hits || []) { const d = Math.hypot(h.px - px, h.py - py); if (d <= h.r && d <= bd) { bd = d; best = h; } }
  return best;
}
// 구조물 높이: 계산된 값이 있으면 그 값, 고정 높이가 있는 건 그 값, 나머지는 지표면 근사
const NOY = -32768;
function structY(hit) {
  const { st, x, z, y } = hit;
  if (st === 200) return { y, note: "입구 지표" };
  if (st === 210) return { y, note: "생성기" };
  if (st === 211 || st === 212) return { y, note: "용암 맨 위" };
  if (st === 201) return { y, note: "생성기 높이" };
  if (st === 202) return { y, note: "" };
  if (st === 203) return { y, note: "" };
  if (st === 13) return { y: -51, note: "" };
  if (st === 25) return { y: -30, note: "약 -40 ~ -20" };
  if (st === 27 || st === 101) return { y: null, note: "지하, 높이 계산 안 됨" };
  if (st === 17) return { y: null, note: "-58 ~ 30 사이" };
  if (st === 19) return { y: null, note: "대략 33 부근" };
  if (st === 12 || st === 20) return { y: null, note: "계산 안 됨" };
  if (y !== undefined && y !== NOY) return { y, note: st === 18 || st === 102 || st === 15 || st === 100 ? "근사" : "근사" };
  if (mapState.dim !== 0 || !hoverEx) return { y: null, note: "" };
  const h = hoverEx.height_at(x, z);
  if (st === 14) return { y: h - 1, note: "근사" };
  return { y: h, note: "근사" };
}
const UNDER = { 175: "무성한 동굴", 174: "점적석 동굴", 183: "깊은 어둠", 187: "유황 동굴" };
function entrTxt(hit) {
  if (hit.st !== 200) return "";
  const dep = hit.flag & 255, n = hit.flag >> 8;
  const found = [];
  if (hoverEx) for (let y = hit.y - 8; y >= -60; y -= 4) { const b = hoverEx.biome_at(hit.x, hit.z, y); if (UNDER[b] && !found.some(f => f.b === b)) found.push({ b, y }); }
  const under = found.length ? found.map(f => `${UNDER[f.b]}(Y ${f.y}쯤부터)`).join(", ") : "일반 동굴";
  return `<br><span class="d">깊이 ${dep}칸 이상 · 넓이 약 ${n * 16}칸²</span><br><span class="d">이 아래: ${under}</span><br><button type="button" class="cv" data-y="${hit.y - dep}">이 깊이 단면 보기</button>`;
}
const MOB_NAME = ["스켈레톤", "좀비", "좀비", "거미"];
const MOB_ICON = { zombie: "201_1", husk: "201_1", drowned: "201_1", skeleton: "201_0", stray: "201_0", spider: "201_3", cave_spider: 100, silverfish: 101, blaze: 102 };
const MOB_KO = { zombie: "좀비", husk: "허스크", drowned: "드라운드", skeleton: "스켈레톤", stray: "스트레이", spider: "거미", cave_spider: "동굴 거미", silverfish: "좀벌레", blaze: "블레이즈", magma_cube: "마그마 큐브" };
function featTxt(hit) {
  if (hit.st === 19) return `<br><span class="d">종류: ${["주거 구역", "호글린 우리", "보물 방 (가운데 용암·상자)", "다리"][hit.flag & 3]}</span>`;
  if (hit.st === 210) {
    const mob = hit.flag, where = { zombie: "던전", skeleton: "던전", spider: "던전", cave_spider: "폐광", silverfish: "엔드 유적(포탈 방)", blaze: "네더 요새" }[mob];
    return `<br><span class="d">${MOB_KO[mob] || mob} 생성기${where ? " · " + where : ""}</span><br><span class="conf sure">확인됨 (월드 파일)</span>`;
  }
  if (hit.st === 211 || hit.st === 212) return `<br><span class="d">용암 원천 ${hit.flag}칸${hit.st === 211 ? " · 하늘이 보이는 곳" : " · 땅속"}</span><br><span class="conf sure">확인됨 (월드 파일)</span>`;
  if (hit.st === 201) {
    const mob = (hit.flag >> 4) & 3, open = hit.flag >> 8;
    return `<br><span class="d">${MOB_NAME[mob]} 생성기로 추정 · 벽 구멍 ${open}개</span><br><span class="conf likely">높은 확률</span><br><span class="d">실제 월드 파일과 비교했을 때 예측한 던전의 약 96%가 실제로 있었고, 실제 던전의 약 90%를 찾았어요. 몹 종류는 약 91% 일치.</span>`;
  }
  if (hit.st === 202) return `<br><span class="d">땅속에 묻힌 용암 호수 · 실제 월드 파일과 비교해 약 93%가 맞았어요</span><br><span class="conf likely">아마 있음</span><br><span class="d">곧장 아래로 파 내려가지 마세요.</span>`;
  if (hit.st === 203) return `<br><span class="d">땅 위에 드러난 용암 웅덩이</span><br><span class="conf likely">아마 있음</span><br><span class="d">실제 월드 파일과 비교했을 때 13곳 중 12곳이 맞았어요.</span>`;
  return "";
}
function shipTxt(hit) {
  if (hit.st !== 121 || !hit.flag) return "";
  const dx = (hit.flag >> 12) - 2048, dz = (hit.flag & 4095) - 2048;
  return `<br><span class="d">엔드 배 근처: ${hit.x + dx}, ${hit.z + dz}</span>`;
}
let popHit = null;
function closePop() { $("pop").style.display = "none"; popHit = null; }
function openPop(hit, px, py) {
  popHit = hit; const { st, x, z } = hit; const key = `${st}:${x}:${z}`;
  const yy = structY(hit); const yTxt = yy.y === null ? "~" : String(yy.y);
  const pop = $("pop");
  pop.innerHTML = `<button type="button" class="x" aria-label="닫기">×</button>
    <div class="hd">${iconTag(st, 16)}${SNAME[st]}</div>
    <div class="co">X ${x}<br>Y ${yTxt}${yy.note ? ` <span class="d">(${yy.note})</span>` : ""}<br>Z ${z}${shipTxt(hit)}${entrTxt(hit)}${featTxt(hit)}</div>
    <div class="row"><button type="button" class="cp">좌표 복사</button><label><input type="checkbox" class="vis"${visitedSet().has(key) ? " checked" : ""}>다녀옴</label></div>`;
  pop.querySelector(".x").onclick = closePop;
  const cvb = pop.querySelector(".cv"); if (cvb) cvb.onclick = () => { closePop(); $("caveOn").checked = true; mapState.cave = true; setCaveY(+cvb.dataset.y); dropQueue(); scheduleDraw(); };
  const cp = pop.querySelector(".cp");
  cp.onclick = async () => {
    const txt = `${x} ${yTxt} ${z}`; let ok = false;
    try { await navigator.clipboard.writeText(txt); ok = true; } catch (e) {
      try { const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); ok = document.execCommand("copy"); ta.remove(); } catch (e2) {}
    }
    cp.textContent = ok ? "복사됨" : txt; setTimeout(() => { cp.textContent = "좌표 복사"; }, 1400);
  };
  pop.querySelector(".vis").onchange = (e) => { setVisited(key, e.target.checked); scheduleDraw(); renderNear(); };
  pop.style.display = "block";
  const W = big.clientWidth, H = big.clientHeight, pw = pop.offsetWidth, ph = pop.offsetHeight;
  let lx = px + 14, ly = py - ph / 2;
  if (lx + pw > W - 6) lx = px - pw - 14;
  lx = Math.max(6, lx); ly = Math.max(6, Math.min(H - ph - 6, ly));
  pop.style.left = lx + "px"; pop.style.top = ly + "px";
}
function showInfoAt(px, py, withTip) {
  if (!mapState.loaded || !hoverEx) return;
  const v = viewRect(); const wx = Math.floor(v.x0 + px * mapState.bpp), wz = Math.floor(v.z0 + py * mapState.bpp);
  let id = hoverEx.biome_at(wx, wz, mapState.dim === -1 ? 64 : 256); if (mapState.dim === 1 && hoverEx.height_at(wx, wz) <= 0) id = -2; const bname = NAME[id] || "";
  $("cursorInfo").textContent = `X ${fmt(wx)}, Z ${fmt(wz)} · 청크 ${Math.floor(wx / 16)}, ${Math.floor(wz / 16)}${bname ? " · " + bname : ""}`;
  const tip = $("tip"); const hit = withTip && findHit(px, py);
  if (hit) { tip.style.display = "block"; tip.style.left = px + "px"; tip.style.top = py + "px"; tip.textContent = hit.label; } else tip.style.display = "none";
}
const endPointer = (e) => {
  const wasTap = gesture && gesture.type === "pan" && gesture.moved < 6 && pointers.size === 1;
  pointers.delete(e.pointerId); reanchor();
  if (!pointers.size) big.classList.remove("drag");
  if (wasTap) {
    const r = big.getBoundingClientRect(); const px = e.clientX - r.left, py = e.clientY - r.top;
    const hit = findHit(px, py);
    if (hit && hit.st !== undefined) { $("tip").style.display = "none"; openPop(hit, px, py); }
    else { closePop(); showInfoAt(px, py, e.pointerType !== "mouse"); }
  }
};
big.addEventListener("pointerup", endPointer); big.addEventListener("pointercancel", endPointer);
big.addEventListener("keydown", (e) => {
  const step = 60 * mapState.bpp; let used = true;
  if (e.key === "ArrowLeft") mapState.cx -= step; else if (e.key === "ArrowRight") mapState.cx += step;
  else if (e.key === "ArrowUp") mapState.cz -= step; else if (e.key === "ArrowDown") mapState.cz += step;
  else if (e.key === "+" || e.key === "=") { const v = viewRect(); zoomAt(0.5, v.W / 2, v.H / 2); }
  else if (e.key === "-") { const v = viewRect(); zoomAt(2, v.W / 2, v.H / 2); } else used = false;
  if (used) { e.preventDefault(); scheduleDraw(); }
});

/* ---------------- first view ---------------- */
ready.then(() => {
  const cdefs = colDefs([186, 184], []);
  const cfg = { R: 500, cx: 0, cz: 0, step: 32, spawn: 1 };
  const m = new Int32Array(mainEx.memory.buffer); const ip = mainEx.ids_ptr() >> 2, yp = mainEx.ys_ptr() >> 2;
  cdefs.forEach((c, i) => { m[ip + i] = c.id; m[yp + i] = c.y; });
  for (const s of [413, 1931, 2187]) {
    mainEx.set_seed(s, 0, mainEx.mc_wd()); mainEx.nearest(2, 500, 16, 0, 0, 1, 0);
    const o = mainEx.out_ptr() >> 2; const mm = new Int32Array(mainEx.memory.buffer);
    addResult(s, 0, Array.from(mm.slice(o, o + 6)), cfg, true, [mm[o + 80], mm[o + 81]], cdefs);
  }
  selIndex = 0; drawPreview(results[0]); renderTable();
  $("threads").value = Math.max(1, Math.min(16, (navigator.hardwareConcurrency || 4) - 1));
});
renderTable();
