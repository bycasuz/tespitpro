// TespitPro statik site üretici: `node uret.js` -> docs/ klasörüne HTML + sitemap yazar.
// Ortak üst/alt/schema burada; sayfa gövdeleri aşağıdaki SAYFALAR dizisinde.
const fs = require("fs"), path = require("path");
const SITE = "https://bycasuz.github.io/tespitpro/";
const TEL = "+905413730069", TEL_GOR = "0541 373 00 69";
const WA = "https://wa.me/905413730069?text=" + encodeURIComponent("Merhaba, su kaçağı tespiti için bilgi almak istiyorum.");
const MAPS = "https://maps.google.com/?cid=11539754779874183849";
const YORUM_YAZ = "https://search.google.com/local/writereview?placeid=ChIJu-e2S3qlyhQRqUqEAdVxJaA";
const ADRES = "Şirinevler Mah. Yeşilbağ Sk. No:11 D:A, 34188 Bahçelievler / İstanbul";
const PLACE_ID = "ChIJu-e2S3qlyhQRqUqEAdVxJaA";
const GSC_META = fs.existsSync(path.join(__dirname, "gsc-meta.txt")) ? fs.readFileSync(path.join(__dirname, "gsc-meta.txt"), "utf8").trim() : "";
const INDEXNOW = "7f3c9a1e5b2d4c6e8a0b1d3f5e7a9c2b";
const esc = (t) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let G = { puan: 5, yorum: 42, yorumlar: [] }; // Google İşletme verisi; derlemede Places API'den tazelenir

const isletme = {
  "@context": "https://schema.org", "@type": "Plumber", "@id": SITE + "#isletme",
  name: "TespitPro", url: SITE, telephone: TEL, image: SITE + "logo.svg",
  description: "Bahçelievler Şirinevler merkezli, cihazla ve kamerayla kırmadan su kaçağı tespiti ve onarımı. 7/24 hizmet.",
  address: { "@type": "PostalAddress", streetAddress: "Şirinevler Mah. Yeşilbağ Sk. No:11 D:A", addressLocality: "Bahçelievler", addressRegion: "İstanbul", postalCode: "34188", addressCountry: "TR" },
  geo: { "@type": "GeoCoordinates", latitude: 40.9978802, longitude: 28.8465744 },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "00:00", closes: "23:59" }],
  areaServed: ["Bahçelievler", "Şirinevler", "Esenler", "Yenibosna", "Güngören", "Bakırköy"].map((n) => ({ "@type": "Place", name: n + ", İstanbul" })),
  hasMap: MAPS, sameAs: [MAPS],
  knowsAbout: ["Su kaçağı tespiti", "Kırmadan su kaçağı tespiti", "Kameralı su kaçağı tespiti", "Su kaçağı onarımı"],
};

const SSS_ORTAK = [
  ["Su kaçağı olduğunu nasıl anlarım?", "En sık işaretler: su faturasının sebepsiz yükselmesi, musluklar kapalıyken sayacın dönmesi, alt kata su inmesi, duvarda veya zeminde nem, kabarma ve küf lekesi."],
  ["Kırmadan tespit ne demek?", "Kaçağın yeri duvar ve zemin kırılmadan, cihaz ve kamerayla bulunur. Onarım için yalnızca kaçağın olduğu nokta açılır; bütün banyo veya mutfak kırılmaz."],
  ["Gece ya da hafta sonu geliyor musunuz?", "Evet, 7 gün 24 saat çalışıyoruz. Alt kata su iniyorsa beklemeden arayın."],
  ["Tespitten sonra tamiri de yapıyor musunuz?", "Evet. Kaçağın yerini gösteriyor, onayınızla aynı ekip onarımı yapıyor."],
];

const ust = (s) => `<!doctype html>
<html lang="tr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${s.baslik}</title>
<meta name="description" content="${s.aciklama}">
<link rel="canonical" href="${SITE}${s.dosya === "index.html" ? "" : s.dosya}">
<meta property="og:title" content="${s.baslik}"><meta property="og:description" content="${s.aciklama}">
<meta property="og:type" content="website"><meta property="og:url" content="${SITE}${s.dosya === "index.html" ? "" : s.dosya}">
<meta property="og:locale" content="tr_TR">${GSC_META}
<link rel="icon" href="logo.svg"><link rel="stylesheet" href="style.css">
<script type="application/ld+json">${JSON.stringify(isletme)}</script>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: s.sss.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) })}</script>
</head><body>
<header><div class="kap">
<a class="logo" href="./">Tespit<span>Pro</span></a>
<nav><a href="./#hizmetler">Hizmetler</a><a href="bahcelievler-su-kacagi-tespiti.html">Bahçelievler</a><a href="sirinevler-su-kacagi-tespiti.html">Şirinevler</a><a href="esenler-su-kacagi-tespiti.html">Esenler</a><a href="./#iletisim">İletişim</a></nav>
<a class="btn kucuk" href="tel:${TEL}">📞 ${TEL_GOR}</a>
</div></header>
<section class="hero"><div class="kap">
<div class="rozet">⭐ Google'da ${Number(G.puan).toFixed(1).replace(".", ",")} puan · ${G.yorum} yorum · 7/24 açık</div>
<h1>${s.h1}</h1>
<p>${s.giris}</p>
<div class="btnler"><a class="btn" href="tel:${TEL}">📞 Hemen ara: ${TEL_GOR}</a><a class="btn wa" href="${WA}">WhatsApp'tan yaz</a></div>
</div></section>
<main>`;

const alt = (s) => `
<section><div class="kap"><h2>Sık sorulan sorular</h2>
${s.sss.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n")}
</div></section>
<section id="iletisim"><div class="kap izgara">
<div class="nap"><h2>İletişim</h2>
<p><strong>TespitPro</strong><br>${ADRES}<br>Telefon: <a href="tel:${TEL}">${TEL_GOR}</a><br>Çalışma saatleri: Her gün 24 saat</p>
<p><a href="${MAPS}">Google Haritalar'da yol tarifi</a> · <a href="${YORUM_YAZ}">Bizi değerlendirin</a></p></div>
<iframe loading="lazy" title="TespitPro konumu" src="https://maps.google.com/maps?q=40.9978802,28.8465744&z=15&output=embed"></iframe>
</div></section>
</main>
<footer><div class="kap">© ${new Date().getFullYear()} TespitPro · ${ADRES} · <a href="tel:${TEL}">${TEL_GOR}</a><br>
<a href="./">Ana sayfa</a> · <a href="bahcelievler-su-kacagi-tespiti.html">Bahçelievler su kaçağı tespiti</a> · <a href="sirinevler-su-kacagi-tespiti.html">Şirinevler su kaçağı tespiti</a> · <a href="esenler-su-kacagi-tespiti.html">Esenler su kaçağı tespiti</a></div></footer>
<div class="sabit"><a class="btn" href="tel:${TEL}">📞 Ara</a><a class="btn wa" href="${WA}">WhatsApp</a></div>
</body></html>`;

const hizmetler = `<section id="hizmetler"><div class="kap"><h2>Hizmetlerimiz</h2><div class="izgara">
<div class="kart"><h3>Cihazla su kaçağı tespiti</h3><p>Akustik dinleme cihazıyla borudaki kaçağın sesini duvarın ve zeminin üstünden takip edip noktasını buluyoruz.</p></div>
<div class="kart"><h3>Kameralı tespit</h3><p>Gider ve borulara kamerayla bakarak kırık, çatlak ve sızıntıyı ekranda size de gösteriyoruz.</p></div>
<div class="kart"><h3>Kırmadan tespit, noktasal onarım</h3><p>Bütün banyoyu veya mutfağı kırmıyoruz; yalnızca kaçağın olduğu noktayı açıp onarıyoruz.</p></div>
<div class="kart"><h3>Alt kata su sızması</h3><p>Komşunuza su iniyorsa kaynağı banyo, mutfak, kombi veya tesisat hattında arayıp kısa sürede buluyoruz.</p></div>
<div class="kart"><h3>Yüksek su faturası</h3><p>Sayaç musluklar kapalıyken dönüyorsa gizli bir kaçak vardır; hattı test edip yerini tespit ediyoruz.</p></div>
<div class="kart"><h3>Bina girişi ve ana hat kaçakları</h3><p>Apartman girişindeki, bahçedeki ve ana hattaki kaçakları da tespit edip onarıyoruz.</p></div>
</div></div></section>`;

const nasil = `<section><div class="kap"><h2>Nasıl çalışıyoruz?</h2><ol class="adim">
<li><strong>Arayın veya WhatsApp'tan yazın.</strong> Belirtileri (fatura, nem, alt kata su) kısaca anlatın.</li>
<li><strong>Adresinize geliyoruz.</strong> Gece ve hafta sonu dahil.</li>
<li><strong>Cihaz ve kamerayla kaçağı buluyoruz,</strong> yerini size gösteriyoruz.</li>
<li><strong>Onayınızla yalnızca o noktayı açıp onarıyoruz,</strong> ardından alanı temiz bırakıyoruz.</li>
</ol></div></section>`;

const yorumlar = () => `<section id="yorumlar"><div class="kap"><h2>Google yorumlarımız (${Number(G.puan).toFixed(1).replace(".", ",")} ⭐ · ${G.yorum} yorum)</h2><div class="izgara">
${G.yorumlar.filter((y) => y.metin).slice(0, 6).map((y) => `<div class="kart"><p>${"⭐".repeat(Math.round(y.puan || 5))}</p><p class="yorum">“${esc(y.metin.length > 320 ? y.metin.slice(0, 317) + "…" : y.metin)}”</p><p><strong>${esc(y.yazar)}</strong> · ${esc(y.once)} · Google</p></div>`).join("\n")}
</div><p><a href="${MAPS}">Tüm Google yorumlarını okuyun →</a> · <a href="${YORUM_YAZ}">Siz de yorum yazın</a></p></div></section>`;

const bolge = (ad, metin, mahalleler) => `<section><div class="kap"><h2>${ad}'de su kaçağı tespiti</h2>${metin}
<p><strong>Hizmet verdiğimiz yerler:</strong> ${mahalleler}</p></div></section>`;

const SAYFALAR = [
  { dosya: "index.html", baslik: "TespitPro | Kırmadan Su Kaçağı Tespiti Bahçelievler · 7/24",
    aciklama: "Bahçelievler, Şirinevler ve Esenler'de cihazla ve kamerayla kırmadan su kaçağı tespiti ve onarımı. 7/24 hizmet: 0541 373 00 69.",
    h1: "Kırmadan su kaçağı tespiti — Bahçelievler, Şirinevler, Esenler",
    giris: "Su faturanız yükseldiyse, alt kata su iniyorsa ya da duvarda nem varsa kaçağın yerini cihaz ve kamerayla kırmadan buluyor, aynı gün onarıyoruz. Şirinevler'deki merkezimizden gece gündüz geliyoruz.",
    govde: () => hizmetler + nasil + yorumlar() + bolge("Bahçelievler ve çevresi", "<p>Merkezimiz Şirinevler'de olduğu için Bahçelievler, Yenibosna, Esenler, Güngören ve Bakırköy'e kısa sürede ulaşıyoruz.</p>", '<a href="bahcelievler-su-kacagi-tespiti.html">Bahçelievler</a>, <a href="sirinevler-su-kacagi-tespiti.html">Şirinevler</a>, <a href="esenler-su-kacagi-tespiti.html">Esenler</a>, Yenibosna, Güngören, Bakırköy'),
    sss: SSS_ORTAK },
  { dosya: "bahcelievler-su-kacagi-tespiti.html", baslik: "Bahçelievler Su Kaçağı Tespiti | Kırmadan, 7/24 · TespitPro",
    aciklama: "Bahçelievler'de kırmadan su kaçağı tespiti: cihazla ve kamerayla kaçağın yerini bulup noktasal onarım. 7/24 · 0541 373 00 69.",
    h1: "Bahçelievler su kaçağı tespiti",
    giris: "Bahçelievler'in tüm mahallelerinde cihazla ve kamerayla kırmadan su kaçağı tespiti yapıyoruz. Merkezimiz Şirinevler'de; gece ve hafta sonu da geliyoruz.",
    govde: () => bolge("Bahçelievler", `<p>Bahçelievler'deki apartmanların önemli bir kısmında tesisat yıllar içinde yenilenmediği için gizli kaçaklar sık görülüyor. En sık karşılaştığımız durumlar: banyodan alt kata su sızması, mutfak tezgâhı altındaki bağlantılardan sızıntı, kombi hattındaki kaçaklar ve bina girişindeki ana hat kaçakları.</p>
<p>Kaçağın yerini akustik cihaz ve kamerayla bulduğumuz için bütün banyoyu veya mutfağı kırmak gerekmiyor; yalnızca kaçağın olduğu nokta açılıp onarılıyor.</p>`, "Şirinevler, Bahçelievler Merkez, Siyavuşpaşa, Kocasinan, Yenibosna, Soğanlı, Zafer, Cumhuriyet, Hürriyet, Fevzi Çakmak, Çobançeşme") + hizmetler + yorumlar() + nasil,
    sss: [["Bahçelievler'de ne kadar sürede geliyorsunuz?", "Merkezimiz Şirinevler'de olduğu için Bahçelievler içindeki adreslere genellikle kısa sürede ulaşıyoruz; trafik durumuna göre telefonda net süre veriyoruz."], ...SSS_ORTAK] },
  { dosya: "sirinevler-su-kacagi-tespiti.html", baslik: "Şirinevler Su Kaçağı Tespiti | Mahallenizdeyiz · TespitPro",
    aciklama: "Şirinevler'de kırmadan su kaçağı tespiti ve onarımı. Merkezimiz Yeşilbağ Sokak'ta; 7/24 hizmet · 0541 373 00 69.",
    h1: "Şirinevler su kaçağı tespiti",
    giris: "Merkezimiz Şirinevler Yeşilbağ Sokak'ta. Mahalle içindeki adreslere çoğu zaman dakikalar içinde ulaşıyor, kaçağı cihaz ve kamerayla kırmadan buluyoruz.",
    govde: () => bolge("Şirinevler", `<p>Şirinevler'deki eski ve yoğun yapılaşmış binalarda alt kata su sızması ve kolon hattı kaçakları sık görülüyor. Komşunuzdan "tavanımıza su geliyor" uyarısı aldıysanız kaynağı bulmadan fayans kırdırmayın: önce cihazla dinleyip kamerayla bakıyor, kaçağın tam noktasını işaretliyoruz.</p>`, "Şirinevler, Kazım Karabekir Caddesi çevresi, Mahmutbey Caddesi çevresi, Yenibosna ve Bahçelievler'e komşu sokaklar") + hizmetler + yorumlar() + nasil,
    sss: [["Şirinevler'de acil durumda gelir misiniz?", "Evet. Merkezimiz Şirinevler'de olduğu için gece de dahil hızlıca geliyoruz; alt kata su iniyorsa önce ana vanayı kapatıp bizi arayın."], ...SSS_ORTAK] },
  { dosya: "esenler-su-kacagi-tespiti.html", baslik: "Esenler Su Kaçağı Tespiti | Kırmadan, 7/24 · TespitPro",
    aciklama: "Esenler'de cihazla ve kamerayla kırmadan su kaçağı tespiti, alt kata su sızması ve noktasal onarım. 7/24 · 0541 373 00 69.",
    h1: "Esenler su kaçağı tespiti",
    giris: "Esenler'de de hizmet veriyoruz: alt kata su sızması, yüksek su faturası ve duvardaki nem için kaçağı cihazla kırmadan buluyor, onarıyoruz.",
    govde: () => bolge("Esenler", `<p>Esenler'deki müşterilerimizden en sık aldığımız çağrı alt kata su inmesi. Bir müşterimizin evinde sabah erken saatlerde alt kata su iniyordu; pazar günü gidip kaçağı cihazla bulduk ve aynı gün onardık.</p>
<p>Kaçağı bulmadan fayans veya duvar kırmak hem masraflı hem de çoğu zaman yanlış yeri açmak demek. Biz önce dinleyip kamerayla bakıyor, yalnızca kaçağın olduğu noktayı açıyoruz.</p>`, "Esenler'in tüm mahalleleri, Güngören ve Bağcılar sınırındaki adresler") + hizmetler + yorumlar() + nasil,
    sss: [["Esenler'e de geliyor musunuz?", "Evet, Esenler'in tüm mahallelerine geliyoruz. Merkezimiz Şirinevler'de, Esenler'e yakın mesafede."], ...SSS_ORTAK] },
];

(async () => {
try {
  const ayar = require("C:/Users/ben/Desktop/Musteri-Avcisi-Pro/veri/ayarlar.json");
  G = await require("C:/Users/ben/Desktop/Musteri-Avcisi-Pro/places.js").detay(ayar.placesKey, PLACE_ID);
  fs.writeFileSync(path.join(__dirname, "google.json"), JSON.stringify(G, null, 1));
} catch (e) {
  console.log("Google verisi alınamadı, son kayıt kullanılıyor:", e.message);
  try { G = JSON.parse(fs.readFileSync(path.join(__dirname, "google.json"), "utf8")); } catch {}
}
const CIKIS = path.join(__dirname, "docs");
fs.mkdirSync(CIKIS, { recursive: true });
for (const s of SAYFALAR) fs.writeFileSync(path.join(CIKIS, s.dosya), ust(s) + s.govde() + alt(s));
fs.copyFileSync(path.join(__dirname, "style.css"), path.join(CIKIS, "style.css"));
fs.writeFileSync(path.join(CIKIS, "logo.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a6cbd"/><path d="M32 10C24 22 18 30 18 38a14 14 0 0 0 28 0c0-8-6-16-14-28z" fill="#fff"/></svg>`);
const bugun = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(CIKIS, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${SAYFALAR.map((s) => `<url><loc>${SITE}${s.dosya === "index.html" ? "" : s.dosya}</loc><lastmod>${bugun}</lastmod></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(CIKIS, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
fs.writeFileSync(path.join(CIKIS, "llms.txt"), `# TespitPro\n\n> Bahçelievler Şirinevler merkezli kırmadan su kaçağı tespiti ve onarımı. 7/24. Telefon ${TEL_GOR}. Adres: ${ADRES}.\n\n${SAYFALAR.map((s) => `- [${s.h1}](${SITE}${s.dosya === "index.html" ? "" : s.dosya})`).join("\n")}\n`);
fs.writeFileSync(path.join(CIKIS, ".nojekyll"), "");
fs.writeFileSync(path.join(CIKIS, INDEXNOW + ".txt"), INDEXNOW);
console.log("Yazıldı:", SAYFALAR.length, "sayfa ->", CIKIS, "| Google:", G.puan, "puan,", G.yorum, "yorum,", G.yorumlar.length, "yorum metni");
})();
