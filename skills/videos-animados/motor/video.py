#!/usr/bin/env python3
"""Motor dos vídeos animados narrados (Reels 1080x1920).

uso: python3 video.py <comando> <pasta-do-episódio> [opções]

  verificar               confere se tudo que o motor precisa está instalado
  elenco    PROJETO       folha com cada personagem do elenco.json (PROJETO/elenco.jpg)
  preparar  EP            lê roteiro.json, gera as falas por cena e o texto da narração (texto_narracao.txt)
  montar    EP            junta molde + biblioteca + elenco + cenas.js na página do episódio (build/pagina.html)
  folha     EP [frac]     folha de quadros de todas as cenas (padrão 0.85 = 85% de cada cena) + erros
  quadro    EP cena frac  um quadro grande de uma cena (pra olhar de perto)
  voz       EP            gera a narração com a voz do perfil (elevenlabs, openai ou kokoro)
  voz       EP --arquivo caminho   usa um áudio pronto (tua voz gravada ou de qualquer outro gerador)
  alinhar   EP            corta os silêncios, mede cada cena pela fala, faz a legenda e confere a narração
  render    EP            renderiza as cenas e exporta o MP4 no padrão Reels (pasta prontos/)
  tudo      EP            montar + alinhar + folha + render

A pasta do projeto é a que tem perfil.json e elenco.json (o motor procura subindo a partir do episódio).
"""
import asyncio, difflib, io, json, os, re, shutil, struct, subprocess, sys, unicodedata
from pathlib import Path

MOTOR = Path(__file__).resolve().parent
WEB, FONTES = MOTOR / "web", MOTOR / "fontes"
DADOS = Path(os.environ.get("VIDEOS_ANIMADOS_HOME", Path.home() / ".videos-animados"))
MODELOS = DADOS / "modelos"

# usa o ambiente próprio do motor (criado pelo instalar.sh), se existir
_venv = DADOS / "venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
if _venv.exists() and Path(sys.prefix).resolve() != (DADOS / "venv").resolve() and not os.environ.get("VA_SEM_VENV"):
    os.execv(str(_venv), [str(_venv), __file__, *sys.argv[1:]])

FPS, W_, H_ = 30, 1080, 1920
SR = 24000          # áudio de trabalho
MAX_SIL, KEEP_SIL = 0.16, 0.10   # pausa dentro da fala: acima de 0,16 s vira 0,10 s
GAP, LEAD = 0.05, 0.10           # entre uma cena e a próxima / antes da primeira palavra
CARTELA = 1.5                    # cartela final muda
MAXW, MAXC, LIM_BLOCO = 4, 24, 2.4  # legenda: até 4 palavras, 24 letras, 2,4 s por bloco


def erro(msg):
    print("ERRO:", msg); sys.exit(1)


# ---------------------------------------------------------------- projeto
def achar_projeto(ep):
    p = ep.resolve()
    for d in [p, *p.parents]:
        if (d / "perfil.json").exists():
            return d
    erro(f"não achei perfil.json acima de {ep}. Rode o questionário primeiro (a skill cria perfil.json e elenco.json).")


def carregar(ep):
    ep = Path(ep).resolve()
    if not ep.is_dir():
        erro(f"pasta do episódio não existe: {ep}")
    pj = achar_projeto(ep)
    perfil = json.load(open(pj / "perfil.json", encoding="utf-8"))
    elenco = json.load(open(pj / "elenco.json", encoding="utf-8")) if (pj / "elenco.json").exists() else {"personagens": []}
    b = ep / "build"; b.mkdir(exist_ok=True)
    return ep, pj, perfil, elenco, b


def ffmpeg_ok():
    return shutil.which("ffmpeg") and shutil.which("ffprobe")


# ---------------------------------------------------------------- números (fala por extenso x tela em algarismo)
UN = "zero um dois três quatro cinco seis sete oito nove dez onze doze treze catorze quinze dezesseis dezessete dezoito dezenove".split()
DZ = "_ _ vinte trinta quarenta cinquenta sessenta setenta oitenta noventa".split()
CT = "_ cento duzentos trezentos quatrocentos quinhentos seiscentos setecentos oitocentos novecentos".split()


def _ate999(n):
    if n == 100:
        return "cem"
    c, r = divmod(n, 100); p = [CT[c]] if c else []
    if r:
        if r < 20:
            p.append(UN[r])
        else:
            d, u = divmod(r, 10); p.append(DZ[d] + (" e " + UN[u] if u else ""))
    return " e ".join(p)


def extenso(n):
    n = int(n)
    if n < 1000:
        return _ate999(n)
    if n < 1_000_000:
        m, r = divmod(n, 1000)
        s = "mil" if m == 1 else _ate999(m) + " mil"
        if r:
            s += (" e " if r < 100 or r % 100 == 0 else " ") + _ate999(r)
        return s
    mi, r = divmod(n, 1_000_000)
    s = ("um milhão" if mi == 1 else _ate999(mi) + " milhões")
    return s + ((" e " if r < 1000 else " ") + extenso(r) if r else "")


def sem_acento(t):
    return "".join(c for c in unicodedata.normalize("NFKD", t) if not unicodedata.combining(c))


EQUIV = [(" está ", " ta "), (" esta ", " ta "), (" estou ", " to "), (" para o ", " pro "), (" para os ", " pros "),
         (" para a ", " pra "), (" para as ", " pras "), (" para ", " pra "), (" ok ", " okay ")]


def tokens(t):
    """texto -> palavras comparáveis: minúsculas, sem acento, números por extenso, 'para' = 'pra' etc."""
    t = " " + t.lower() + " "
    t = re.sub(r"r\$\s*([\d.]+)(,\d+)?", lambda m: " " + m.group(1) + " reais ", t)
    t = re.sub(r"(\d+)\s*%", r"\1 por cento", t)
    t = re.sub(r"(\d{1,2})h(\d{2})", lambda m: f" {m.group(1)} e {m.group(2)} ", t)
    t = re.sub(r"(\d+)h\b", r"\1 horas", t)
    t = re.sub(r"(?<=\d)\.(?=\d{3})", "", t)
    t = re.sub(r"\d+", lambda m: " " + extenso(m.group(0)) + " ", t)
    t = sem_acento(t)
    for a, b in EQUIV:
        t = t.replace(sem_acento(a), b)
    return re.findall(r"[a-z0-9]+", t)


# ---------------------------------------------------------------- cores da marca
def hex_rgb(h):
    h = h.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mix(rgb, alvo, f):
    return tuple(round(c + (a - c) * f) for c, a in zip(rgb, alvo))


def to_hex(rgb):
    return "#" + "".join(f"{c:02X}" for c in rgb)


def tema(perfil):
    m = perfil.get("marca", {})
    cor = m.get("cor", "#FF6A2B")
    try:
        rgb = hex_rgb(cor)
    except Exception:
        erro(f"cor da marca inválida no perfil.json: {cor!r} (use #RRGGBB)")
    c1, c2, c3 = to_hex(rgb), to_hex(mix(rgb, (255, 255, 255), .25)), to_hex(mix(rgb, (0, 0, 0), .18))
    d1, d2 = to_hex(mix(rgb, (8, 8, 12), .9)), to_hex(mix(rgb, (8, 8, 12), .66))
    sig = (m.get("sigla") or "".join(w[0] for w in m.get("nome", "EU").split()[:3])).upper()[:5]
    marca = {"nome": m.get("nome", ""), "sigla": sig, "perfil": m.get("perfil", "@perfil"), "cor": c1}
    css = f":root{{--or:{c1};--or2:{c2}}}"
    js = (f"const MARCA={json.dumps(marca, ensure_ascii=False)};\n"
          f"const COR={{marca:'{c1}',clara:'{c2}',escura:'{c3}'}};\n")
    js_tones = f"TONES.marca=['{d1}','{d2}','{c1}'];\n"
    subs = [("#FF6A2B", c1), ("#ff6a2b", c1), ("#FF8A50", c2), ("#D9541E", c3), ("rgba(255,106,43,", "rgba(%d,%d,%d," % rgb)]
    return css, js, js_tones, subs


# ---------------------------------------------------------------- elenco
PELE = {"clara": ("#F2C3A0", "#D9A27E"), "media": ("#D99A6C", "#BD7D53"), "média": ("#D99A6C", "#BD7D53"),
        "morena": ("#A86B4C", "#8C5639"), "negra": ("#7A4A33", "#5E3826"), "parda": ("#B97A55", "#9A6040")}
CABELO = {"bone": None, "boné": None, "curto": "short", "cacheado": "curly", "crespo": "curly", "maria-chiquinha": "pigtails",
          "longo": "long", "coque": "bun", "careca": "bald"}
ROUPA = {"camiseta": "tee", "moletom": "hoodie", "vestido": "dress"}


def ident(s):
    s = re.sub(r"[^A-Za-z0-9_]", "_", sem_acento(s).upper())
    return ("P_" + s) if s[:1].isdigit() else s


def elenco_js(elenco):
    out, prot = ["/* ---------- ELENCO (gerado do elenco.json; não edite aqui) ---------- */"], None
    for p in elenco.get("personagens", []):
        f = ident(p.get("funcao") or p["nome"])
        v = p.get("visual", {})
        o = {"w": v.get("largura", 300), "pose": "idle", "mood": "smile"}
        cab = v.get("cabelo", "curto")
        if cab not in CABELO:
            erro(f"elenco.json: cabelo '{cab}' de {p['nome']} não existe. Use: {', '.join(CABELO)}")
        if CABELO[cab]:
            o["hairStyle"] = CABELO[cab]
        o["hair"] = v.get("cor_cabelo", "#2A1810")
        if v.get("cor_sobrancelha"):
            o["browC"] = v["cor_sobrancelha"]
        sk = PELE.get(str(v.get("pele", "media")).lower())
        if not sk:
            erro(f"elenco.json: pele '{v.get('pele')}' de {p['nome']} não existe. Use: clara, media, parda, morena, negra")
        o["skin"], o["skin2"] = sk
        o["top"] = ROUPA.get(v.get("roupa", "camiseta"), "tee")
        cr = v.get("cor_roupa", "#3D8BFF")
        o["topC"] = cr; o["topC2"] = v.get("cor_roupa2") or to_hex(mix(hex_rgb(cr), (0, 0, 0), .2)); o["armC"] = cr if o["top"] != "dress" else sk[0]
        o["star"] = v.get("estampa", "#FF6A2B")
        o["pants"] = v.get("cor_calca", "#1E2433"); o["shoe"] = v.get("cor_tenis", "#F4F4F2")
        for k_pt, k in [("oculos", "glasses"), ("barba", "beard"), ("bigode", "mustache")]:
            if v.get(k_pt):
                o[k] = "#111827" if (v[k_pt] is True and k == "glasses") else v[k_pt]
        for k_pt, k in [("oculos_escuros", "shades"), ("fone", "headset"), ("brinco", "earrings"), ("cilios", "lashes"),
                        ("batom", "lips"), ("corrente", "chain"), ("crianca", "kid")]:
            if v.get(k_pt):
                o[k] = True
        if "sigla_bone" in v:
            o["capText"] = v["sigla_bone"]
        out.append(f"/* {p['nome']}: {p.get('papel', '')}. {p.get('jeito', '')} */")
        out.append(f"const {f}=(id,x,y,o={{}})=>P6(id,x,y,Object.assign({json.dumps(o, ensure_ascii=False)},o));")
        if str(p.get("papel", "")).lower().startswith("protagonista") and not prot:
            prot = f
    if not elenco.get("personagens"):
        erro("elenco.json sem personagens. Rode o questionário (a skill cria o elenco).")
    prot = prot or ident(elenco["personagens"][0].get("funcao") or elenco["personagens"][0]["nome"])
    out.append(f"const PROTAGONISTA={prot};")
    return "\n".join(out) + "\n"


# ---------------------------------------------------------------- preparar
def frases_ok(cenas):
    return [c for c in cenas if c.get("fala", "").strip()]


def preparar(ep):
    ep, pj, perfil, elenco, b = carregar(ep)
    r = json.load(open(ep / "roteiro.json", encoding="utf-8"))
    cenas = r.get("cenas") or erro("roteiro.json sem 'cenas'")
    pal = r.get("palavra") or erro("roteiro.json sem 'palavra' (a palavra do CTA)")
    fala = [c["fala"].strip() for c in cenas]
    tela = [(c.get("tela") or c["fala"]).strip() for c in cenas]
    avisos = []
    for i, (f, t) in enumerate(zip(fala, tela)):
        if re.search(r"\d", f):
            avisos.append(f"cena {i}: número em algarismo na FALA ('{f[:50]}…'). Na fala, número vai por extenso; o algarismo vai em 'tela'.")
        n = len(f.split())
        if n > 18:
            avisos.append(f"cena {i}: {n} palavras numa cena só. Quebra em duas (até ~16 palavras por cena).")
        if tokens(f) != tokens(t):
            sm = difflib.SequenceMatcher(None, tokens(f), tokens(t)).ratio()
            if sm < .8:
                avisos.append(f"cena {i}: a tela está muito diferente da fala (a legenda segue a fala palavra por palavra).")
    C = tela + [f"Comenta {pal}"]
    open(b / "caps.js", "w", encoding="utf-8").write(
        "const C=" + json.dumps(C, ensure_ascii=False) + ";\nconst CAP_N=" + json.dumps(r.get("numero")) +
        ";const CAP_T=" + json.dumps(r.get("titulo", ""), ensure_ascii=False) + ";const CAP_W=" + json.dumps(pal, ensure_ascii=False) + ";\n")
    json.dump({"fala": fala + [""], "tela": C}, open(b / "fala.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    texto = " ".join(fala)
    open(ep / "texto_narracao.txt", "w", encoding="utf-8").write(texto + "\n")
    nw = len(texto.split())
    print(f"{len(C)} cenas ({len(fala)} faladas + cartela final), {nw} palavras, ~{nw / 2.9:.0f} s de fala")
    print(f"texto da narração: {ep / 'texto_narracao.txt'}")
    for a in avisos:
        print("AVISO:", a)


# ---------------------------------------------------------------- montar
def montar(ep, quiet=False):
    ep, pj, perfil, elenco, b = carregar(ep)
    if not (b / "caps.js").exists():
        preparar(ep)
    if not (ep / "cenas.js").exists():
        erro(f"falta {ep / 'cenas.js'} (as cenas animadas do episódio)")
    css, js_tema, js_tones, subs = tema(perfil)
    fontes = "".join(
        f"@font-face{{font-family:'{fam}';src:url('{(FONTES / arq).as_uri()}') format('woff2');font-weight:{w};font-style:normal}}"
        for fam, arq, w in [("Inter", "Inter-Regular.woff2", 400), ("Inter", "Inter-SemiBold.woff2", 600), ("Inter", "Inter-Bold.woff2", 700),
                            ("Inter", "Inter-ExtraBold.woff2", 800), ("Inter", "Inter-Black.woff2", 900),
                            ("Inter Display", "InterDisplay-ExtraBold.woff2", 800), ("Inter Display", "InterDisplay-Black.woff2", 900)])
    lib = js_tema + "".join(open(WEB / f, encoding="utf-8").read() + "\n" for f in ["base.js", "pessoas.js", "telas.js", "extras.js"]) + js_tones + \
        open(WEB / "novela.js", encoding="utf-8").read() + "\n" + elenco_js(elenco)
    for a, c in subs:
        lib = lib.replace(a, c)
    cod = lib + open(b / "caps.js", encoding="utf-8").read() + "\n" + open(ep / "cenas.js", encoding="utf-8").read() + \
        "\nif(typeof S==='undefined')throw new Error('cenas.js precisa definir const S=[...]');" \
        "\nif(S.length!==C.length)throw new Error(`cenas.js tem ${S.length} cenas e o roteiro tem ${C.length} (uma por fala + a cartela final)`);\n"
    h = open(WEB / "molde.html", encoding="utf-8").read()
    for a, c in subs:   # brilho do fundo, selo e destaque da legenda na cor da marca
        h = h.replace(a, c)
    h = h.replace("/*__FONTES__*/", fontes).replace("/*__TEMA__*/", css).replace("/*__CODIGO__*/", cod)
    open(b / "pagina.html", "w", encoding="utf-8").write(h)
    if not quiet:
        print("página:", b / "pagina.html")
    return b / "pagina.html"


# ---------------------------------------------------------------- navegador
async def _lancar(p):
    """Chromium do Playwright; se não estiver instalado, o Google Chrome do computador (ou VA_CHROME=caminho)"""
    args = ["--no-sandbox", "--allow-file-access-from-files"]
    tent = [{}, {"channel": "chrome"}, {"channel": "msedge"}]
    if os.environ.get("VA_CHROME"):
        tent.insert(0, {"executable_path": os.environ["VA_CHROME"]})
    ult = None
    for kw in tent:
        try:
            return await p.chromium.launch(args=args, **kw)
        except Exception as e:
            ult = e
    erro(f"não consegui abrir o navegador de render ({str(ult).splitlines()[0][:120]}). Rode: bash instalar.sh  (ou instale o Google Chrome)")


async def _abrir(p, pagina, b):
    br = await _lancar(p)
    pg = await br.new_page(viewport={"width": W_, "height": H_}, device_scale_factor=1)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    if (b / "timing.json").exists() and (b / "subs.json").exists():
        tm = json.load(open(b / "timing.json"))
        await pg.add_init_script(f"window.OVR={json.dumps(tm['durs'])};window.SUBS={open(b / 'subs.json', encoding='utf-8').read()};")
    await pg.goto(Path(pagina).resolve().as_uri())
    await pg.evaluate("document.fonts.ready")
    return br, pg, errs


def folha(ep, frac=0.85, saida=None):
    from playwright.async_api import async_playwright
    from PIL import Image
    ep, pj, perfil, elenco, b = carregar(ep)
    pagina = montar(ep, quiet=True)
    saida = Path(saida) if saida else b / f"folha_{int(frac * 100):02d}.jpg"

    async def run():
        async with async_playwright() as p:
            br, pg, errs = await _abrir(p, pagina, b)
            if errs:
                print("ERROS NA PÁGINA:", *errs[:5], sep="\n  "); await br.close(); return False
            n = await pg.evaluate("S.length"); ims = []
            for k in range(n):
                d = await pg.evaluate(f"setScene({k})"); await pg.evaluate(f"setTime({d * frac})")
                dup = await pg.evaluate("()=>{const c={};document.querySelectorAll('[id]').forEach(e=>c[e.id]=(c[e.id]||0)+1);return Object.keys(c).filter(i=>c[i]>1)}")
                if dup:
                    print("IDS REPETIDOS na cena", k, dup[:8])
                ims.append(Image.open(io.BytesIO(await pg.screenshot(type="jpeg", quality=85))).resize((216, 384)))
            miss = await pg.evaluate("window.WWMISS||[]")
            await br.close()
            if miss:
                print("PALAVRAS QUE NÃO ESTÃO NA LEGENDA (WW):", *miss, sep="\n  ")
            if errs:
                print("ERROS:", *errs[:5], sep="\n  ")
            c = min(8, len(ims)); Wd = Image.new("RGB", (216 * c, 384 * ((len(ims) + c - 1) // c)), (20, 20, 24))
            for i, im in enumerate(ims):
                Wd.paste(im, ((i % c) * 216, (i // c) * 384))
            Wd.save(saida, quality=85)
            print(f"folha: {saida} ({n} cenas)")
            return not errs
    ok = asyncio.run(run())
    if not ok:
        sys.exit(1)


def quadro(ep, cena, frac, saida=None):
    from playwright.async_api import async_playwright
    ep, pj, perfil, elenco, b = carregar(ep)
    pagina = montar(ep, quiet=True)
    saida = Path(saida) if saida else b / f"quadro_{int(cena):02d}_{int(float(frac) * 100):03d}.jpg"

    async def run():
        async with async_playwright() as p:
            br, pg, errs = await _abrir(p, pagina, b)
            d = await pg.evaluate(f"setScene({int(cena)})"); f = float(frac)
            await pg.evaluate(f"setTime({d * f if f <= 1 else f})")
            await pg.screenshot(path=str(saida), type="jpeg", quality=90)
            await br.close()
            if errs:
                print("ERROS:", *errs[:5], sep="\n  ")
    asyncio.run(run()); print("quadro:", saida)


def previa_elenco(projeto):
    """folha com cada personagem do elenco.json (pra aprovar o visual no questionário)"""
    pj = Path(projeto).resolve()
    if not (pj / "perfil.json").exists():
        erro(f"não achei perfil.json em {pj}")
    el = json.load(open(pj / "elenco.json", encoding="utf-8"))
    ps = el.get("personagens") or erro("elenco.json sem personagens")
    ep = pj / ".previa_elenco"; shutil.rmtree(ep, ignore_errors=True); ep.mkdir()
    cenas = [{"fala": f"{p['nome']}, {p.get('papel', '')}."} for p in ps]
    json.dump({"numero": None, "titulo": "Elenco", "palavra": "ELENCO", "cenas": cenas}, open(ep / "roteiro.json", "w", encoding="utf-8"), ensure_ascii=False)
    sc = []
    for i, p in enumerate(ps):
        f = ident(p.get("funcao") or p["nome"])
        sc.append(f"SC({i},'marca',()=>{f}('a{i}',90,780,{{w:300,mood:'smile'}})+{f}('b{i}',390,780,{{w:300,pose:'wave',mood:'happy'}})+{f}('c{i}',690,780,{{w:300,pose:'phone',prop:'phone',mood:'wow'}}),"
                  f"t=>{{life('a{i}',t);life('b{i}',t,1);life('c{i}',t,2);wave('b{i}',t,.1,false)}})")
    sc.append(f"cartelaFinal({len(ps)})")
    open(ep / "cenas.js", "w", encoding="utf-8").write("const S=[\n" + ",\n".join(sc) + "\n];\n")
    preparar(ep)
    folha(ep, 0.6, pj / "elenco.jpg")


# ---------------------------------------------------------------- voz
def _post(url, headers, body, saida):
    import urllib.request, urllib.error
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={**headers, "Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            open(saida, "wb").write(r.read())
    except urllib.error.HTTPError as e:
        erro(f"{url} respondeu {e.code}: {e.read()[:400].decode('utf-8', 'replace')}")


def voz(ep, arquivo=None):
    ep, pj, perfil, elenco, b = carregar(ep)
    for velho in ep.glob("narracao_bruta.*"):
        velho.unlink()
    if arquivo:
        src = Path(arquivo).expanduser()
        if not src.exists():
            erro(f"áudio não encontrado: {src}")
        dst = ep / ("narracao_bruta" + src.suffix.lower()); shutil.copy(src, dst); print("narração:", dst); return
    tf = ep / "texto_narracao.txt"
    if not tf.exists():
        preparar(ep)
    texto = open(tf, encoding="utf-8").read().strip()
    v = perfil.get("voz", {}); via = v.get("via", "arquivo")
    if via == "elevenlabs":
        key = os.environ.get("ELEVENLABS_API_KEY") or erro("defina a variável ELEVENLABS_API_KEY com a tua chave da ElevenLabs")
        vid = v.get("voice_id") or erro("perfil.json: falta voz.voice_id (o ID da voz na ElevenLabs)")
        body = {"text": texto, "model_id": v.get("modelo", "eleven_multilingual_v2")}
        if v.get("ajustes"):
            body["voice_settings"] = v["ajustes"]
        out = ep / "narracao_bruta.mp3"
        _post(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128", {"xi-api-key": key}, body, out)
    elif via == "openai":
        key = os.environ.get("OPENAI_API_KEY") or erro("defina a variável OPENAI_API_KEY com a tua chave da OpenAI")
        body = {"model": v.get("modelo", "gpt-4o-mini-tts"), "voice": v.get("voice_id", "ash"), "input": texto, "response_format": "mp3",
                "instructions": v.get("instrucoes", "Narre em português do Brasil, com sotaque brasileiro, animado e natural, como um contador de histórias de Reels. Não troque de idioma.")}
        out = ep / "narracao_bruta.mp3"
        _post("https://api.openai.com/v1/audio/speech", {"Authorization": f"Bearer {key}"}, body, out)
    elif via == "kokoro":
        import numpy as np, soundfile as sf
        try:
            from kokoro_onnx import Kokoro
        except ImportError:
            erro("voz grátis não instalada. Rode: bash instalar.sh --voz-gratis")
        mk = MODELOS / "kokoro"
        k = Kokoro(str(mk / "kokoro-v1.0.int8.onnx"), str(mk / "voices-v1.0.bin"))
        a, sr = k.create(texto, voice=v.get("voice_id", "pf_dora"), speed=float(v.get("velocidade", 1.1)), lang="pt-br")
        out = ep / "narracao_bruta.wav"; sf.write(out, np.asarray(a, dtype=np.float32), sr)
    elif via == "arquivo":
        erro("o perfil usa voz gravada/externa: grave ou gere a narração de texto_narracao.txt e rode  voz EP --arquivo caminho/do/audio")
    else:
        erro(f"perfil.json: voz.via '{via}' não existe (use arquivo, elevenlabs, openai ou kokoro)")
    print("narração:", out)


# ---------------------------------------------------------------- áudio: ASR, idioma, voz
_mod = {}


def _asr():
    if "pk" not in _mod:
        import sherpa_onnx
        d = MODELOS / "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
        if not d.exists():
            erro("modelo de transcrição não instalado. Rode: bash instalar.sh")
        _mod["pk"] = sherpa_onnx.OfflineRecognizer.from_transducer(
            encoder=str(d / "encoder.int8.onnx"), decoder=str(d / "decoder.int8.onnx"), joiner=str(d / "joiner.int8.onnx"),
            tokens=str(d / "tokens.txt"), model_type="nemo_transducer", num_threads=4)
    return _mod["pk"]


def _lid():
    if "lid" not in _mod:
        import sherpa_onnx
        w = MODELOS / "sherpa-onnx-whisper-base" / "base-"
        _mod["lid"] = sherpa_onnx.SpokenLanguageIdentification(sherpa_onnx.SpokenLanguageIdentificationConfig(
            whisper=sherpa_onnx.SpokenLanguageIdentificationWhisperConfig(encoder=str(w) + "encoder.int8.onnx", decoder=str(w) + "decoder.int8.onnx"), num_threads=2))
    return _mod["lid"]


def _spk():
    if "spk" not in _mod:
        import sherpa_onnx
        _mod["spk"] = sherpa_onnx.SpeakerEmbeddingExtractor(sherpa_onnx.SpeakerEmbeddingExtractorConfig(
            model=str(MODELOS / "wespeaker_en_voxceleb_resnet34.onnx"), num_threads=2))
    return _mod["spk"]


def ler_audio(path, sr, tempo=1.0):
    import numpy as np
    af = f"atempo={tempo}" if abs(tempo - 1) > 1e-6 else "anull"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-af", af, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def ouvir(a16):
    """transcrição com o tempo de início de cada palavra (16 kHz)"""
    pk = _asr(); st = pk.create_stream(); st.accept_waveform(16000, a16); pk.decode_stream(st); r = st.result
    ws, cur = [], None
    for tok, ts in zip(r.tokens, r.timestamps):
        if tok.startswith(" ") or cur is None:
            if cur:
                ws.append(cur)
            cur = [tok.strip(), float(ts)]
        else:
            cur[0] += tok
    if cur:
        ws.append(cur)
    return r.text.strip(), ws


def idioma(a16):
    l = _lid(); st = l.create_stream(); st.accept_waveform(16000, a16); return l.compute(st)


def emb(a16):
    import numpy as np
    e = _spk(); st = e.create_stream(); st.accept_waveform(16000, a16); st.input_finished()
    v = np.array(e.compute(st)); return v / np.linalg.norm(v)


def trim(a, keep=0.03):
    import numpy as np
    thr = max(0.004, 0.025 * float(np.abs(a).max() or 1))
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    return a[max(0, idx[0] - int(keep * SR)):min(len(a), idx[-1] + int(keep * SR))]


def compress(a, fr=0.01, thr_f=0.04):
    """encurta toda pausa interna maior que MAX_SIL para KEEP_SIL (corte com micro-fade)"""
    import numpy as np
    n = int(fr * SR); m = len(a) // n
    if m < 3:
        return a
    rms = np.sqrt(np.mean(a[:m * n].reshape(m, n) ** 2, axis=1))
    thr = max(0.004, thr_f * float(np.abs(a).max() or 1)); sil = rms < thr
    k = 0
    while k < m:  # estalinho de até 30 ms no meio de uma pausa não quebra a pausa
        if not sil[k]:
            j = k
            while j < m and not sil[j]:
                j += 1
            if 0 < k and j < m and (j - k) <= 3 and sil[k - 1] and sil[j] and rms[k:j].max() < 4 * thr:
                sil[k:j] = True
            k = j
        else:
            k += 1
    parts, last, i = [], 0, 0
    while i < m:
        if sil[i]:
            j = i
            while j < m and sil[j]:
                j += 1
            if (j - i) * fr > MAX_SIL and i > 0 and j < m:
                h = int(KEEP_SIL / 2 * SR); s0, s1 = i * n + h, j * n - h
                parts.append(a[last:s0]); last = s1
            i = j
        else:
            i += 1
    parts.append(a[last:])
    f = int(0.005 * SR); ramp = np.linspace(1, 0, f, dtype=np.float32)
    for k in range(len(parts) - 1):
        if len(parts[k]) > f:
            parts[k] = parts[k].copy(); parts[k][-f:] *= ramp
        if len(parts[k + 1]) > f:
            parts[k + 1] = parts[k + 1].copy(); parts[k + 1][:f] *= ramp[::-1]
    return np.concatenate(parts)


# ---------------------------------------------------------------- legenda
FN = set("a o as os e é de do da dos das no na nos nas que pra com em um uma te tu se ao à teu tua seu sua por pelo pela sem quem".split())
_nw = lambda w: re.sub(r"[^\wà-ü$]", "", w.lower())


def blocos(ws):
    ch, cur = [], []
    for w in ws:
        if cur and re.search(r"[.,?!:;]$", cur[-1]):
            ch.append(cur); cur = []
        elif cur and (len(cur) >= MAXW or len(" ".join(cur + [w])) > MAXC):
            mv = []
            while len(cur) > 1 and _nw(cur[-1]) in FN:
                mv.insert(0, cur.pop())
            ch.append(cur); cur = mv
        cur.append(w)
    if cur:
        ch.append(cur)
    pu = lambda w: re.search(r"[.,?!:;]$", w)
    fits = lambda c: len(c) <= MAXW + 1 and len(" ".join(c)) <= MAXC + 4
    k = 0
    while k < len(ch):
        if len(ch[k]) == 1 and len(ch) > 1:
            if k and not pu(ch[k - 1][-1]):
                if fits(ch[k - 1] + ch[k]):
                    ch[k - 1] += ch.pop(k); continue
                if len(ch[k - 1]) >= 3:
                    ch[k].insert(0, ch[k - 1].pop())
            elif k + 1 < len(ch) and (not pu(ch[k][0]) or ch[k][0].endswith(",")) and fits(ch[k] + ch[k + 1]):
                ch[k] += ch.pop(k + 1); continue
        k += 1
    return ch


def legenda(tela, durs, palavras, marca_nome):
    """tela: texto da tela por cena; palavras: [(palavra ouvida, tempo absoluto)]; -> por cena [[texto, ini, fim, bloco]] (tempo relativo à cena)"""
    import numpy as np
    st = np.concatenate([[0], np.cumsum(durs)])
    marca = marca_nome.split() if marca_nome else []
    res = []
    for k, cap in enumerate(tela):
        cw = cap.replace("*", "").split()
        sw = [(w, t - st[k]) for w, t in palavras if st[k] - 0.12 <= t < st[k + 1] - 0.02]
        if k == len(tela) - 1 or not sw:   # cartela final ou cena muda
            res.append([]); continue
        # cada palavra da tela e da fala vira uma lista de tokens comparáveis
        ca = [(i, t) for i, w in enumerate(cw) for t in (tokens(w) or ["_"])]
        sa = [(j, t) for j, (w, _) in enumerate(sw) for t in (tokens(w) or ["_"])]
        tm = [None] * len(cw)
        for blk in difflib.SequenceMatcher(None, [t for _, t in ca], [t for _, t in sa], autojunk=False).get_matching_blocks():
            for d in range(blk.size):
                i, j = ca[blk.a + d][0], sa[blk.b + d][0]
                if tm[i] is None:
                    tm[i] = sw[j][1]
        idx = [i for i, x in enumerate(tm) if x is not None]
        if not idx:
            tm = [sw[0][1] + (durs[k] - sw[0][1]) * i / len(cw) for i in range(len(cw))]
        else:
            for i in range(len(cw)):   # palavra sem par: reparte entre as vizinhas casadas
                if tm[i] is None:
                    pa = max([q for q in idx if q < i], default=None); pb = min([q for q in idx if q > i], default=None)
                    if pa is not None and pb is not None:
                        tm[i] = tm[pa] + (tm[pb] - tm[pa]) * (i - pa) / (pb - pa)
                    elif pa is not None:
                        tm[i] = tm[pa] + 0.25 * (i - pa)
                    else:
                        tm[i] = tm[pb] - 0.25 * (pb - i)
        for i in range(1, len(cw)):  # ordem
            tm[i] = max(tm[i], tm[i - 1] + 0.04)
        tm = [min(max(0.0, t), durs[k] - 0.05) for t in tm]
        # nome e número não se separam
        grupos = [[i] for i in range(len(cw))]
        g = 0
        while g < len(grupos) - 1:
            a1, b1 = cw[grupos[g][-1]], cw[grupos[g + 1][0]]
            junta = (a1 == "R$") or (re.match(r"[\d.,]+$", a1) and re.match(r"(mil|milhões|milhão|mi|bi|reais|%)\W*$", b1)) \
                or any(len(marca) > 1 and _nw(a1) == _nw(marca[x]) and _nw(b1) == _nw(marca[x + 1]) for x in range(len(marca) - 1))
            if junta and not re.search(r"[.?!:;]$", a1):
                grupos[g] += grupos.pop(g + 1)
            else:
                g += 1
        txt = ["\u00a0".join(cw[i] for i in gr) for gr in grupos]
        row, gi = [], 0
        for ci, ch in enumerate(blocos(txt)):
            for x in range(len(ch)):
                gr = grupos[gi]; gi += 1
                for y, i in enumerate(gr):
                    ult = x == len(ch) - 1 and y == len(gr) - 1
                    row.append([re.sub(r"[.,:;]+$", "", cw[i]) if ult else cw[i], round(tm[i], 3), 0, ci])
        for i, w in enumerate(row):
            w[2] = row[i + 1][1] if i + 1 < len(row) else round(durs[k], 3)
        # bloco que fica mais de LIM_BLOCO na tela: divide
        mudou = True
        while mudou:
            mudou = False
            for c in sorted({w[3] for w in row}):
                ix = [i for i, w in enumerate(row) if w[3] == c]
                nx = [w[1] for w in row if w[3] == c + 1]
                fim = nx[0] if nx else row[ix[-1]][2]
                if fim - row[ix[0]][1] > LIM_BLOCO and len(ix) >= 2:
                    meio = ix[len(ix) // 2]
                    for w in row:
                        if w[3] > c:
                            w[3] += 1
                    for i in ix:
                        if i >= meio:
                            row[i][3] = c + 1
                    mudou = True; break
        res.append(row)
    return res


# ---------------------------------------------------------------- alinhar
def alinhar(ep, tempo=None):
    import numpy as np, soundfile as sf
    ep, pj, perfil, elenco, b = carregar(ep)
    if not (b / "fala.json").exists():
        preparar(ep)
    F = json.load(open(b / "fala.json", encoding="utf-8")); fala, tela = F["fala"], F["tela"]
    br = sorted(ep.glob("narracao_bruta.*"))
    if not br:
        erro("falta a narração: rode  voz EP  (ou  voz EP --arquivo caminho)")
    tempo = float(tempo or perfil.get("voz", {}).get("tempo", 1.0))
    lang_alvo = perfil.get("idioma", "pt")
    a16 = ler_audio(br[0], 16000, tempo); a24 = ler_audio(br[0], SR, tempo)
    faladas = [i for i, f in enumerate(fala) if f]
    print(f"narração: {br[0].name} ({len(a16) / 16000:.1f} s{' a ' + str(tempo) + 'x' if tempo != 1 else ''}) — transcrevendo…", flush=True)
    _, rw = ouvir(a16)
    rt = [(j, t) for j, (w, _) in enumerate(rw) for t in (tokens(w) or ["_"])]
    toks = [(i, t) for i in faladas for t in tokens(fala[i])]
    mt = {}
    for blk in difflib.SequenceMatcher(None, [t for _, t in toks], [t for _, t in rt], autojunk=False).get_matching_blocks():
        for d in range(blk.size):
            mt[blk.a + d] = rt[blk.b + d][0]
    first, last, lastw = {}, {}, {}
    for k, (i, _) in enumerate(toks):
        if k in mt:
            first.setdefault(i, rw[mt[k]][1]); last[i] = rw[mt[k]][1]; lastw[i] = rw[mt[k]][0]
    casadas = len(mt) / max(1, len(toks))
    if casadas < .6:
        erro(f"a narração não bate com o roteiro (só {casadas:.0%} das palavras). Confere se o áudio é deste episódio.")
    fr = int(0.02 * 16000)
    rms = np.sqrt(np.mean(a16[:len(a16) // fr * fr].reshape(-1, fr) ** 2, axis=1))
    cut = [0.0]
    for n, i in enumerate(faladas[1:], 1):
        t1 = first.get(i)
        if t1 is None:
            t1 = cut[-1] + 0.5
        lo = max(cut[-1] + 0.2, t1 - 0.7)
        tp = last.get(faladas[n - 1])
        if tp is not None:  # nunca cortar antes da última palavra da cena anterior terminar (duração estimada pelas letras)
            fim = tp + min(0.7, 0.03 + 0.072 * len(lastw.get(faladas[n - 1], "")))
            lo = max(lo, min(fim, t1 - 0.06), tp + 0.1)
        hi = max(lo + 0.04, t1 - 0.02)
        i0, i1 = int(lo / 0.02), int(hi / 0.02)
        j = i0 + int(np.argmin(rms[i0:i1])) if i1 > i0 else i0
        cut.append(j * 0.02 + 0.01)
    cut.append(len(a16) / 16000)

    # conferência frase por frase + montagem
    rel, ruins = [], []
    partes = [np.zeros(int(LEAD * SR), np.float32)]; pos = LEAD; starts = [0.0] * len(fala)
    for n, i in enumerate(faladas):
        s0, s1 = cut[n], cut[n + 1]
        x = a16[int(s0 * 16000):int(s1 * 16000)]
        ouvido, _ = ouvir(np.concatenate([np.zeros(int(.4 * 16000), np.float32), x]))
        lg = idioma(x) if len(x) > 16000 * 0.8 else lang_alvo
        e_, h_ = tokens(fala[i]), tokens(ouvido)
        sim = max(difflib.SequenceMatcher(None, e_, h_).ratio(),   # palavra a palavra ou letra a letra (o ASR às vezes cola "Lu vendeu" em "Luvendeu")
                  difflib.SequenceMatcher(None, "".join(e_), "".join(h_), autojunk=False).ratio())
        sobra = len(h_) - len(e_)
        ok = sim >= .8 and (lg == lang_alvo or (sim >= .95 and len(e_) <= 6))
        motivo = [] if ok else ([f"idioma {lg}"] if lg != lang_alvo else []) + ([f"texto {sim:.0%} igual"] if sim < .8 else [])
        if sobra >= 3 and sim < .9:
            motivo.append(f"{sobra} palavras a mais (frase repetida?)"); ok = False
        rel.append(f"{'ok ' if ok else 'REVER'} cena {i:2d} [{lg}] {sim:.2f} | ouvido: {ouvido}")
        if not ok:
            ruins.append(f"cena {i}: {', '.join(motivo)} — roteiro: \"{fala[i]}\" | ouvido: \"{ouvido}\"")
        c = compress(trim(a24[int(s0 * SR):int(s1 * SR)]))
        starts[i] = 0.0 if n == 0 else pos
        partes.append(c); pos += len(c) / SR
        partes.append(np.zeros(int(GAP * SR), np.float32)); pos += GAP
    starts[len(fala) - 1] = pos
    partes.append(np.zeros(int(CARTELA * SR), np.float32)); pos += CARTELA
    full = np.concatenate(partes)
    sf.write(b / "narracao.wav", full, SR)
    total = len(full) / SR
    durs = [round((starts[i + 1] if i + 1 < len(fala) else total) - starts[i], 3) for i in range(len(fala))]

    # legenda pelo que se ouve na narração final
    print("fazendo a legenda…", flush=True)
    f16 = ler_audio(b / "narracao.wav", 16000)
    txt_final, fw = ouvir(f16)
    subs = legenda(tela, durs, [(w, t) for w, t in fw], perfil.get("marca", {}).get("nome", ""))
    json.dump({"durs": durs, "total": round(total, 3)}, open(b / "timing.json", "w"))
    json.dump(subs, open(b / "subs.json", "w", encoding="utf-8"), ensure_ascii=False)

    # conferência do áudio inteiro: texto, idioma, mesma voz, pausas
    sim_total = difflib.SequenceMatcher(None, tokens(" ".join(f for f in fala if f)), tokens(txt_final), autojunk=False).ratio()
    seg = 8 * 16000; fala16 = f16[:int((total - CARTELA) * 16000)]
    trechos = [fala16[i:i + seg] for i in range(0, max(1, len(fala16) - 3 * 16000), seg)]
    langs = [idioma(t) for t in trechos]
    E = [emb(t) for t in trechos if len(t) > 3 * 16000]
    ref = None
    vref = perfil.get("voz", {}).get("referencia")
    if vref and (pj / vref).exists():
        r16 = ler_audio(pj / vref, 16000); ref = np.mean([emb(r16[i:i + seg]) for i in range(0, max(1, len(r16) - 3 * 16000), seg)], axis=0)
        ref /= np.linalg.norm(ref)
    mesma = [float(E[0] @ e) for e in E] if E else [1.0]
    com_ref = [float(ref @ e) for e in E] if ref is not None and E else []
    n_ = int(0.01 * SR); m_ = int((total - CARTELA) * SR) // n_
    rr = np.sqrt(np.mean(full[:m_ * n_].reshape(m_, n_) ** 2, axis=1)); sil = rr < max(0.004, 0.025 * float(np.abs(full).max()))
    pausas, i = [], 0
    while i < m_:
        if sil[i]:
            j = i
            while j < m_ and sil[j]:
                j += 1
            if (j - i) * .01 >= .2:
                pausas.append(round((j - i) * .01, 2))
            i = j
        else:
            i += 1
    blocos_longos = sum(1 for row in subs for c in {w[3] for w in row}
                        if (lambda ix, nx: (nx[0] if nx else row[ix[-1]][2]) - row[ix[0]][1])(
                            [q for q, w in enumerate(row) if w[3] == c], [w[1] for w in row if w[3] == c + 1]) > 2.6)
    att = list(ruins)
    if any(l != lang_alvo for l in langs):
        att.append(f"idioma por trecho de 8 s: {' '.join(langs)} (tem trecho fora de '{lang_alvo}')")
    if min(mesma) < .6:
        att.append(f"a voz muda no meio (semelhança com o 1º trecho: {' '.join(f'{s:.2f}' for s in mesma)})")
    if com_ref and min(com_ref) < .6:
        att.append(f"voz diferente da referência do perfil ({' '.join(f'{s:.2f}' for s in com_ref)})")
    if sim_total < .85:
        att.append(f"a narração final só bate {sim_total:.0%} com o roteiro")
    linhas = ["CONFERÊNCIA DA NARRAÇÃO", "",
              f"duração: {total:.1f} s ({len(fala)} cenas; menor {min(durs):.2f} s, maior {max(durs):.2f} s)",
              f"texto x roteiro: {sim_total:.0%}",
              f"idioma por trecho de 8 s: {' '.join(langs)}",
              f"mesma voz do começo ao fim: {' '.join(f'{s:.2f}' for s in mesma)}" + (f" | com a referência: {' '.join(f'{s:.2f}' for s in com_ref)}" if com_ref else ""),
              f"pausas de 0,2 s ou mais (fora a cartela): {pausas or 'nenhuma'}",
              f"blocos de legenda acima de 2,6 s: {blocos_longos}", "", "frase por frase:", *rel, ""]
    linhas.append("ATENÇÃO:\n  " + "\n  ".join(att) if att else "APROVADO: mesma voz, mesmo idioma, texto do roteiro, sem pausa morta.")
    open(b / "conferencia.txt", "w", encoding="utf-8").write("\n".join(linhas) + "\n")
    print("\n".join(linhas[2:8]))
    print("\n".join(linhas[-1:]))
    print("detalhes:", b / "conferencia.txt")
    return not att


# ---------------------------------------------------------------- render + exportação
def render(ep, workers=2):
    from playwright.async_api import async_playwright
    ep, pj, perfil, elenco, b = carregar(ep)
    if not (b / "timing.json").exists():
        erro("rode  alinhar EP  antes do render (a duração de cada cena vem da narração)")
    pagina = montar(ep, quiet=True)
    tm = json.load(open(b / "timing.json"))
    ends = [sum(tm["durs"][:i + 1]) for i in range(len(tm["durs"]))]; sts = [0.0] + ends[:-1]
    frames = [round(e * FPS) - round(s * FPS) for s, e in zip(sts, ends)]
    sc = b / "cenas"; shutil.rmtree(sc, ignore_errors=True); sc.mkdir()

    async def uma(br, k, sem):
        async with sem:
            pg = await br.new_page(viewport={"width": W_, "height": H_}, device_scale_factor=1)
            errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(f"window.OVR={json.dumps(tm['durs'])};window.SUBS={open(b / 'subs.json', encoding='utf-8').read()};")
            await pg.goto(pagina.resolve().as_uri()); await pg.evaluate("document.fonts.ready")
            await pg.evaluate(f"setScene({k})")
            tmp, fin = sc / f"cena_{k:03d}.tmp.mp4", sc / f"cena_{k:03d}.mp4"
            proc = await asyncio.create_subprocess_exec(
                "ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p", "-r", str(FPS), str(tmp), stdin=asyncio.subprocess.PIPE)
            for f in range(frames[k]):
                await pg.evaluate(f"setTime({f / FPS})")
                proc.stdin.write(await pg.screenshot(type="jpeg", quality=92)); await proc.stdin.drain()
            proc.stdin.close(); rc = await proc.wait(); await pg.close()
            if rc == 0:
                os.replace(tmp, fin)
            print(f"cena {k + 1}/{len(frames)} ({frames[k]} quadros){' ERROS: ' + str(errs[:2]) if errs else ''}", flush=True)
            return rc

    async def todas():
        async with async_playwright() as p:
            br = await _lancar(p)
            sem = asyncio.Semaphore(workers)
            rcs = await asyncio.gather(*[uma(br, k, sem) for k in range(len(frames))])
            await br.close()
            return rcs
    rcs = asyncio.run(todas())
    if any(rcs):
        erro("alguma cena falhou no render")
    (sc / "lista.txt").write_text("".join(f"file 'cena_{k:03d}.mp4'\n" for k in range(len(frames))))
    master = b / "master.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(sc / "lista.txt"), "-c", "copy", str(master)], check=True)
    r = json.load(open(ep / "roteiro.json", encoding="utf-8"))
    nome = re.sub(r"[^A-Za-z0-9]+", "", sem_acento(r.get("titulo", ep.name)).title()) or ep.name
    num = r.get("numero")
    prontos = pj / "prontos"; prontos.mkdir(exist_ok=True)
    final = prontos / (f"Cap{int(num):02d}_{nome}.mp4" if isinstance(num, int) else f"{nome}.mp4")
    ok = exportar(master, b / "narracao.wav", final)
    print("vídeo:", final)
    if not ok:
        sys.exit(1)


def exportar(master, audio, final):
    out = final.with_suffix(".parcial.mp4")
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(master), "-i", str(audio), "-map", "0:v:0", "-map", "1:a:0",
        "-vf", "scale=1080:1920:in_color_matrix=bt601:out_color_matrix=bt709:in_range=tv:out_range=tv:flags=bicubic,format=yuv420p,setsar=1",
        "-r", "30", "-fps_mode", "cfr", "-c:v", "libx264", "-preset", "veryfast", "-profile:v", "high", "-level", "4.1",
        "-crf", "18", "-maxrate", "20M", "-bufsize", "40M", "-g", "60", "-keyint_min", "60", "-sc_threshold", "0",
        "-force_key_frames", "expr:gte(t,n_forced*2)",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
        "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709",
        "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2",
        "-shortest", "-movflags", "+faststart", "-use_editlist", "0", "-avoid_negative_ts", "make_zero", str(out)], check=True)
    os.replace(out, final)
    p = json.loads(subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(final)],
                                  capture_output=True, text=True, check=True).stdout)
    v = next(s for s in p["streams"] if s["codec_type"] == "video"); a = next(s for s in p["streams"] if s["codec_type"] == "audio")
    pk = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "packet=pts_time,flags", "-of", "csv=p=0", str(final)],
                        capture_output=True, text=True, check=True).stdout.split()
    kf = [float(l.split(",")[0]) for l in pk if "K" in l.split(",")[-1]]
    gaps = sorted({round(y - x, 3) for x, y in zip(kf, kf[1:])})
    data = open(final, "rb").read(); top, pos = [], 0
    while pos + 8 <= len(data):
        size, typ = struct.unpack(">I4s", data[pos:pos + 8])
        if size == 1:
            size = struct.unpack(">Q", data[pos + 8:pos + 16])[0]
        top.append(typ.decode("latin1"))
        if size == 0:
            break
        pos += size
    moov_first = "moov" in top and "mdat" in top and top.index("moov") < top.index("mdat")
    ok = (v["width"], v["height"]) == (1080, 1920) and v["codec_name"] == "h264" and v["pix_fmt"] == "yuv420p" and v["r_frame_rate"] == "30/1" \
        and v.get("color_space") == "bt709" and a["codec_name"] == "aac" and a["sample_rate"] == "48000" and a["channels"] == 2 \
        and moov_first and all(abs(g - 2.0) < 0.001 for g in gaps)
    print(f"exportação: {v['width']}x{v['height']} {v['codec_name']} {v['pix_fmt']} {v['r_frame_rate']} fps, cor {v.get('color_space')}, "
          f"áudio {a['codec_name']} {a['sample_rate']} Hz {a['channels']} canais, {float(p['format']['duration']):.1f} s, "
          f"keyframe a cada {gaps} s, faststart {moov_first} -> {'APROVADO' if ok else 'REPROVADO'}")
    return ok


# ---------------------------------------------------------------- verificar
def verificar():
    falta = []
    if not ffmpeg_ok():
        falta.append("ffmpeg (Mac: brew install ffmpeg | Windows: winget install ffmpeg | Linux: apt install ffmpeg)")
    for mod in ["numpy", "soundfile", "PIL", "sherpa_onnx", "playwright"]:
        try:
            __import__(mod)
        except ImportError:
            falta.append(f"pacote Python {mod} (rode bash instalar.sh)")
    for m in ["sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8/encoder.int8.onnx", "sherpa-onnx-whisper-base/base-encoder.int8.onnx",
              "wespeaker_en_voxceleb_resnet34.onnx"]:
        if not (MODELOS / m).exists():
            falta.append(f"modelo {m.split('/')[0]} (rode bash instalar.sh)")
    try:
        from playwright.async_api import async_playwright

        async def _t():
            async with async_playwright() as p:
                await (await _lancar(p)).close()
        asyncio.run(_t())
    except SystemExit:
        falta.append("navegador de render (rode bash instalar.sh, ou instale o Google Chrome)")
    except Exception as e:
        falta.append(f"navegador de render ({str(e).splitlines()[0][:80]})")
    kok = (MODELOS / "kokoro" / "kokoro-v1.0.int8.onnx").exists()
    print("voz grátis (kokoro):", "instalada" if kok else "não instalada (opcional: bash instalar.sh --voz-gratis)")
    if falta:
        print("FALTA:", *falta, sep="\n  "); sys.exit(1)
    print("tudo pronto")


# ---------------------------------------------------------------- main
def main():
    a = sys.argv[1:]
    if not a or a[0] in ("-h", "--help", "ajuda"):
        print(__doc__); return
    cmd = a[0]
    if cmd == "verificar":
        return verificar()
    if cmd == "elenco":
        return previa_elenco(a[1] if len(a) > 1 else ".")
    if len(a) < 2:
        erro(f"uso: video.py {cmd} pasta-do-episodio")
    ep = a[1]
    if cmd == "preparar":
        preparar(ep)
    elif cmd == "montar":
        montar(ep)
    elif cmd == "folha":
        folha(ep, float(a[2]) if len(a) > 2 else 0.85, a[3] if len(a) > 3 else None)
    elif cmd == "quadro":
        quadro(ep, a[2], a[3] if len(a) > 3 else "0.85", a[4] if len(a) > 4 else None)
    elif cmd == "voz":
        voz(ep, a[a.index("--arquivo") + 1] if "--arquivo" in a else None)
    elif cmd == "alinhar":
        ok = alinhar(ep, a[a.index("--tempo") + 1] if "--tempo" in a else None)
        sys.exit(0 if ok else 2)
    elif cmd == "render":
        render(ep)
    elif cmd == "tudo":
        preparar(ep); montar(ep)
        if not alinhar(ep):
            erro("a conferência da narração pediu atenção (build/conferencia.txt). Corrija antes do render.")
        folha(ep); render(ep)
    else:
        erro(f"comando desconhecido: {cmd}")


if __name__ == "__main__":
    main()
