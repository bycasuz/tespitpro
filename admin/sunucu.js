// TespitPro yerel yönetim sunucusu: yalnız 127.0.0.1:4310. Harici bağımlılık yok.
const http = require("http"), fs = require("fs"), path = require("path"), { execFile } = require("child_process");
const KOK = path.join(__dirname, "..");
const PORT = 4310, HOST = "127.0.0.1";
const ICERIK = path.join(KOK, "icerik.json"), YEDEK = path.join(KOK, "yedek"), HAM = path.join(KOK, "ham-foto"), DOCS = path.join(KOK, "docs");
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8" };
const ZORUNLU = ["firma", "sayfalar", "slider", "belirtiler", "yontem", "surec", "galeri", "kimlere", "bolgeler", "sssOrtak", "talepKonulari", "rehber", "rehberSayfa"];

const yanit = (res, kod, obj) => { res.writeHead(kod, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); };
const govde = (req, limit) => new Promise((ok, hata) => {
  const parca = []; let n = 0;
  req.on("data", (c) => { n += c.length; if (n > limit) { req.destroy(); hata(new Error("İstek çok büyük")); } else parca.push(c); });
  req.on("end", () => ok(Buffer.concat(parca).toString("utf8")));
  req.on("error", hata);
});
const calistir = (cmd, args, cwd) => new Promise((ok) => execFile(cmd, args, { cwd, timeout: 180000, windowsHide: true, maxBuffer: 4e6 }, (err, out, errOut) => ok({ kod: err ? (err.code || 1) : 0, cikti: ((out || "") + (errOut || "")).trim() })));
const guvenli = (taban, goreli) => {
  const yol = path.normalize(path.join(taban, goreli));
  return yol === taban || yol.startsWith(taban + path.sep) ? yol : null;
};
const dogrula = (v) => {
  const h = [];
  if (!v || typeof v !== "object" || Array.isArray(v)) return ["Veri nesne değil"];
  for (const k of ZORUNLU) if (!(k in v)) h.push(k + " alanı eksik");
  if (Array.isArray(v.sayfalar) && !v.sayfalar.length) h.push("sayfalar boş olamaz");
  if (Array.isArray(v.slider) && !v.slider.length) h.push("slider en az bir slayt içermeli");
  for (const k of ["slider", "sayfalar", "bolgeler", "rehber", "talepKonulari", "sssOrtak"]) if (k in v && !Array.isArray(v[k])) h.push(k + " dizi olmalı");
  return h;
};
const fotoAdi = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const UZANTI = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const zaman = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

async function api(req, res, yol) {
  if (yol === "/api/icerik" && req.method === "GET") return yanit(res, 200, JSON.parse(fs.readFileSync(ICERIK, "utf8")));
  if (yol === "/api/icerik" && req.method === "POST") {
    let v;
    try { v = JSON.parse(await govde(req, 5e6)); } catch (e) { return yanit(res, 400, { ok: false, hatalar: ["Geçersiz JSON: " + e.message] }); }
    const h = dogrula(v);
    if (h.length) return yanit(res, 400, { ok: false, hatalar: h });
    fs.mkdirSync(YEDEK, { recursive: true });
    const yedek = "icerik-" + zaman() + ".json";
    if (fs.existsSync(ICERIK)) fs.copyFileSync(ICERIK, path.join(YEDEK, yedek));
    fs.writeFileSync(ICERIK, JSON.stringify(v, null, 2) + "\n", "utf8");
    return yanit(res, 200, { ok: true, yedek });
  }
  if (yol === "/api/fotolar" && req.method === "GET") {
    const ham = fs.existsSync(HAM) ? fs.readdirSync(HAM).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)) : [];
    const web = fs.existsSync(path.join(DOCS, "img")) ? fs.readdirSync(path.join(DOCS, "img")).filter((f) => f.endsWith("-800.webp")).map((f) => f.slice(0, -9)) : [];
    return yanit(res, 200, { ham, web });
  }
  if (yol === "/api/foto" && req.method === "POST") {
    let v;
    try { v = JSON.parse(await govde(req, 20e6)); } catch (e) { return yanit(res, 400, { ok: false, mesaj: "Yükleme okunamadı" }); }
    const ad = fotoAdi(v.ad), m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(v.dataUrl || "");
    if (!ad) return yanit(res, 400, { ok: false, mesaj: "Geçersiz dosya adı" });
    if (!m) return yanit(res, 400, { ok: false, mesaj: "Yalnız JPG, PNG veya WEBP yüklenebilir" });
    fs.mkdirSync(HAM, { recursive: true });
    fs.writeFileSync(path.join(HAM, ad + "." + UZANTI[m[1]]), Buffer.from(m[2], "base64"));
    const sonuc = await calistir("python", [path.join(__dirname, "foto.py"), ad], KOK);
    return yanit(res, 200, { ok: sonuc.kod === 0, ad, mesaj: sonuc.kod === 0 ? "Fotoğraf hazır: " + ad : sonuc.cikti });
  }
  if (yol === "/api/google" && req.method === "GET") {
    try { return yanit(res, 200, JSON.parse(fs.readFileSync(path.join(KOK, "google.json"), "utf8"))); } catch { return yanit(res, 200, {}); }
  }
  if (yol === "/api/derle" && req.method === "POST") {
    const sonuc = await calistir(process.execPath, [path.join(KOK, "uret.js")], KOK);
    return yanit(res, 200, { ok: sonuc.kod === 0, cikti: sonuc.cikti });
  }
  if (yol === "/api/yayinla" && req.method === "POST") {
    const uzak = await calistir("git", ["remote"], KOK);
    if (!uzak.cikti) return yanit(res, 200, { ok: false, mesaj: "yayın adresi ayarlı değil" });
    await calistir("git", ["add", "-A"], KOK);
    const c = await calistir("git", ["commit", "-m", "Site güncellemesi " + new Date().toISOString().slice(0, 10)], KOK);
    if (c.kod !== 0) return yanit(res, 200, { ok: false, mesaj: /nothing to commit/i.test(c.cikti) ? "Değişiklik yok" : c.cikti });
    return yanit(res, 200, { ok: true, mesaj: "Commit atıldı. Gönderme (push) yapılmadı." });
  }
  return yanit(res, 404, { ok: false, mesaj: "Bulunamadı" });
}

function dosya(res, taban, goreli) {
  const yol = guvenli(taban, goreli || "index.html");
  if (!yol) { res.writeHead(403); return res.end(); }
  let hedef = yol;
  if (fs.existsSync(hedef) && fs.statSync(hedef).isDirectory()) hedef = path.join(hedef, "index.html");
  if (!fs.existsSync(hedef)) { res.writeHead(404); return res.end("Bulunamadı"); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(hedef).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(hedef).pipe(res);
}

http.createServer(async (req, res) => {
  try {
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host || "")) { res.writeHead(403); return res.end(); }
    const url = new URL(req.url, "http://127.0.0.1");
    const yol = decodeURIComponent(url.pathname);
    if (yol.startsWith("/api/")) return await api(req, res, yol);
    if (yol === "/" || yol === "/index.html") return dosya(res, __dirname, "index.html");
    if (yol.startsWith("/onizleme/")) return dosya(res, DOCS, yol.slice("/onizleme/".length));
    if (yol.startsWith("/ham/")) {
      const ad = yol.slice("/ham/".length);
      if (!/\.(jpe?g|png|webp)$/i.test(ad)) { res.writeHead(404); return res.end(); }
      return dosya(res, HAM, ad);
    }
    res.writeHead(404); res.end("Bulunamadı");
  } catch (e) {
    yanit(res, 500, { ok: false, mesaj: e.message });
  }
}).listen(PORT, HOST, () => console.log("TespitPro yönetim: http://127.0.0.1:" + PORT));
