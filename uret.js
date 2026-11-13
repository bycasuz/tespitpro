// TespitPro statik site üretici: `node uret.js` -> docs/
// Google İşletme verisi (puan, yorum sayısı, yorumlar) her derlemede Places API'den tazelenir.
const fs = require("fs"), path = require("path");

// ---- Sabitler (alan adı alınınca yalnız SITE değişir) ----
const SITE = "https://bycasuz.github.io/tespitpro/";
const TEL = "+905413730069", TEL_GOR = "0541 373 00 69";
const WA = "https://wa.me/905413730069?text=" + encodeURIComponent("Merhaba, su kaçağı tespiti için bilgi almak istiyorum.");
const MAPS = "https://maps.google.com/?cid=11539754779874183849";
const YORUM_YAZ = "https://search.google.com/local/writereview?placeid=ChIJu-e2S3qlyhQRqUqEAdVxJaA";
const PLACE_ID = "ChIJu-e2S3qlyhQRqUqEAdVxJaA";
const ADRES = "Şirinevler Mah. Yeşilbağ Sk. No:11 D:A, 34188 Bahçelievler / İstanbul";
const INDEXNOW = "7f3c9a1e5b2d4c6e8a0b1d3f5e7a9c2b";
const GSC_META = fs.existsSync(path.join(__dirname, "gsc-meta.txt")) ? fs.readFileSync(path.join(__dirname, "gsc-meta.txt"), "utf8").trim() : "";
const esc = (t) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let G = { puan: 5, yorum: 42, yorumlar: [] };
const puanY = () => Number(G.puan || 5).toFixed(1).replace(".", ",");

// ---- İkonlar ----
const IK = {
  tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.200 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.300.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z"/></svg>',
  ok: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  logo: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="#0B2545"/><path d="M20 7c-5.6 7.6-9 12.6-9 17a9 9 0 0 0 18 0c0-4.4-3.4-9.4-9-17z" fill="#F26B1D"/><path d="M15.5 24.5a4.5 4.5 0 0 0 4.5 4.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
};

const resim = (ad, alt, { genis = "(max-width:980px) 100vw, 50vw", oncelik = false, tek = false } = {}) =>
  `<img src="img/${ad}-800.webp" ${tek ? "" : `srcset="img/${ad}-800.webp 800w, img/${ad}-1600.webp 1600w" sizes="${genis}"`} alt="${alt}" ${oncelik ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

// ---- Schema ----
const isletme = () => ({
  "@context": "https://schema.org", "@type": "Plumber", "@id": SITE + "#isletme",
  name: "TespitPro", slogan: "Kaçağı var, biz buluruz!", url: SITE, telephone: TEL,
  image: [SITE + "img/og.jpg", SITE + "img/termal-duvar-1600.webp"], logo: SITE + "logo.svg",
  description: "Bahçelievler Şirinevler merkezli; termal kamera, akustik dinleme ve kamerayla kırmadan su kaçağı tespiti ve noktasal onarım. 7/24 hizmet.",
  address: { "@type": "PostalAddress", streetAddress: "Şirinevler Mah. Yeşilbağ Sk. No:11 D:A", addressLocality: "Bahçelievler", addressRegion: "İstanbul", postalCode: "34188", addressCountry: "TR" },
  geo: { "@type": "GeoCoordinates", latitude: 40.9978802, longitude: 28.8465744 },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" }],
  areaServed: ["Bahçelievler", "Şirinevler", "Esenler", "Yenibosna", "Güngören", "Bakırköy", "Bağcılar"].map((n) => ({ "@type": "Place", name: n + ", İstanbul" })),
  hasMap: MAPS, sameAs: [MAPS],
  makesOffer: ["Kırmadan su kaçağı tespiti", "Termal kamera ile su kaçağı tespiti", "Akustik dinleme ile su kaçağı tespiti", "Kameralı gider ve boru inceleme", "Noktasal su kaçağı onarımı", "Tıkanıklık açma"].map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })),
});

// ---- Ortak bölümler ----
const SSS_ORTAK = [
  ["Su kaçağı olduğunu nasıl anlarım?", "En sık işaretler: su faturasının sebepsiz yükselmesi, bütün musluklar kapalıyken sayacın dönmesi, alt kata su inmesi, duvarda veya zeminde nem, kabarma ve küf lekesi."],
  ["Kırmadan tespit nasıl yapılıyor?", "Termal kamerayla duvar ve zemindeki ısı farkını, akustik dinleme cihazıyla borudaki kaçağın sesini takip ediyoruz; gerekirse gider ve borulara kamerayla bakıyoruz. Kaçağın noktası kesinleşmeden hiçbir yeri kırmıyoruz."],
  ["Onarım için ne kadar yer açılıyor?", "Yalnızca kaçağın olduğu nokta açılıyor. Bütün banyoyu veya mutfağı kırmak gerekmiyor; onarımdan sonra alanı temiz bırakıyoruz."],
  ["Gece ya da hafta sonu geliyor musunuz?", "Evet, haftanın 7 günü 24 saat çalışıyoruz. Alt kata su iniyorsa önce ana vanayı kapatın, sonra bizi arayın."],
  ["Tespitten sonra tamiri de siz mi yapıyorsunuz?", "Evet. Kaçağın yerini size gösteriyoruz; onayınızla aynı ekip onarımı yapıyor."],
];

const ust = (s) => `<!doctype html>
<html lang="tr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${s.baslik}</title>
<meta name="description" content="${s.aciklama}">
<link rel="canonical" href="${SITE}${s.dosya === "index.html" ? "" : s.dosya}">
<meta name="theme-color" content="#0B2545">
<meta property="og:title" content="${s.baslik}"><meta property="og:description" content="${s.aciklama}">
<meta property="og:type" content="website"><meta property="og:url" content="${SITE}${s.dosya === "index.html" ? "" : s.dosya}">
<meta property="og:image" content="${SITE}img/og.jpg"><meta property="og:locale" content="tr_TR"><meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="TR-34"><meta name="geo.placename" content="Bahçelievler, İstanbul"><meta name="geo.position" content="40.9978802;28.8465744">${GSC_META}
<link rel="icon" href="logo.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="preload" as="image" href="img/${s.heroFoto}-800.webp" imagesrcset="img/${s.heroFoto}-800.webp 800w, img/${s.heroFoto}-1600.webp 1600w" imagesizes="(max-width:980px) 100vw, 50vw">
<link rel="stylesheet" href="style.css">
<script type="application/ld+json">${JSON.stringify(isletme())}</script>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: s.sss.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) })}</script>
${s.dosya === "index.html" ? "" : `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "TespitPro", item: SITE }, { "@type": "ListItem", position: 2, name: s.h1, item: SITE + s.dosya }] })}</script>`}
</head><body>
<a class="atla" href="#icerik">İçeriğe geç</a>
<header class="ust" id="ust"><div class="kap">
<a class="logo" href="./" aria-label="TespitPro ana sayfa">${IK.logo}<span>Tespit<b>pro</b></span></a>
<nav class="menu" aria-label="Ana menü"><a href="./#yontem">Nasıl buluyoruz</a><a href="./#galeri">Sahadan</a><a href="./#yorumlar">Yorumlar</a><a href="./#bolgeler">Bölgeler</a><a href="./#sss">SSS</a></nav>
<a class="btn btn-ana" href="tel:${TEL}">${IK.tel}<span>${TEL_GOR}</span></a>
</div></header>
<main id="icerik">`;

const hero = (s) => `<section class="hero"><div class="kap">
<div>
<div class="cipler"><span class="cip"><span class="nokta"></span>7/24 açık · gece ve hafta sonu</span><a class="cip" href="${MAPS}"><span class="yildiz">★</span>Google ${puanY()} · ${G.yorum} yorum</a></div>
<h1>${s.heroBaslik}</h1>
<p class="giris">${s.giris}</p>
<div class="btnler"><a class="btn btn-ana" href="tel:${TEL}">${IK.tel}Hemen ara</a><a class="btn btn-wa" href="${WA}">${IK.wa}WhatsApp'tan yaz</a></div>
<p class="semtler">Merkez: <strong>Şirinevler</strong> · Bahçelievler, Esenler, Yenibosna, Güngören, Bakırköy</p>
</div>
<div class="hero-gorsel"><div class="cerceve">${resim(s.heroFoto, s.heroAlt, { oncelik: true })}<span class="tarama" aria-hidden="true"></span></div>
<div class="etiket e1"><strong>Önce buluyoruz, sonra açıyoruz</strong>Kaçağın noktası kesinleşmeden hiçbir yer kırılmaz.</div>
<a class="etiket e2" href="${MAPS}" style="text-decoration:none"><span class="puan">${puanY()}</span><span><strong>Google puanı</strong>${G.yorum} gerçek yorum</span></a>
</div></div></section>`;

const belirtiler = `<section class="koyu belirti" aria-labelledby="b-bas"><div class="kap">
<div><h2 id="b-bas">Bu belirtilerden biri varsa kaçak büyümeden arayın.</h2><p class="alt">Gizli kaçak her gün hem faturanıza hem binanıza zarar verir. Erken tespit, küçük bir noktasal onarım demektir.</p><div class="termal-serit" style="max-width:220px;margin-top:28px"></div></div>
<ol>
<li><span>01</span><strong>Su faturası sebepsiz yükseldi</strong><p>Bütün musluklar kapalıyken sayaç dönüyorsa hatta gizli kaçak vardır.</p></li>
<li><span>02</span><strong>Alt kata su iniyor</strong><p>Komşunun tavanında leke veya damlama; kaynak çoğu zaman banyo, mutfak ya da kombi hattıdır.</p></li>
<li><span>03</span><strong>Duvarda nem, kabarma, küf</strong><p>Boya kabarması, sürekli ıslak süpürgelik veya küf kokusu tesisattan sızıntıya işaret eder.</p></li>
<li><span>04</span><strong>Su basıncı düştü</strong><p>Basıncın aniden zayıflaması ya da kombinin sık su istemesi kaçak belirtisi olabilir.</p></li>
</ol></div></section>`;

const YONTEM = [
  ["termal-duvar", "Termal kamera", "Duvar ve zemindeki sıcaklık farkını görüntüleyip sıcak ya da soğuk su hattındaki sızıntının izini sürüyoruz.", "Termal kamerayla duvardaki ısı izini takip ediyoruz"],
  ["akustik-banyo", "Akustik dinleme", "Hassas dinleme cihazıyla basınçlı borudaki kaçağın sesini zeminin üstünden dinleyip noktasını daraltıyoruz.", "Kulaklıklı akustik cihazla banyoda kaçak sesi dinleniyor"],
  ["termal-ekran", "Kameralı inceleme", "Gerekirse gider ve borulara kamerayla bakıyor, kırığı ve sızıntıyı ekranda size de gösteriyoruz.", "Termal kamera ekranında kaçak bölgesi görülüyor"],
  ["noktasal-acma", "Noktasal onarım", "Kaçağın yeri kesinleşince yalnızca o noktayı açıp onarıyoruz; bütün banyo ya da mutfak kırılmıyor.", "Zeminde yalnızca kaçak noktası açılmış, boru onarımı"],
];
const yontemler = `<section class="bolum" id="yontem" aria-labelledby="y-bas"><div class="kap">
<div class="bolum-bas"><h2 id="y-bas">Kaçağı nasıl<br>kırmadan buluyoruz?</h2><p>Tahminle fayans kırmıyoruz. Birden çok yöntemi birlikte kullanıp kaçağın yerini kesinleştiriyor, sonra açıyoruz.</p></div>
<div class="yontem">
<div class="yontem-liste" role="tablist" aria-label="Tespit yöntemleri">
${YONTEM.map(([f, b, t, a], i) => `<button class="yontem-btn" role="tab" id="yt${i}" aria-controls="yg" aria-selected="${i === 0}" data-foto="${f}" data-alt="${esc(a)}" data-not="${esc(b)}"><span class="no">0${i + 1}</span><span><strong>${b}</strong><p>${t}</p></span></button>`).join("\n")}
</div>
<figure class="yontem-gorsel" id="yg" role="tabpanel" aria-live="polite">${resim(YONTEM[0][0], YONTEM[0][3])}<figcaption>${YONTEM[0][1]}</figcaption></figure>
</div></div></section>`;

const surec = `<section class="bolum" style="padding-top:0" aria-labelledby="s-bas"><div class="kap">
<div class="bolum-bas"><h2 id="s-bas">Aradığınız andan<br>onarıma kadar.</h2><p>Her adımı size anlatıyor, kaçağın yerini göstermeden işe başlamıyoruz.</p></div>
<ol class="surec">
<li><strong>Arayın ya da yazın</strong><p>Belirtileri kısaca anlatın; fotoğraf göndermek isterseniz WhatsApp'tan iletin.</p></li>
<li><strong>Adresinize gelelim</strong><p>Şirinevler'den çıkıyoruz; gece ve hafta sonu da.</p></li>
<li><strong>Kaçağı birlikte görelim</strong><p>Cihaz ve kamerayla yeri buluyor, işaretleyip size gösteriyoruz.</p></li>
<li><strong>Noktasal onarım</strong><p>Onayınızla yalnız o noktayı açıp onarıyor, alanı temiz bırakıyoruz.</p></li>
</ol></div></section>`;

const galeri = `<section class="bolum koyu" id="galeri" aria-labelledby="g-bas" style="background:#0E2B4F"><div class="kap">
<div class="bolum-bas"><h2 id="g-bas" style="color:#fff">Sahadan.</h2><p style="color:#B9C6D6">Fotoğrafların hepsi bizim işlerimizden; Google İşletme profilimizde de yayında.</p></div>
<div class="galeri">
<figure class="g1">${resim("termal-balkon", "Ekip üyesi balkonda termal kamerayla tesisatı tarıyor", { genis: "(max-width:980px) 100vw, 58vw" })}<figcaption>Termal tarama</figcaption></figure>
<figure class="g2">${resim("akustik-banyo", "Banyoda akustik dinleme cihazıyla kaçak aranıyor", { genis: "(max-width:980px) 50vw, 42vw" })}<figcaption>Akustik dinleme</figcaption></figure>
<figure class="g3">${resim("noktasal-acma", "Zeminde yalnızca kaçak noktası açılmış", { genis: "(max-width:980px) 50vw, 42vw" })}<figcaption>Noktasal açma</figcaption></figure>
<figure class="g4">${resim("termal-duvar", "Duvar dibinde termal kamerayla ölçüm", { genis: "(max-width:980px) 50vw, 34vw" })}<figcaption>Duvar içi hat</figcaption></figure>
<figure class="g5">${resim("kanal-acma", "Tuvalet giderinde makineyle tıkanıklık açma", { genis: "(max-width:980px) 50vw, 25vw", tek: true })}<figcaption>Tıkanıklık açma</figcaption></figure>
</div></div></section>`;

const yorumlar = () => {
  const l = (G.yorumlar || []).filter((y) => y.metin).slice(0, 8);
  return `<section class="bolum" id="yorumlar" aria-labelledby="r-bas"><div class="kap">
<div class="bolum-bas"><div class="yorum-bas"><h2 id="r-bas">Müşterilerimiz<br>ne diyor?</h2></div>
<a class="buyuk-puan" href="${MAPS}" style="text-decoration:none"><b>${puanY()}</b><span><span class="yildizlar" aria-label="5 üzerinden ${puanY()}">★★★★★</span><small>Google'da ${G.yorum} yorum</small></span></a></div>
<div class="yorum-serit" tabindex="0" aria-label="Google yorumları">
${l.map((y) => `<article class="yorum-kart"><span class="yildizlar" aria-label="${y.puan} yıldız">${"★".repeat(Math.round(y.puan || 5))}</span><blockquote>${esc(y.metin.length > 360 ? y.metin.slice(0, 357) + "…" : y.metin)}</blockquote><footer><span class="bas-harf" aria-hidden="true">${esc((y.yazar || "?").trim()[0])}</span><span><strong>${esc(y.yazar)}</strong>${esc(y.once)} · Google</span></footer></article>`).join("\n")}
</div>
<div class="btnler" style="margin-top:24px"><a class="btn btn-hayalet" href="${MAPS}">Tüm yorumlar ${IK.ok}</a><a class="btn btn-hayalet" href="${YORUM_YAZ}">Yorum yazın</a></div>
</div></section>`;
};

const kimlere = `<section class="bolum" style="padding-top:0" aria-labelledby="k-bas"><div class="kap">
<div class="bolum-bas"><h2 id="k-bas">Evden fabrikaya.</h2><p>Daire, dükkân ya da tesis; yöntem aynı: önce bul, sonra noktasal onar.</p></div>
<div class="kimlere">
<div><strong>Evler</strong><p>Banyo, mutfak, kombi ve yerden ısıtma hatlarındaki gizli kaçaklar.</p></div>
<div><strong>İş yerleri</strong><p>Dükkân ve ofislerde işinizi aksatmadan, mesai dışında da tespit.</p></div>
<div><strong>Siteler ve apartmanlar</strong><p>Bina girişi, ana hat, kolon ve ortak alan kaçakları; yönetime yerinde anlatım.</p></div>
<div><strong>Fabrikalar</strong><p>Geniş alanlarda termal ve akustik yöntemlerle hat taraması.</p></div>
</div></div></section>`;

const BOLGELER = [["Bahçelievler", "bahcelievler-su-kacagi-tespiti.html"], ["Şirinevler", "sirinevler-su-kacagi-tespiti.html"], ["Esenler", "esenler-su-kacagi-tespiti.html"], ["Yenibosna", ""], ["Güngören", ""], ["Bakırköy", ""]];
const bolgeler = `<section class="bolum" id="bolgeler" aria-labelledby="h-bas" style="padding-top:0"><div class="kap">
<div class="bolum-bas"><h2 id="h-bas">Hizmet bölgelerimiz.</h2><p>Merkezimiz Şirinevler Yeşilbağ Sokak'ta; çevre ilçelere kısa sürede ulaşıyoruz.</p></div>
<div class="bolge"><nav class="bolge-liste" aria-label="Bölge sayfaları">
${BOLGELER.map(([a, u]) => u ? `<a href="${u}">${a}<small>Su kaçağı tespiti ${IK.ok}</small></a>` : `<span>${a}<small>Hizmet veriyoruz</small></span>`).join("\n")}
</nav>
<div class="harita"><iframe loading="lazy" title="TespitPro konumu, Şirinevler" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=40.9978802,28.8465744&z=15&output=embed"></iframe></div>
</div></div></section>`;

const sss = (l) => `<section class="bolum" id="sss" aria-labelledby="q-bas" style="padding-top:0"><div class="kap">
<div class="bolum-bas"><h2 id="q-bas">Sık sorulanlar.</h2></div>
<div class="sss">${l.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n")}</div>
</div></section>`;

const kapanis = `<section class="kapanis"><div class="kap"><div class="kutu">
<div><h2>Kaçağı var,<br>biz buluruz.</h2><p>Gece ya da gündüz fark etmez. Arayın, belirtileri anlatın; ne yapmanız gerektiğini telefonda söyleyelim.</p></div>
<div><a class="tel" href="tel:${TEL}">${TEL_GOR}</a><div class="btnler"><a class="btn btn-ana" href="tel:${TEL}">${IK.tel}Hemen ara</a><a class="btn btn-wa" href="${WA}">${IK.wa}WhatsApp</a></div></div>
</div></div></section>`;

const alt = () => `</main>
<footer class="alt-bilgi"><div class="kap">
<div><a class="logo" href="./">${IK.logo}<span>Tespit<b>pro</b></span></a><p>Kırmadan su kaçağı tespiti ve noktasal onarım.<br>${ADRES}</p><p style="margin-top:10px"><a href="tel:${TEL}">${TEL_GOR}</a> · Her gün 24 saat</p></div>
<div><h3>Bölgeler</h3><ul>${BOLGELER.filter((b) => b[1]).map(([a, u]) => `<li><a href="${u}">${a} su kaçağı tespiti</a></li>`).join("")}</ul></div>
<div><h3>Google</h3><ul><li><a href="${MAPS}">Haritalar'da yol tarifi</a></li><li><a href="${MAPS}">Google yorumları (${puanY()} ★)</a></li><li><a href="${YORUM_YAZ}">Yorum yazın</a></li></ul></div>
<p class="telif">© ${new Date().getFullYear()} TespitPro. Fotoğraflar TespitPro'ya aittir.</p>
</div></footer>
<div class="sabit"><a class="btn btn-ana" href="tel:${TEL}">${IK.tel}Ara</a><a class="btn btn-wa" href="${WA}">${IK.wa}WhatsApp</a></div>
<script>
(function(){var u=document.getElementById("ust");addEventListener("scroll",function(){u.classList.toggle("kaydi",scrollY>8)},{passive:true});
var g=document.getElementById("yg");if(!g)return;var im=g.querySelector("img"),fc=g.querySelector("figcaption"),b=[].slice.call(document.querySelectorAll(".yontem-btn"));
b.forEach(function(x,i){x.addEventListener("click",function(){b.forEach(function(y){y.setAttribute("aria-selected",y===x)});var f=x.dataset.foto;im.srcset="img/"+f+"-800.webp 800w, img/"+f+"-1600.webp 1600w";im.src="img/"+f+"-800.webp";im.alt=x.dataset.alt;fc.textContent=x.dataset.not});
x.addEventListener("keydown",function(e){var k={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key];if(k){e.preventDefault();var n=b[(i+k+b.length)%b.length];n.focus();n.click()}})});})();
</script>
</body></html>`;

const bolgeMetni = (ad, paragraflar, mahalleler) => `<section class="bolum" aria-labelledby="m-bas"><div class="kap">
<div class="bolum-bas"><h2 id="m-bas">${ad}'de su kaçağı tespiti.</h2></div>
<div class="metin">${paragraflar.map((p) => `<p>${p}</p>`).join("")}<div class="mahalleler">${mahalleler.map((m) => `<span>${m}</span>`).join("")}</div></div>
</div></section>`;

const SAYFALAR = [
  { dosya: "index.html", baslik: "TespitPro | Kırmadan Su Kaçağı Tespiti · Bahçelievler, Şirinevler · 7/24",
    aciklama: "Termal kamera ve akustik dinleme ile kırmadan su kaçağı tespiti, noktasal onarım. Bahçelievler, Şirinevler, Esenler · 7/24 · 0541 373 00 69.",
    h1: "Kırmadan su kaçağı tespiti", heroBaslik: "Kaçağı var,<br><em>biz buluruz.</em>",
    giris: "Su kaçağını termal kamera ve akustik dinlemeyle kırmadan buluyor, yalnızca o noktayı açıp onarıyoruz. Gece gündüz, haftanın her günü.",
    heroFoto: "akustik-banyo", heroAlt: "TespitPro ekibi banyoda akustik dinleme cihazıyla su kaçağı arıyor",
    govde: () => belirtiler + yontemler + surec + galeri + yorumlar() + kimlere + bolgeler + sss(SSS_ORTAK) + kapanis, sss: SSS_ORTAK },
  { dosya: "bahcelievler-su-kacagi-tespiti.html", baslik: "Bahçelievler Su Kaçağı Tespiti | Kırmadan, 7/24 · TespitPro",
    aciklama: "Bahçelievler'de termal kamera ve akustik cihazla kırmadan su kaçağı tespiti, noktasal onarım. 7/24 · 0541 373 00 69.",
    h1: "Bahçelievler su kaçağı tespiti", heroBaslik: "Bahçelievler'de<br><em>su kaçağı tespiti.</em>",
    giris: "Bahçelievler'in tüm mahallelerinde kaçağı termal kamera ve akustik dinlemeyle kırmadan buluyoruz. Merkezimiz Şirinevler'de; gece ve hafta sonu da geliyoruz.",
    heroFoto: "termal-balkon", heroAlt: "Bahçelievler'de bir apartmanda termal kamerayla tesisat taraması",
    govde: (s) => bolgeMetni("Bahçelievler", [
      "Bahçelievler'deki apartmanların önemli bir kısmında tesisat yıllar içinde yenilenmediği için gizli kaçaklar sık görülüyor. En sık karşılaştığımız durumlar: banyodan alt kata su sızması, mutfak tezgâhı altındaki bağlantılardan sızıntı, kombi hattındaki kaçaklar ve bina girişindeki ana hat kaçakları.",
      "Kaçağın yerini termal kamera, akustik dinleme ve gerekirse kamerayla kesinleştirdiğimiz için bütün banyoyu veya mutfağı kırmak gerekmiyor; yalnızca kaçağın olduğu nokta açılıp onarılıyor.",
    ], ["Şirinevler", "Bahçelievler Merkez", "Siyavuşpaşa", "Kocasinan", "Yenibosna", "Soğanlı", "Zafer", "Cumhuriyet", "Hürriyet", "Fevzi Çakmak", "Çobançeşme"]) + belirtiler + yontemler + yorumlar() + sss(s.sss) + kapanis,
    sss: [["Bahçelievler'e ne kadar sürede geliyorsunuz?", "Merkezimiz Şirinevler'de olduğu için Bahçelievler içindeki adreslere genellikle kısa sürede ulaşıyoruz; trafik durumuna göre telefonda net süre veriyoruz."], ...SSS_ORTAK] },
  { dosya: "sirinevler-su-kacagi-tespiti.html", baslik: "Şirinevler Su Kaçağı Tespiti | Mahallenizdeyiz · TespitPro",
    aciklama: "Şirinevler'de kırmadan su kaçağı tespiti ve noktasal onarım. Merkezimiz Yeşilbağ Sokak'ta; 7/24 · 0541 373 00 69.",
    h1: "Şirinevler su kaçağı tespiti", heroBaslik: "Şirinevler'de<br><em>mahallenizdeyiz.</em>",
    giris: "Merkezimiz Şirinevler Yeşilbağ Sokak'ta. Mahalle içindeki adreslere çoğu zaman dakikalar içinde ulaşıyor, kaçağı cihaz ve kamerayla kırmadan buluyoruz.",
    heroFoto: "termal-duvar", heroAlt: "Şirinevler'de bir dairede duvar dibinde termal kamerayla ölçüm",
    govde: (s) => bolgeMetni("Şirinevler", [
      "Şirinevler'deki eski ve yoğun yapılaşmış binalarda alt kata su sızması ve kolon hattı kaçakları sık görülüyor. Komşunuzdan \"tavanımıza su geliyor\" uyarısı aldıysanız kaynağı bulmadan fayans kırdırmayın.",
      "Önce termal kamerayla ısı izini, akustik cihazla kaçağın sesini takip ediyor; kaçağın tam noktasını işaretleyip size gösteriyoruz. Onarım için yalnız o nokta açılıyor.",
    ], ["Kazım Karabekir Caddesi", "Mahmutbey Caddesi", "Yeşilbağ Sokak çevresi", "Yenibosna sınırı", "Bahçelievler sınırı"]) + belirtiler + yontemler + yorumlar() + sss(s.sss) + kapanis,
    sss: [["Şirinevler'de acil durumda gelir misiniz?", "Evet. Merkezimiz Şirinevler'de olduğu için gece de dahil hızlıca geliyoruz; alt kata su iniyorsa önce ana vanayı kapatıp bizi arayın."], ...SSS_ORTAK] },
  { dosya: "esenler-su-kacagi-tespiti.html", baslik: "Esenler Su Kaçağı Tespiti | Kırmadan, 7/24 · TespitPro",
    aciklama: "Esenler'de termal kamera ve akustik cihazla kırmadan su kaçağı tespiti, alt kata su sızması ve noktasal onarım. 7/24 · 0541 373 00 69.",
    h1: "Esenler su kaçağı tespiti", heroBaslik: "Esenler'de<br><em>su kaçağı tespiti.</em>",
    giris: "Esenler'de alt kata su sızması, yüksek su faturası ve duvardaki nem için kaçağı cihazla kırmadan buluyor, aynı ekiple onarıyoruz.",
    heroFoto: "termal-balkon", heroAlt: "Termal kamerayla bina tesisatında kaçak taraması",
    govde: (s) => bolgeMetni("Esenler", [
      "Esenler'deki müşterilerimizden en sık aldığımız çağrı alt kata su inmesi. Bir müşterimizin evinde sabah erken saatlerde alt kata su iniyordu; pazar günü gidip kaçağı cihazla bulduk ve onarımını yaptık.",
      "Kaçağı bulmadan fayans veya duvar kırmak hem masraflı hem de çoğu zaman yanlış yeri açmak demek. Biz önce dinleyip termal kamerayla bakıyor, yalnızca kaçağın olduğu noktayı açıyoruz.",
    ], ["Esenler'in tüm mahalleleri", "Güngören sınırı", "Bağcılar sınırı"]) + belirtiler + yontemler + yorumlar() + sss(s.sss) + kapanis,
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
  for (const s of SAYFALAR) fs.writeFileSync(path.join(CIKIS, s.dosya), ust(s) + hero(s) + s.govde(s) + alt());
  fs.copyFileSync(path.join(__dirname, "style.css"), path.join(CIKIS, "style.css"));
  fs.writeFileSync(path.join(CIKIS, "logo.svg"), IK.logo.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true"', ""));
  const bugun = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(CIKIS, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${SAYFALAR.map((s) => `<url><loc>${SITE}${s.dosya === "index.html" ? "" : s.dosya}</loc><lastmod>${bugun}</lastmod></url>`).join("\n")}\n</urlset>\n`);
  fs.writeFileSync(path.join(CIKIS, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
  fs.writeFileSync(path.join(CIKIS, "llms.txt"), `# TespitPro\n\n> Bahçelievler Şirinevler merkezli kırmadan su kaçağı tespiti (termal kamera, akustik dinleme, kameralı inceleme) ve noktasal onarım. 7/24. Google puanı ${puanY()} (${G.yorum} yorum). Telefon ${TEL_GOR}. Adres: ${ADRES}.\n\n${SAYFALAR.map((s) => `- [${s.h1}](${SITE}${s.dosya === "index.html" ? "" : s.dosya})`).join("\n")}\n`);
  fs.writeFileSync(path.join(CIKIS, ".nojekyll"), "");
  fs.writeFileSync(path.join(CIKIS, INDEXNOW + ".txt"), INDEXNOW);
  console.log("Yazıldı:", SAYFALAR.length, "sayfa | Google:", puanY(), "puan,", G.yorum, "yorum,", (G.yorumlar || []).length, "yorum metni");
})();
